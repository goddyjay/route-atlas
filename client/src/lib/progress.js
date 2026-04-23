// Per-action progress tracking, persisted in localStorage.
//
// Design:
//  - We derive a stable atlas ID from the intake so users who regenerate
//    the same atlas (or click the same preset) see their previous checks.
//  - Different intakes produce different IDs, so edits start fresh state.
//  - Storage is per-browser, no server round-trip.
//
// Keys look like:  routeatlas:progress:v1:{atlasId}:{routeId}:{actionIdx}
// Values are just "1" (done) or absent (not done).

const STORAGE_PREFIX = "routeatlas:progress:v1";

// djb2 string hash — fast, stable, non-cryptographic. Returns a short
// base36 string suitable for a URL-safe atlas ID.
function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
}

// Which intake fields actually determine the atlas output. Changes to any
// of these produce a new atlas ID (and therefore fresh progress state).
// Order-stable so the hash is deterministic.
const ATLAS_ID_KEYS = [
  "degree",
  "class_of_degree",
  "university_tier",
  "nysc_status",
  "years_since_nysc",
  "state",
  "city",
  "savings_ngn",
  "current_monthly_income_ngn",
  "current_work",
  "dependents",
  "monthly_family_obligation_ngn",
  "family_pressure_level",
  "marital_status",
  "children_count",
  "spouse_employment",
  "spouse_monthly_income_ngn",
  "japa_appetite",
  "risk_tolerance",
  "time_horizon_months",
];

export function atlasIdFromIntake(intake) {
  if (!intake) return "anon";
  const serialized = ATLAS_ID_KEYS.map((k) => {
    const v = intake[k];
    if (v === undefined || v === null) return `${k}:`;
    return `${k}:${String(v)}`;
  }).join("|");
  return djb2(serialized);
}

function storageKey(atlasId, routeId, actionIdx) {
  return `${STORAGE_PREFIX}:${atlasId}:${routeId}:${actionIdx}`;
}

export function getActionDone(atlasId, routeId, actionIdx) {
  if (!atlasId || !routeId) return false;
  try {
    return localStorage.getItem(storageKey(atlasId, routeId, actionIdx)) === "1";
  } catch {
    return false;
  }
}

export function setActionDone(atlasId, routeId, actionIdx, done) {
  if (!atlasId || !routeId) return;
  try {
    const key = storageKey(atlasId, routeId, actionIdx);
    if (done) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* quota exceeded or SSR — ignore */
  }
}

// Rehydrate the full { "routeId::actionIdx": true } map for an atlas from
// localStorage. Called on atlas mount and whenever the atlas ID changes.
export function loadAtlasProgress(atlasId, routes) {
  const map = {};
  if (!atlasId || !Array.isArray(routes)) return map;
  for (const r of routes) {
    const actions = r.monday_actions ?? [];
    for (let i = 0; i < actions.length; i++) {
      if (getActionDone(atlasId, r.id, i)) {
        map[`${r.id}::${i}`] = true;
      }
    }
  }
  return map;
}

// Count total actions + done across every route in the atlas.
export function countAtlasProgress(progressMap, routes) {
  let total = 0;
  let done = 0;
  for (const r of routes ?? []) {
    const n = (r.monday_actions ?? []).length;
    total += n;
    for (let i = 0; i < n; i++) {
      if (progressMap[`${r.id}::${i}`]) done++;
    }
  }
  return { done, total };
}
