// Local persistence for atlases the user has generated. Kept per-browser
// in localStorage (no server round-trip, no account). Stores the full
// atlas JSON so the Saved Routes view doesn't need the backend to be
// reachable or the original share link to still be valid.
//
// Storage shape under key `routeatlas:saved:v1`:
//   {
//     "<atlasId>": {
//       atlas: <full atlas JSON>,
//       topTitle: "Pharma QA Analyst → ...",
//       savedAt: <epoch ms>,
//     },
//     ...
//   }

import { atlasIdFromIntake } from "./progress.js";

const STORAGE_KEY = "routeatlas:saved:v1";
const MAX_ENTRIES = 20;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota exceeded — silently drop */
  }
}

/** Save (or update) an atlas in the local store. Idempotent per atlasId. */
export function saveLocalAtlas(atlas) {
  if (!atlas?.user) return null;
  const atlasId = atlasIdFromIntake(atlas.user);
  const topTitle = atlas.routes?.[0]?.title ?? "Untitled atlas";
  const store = readStore();
  store[atlasId] = {
    atlas,
    topTitle,
    savedAt: Date.now(),
  };

  // Keep only the N most recent to cap localStorage usage.
  const ids = Object.keys(store);
  if (ids.length > MAX_ENTRIES) {
    const sorted = ids
      .map((id) => [id, store[id].savedAt ?? 0])
      .sort((a, b) => b[1] - a[1]);
    const toKeep = new Set(sorted.slice(0, MAX_ENTRIES).map(([id]) => id));
    for (const id of ids) if (!toKeep.has(id)) delete store[id];
  }

  writeStore(store);
  return atlasId;
}

/** List all saved atlases, most recent first. */
export function listLocalAtlases() {
  const store = readStore();
  return Object.entries(store)
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
}

/** Look up a single saved atlas by atlasId. */
export function getLocalAtlas(id) {
  const store = readStore();
  return store[id] ?? null;
}

/** Remove a single saved atlas. */
export function removeLocalAtlas(id) {
  const store = readStore();
  delete store[id];
  writeStore(store);
}

/** Wipe everything. Exposed for settings / debug use. */
export function clearLocalAtlases() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
