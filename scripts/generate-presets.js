// Pre-compute atlas responses for every demo preset and write them as static
// JSON files into client/public/presets/. The frontend serves these instantly
// when a user clicks a preset, bypassing the ~90s live Opus generation.
//
// Usage:
//   # Against a locally-running backend on :3001
//   npm run generate-presets
//
//   # Against the production backend
//   API_URL=https://route-atlas-api.onrender.com npm run generate-presets
//
// Re-run whenever you change the Nigerian context block, the schema, or the
// preset intakes — otherwise the cached JSON drifts from what the live API
// would produce.

import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { DEMO_PRESETS } from "../client/src/lib/presets.js";

const API_URL = process.env.API_URL || "http://localhost:3001";
const OUT_DIR = "./client/public/presets";

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Generating cached atlas responses against ${API_URL}`);
console.log(`Writing to ${OUT_DIR}\n`);

let failures = 0;

for (const preset of DEMO_PRESETS) {
  process.stdout.write(`  ${preset.emoji}  ${preset.id.padEnd(32)} `);
  const start = Date.now();

  try {
    const res = await fetch(`${API_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "route_atlas", ...preset.intake }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.log(`✗ HTTP ${res.status}: ${text.slice(0, 120)}`);
      failures++;
      continue;
    }

    const body = await res.json();
    if (!body.success || !body.data) {
      console.log(`✗ unexpected response shape`);
      failures++;
      continue;
    }

    writeFileSync(
      `${OUT_DIR}/${preset.id}.json`,
      JSON.stringify(body.data, null, 2)
    );
    const secs = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✓ ${secs}s  (${body.data.routes?.length ?? 0} routes)`);
  } catch (err) {
    console.log(`✗ ${err.message}`);
    failures++;
  }
}

console.log(
  `\n${DEMO_PRESETS.length - failures}/${DEMO_PRESETS.length} presets generated successfully.`
);
process.exit(failures > 0 ? 1 : 0);
