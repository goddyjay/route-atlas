const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Fire-and-forget ping to the backend /health endpoint. Used on app mount
 * to wake up Render's free-tier dyno before the user clicks Try Demo —
 * saves the ~30s cold-start penalty on first interaction.
 */
export function warmBackend() {
  return fetch(`${API_BASE}/health`, {
    method: "GET",
    // Keep this quiet — failure is fine, we don't want the error bubbling.
    cache: "no-store",
  }).catch(() => {
    /* ignore */
  });
}

async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!res.ok) {
    const fieldErrors = body.errors?.map((e) => `${e.path}: ${e.msg}`).join(", ");
    throw new Error(fieldErrors || body.message || `Request failed (${res.status})`);
  }

  return body.data;
}

/** Block-until-done fallback. */
export function fetchRouteAtlas(intake) {
  return postJson("/api/recommendations", { type: "route_atlas", ...intake });
}

/**
 * Persist an atlas server-side so it can be shared via a short URL.
 * Returns the short ID on success. Uses a direct fetch rather than
 * postJson because /api/atlas returns { id } at the top level (not
 * wrapped in { data: { id } } like the recommendations endpoint).
 */
export async function createSharedAtlas(atlas) {
  const res = await fetch(`${API_BASE}/api/atlas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: atlas }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || `Failed to share (${res.status})`);
  }
  return body.id;
}

/**
 * Stream a follow-up Q&A answer about a specific route. Same SSE flow as
 * the atlas stream but different event shape: each `delta` carries a raw
 * text chunk (not a chars counter). `done` carries the final text string.
 *
 * The caller receives onDelta callbacks for each chunk so it can append
 * text to the UI as Claude writes. Resolves with the full answer string.
 */
export async function streamFollowup(payload, onDelta) {
  const res = await fetch(`${API_BASE}/api/recommendations/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      const fieldErrors = body.errors?.map((e) => `${e.path}: ${e.msg}`).join(", ");
      msg = fieldErrors || body.message || msg;
    } catch {
      /* ignore parse failure */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalText = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIdx;
    while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);
      if (raw.startsWith(":")) continue;

      let eventName = "message";
      let dataLine = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;

      let body;
      try {
        body = JSON.parse(dataLine);
      } catch {
        continue;
      }

      if (eventName === "delta") {
        onDelta?.(body.text ?? "");
      } else if (eventName === "done") {
        finalText = body.text ?? "";
      } else if (eventName === "error") {
        throw new Error(body.message || "Stream failed");
      }
    }
  }

  if (finalText === null) {
    throw new Error("Stream ended without a final answer.");
  }
  return finalText;
}

/**
 * Submit a CV for ATS analysis. Blocking call — returns the full dossier
 * when the model finishes (usually 15-25s). Body: { cv_text, target_role? }.
 */
export async function checkCv({ cv_text, target_role }) {
  const res = await fetch(`${API_BASE}/api/cv/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv_text, target_role }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    const fieldErrors = body?.errors?.map((e) => `${e.path}: ${e.msg}`).join(", ");
    throw new Error(fieldErrors || body?.message || `Request failed (${res.status})`);
  }
  return body.data;
}

/** Load a previously-shared atlas by its short ID. */
export async function fetchSharedAtlas(id) {
  const res = await fetch(`${API_BASE}/api/atlas/${encodeURIComponent(id)}`);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || `Failed to load atlas (${res.status})`);
  }
  return body.data;
}

/**
 * Streaming fetcher. Opens an SSE connection to /api/recommendations/stream,
 * parses `event: <name>\ndata: <json>\n\n` chunks, and calls `onEvent(name, data)`
 * for each one. Resolves with the final data on `done`; rejects on `error`.
 *
 * Events emitted by the backend:
 *   start    → { type }
 *   progress → { chars }            (many, one per model chunk)
 *   done     → { success, data, usage }
 *   error    → { message }
 */
export async function streamRouteAtlas(intake, onEvent) {
  const res = await fetch(`${API_BASE}/api/recommendations/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "route_atlas", ...intake }),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      const fieldErrors = body.errors?.map((e) => `${e.path}: ${e.msg}`).join(", ");
      msg = fieldErrors || body.message || msg;
    } catch {
      /* ignore parse failure */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalData = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Split on the SSE record separator. The last piece may be incomplete,
    // so we keep it in the buffer for the next chunk.
    let sepIdx;
    while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);

      // Skip comments / heartbeats like `: ping`.
      if (raw.startsWith(":")) continue;

      let eventName = "message";
      let dataLine = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;

      let payload;
      try {
        payload = JSON.parse(dataLine);
      } catch {
        continue;
      }

      onEvent?.(eventName, payload);

      if (eventName === "done") {
        finalData = payload.data;
      } else if (eventName === "error") {
        throw new Error(payload.message || "Stream failed");
      }
    }
  }

  if (!finalData) {
    throw new Error("Stream ended without a final result.");
  }
  return finalData;
}
