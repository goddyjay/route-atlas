// Follow-up Q&A module. Shares the Nigerian context block with routeAtlas
// but produces a short, focused prose answer about ONE specific route
// instead of a full atlas. Streamed over SSE so the user sees tokens land
// as Claude writes.
//
// Key differences from routeAtlas:
//  - Output is plain text, not structured JSON
//  - Much shorter (max ~700 tokens, usually ~300-500)
//  - Scoped to the single route the user is asking about
//  - Must cite the user's intake fields AND the specific route's facts
//
// Reuses the same Nigerian context block so the answer is grounded in the
// same knowledge. We don't re-encode 7k tokens per follow-up — prompt
// caching handles that after the first call of each 5-min window.

import { body } from "express-validator";
import routeAtlas from "./routeAtlas.js";

// The Nigerian context block lives inside routeAtlas's system prompt. We
// pull it out verbatim so follow-ups reason from the same ground truth.
// The instruction shell below changes; the context body doesn't.
const CONTEXT_MARKER_START = "=====================================================================\nNIGERIAN CONTEXT";
const CONTEXT_MARKER_END = "=====================================================================\nOUTPUT SCHEMA";
function extractNigerianContext() {
  const src = routeAtlas.systemPrompt;
  const a = src.indexOf(CONTEXT_MARKER_START);
  const b = src.indexOf(CONTEXT_MARKER_END);
  if (a === -1 || b === -1) return "";
  return src.slice(a, b).trim();
}

const FOLLOWUP_SYSTEM_PROMPT = `You are Route Atlas — a route cartographer for Nigerian post-NYSC graduates. A user has already been shown a route atlas and is now asking a follow-up question about ONE specific route.

Your job: answer the user's question honestly, concretely, and specifically to the route they're asking about and the Nigerian context they're operating in. Use the Nigerian context block below as your knowledge base.

Voice: cartographer, not cheerleader. Neutral, specific, grounded in Nigerian reality. Reference real companies, real communities, real ₦ figures where relevant.

Never use: "you could consider", "you might want to", "leverage", "unlock", "tap into", "navigate", "empower", "a variety of", "in today's competitive market", "ultimately", "hope this helps", "good luck". No hedge openers like "It's worth noting". No self-referential closers. Direct statements only — "Apply Tuesday 8am" not "You could try applying around Tuesday".

Format:
- Plain text (NOT JSON, NOT markdown headings). Short paragraphs. Use "•" bullet points if listing.
- Max 200 words. Answer the question — don't re-summarize the route.
- When citing salary, cost, time, or location, be specific.
- Reference the user's intake (degree, savings, state, family situation, etc.) if it meaningfully changes the answer.
- If the question is off-topic or unclear, say so briefly and suggest what you CAN answer about this route.
- Do NOT recommend illegal paths (yahoo, MLM, etc.).

${extractNigerianContext()}`;

const validators = [
  body("route_title")
    .isString()
    .isLength({ min: 2, max: 200 })
    .withMessage("route_title is required"),
  body("route_category").isString().isLength({ min: 2, max: 60 }),
  body("route_one_liner").optional({ values: "falsy" }).isString(),
  body("route_nigerian_notes").optional({ values: "falsy" }).isString(),
  body("question")
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage("question is required (3-500 chars)"),
  body("intake").optional().isObject(),
];

function buildUserPrompt(input) {
  const { route_title, route_category, route_one_liner, route_nigerian_notes, question, intake } = input;

  const fmt = (n) => (typeof n === "number" ? `₦${Number(n).toLocaleString()}` : "");
  const intakeLines = intake
    ? [
        intake.degree && `- Degree: ${intake.degree}`,
        intake.state && intake.city && `- Location: ${intake.city}, ${intake.state}`,
        typeof intake.savings_ngn === "number" && `- Savings: ${fmt(intake.savings_ngn)}`,
        intake.nysc_status && `- NYSC: ${intake.nysc_status.replace(/_/g, " ")}`,
        intake.marital_status && `- Marital: ${intake.marital_status.replace(/_/g, " ")}`,
        typeof intake.children_count === "number" && intake.children_count > 0 &&
          `- Children: ${intake.children_count}`,
        intake.japa_appetite && `- JAPA appetite: ${intake.japa_appetite}`,
        intake.risk_tolerance && `- Risk tolerance: ${intake.risk_tolerance}`,
      ].filter(Boolean)
    : [];

  const routeBlock = [
    `ROUTE: ${route_title}`,
    `Category: ${route_category}`,
    route_one_liner && `Summary: ${route_one_liner}`,
    route_nigerian_notes && `Nigerian notes on this route: ${route_nigerian_notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const intakeBlock = intakeLines.length
    ? `USER INTAKE (the person asking):\n${intakeLines.join("\n")}\n\n`
    : "";

  return `${routeBlock}

${intakeBlock}USER'S QUESTION:
${question}

Answer the question in under 200 words. Plain text.`;
}

// The follow-up module doesn't use JSON validation — it streams plain text,
// so validateResponse just passes through. We still export it to conform to
// the module shape.
function validateResponse() {
  // No-op: output is plain text.
  return true;
}

export default {
  type: "route_followup",
  label: "Route Follow-up",
  model: "claude-opus-4-7",
  maxTokens: 900,
  plainText: true,
  validators,
  systemPrompt: FOLLOWUP_SYSTEM_PROMPT,
  buildUserPrompt,
  validateResponse,
};
