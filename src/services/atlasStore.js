// In-memory atlas store keyed by short random IDs. Used to power the
// "Share this atlas" feature — sharers POST the atlas here, get a short
// URL-safe ID back, and can ship that link to anyone.
//
// Trade-offs:
//  - In-memory: survives until the Node process restarts. For a hackathon
//    demo this is fine; a deploy redeploys rare enough and a dropped link
//    is acceptable collateral.
//  - Capped: we LRU-evict when the store gets past MAX_ENTRIES so a spamming
//    client can't exhaust memory.
//  - TTL: entries also expire after MAX_AGE_MS so stale data can't linger.
//
// If you later want durable sharing, swap this module's three exports with
// a Redis or file-backed implementation — the controller/route don't care.

const MAX_ENTRIES = 500;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const store = new Map();

// 10-char base36 ID — ~52 bits of entropy, collisions effectively
// impossible at this scale. Readable and URL-safe.
function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function evictIfNeeded() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.createdAt > MAX_AGE_MS) {
      store.delete(id);
    }
  }
  if (store.size <= MAX_ENTRIES) return;
  // Drop oldest N so we're back under the cap.
  const sorted = [...store.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  const toDrop = sorted.slice(0, store.size - MAX_ENTRIES);
  for (const [id] of toDrop) store.delete(id);
}

export function saveAtlas(data) {
  evictIfNeeded();
  let id = generateId();
  // Collision retry just in case.
  while (store.has(id)) id = generateId();
  store.set(id, { data, createdAt: Date.now() });
  return id;
}

export function getAtlas(id) {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > MAX_AGE_MS) {
    store.delete(id);
    return null;
  }
  return entry.data;
}

export function storeStats() {
  return { size: store.size, maxEntries: MAX_ENTRIES };
}
