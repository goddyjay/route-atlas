import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, ChevronDown } from "lucide-react";
import { AtlasForm } from "../components/AtlasForm.jsx";
import { AtlasView } from "../components/AtlasView.jsx";
import { streamRouteAtlas } from "../lib/api.js";
import { DEMO_PRESETS } from "../lib/presets.js";
import { saveLocalAtlas } from "../lib/savedAtlases.js";

// Rough char count of a complete atlas — drives the progress bar fill.
// Overshoots are clamped to 95% so the bar never sits at 100% while the
// model is still writing.
const EXPECTED_STREAM_CHARS = 14000;

// Animates the progress bar (0 → 1) + the streamed-chars counter over a
// fixed duration, driving a fake-streamed loading state when we serve a
// cached preset atlas. Ease-out cubic so the bar sprints then slows, which
// mirrors the rhythm of a real Opus generation.
function fakeStreamProgress({ duration, onProgress, onChars }) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (t) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      onProgress(Math.min(0.98, eased));
      onChars(Math.round(eased * EXPECTED_STREAM_CHARS));
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

// Page-level layout. The page itself is ONE flex row that fills whatever
// height the shell gave it (flex-1 on desktop, natural on mobile). Each pane
// owns its own scroll, so the form and the atlas scroll independently — no
// fighting over a single scroll bar.
//
//   Mobile:    [form stacked]
//              [atlas stacked]
//
//   Desktop:   [form 42%] | [atlas 58%]
//               scroll A  |  scroll B
//
// We deliberately DO NOT wrap in a max-width container. The app should feel
// like a workspace, not a dialog.
export default function AtlasPage() {
  const [atlas, setAtlas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seed, setSeed] = useState(null);
  const [progress, setProgress] = useState(0);     // 0–1
  const [streamChars, setStreamChars] = useState(0);

  const resultsRef = useRef(null);

  async function handleSubmit(values) {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStreamChars(0);
    try {
      const payload = normalizeIntake(values);
      const data = await streamRouteAtlas(payload, (event, body) => {
        if (event === "progress") {
          const chars = body.chars ?? 0;
          setStreamChars(chars);
          setProgress(Math.min(0.95, chars / EXPECTED_STREAM_CHARS));
        } else if (event === "done") {
          setProgress(1);
        }
      });
      setAtlas(data);
      // Persist to Saved Routes. We only save atlases the user generated
      // themselves — preset runs skip this block because they take the
      // cached-atlas path in runPreset.
      saveLocalAtlas(data);
      setTimeout(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 60);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function runPreset(preset) {
    // Cache-first: if the preset ships with a pre-computed atlas, fetch it
    // and play a short fake-streamed progress animation so the UX matches
    // the real streaming flow visually without the 90s generation wait.
    // Falls back to a live submission if the cache file is missing.
    if (preset.cachedAtlasUrl) {
      // Populate the form for display but DON'T auto-submit.
      setSeed({ version: Date.now(), values: preset.intake, autoSubmit: false });
      setAtlas(null);
      setError(null);
      setLoading(true);
      setProgress(0);
      setStreamChars(0);

      try {
        const [data] = await Promise.all([
          fetch(preset.cachedAtlasUrl).then((r) => {
            if (!r.ok) throw new Error(`cache miss (${r.status})`);
            return r.json();
          }),
          fakeStreamProgress({
            duration: 3800,
            onProgress: setProgress,
            onChars: setStreamChars,
          }),
        ]);
        setAtlas(data);
        setProgress(1);
      } catch (err) {
        // Cache missed / server refused — fall back to a live run.
        console.warn("[preset] cached atlas failed, falling back to live:", err);
        setSeed({ version: Date.now(), values: preset.intake });
      } finally {
        setLoading(false);
      }
      return;
    }

    // No cache — fall through to the standard seed → form → submit flow.
    setSeed({ version: Date.now(), values: preset.intake });
  }

  const rightHasContent = loading || error || Boolean(atlas);

  return (
    <main className="lg:flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
      {/* LEFT PANE — form + presets. Scrollbar pinned to the LEFT edge via
         the scroll-left helper (rtl container, ltr child). */}
      <section
        aria-label="Intake"
        className="w-full lg:w-[42%] xl:w-[40%] 2xl:w-[36%]
                   border-b lg:border-b-0 lg:border-r border-ink-200
                   lg:overflow-y-auto lg:scroll-left pretty-scroll"
      >
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5">
          <PresetBar onRun={runPreset} />
          <AtlasForm onSubmit={handleSubmit} loading={loading} seed={seed} />
        </div>
      </section>

      {/* RIGHT PANE — atlas. Independently scrollable on desktop. Empty state
         is vertically centered; populated state flows from the top. */}
      <section
        ref={resultsRef}
        aria-label="Route atlas"
        className="w-full lg:flex-1 lg:overflow-y-auto pretty-scroll"
      >
        <div className="min-h-full flex flex-col px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div
            className={
              rightHasContent
                ? "w-full"
                : "m-auto w-full max-w-xl"
            }
          >
            <AtlasView
              loading={loading}
              error={error}
              atlas={atlas}
              progress={progress}
              streamChars={streamChars}
              onRetry={() => setError(null)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

// Collapsed demo control. Shows one button — "Try a demo." Click it to
// reveal a compact picker with the 4 preset personas. Click a persona to
// run it (which auto-closes the picker). Keeps the form pane uncluttered
// for users who want to fill their own intake.
function PresetBar({ onRun }) {
  const [open, setOpen] = useState(false);

  const handleRun = (preset) => {
    setOpen(false);
    onRun(preset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full inline-flex items-center justify-between gap-3
                   rounded-xl px-4 py-3 text-ink-900 font-semibold text-[13.5px]
                   gradient-shift border border-ink-200 relative overflow-hidden
                   min-h-[48px]"
        style={{
          background:
            "linear-gradient(120deg, #434F8C 0%, #5361A8 30%, #98A0C7 50%, #747EB3 70%, #434F8C 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px -10px rgba(116, 126, 179,0.55)",
        }}
      >
        <span className="relative flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, -10, 10, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex"
          >
            <Zap size={16} className="text-amber-700 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          </motion.span>
          <span>{open ? "Pick a demo" : "Try a demo"}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          className="inline-flex"
        >
          <ChevronDown size={14} className="text-ink-900/85" />
        </motion.span>
        {!open && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{
              duration: 2.6,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
            style={{
              background:
                "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
            }}
          />
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {DEMO_PRESETS.map((p) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => handleRun(p)}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] },
                    },
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="group inline-flex items-start gap-2 rounded-xl
                             bg-ink-100 hover:bg-ink-100
                             border border-ink-200 hover:border-brand-300
                             text-ink-800 text-[12px] font-semibold
                             px-3 py-2.5 text-left w-full min-h-[56px]"
                >
                  <span className="text-base leading-none mt-0.5 transition-transform group-hover:scale-110">
                    {p.emoji}
                  </span>
                  <span className="flex flex-col leading-tight min-w-0">
                    <span className="text-ink-900 truncate">{p.title}</span>
                    <span className="text-ink-500 text-[10.5px] font-normal line-clamp-2">
                      {p.tagline}
                    </span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// The form collects display-friendly defaults (empty strings for optional
// fields, years_since_nysc filled even when not relevant). Strip those so
// the backend's `optional({ values: "falsy" })` validators accept the body.
function normalizeIntake(values) {
  const out = { ...values };

  if (out.nysc_status !== "completed") {
    delete out.years_since_nysc;
  }

  ["class_of_degree", "university_tier", "health_constraints"].forEach((k) => {
    if (out[k] === "" || out[k] === null || out[k] === undefined) {
      delete out[k];
    }
  });

  // Spouse fields only matter when the user is partnered, AND only the
  // income matters when the spouse actually earns. Strip otherwise so the
  // backend doesn't act on stale default values.
  const partnered =
    out.marital_status === "in_relationship" || out.marital_status === "married";
  if (!partnered) {
    delete out.spouse_employment;
    delete out.spouse_monthly_income_ngn;
  } else {
    if (
      !out.spouse_employment ||
      out.spouse_employment === "unemployed" ||
      out.spouse_employment === "prefer_not_to_say"
    ) {
      delete out.spouse_monthly_income_ngn;
    }
  }

  if (!Array.isArray(out.existing_skills) || out.existing_skills.length === 0) {
    delete out.existing_skills;
  }
  if (!Array.isArray(out.hard_nos) || out.hard_nos.length === 0) {
    delete out.hard_nos;
  }

  return out;
}
