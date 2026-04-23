import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Thrown when Claude returned text we couldn't parse or that failed a module's
 * shape validator. The controller catches this and returns a 502 so the
 * frontend can show a retry-able error while we log the raw output.
 */
export class ClaudeJsonError extends Error {
  constructor(message, rawText) {
    super(message);
    this.name = "ClaudeJsonError";
    this.rawText = rawText;
  }
}

/**
 * Extract a JSON object from Claude's raw text response. Handles code-fence
 * wrappers and leading/trailing prose by slicing between the first { and the
 * last }.
 */
function extractJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) {
    throw new Error("No JSON object found in response");
  }
  return cleaned.slice(first, last + 1);
}

/**
 * Generic runner: takes a module (system prompt + user prompt builder + shape
 * validator) and returns the parsed, validated response. Knows nothing about
 * the specific domain — the module owns that.
 */
export async function runClaudeModule(mod, input) {
  const userPrompt = mod.buildUserPrompt(input);

  const response = await anthropic.messages.create({
    model: mod.model ?? "claude-opus-4-7",
    max_tokens: mod.maxTokens ?? 8000,
    system: [
      {
        type: "text",
        text: mod.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  let jsonString;
  try {
    jsonString = extractJson(rawText);
  } catch (err) {
    throw new ClaudeJsonError(err.message, rawText);
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new ClaudeJsonError("Claude returned malformed JSON", rawText);
  }

  try {
    mod.validateResponse(parsed);
  } catch (err) {
    throw new ClaudeJsonError(
      `Invalid ${mod.type} response shape: ${err.message}`,
      rawText
    );
  }

  return {
    data: parsed,
    usage: response.usage,
  };
}

/**
 * Streaming variant. Same inputs/outputs as runClaudeModule, but emits
 * intermediate `onDelta({ accumulated, chunk })` callbacks as Claude writes
 * tokens. Returns the final validated result when the model finishes.
 *
 * Used by the SSE endpoint so the frontend can show live progress instead
 * of staring at a skeleton for a minute.
 */
export async function runClaudeModuleStream(mod, input, onDelta) {
  const userPrompt = mod.buildUserPrompt(input);

  const stream = anthropic.messages.stream({
    model: mod.model ?? "claude-opus-4-7",
    max_tokens: mod.maxTokens ?? 8000,
    system: [
      {
        type: "text",
        text: mod.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  let accumulated = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta?.type === "text_delta"
    ) {
      const chunk = event.delta.text;
      accumulated += chunk;
      if (onDelta) onDelta({ accumulated, chunk });
    }
  }

  const finalResponse = await stream.finalMessage();
  const rawText = accumulated ||
    finalResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

  // Plain-text modules (e.g. the follow-up Q&A) skip JSON parsing and
  // just hand the raw text back to the caller. Identified by the module
  // setting `plainText: true`.
  if (mod.plainText) {
    return { data: rawText, usage: finalResponse.usage };
  }

  let jsonString;
  try {
    jsonString = extractJson(rawText);
  } catch (err) {
    throw new ClaudeJsonError(err.message, rawText);
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new ClaudeJsonError("Claude returned malformed JSON", rawText);
  }

  try {
    mod.validateResponse(parsed);
  } catch (err) {
    throw new ClaudeJsonError(
      `Invalid ${mod.type} response shape: ${err.message}`,
      rawText
    );
  }

  return {
    data: parsed,
    usage: finalResponse.usage,
  };
}
