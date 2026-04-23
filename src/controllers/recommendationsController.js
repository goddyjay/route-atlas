import Anthropic from "@anthropic-ai/sdk";
import { body, validationResult } from "express-validator";
import {
  runClaudeModule,
  runClaudeModuleStream,
  ClaudeJsonError,
} from "../services/claude.js";
import { getModule, MODULE_TYPES } from "../modules/index.js";
import followupModule from "../modules/followup.js";

// Envelope validators always run before dispatching to a module.
const typeValidator = body("type")
  .exists({ checkFalsy: true })
  .isIn(MODULE_TYPES)
  .withMessage(`type must be one of: ${MODULE_TYPES.join(", ")}`);

async function runChains(req, chains) {
  for (const chain of chains) {
    await chain.run(req);
  }
}

export async function handleRecommendations(req, res) {
  // Step 1: validate envelope (the `type` discriminator).
  await typeValidator.run(req);
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const mod = getModule(req.body.type);
  if (!mod) {
    return res
      .status(400)
      .json({ success: false, message: `Unknown type: ${req.body.type}` });
  }

  // Step 2: run module-specific validators.
  await runChains(req, mod.validators);
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // Strip envelope, pass domain fields to the module.
  // eslint-disable-next-line no-unused-vars
  const { type: _t, ...payload } = req.body;

  try {
    const { data, usage } = await runClaudeModule(mod, payload);
    return res.status(200).json({
      success: true,
      data: { type: mod.type, user: payload, ...data },
      usage,
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({
        success: false,
        message: "AI service authentication failed. Check your API key.",
      });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({
        success: false,
        message: "AI service rate limit reached. Please try again shortly.",
      });
    }
    if (err instanceof ClaudeJsonError) {
      console.error(`[Recommendations:${mod.type}] JSON error:`, err.message);
      console.error(`[Recommendations:${mod.type}] Raw output:`, err.rawText);
      return res.status(502).json({
        success: false,
        message: "AI returned an unexpected response. Please try again.",
      });
    }
    console.error(`[Recommendations:${mod.type}]`, err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}

/**
 * SSE streaming variant. Emits `progress` events as Claude writes tokens and
 * a single `done` event (or `error`) at the end. The frontend renders a live
 * progress bar off the delta stream so the user sees motion within ~2s.
 */
export async function handleRecommendationsStream(req, res) {
  await typeValidator.run(req);
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const mod = getModule(req.body.type);
  if (!mod) {
    return res
      .status(400)
      .json({ success: false, message: `Unknown type: ${req.body.type}` });
  }

  await runChains(req, mod.validators);
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // SSE headers. flushHeaders() ensures the client sees the response start
  // before the first delta — otherwise proxies may buffer the early bytes.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat keeps the connection alive if Claude takes longer than a
  // proxy's idle timeout. Cleared when the stream finishes.
  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 15000);

  // eslint-disable-next-line no-unused-vars
  const { type: _t, ...payload } = req.body;

  try {
    send("start", { type: mod.type });

    let charCount = 0;
    const result = await runClaudeModuleStream(mod, payload, ({ chunk }) => {
      charCount += chunk.length;
      // Don't ship raw JSON to the client — just the char count. The UI uses
      // it to drive a progress bar without leaking the response structure.
      send("progress", { chars: charCount });
    });

    send("done", {
      success: true,
      data: { type: mod.type, user: payload, ...result.data },
      usage: result.usage,
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      send("error", { message: "AI service authentication failed." });
    } else if (err instanceof Anthropic.RateLimitError) {
      send("error", { message: "AI rate limit reached. Try again shortly." });
    } else if (err instanceof ClaudeJsonError) {
      console.error(`[Stream:${mod.type}] JSON error:`, err.message);
      console.error(`[Stream:${mod.type}] Raw:`, err.rawText);
      send("error", { message: "AI returned an unexpected response." });
    } else {
      console.error(`[Stream:${mod.type}]`, err);
      send("error", { message: "Something went wrong. Please try again." });
    }
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}

/**
 * SSE streaming handler for route follow-up Q&A. Unlike the atlas stream,
 * this emits each raw text delta as it arrives (not just a chars counter)
 * so the UI can show the answer typing in real time.
 */
export async function handleFollowupStream(req, res) {
  const mod = followupModule;

  // Run the module's validators directly (no envelope / type discriminator).
  for (const chain of mod.validators) {
    await chain.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 15000);

  try {
    send("start", { type: mod.type });

    const result = await runClaudeModuleStream(mod, req.body, ({ chunk }) => {
      // Ship each token chunk directly — this is what powers the typing
      // animation on the frontend.
      send("delta", { text: chunk });
    });

    send("done", { success: true, text: result.data, usage: result.usage });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      send("error", { message: "AI service authentication failed." });
    } else if (err instanceof Anthropic.RateLimitError) {
      send("error", { message: "AI rate limit reached. Try again shortly." });
    } else {
      console.error(`[Followup]`, err);
      send("error", { message: "Something went wrong. Please try again." });
    }
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}
