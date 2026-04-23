# CLAUDE.md

Guidance for AI coding agents (Claude Code, Cursor, etc.) working on this repo. Read this before touching anything.

## What this is

**Route Atlas** — an AI route cartographer for Nigerian post-NYSC graduates. Users fill a ~23-field intake; Claude Opus 4.7 returns 4 ranked routes forward with real ₦ pay, Monday actions, and a 2-year projection. Streaming over SSE, dense Nigerian context in the system prompt.

Single product, single persona (post-NYSC grad), single frame (scout/opportunity, not counselor). **Do not widen the scope** — that's the trap that produced the original pathforge-ai fork. Resist adding modules for "education paths" or "life decisions." If the user asks for those, push back.

## The moat is the system prompt

The product's defensibility is the **Nigerian context block** in `src/modules/routeAtlas.js` — about 7,000 tokens of NYSC mechanics, degree→route mappings, JAPA economics, salary bands, survival-work taxonomy, Igba Boi, bootcamp reality, married-grad dynamics, etc. **This is what makes output unfakeable vs. ChatGPT.**

When editing the prompt:
- Every change to the Nigerian block should favor *more specific* over *more general*. Real company names, real URLs, real ₦ figures beat abstractions every time.
- Keep the `fit_reasons must cite a concrete intake field by name` rule. It's the single best anti-generic-output constraint in the prompt.
- Keep the `fit_score spread` rule (94/83/72 pattern). Flat scores betray lazy reasoning.
- Keep the voice constraint — **cartographer, not cheerleader.** No "exciting journey" language.

## Architecture in one paragraph

Node/Express backend dispatches through a **pluggable module pattern** (`src/modules/index.js`). The one module today is `routeAtlas`. Each module owns `{ type, systemPrompt, buildUserPrompt, validators, validateResponse, model, maxTokens }`. The generic runner in `src/services/claude.js` handles SDK calls, JSON extraction, schema validation, and SSE streaming. React frontend uses framer-motion throughout, TailwindCSS with a custom `brand` (emerald) + `accent` (teal) palette, and streams from `/api/recommendations/stream` parsing SSE events client-side.

## Run it

```bash
# Backend (:3001)
npm install
npm run dev

# Frontend (:5174) — separate terminal
cd client
npm install
npm run dev
```

Needs `.env` with `ANTHROPIC_API_KEY` (see `.env.example`). Vite proxies `/api` to `:3001` so no CORS setup required.

## File layout (critical paths)

| Path | What it holds |
|---|---|
| `src/modules/routeAtlas.js` | **The brain.** System prompt + Nigerian context + schema + validators. Most impactful file. |
| `src/services/claude.js` | SDK wrapper. Two entries: `runClaudeModule` (JSON block) + `runClaudeModuleStream` (SSE). |
| `src/controllers/recommendationsController.js` | Envelope + dispatch + error mapping. |
| `client/src/components/AtlasForm.jsx` | 23-field Nigerian intake, chip pickers with custom input, color-coded section headers. |
| `client/src/components/RouteCard.jsx` | The route artifact UI. Confidence ring, bloom, timeline, pro tips. |
| `client/src/components/AtlasView.jsx` | Snapshot + header + cards grid + compare + filtered-out + loading state with progress bar. |
| `client/src/lib/nigerian.js` | Intake enums + skill/hard-no presets. Source of truth for dropdowns. |
| `client/src/lib/presets.js` | 4 demo personas. |

## Conventions

### Prompts

- Schema in the system prompt is **literal JSON skeleton with field descriptions as comments** — not English prose. Claude follows it more reliably.
- Rules are **numbered and non-negotiable**. Add new rules at the bottom, don't renumber.
- Strict enums (`'Low' | 'Medium' | 'High'`) are repeated on both the schema and in rules — the redundancy reduces drift.
- Output size matters for latency. Keep `maxTokens` tight (currently 10000). Every new field adds tokens; every token adds ~10ms to generation time.

### React / Tailwind

- `motion.*` from framer-motion for anything that animates. Use `variants` + `staggerChildren` for orchestrated entrances.
- Brand color: `emerald-{300..700}` aliased to `brand-*` in `tailwind.config.js`. Teal aliased to `accent-*`.
- Dark theme is the only theme. No light mode.
- Custom utilities in `index.css`: `.card`, `.card-hover`, `.pretty-scroll`, `.scroll-left`, `.field-input`, `.field-select`, `.bloom`, `.gradient-shift`, `.ambient-pulse`.
- Don't add a `max-width` container on the main shell — the full-viewport split-pane is intentional (Notion/Linear feel, not login-page feel).

### Intake changes

Adding a new intake field is a 5-file change. Update in this order:
1. `src/modules/routeAtlas.js` — add validator in `validators[]`, add to `buildUserPrompt` destructure + lines array, mention in system prompt context if it affects reasoning.
2. `client/src/lib/nigerian.js` — add enum/options if needed.
3. `client/src/components/AtlasForm.jsx` — add field to zod schema, defaults, form UI.
4. `client/src/routes/AtlasPage.jsx` — update `normalizeIntake` if the field is conditional (strip when not meaningful).
5. `client/src/lib/presets.js` — add to all 4 demo presets.

## Gotchas

- **Icons:** The `Sparkles` icon has been intentionally removed from every user-facing surface. It reads as generic "AI slop." Use `Compass`, `Target`, `Lightbulb`, `TrendingUp`, `ArrowUpRight`, or category-specific icons instead.
- **Streaming:** the SSE endpoint at `/api/recommendations/stream` emits `start` → `progress` (many) → `done` / `error`. Do NOT change event names without updating `client/src/lib/api.js` parser.
- **Prompt cache:** the system prompt uses `cache_control: { type: "ephemeral" }`. TTL is 5 minutes. First call is cold (~10s setup). Don't expect cache hits after 5 min idle.
- **Route count:** hard-coded at **4 routes exactly** in the system prompt, matched in `EXPECTED_STREAM_CHARS` in `AtlasPage.jsx`, and in UI copy. If you change route count, update all three.
- **PNG logo:** the full lockup is 95 KB (optimized from 4.8 MB). If you replace it, re-optimize with `convert input.png -resize 1200x -colors 128 -strip output.png`.
- **The `cheapest_test` + `communities` fields** are intentionally disabled in the prompt (rules 19/20) to control output size. The UI still has code to render them if re-enabled — flip the rules to bring them back.

## What NOT to do

- ❌ Don't add auth, accounts, or database persistence. This is a hackathon demo; localStorage is sufficient.
- ❌ Don't add currency conversion. Nigerian-specific = ₦-only is the moat.
- ❌ Don't add more modules. One module, one artifact.
- ❌ Don't widen from post-NYSC graduates to general career advice.
- ❌ Don't swap Opus 4.7 for Sonnet without the user's explicit approval — the hackathon is Opus-specific.
- ❌ Don't re-enable sparkle/AI-magic icons. They've been intentionally removed.
- ❌ Don't commit `.env`. It's gitignored; keep it that way.

## When in doubt

- Favor **specificity over generality** (in prompt, in copy, in intake).
- Favor **fewer routes with more depth** over many shallow routes.
- Favor **lived-experience realism** over textbook advice.
- Favor **shipping** over polishing.
