import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  RotateCw,
  Compass,
  Lightbulb,
  XCircle,
  LayoutGrid,
  Columns3,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  X as XIcon,
  Ban,
} from "lucide-react";
import { RouteCard } from "./RouteCard.jsx";
import { CompareView } from "./CompareView.jsx";
import { RouteComparisonBar } from "./RouteComparisonBar.jsx";
import { DecisionHeader } from "./DecisionHeader.jsx";
import { FollowupDrawer } from "./FollowupDrawer.jsx";
import { Logo } from "./Logo.jsx";
import {
  atlasIdFromIntake,
  loadAtlasProgress,
  setActionDone,
  countAtlasProgress,
} from "../lib/progress.js";
import { createSharedAtlas } from "../lib/api.js";

export function AtlasView({
  loading,
  error,
  atlas,
  progress = 0,
  streamChars = 0,
  onRetry,
}) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingState key="loading" progress={progress} streamChars={streamChars} />
      ) : error ? (
        <ErrorState key="error" message={error} onRetry={onRetry} />
      ) : !atlas ? (
        <EmptyState key="empty" />
      ) : (
        <Atlas key="atlas" atlas={atlas} />
      )}
    </AnimatePresence>
  );
}

function Atlas({ atlas }) {
  const routes = atlas.routes ?? [];
  const filtered = atlas.routes_filtered_out ?? [];
  const topFit = routes[0]?.fit_score;
  const [view, setView] = useState("cards"); // "cards" | "compare"

  // Atlas-level progress tracking. We derive a stable atlasId from the
  // intake so progress persists across reloads for the same situation,
  // and resets naturally when the user edits their intake.
  const atlasId = useMemo(() => atlasIdFromIntake(atlas.user), [atlas.user]);
  const [progress, setProgress] = useState(() =>
    loadAtlasProgress(atlasId, routes)
  );

  // Rehydrate whenever the atlas changes (user regenerates, or another
  // preset is clicked).
  useEffect(() => {
    setProgress(loadAtlasProgress(atlasId, routes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlasId]);

  const toggleAction = (routeId, actionIdx) => {
    const key = `${routeId}::${actionIdx}`;
    setProgress((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setActionDone(atlasId, routeId, actionIdx, next[key]);
      return next;
    });
  };

  const { done: totalDone, total: totalActions } = countAtlasProgress(
    progress,
    routes
  );

  // Follow-up drawer state — holds the single route the user clicked
  // "Ask a follow-up" on. Lifted here so only one drawer can be open
  // at a time regardless of which card triggered it.
  const [followupRoute, setFollowupRoute] = useState(null);

  // When triggered, expand every route card temporarily, wait one paint,
  // open the browser print dialog, then restore normal expansion state
  // when the print dialog closes.
  const [forceExpandAll, setForceExpandAll] = useState(false);
  const handleExportPdf = async () => {
    setForceExpandAll(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const cleanup = () => {
      setForceExpandAll(false);
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Fallback in case afterprint doesn't fire (some mobile browsers).
    setTimeout(cleanup, 2000);
  };

  // Share flow: POST the atlas to the backend, get a short ID back,
  // build the share URL and copy it to clipboard (with Web Share API
  // fallback on mobile). Three states: idle → busy → copied (for 2s).
  const [shareState, setShareState] = useState("idle");
  const [shareUrl, setShareUrl] = useState("");
  const handleShare = async () => {
    if (shareState === "busy") return;
    setShareState("busy");
    try {
      const id = await createSharedAtlas(atlas);
      const url = `${window.location.origin}/atlas/${id}`;
      setShareUrl(url);
      // Web Share API on mobile, clipboard everywhere else.
      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Route Atlas",
            text: "Here's my Route Atlas — 4 paths mapped from my situation:",
            url,
          });
          setShareState("copied");
        } catch {
          // User cancelled share sheet — still copy as fallback.
          await navigator.clipboard?.writeText(url);
          setShareState("copied");
        }
      } else {
        await navigator.clipboard?.writeText(url);
        setShareState("copied");
      }
      setTimeout(() => setShareState("idle"), 2500);
    } catch (err) {
      console.error("[share]", err);
      setShareState("idle");
      alert("Couldn't create share link. Please try again.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 atlas-printable"
    >
      <DecisionHeader atlas={atlas} />

      <SnapshotCard
        snapshot={atlas.user_snapshot}
        insight={atlas.headline_insight}
        topFit={topFit}
        totalDone={totalDone}
        totalActions={totalActions}
      />

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div>
          <h2 className="display text-[22px] md:text-[26px] tracking-extra-tight text-white leading-tight">
            Based on your profile, here are your best paths
          </h2>
          <p className="text-[12px] text-slate-500 mt-1">
            {routes.length} routes · ranked best-fit first · expand any route to open the full map
          </p>
        </div>
        <div className="flex items-center gap-2 no-print flex-wrap">
          <motion.button
            type="button"
            onClick={handleShare}
            disabled={shareState === "busy"}
            whileTap={{ scale: 0.96 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition min-h-[36px] ${
              shareState === "copied"
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-emerald-400/30 text-slate-200"
            }`}
            aria-label="Share this atlas"
          >
            {shareState === "copied" ? (
              <>
                <Check size={12} />
                <span className="hidden sm:inline">Link copied</span>
                <span className="sm:hidden">Copied</span>
              </>
            ) : shareState === "busy" ? (
              <>
                <Copy size={12} className="animate-pulse" />
                <span className="hidden sm:inline">Creating link…</span>
                <span className="sm:hidden">…</span>
              </>
            ) : (
              <>
                <Share2 size={12} />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/30 text-slate-200 transition min-h-[36px]"
            aria-label="Save atlas as PDF"
          >
            <Printer size={12} />
            <span className="hidden sm:inline">PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <ViewSwitcher view={view} onChange={setView} />
        </div>
        {shareState === "copied" && shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="basis-full text-[11px] text-emerald-300 tabular truncate"
          >
            {shareUrl}
          </motion.div>
        )}
      </motion.header>

      {view === "cards" && <RouteComparisonBar routes={routes} />}

      <AnimatePresence mode="wait">
        {view === "cards" ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-4"
          >
            {routes.map((route, i) => (
              <RouteCard
                key={route.id ?? i}
                route={route}
                index={i}
                isTop={i === 0}
                progress={progress}
                onToggleAction={toggleAction}
                forceExpanded={forceExpandAll}
                onAskFollowup={setFollowupRoute}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="compare" transition={{ duration: 0.25 }}>
            <CompareView routes={routes} />
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length > 0 && <FilteredOut items={filtered} />}

      <FollowupDrawer
        open={Boolean(followupRoute)}
        onClose={() => setFollowupRoute(null)}
        route={followupRoute}
        intake={atlas.user}
      />
    </motion.section>
  );
}

// Segmented control — Cards view vs Compare view. Pill slides between
// options using motion's layout animation so the active state glides.
function ViewSwitcher({ view, onChange }) {
  const options = [
    { id: "cards", label: "Cards", Icon: LayoutGrid },
    { id: "compare", label: "Compare", Icon: Columns3 },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] ring-1 ring-white/10">
      {options.map((opt) => {
        const active = view === opt.id;
        const Icon = opt.Icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition"
          >
            {active && (
              <motion.span
                layoutId="view-pill"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600/80 to-accent-500/80 ring-1 ring-white/15"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 20px -6px rgba(20,184,166,0.55)",
                }}
              />
            )}
            <span className={`relative z-10 inline-flex items-center gap-1.5 ${active ? "text-white" : "text-slate-400 hover:text-white"}`}>
              <Icon size={12} />
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SnapshotCard({ snapshot, insight, topFit, totalDone = 0, totalActions = 0 }) {
  const pct = totalActions > 0 ? Math.round((totalDone / totalActions) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="card p-5 relative overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-0 w-72 h-40 bg-brand-500/15 blur-3xl rounded-full ambient-pulse"
      />
      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-start">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(140deg, #10b981, #14b8a6)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 18px -6px rgba(16,185,129,0.5)",
          }}
        >
          <Compass size={16} className="text-white" />
        </motion.div>
        <div>
          <div className="eyebrow text-brand-300/80">Based on your profile</div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[14px] md:text-[15px] text-slate-100 mt-1.5 leading-relaxed"
          >
            {snapshot}
          </motion.p>
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-3.5"
            >
              <div className="eyebrow text-amber-300 flex items-center gap-1.5">
                <Lightbulb size={10} /> Headline insight
              </div>
              <p className="text-[13px] text-amber-50/90 mt-1.5 leading-relaxed">
                {insight}
              </p>
            </motion.div>
          )}
        </div>
        {typeof topFit === "number" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="hidden md:flex flex-col items-end text-right"
          >
            <div className="eyebrow text-slate-500">Top match</div>
            <div className="display text-[26px] tracking-extra-tight text-white tabular mt-0.5">
              {Math.round(topFit)}
              <span className="text-brand-300 text-[14px]">%</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress across all routes. Shows only when the user has at least
          one action checked, otherwise the bar feels like clutter. */}
      {totalActions > 0 && totalDone > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="relative mt-4 pt-4 border-t border-white/[0.06]"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 size={11} />
              <span className="uppercase tracking-wider">Your progress</span>
            </div>
            <div className="text-[11px] text-slate-400 tabular">
              <span className="text-emerald-300 font-semibold">{totalDone}</span>
              <span className="text-slate-500"> / {totalActions} Monday actions</span>
              <span className="text-slate-600 ml-2">· {pct}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, #10b981 0%, #2dd4bf 50%, #10b981 100%)",
                boxShadow: "0 0 14px -2px rgba(16,185,129,0.6)",
              }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Muted "Routes Not Recommended" section — shows the routes the model
// considered and rejected for this user. Each rejection cites a specific
// user constraint (the backend prompt enforces this).
//
// Visual treatment: lower emphasis than the main recommendation cards —
// dashed border, near-transparent background, muted slate text, line-
// through on route names. Still readable but immediately scannable as
// "these are NOT your recommendations."
function FilteredOut({ items }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] p-4 sm:p-5"
      aria-label="Routes not recommended"
    >
      <header className="flex items-center justify-between gap-3 flex-wrap pb-3 mb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <Ban size={11} className="text-slate-500" />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Routes not recommended
          </span>
        </div>
        <span className="text-[10.5px] text-slate-600 tabular">
          {items.length} considered · ruled out for your situation
        </span>
      </header>

      <ul className="space-y-3">
        {items.map((it, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="flex items-start gap-3 group"
          >
            <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-md border border-white/[0.08] bg-white/[0.02] text-slate-600">
              <XIcon size={10} strokeWidth={2.5} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-slate-400 leading-snug decoration-slate-700 line-through underline-offset-2">
                {it.route}
              </div>
              <div className="text-[12px] text-slate-500 leading-relaxed mt-0.5">
                {it.reason}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-10 text-center relative overflow-hidden"
    >
      {/* Ambient glow behind the whole card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-brand-500/20 to-accent-500/20 rounded-full blur-3xl"
      />
      <div className="relative">
        {/* Logo hero: the logo continuously floats up-and-down, and a
            radial emerald halo behind it expands+contracts on its own beat,
            so the mark feels "breathing" while the atlas is waiting. */}
        <motion.div
          className="mx-auto mb-5 relative flex items-center justify-center w-24 h-24"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.65) 0%, rgba(20,184,166,0.25) 45%, transparent 75%)",
              filter: "blur(14px)",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.18) 60deg, transparent 120deg, transparent 240deg, rgba(20,184,166,0.18) 300deg, transparent 360deg)",
              borderRadius: "9999px",
            }}
          />
          <Logo size={84} className="relative" />
        </motion.div>
        <h3 className="display text-xl tracking-extra-tight text-white">
          Your atlas is blank
        </h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Fill the intake — or click <span className="text-emerald-300 font-semibold">Try Demo</span> — and we'll map 4 real routes forward from your exact situation.
        </p>
      </div>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-6"
      style={{
        borderColor: "rgba(244, 63, 94, 0.3)",
        background: "rgba(244, 63, 94, 0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-rose-300 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-rose-100">Something went wrong</h3>
          <p className="text-sm text-rose-200/80 mt-1">{message}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-secondary mt-3">
              <RotateCw size={14} />
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LoadingState({ progress = 0, streamChars = 0 }) {
  const pct = Math.min(100, Math.round(progress * 100));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="card p-5 relative overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 w-64 h-32 rounded-full bg-brand-500/20 blur-3xl ambient-pulse"
        />
        <div className="relative flex items-center gap-2 text-brand-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
          </span>
          <Compass size={14} className="text-brand-300" />
          <LoadingMessage streaming={streamChars > 0} />
        </div>

        {/* Live progress bar. Motion width follows the progress prop; a
            shimmering overlay keeps motion visible even when progress pauses
            between chunks. */}
        <div className="relative mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(90deg, #10b981 0%, #2dd4bf 50%, #10b981 100%)",
              backgroundSize: "200% 100%",
              boxShadow: "0 0 18px -2px rgba(20,184,166,0.6)",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 w-20"
            initial={{ x: "-100%" }}
            animate={{ x: `${pct * 1.2}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              filter: "blur(6px)",
              opacity: pct < 100 ? 1 : 0,
            }}
          />
        </div>

        <div className="relative mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
          <span>
            {streamChars > 0
              ? `Streaming · ${streamChars.toLocaleString()} chars received`
              : "Opus 4.7 is reasoning through your situation"}
          </span>
          <span className="tabular text-slate-400 font-semibold">{pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-5 relative overflow-hidden">
            <Shimmer />
            <div className="relative">
              <div className="flex gap-2 items-center">
                <div className="w-16 h-4 rounded bg-white/5" />
                <div className="w-12 h-4 rounded bg-white/5" />
              </div>
              <div className="mt-3 h-5 w-3/4 rounded bg-white/5" />
              <div className="mt-2 h-3 w-full rounded bg-white/5" />
              <div className="mt-4 h-20 rounded bg-white/5" />
              <div className="mt-4 h-10 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Shimmer() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        animation: "shimmer 1.6s linear infinite",
        background:
          "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

const LOADING_MESSAGES_THINKING = [
  "Reading your situation…",
  "Mapping the Nigerian landscape…",
];
const LOADING_MESSAGES_STREAMING = [
  "Weighing your savings and obligations…",
  "Ruling out routes that don't fit…",
  "Drawing the first Monday actions…",
  "Calibrating 2-year projections…",
  "Finalizing pro tips…",
];
function LoadingMessage({ streaming }) {
  const [idx, setIdx] = useState(0);
  const messages = streaming ? LOADING_MESSAGES_STREAMING : LOADING_MESSAGES_THINKING;
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(id);
  }, [messages.length]);
  // Reset index when switching phases so the first streaming message is fresh.
  useEffect(() => {
    setIdx(0);
  }, [streaming]);
  return (
    <span className="text-sm font-medium">
      <AnimatePresence mode="wait">
        <motion.span
          key={`${streaming}-${idx}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          {messages[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
