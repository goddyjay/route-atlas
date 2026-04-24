import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Target,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { checkCv } from "../lib/api.js";

// CV ATS checker. Paste CV → the analysis returns a structured dossier showing
// ATS score, critical fixes, keyword gaps, formatting issues, and rewritten
// sections. Complements the atlas: atlas tells you WHICH route, job_sites
// tell you WHERE, this page makes sure your CV passes the filter.

const EXAMPLE_CV = `GODWIN ADEOLUWA
Lagos, Nigeria · godwin@example.com · 090-XXX-XXXX

PROFILE
Microbiology graduate with 1 year post-NYSC experience. Passionate about
science and open to opportunities.

EDUCATION
University of Ibadan — B.Sc Microbiology, Second Class Upper (2023)
NYSC — Ogun State (2024)

EXPERIENCE
Home Lesson Teacher — 2024 to present
 - Taught students at home
 - Handled customers and communicated well

SKILLS
Excel, Microsoft Word, Hard-working, Team player`;

export default function CvCheckPage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvText.trim() || cvText.trim().length < 50) {
      setError("Paste your CV text first (at least 50 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await checkCv({
        cv_text: cvText.trim(),
        target_role: targetRole.trim() || undefined,
      });
      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
      <Header />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT — input */}
        <section className="lg:col-span-5 xl:col-span-5">
          <form onSubmit={handleSubmit} className="card p-4 sm:p-5 space-y-4">
            <div>
              <label className="field-label">Target role (optional)</label>
              <input
                type="text"
                placeholder="e.g. Pharma QA Analyst, Remote Finance, NHS Care Worker"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                maxLength={200}
                className="field-input"
              />
              <p className="text-[11px] text-ink-500 mt-1.5">
                Leave blank for general Nigerian recruitment analysis.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label !mb-0">Paste your CV text</label>
                <button
                  type="button"
                  onClick={() => setCvText(EXAMPLE_CV)}
                  className="text-[10.5px] font-semibold text-emerald-600 hover:text-emerald-700 transition"
                >
                  Try a sample CV
                </button>
              </div>
              <textarea
                rows={16}
                placeholder="Paste the full text of your CV here. Just the content — we'll handle the ATS analysis."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                maxLength={20000}
                className="field-input resize-none font-mono text-[12.5px] leading-relaxed"
                style={{ minHeight: "340px" }}
              />
              <div className="flex items-center justify-between text-[11px] text-ink-500 mt-1.5">
                <span>{cvText.length.toLocaleString()} / 20,000 chars</span>
                {cvText.length > 0 && cvText.length < 50 && (
                  <span className="text-amber-600">Need at least 50 chars</span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || cvText.trim().length < 50}
              whileTap={{ scale: 0.99 }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                         px-5 py-3 text-ink-900 font-semibold text-[13.5px]
                         gradient-shift border border-ink-200 min-h-[48px]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(120deg, #434F8C 0%, #5361A8 30%, #98A0C7 50%, #747EB3 70%, #434F8C 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px -10px rgba(116, 126, 179,0.55)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Running ATS analysis…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Check my CV
                </>
              )}
            </motion.button>
            <p className="text-center text-[11px] text-ink-500">
              ~20 seconds · Nigerian recruitment context
            </p>
          </form>
        </section>

        {/* RIGHT — results */}
        <section ref={resultsRef} className="lg:col-span-7 xl:col-span-7">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState key="loading" />
            ) : result ? (
              <CvDossier key="dossier" data={result} />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-[720px] mx-auto"
    >
      <div className="inline-flex items-center gap-2 chip mb-4">
        <Sparkles size={11} className="text-emerald-600" />
        New · Pairs with your Route Atlas
      </div>
      <h1 className="display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.08] tracking-extra-tight text-ink-900">
        Will your CV clear the ATS?
      </h1>
      <p className="text-ink-500 text-[14px] sm:text-[15px] mt-3 leading-relaxed">
        Paste your CV. We grade it against Nigerian recruitment norms and
        global ATS filters, then rewrite the weak sections.
      </p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="card p-8 sm:p-10 text-center relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-brand-500/20 to-accent-500/20 rounded-full blur-3xl"
      />
      <div className="relative">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(140deg, #5361A8, #747EB3)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 30px -8px rgba(83, 97, 168,0.5)",
          }}
        >
          <FileText size={24} className="text-ink-900" />
        </motion.div>
        <h3 className="display text-xl tracking-extra-tight text-ink-900">
          Awaiting your CV
        </h3>
        <p className="text-sm text-ink-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Paste your CV. Output: ATS score, priority fixes, keyword gaps, formatting risks,
          and rewritten sections. ~20 seconds.
        </p>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="card p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <Loader2 size={14} className="animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Running ATS analysis…</span>
      </div>
      <p className="text-[11px] text-ink-500 mt-2 ml-5">
        15–25 seconds · score, keyword match, formatting risks, rewrites
      </p>

      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-ink-50 border border-ink-200 p-4 relative overflow-hidden">
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
            <div className="relative">
              <div className="h-4 w-1/3 rounded bg-white/5" />
              <div className="mt-3 h-3 w-full rounded bg-white/5" />
              <div className="mt-1.5 h-3 w-4/5 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ----- Dossier output ----------------------------------------------------

const VERDICT_STYLES = {
  "ATS-ready": {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    ring: "#5361A8",
  },
  Solid: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-200",
    ring: "#747EB3",
  },
  Borderline: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    ring: "#fbbf24",
  },
  "Needs major rework": {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    ring: "#fb7185",
  },
};

const PRIORITY_STYLES = {
  Critical: "bg-rose-100 text-rose-700 border-rose-300",
  High: "bg-amber-100 text-amber-700 border-amber-300",
  Medium: "bg-ink-100 text-ink-700 border-ink-200",
};

function CvDossier({ data }) {
  const verdict = VERDICT_STYLES[data.score_verdict] ?? VERDICT_STYLES.Borderline;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* HEADER — score + verdict + summary */}
      <div className="card p-5 sm:p-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-0 w-72 h-40 bg-emerald-50 blur-3xl rounded-full ambient-pulse"
        />
        <div className="relative grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-center">
          <ScoreRing score={data.ats_score} color={verdict.ring} />
          <div className="min-w-0">
            <div className="eyebrow text-ink-500">ATS verdict</div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border mt-1.5 ${verdict.bg} ${verdict.text} ${verdict.border}`}
            >
              {data.score_verdict}
            </div>
            <p className="text-[14px] text-ink-900 mt-3 leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      {/* TOP FIXES */}
      {data.top_fixes?.length > 0 && (
        <DossierBlock label="Top fixes" icon={Pencil}>
          <ol className="space-y-3">
            {data.top_fixes.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
                className="rounded-xl border border-ink-200 bg-ink-50 p-3.5"
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${PRIORITY_STYLES[f.priority] ?? PRIORITY_STYLES.Medium}`}
                  >
                    {f.priority}
                  </span>
                  <span className="text-[10px] font-bold tabular text-ink-500">
                    FIX {i + 1}
                  </span>
                </div>
                <div className="text-[13px] text-ink-900 font-semibold leading-snug">
                  {f.issue}
                </div>
                <div className="text-[12.5px] text-emerald-700/90 mt-2 leading-relaxed border-l-2 border-emerald-300 pl-3">
                  <span className="text-emerald-600 font-semibold">Do this:</span> {f.fix}
                </div>
              </motion.li>
            ))}
          </ol>
        </DossierBlock>
      )}

      {/* REWRITTEN SECTIONS — before/after */}
      {data.rewritten_sections?.length > 0 && (
        <DossierBlock label="Rewritten sections" icon={ArrowRight}>
          <div className="space-y-3">
            {data.rewritten_sections.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-ink-200 bg-ink-50 p-3.5"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2.5">
                  {r.section}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1.5">
                      Before
                    </div>
                    <p className="text-[12.5px] text-rose-700/80 leading-relaxed">
                      {r.before}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
                      After
                    </div>
                    <p className="text-[12.5px] text-emerald-50/90 leading-relaxed">
                      {r.after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DossierBlock>
      )}

      {/* KEYWORD GAPS */}
      {data.keyword_gaps?.length > 0 && (
        <DossierBlock label="Keywords to add" icon={KeyRound}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.keyword_gaps.map((k, i) => (
              <div
                key={i}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
              >
                <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
                  <Target size={11} className="text-emerald-600" />
                  {k.keyword}
                </div>
                <div className="text-[11.5px] text-ink-500 leading-snug mt-1">
                  {k.where_to_add}
                </div>
              </div>
            ))}
          </div>
        </DossierBlock>
      )}

      {/* FORMATTING ISSUES */}
      {data.formatting_issues?.length > 0 && (
        <DossierBlock label="Formatting risks" icon={AlertTriangle} accent="rose">
          <ul className="space-y-2">
            {data.formatting_issues.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[12.5px] text-rose-700/90 leading-relaxed"
              >
                <AlertTriangle size={12} className="text-rose-600 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-rose-700">{f.issue}</span>
                  <span className="text-rose-700/70"> — {f.impact}</span>
                </span>
              </li>
            ))}
          </ul>
        </DossierBlock>
      )}

      {/* NIGERIAN NOTES */}
      {data.nigerian_notes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="eyebrow text-amber-600 flex items-center gap-1.5 mb-2">
            <Sparkles size={10} /> Nigerian recruitment note
          </div>
          <p className="text-[12.5px] text-amber-50/90 leading-relaxed">
            {data.nigerian_notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function DossierBlock({ label, icon: Icon, accent = "default", children }) {
  const accentMap = {
    default: "text-ink-500 border-ink-200",
    rose: "text-rose-600 border-rose-200",
  };
  const color = accentMap[accent] ?? accentMap.default;
  return (
    <section className="card p-5 space-y-3">
      <div
        className={`flex items-center gap-2 pb-2 border-b text-[10.5px] font-bold uppercase tracking-[0.16em] ${color}`}
      >
        {Icon && <Icon size={11} />}
        {label}
      </div>
      {children}
    </section>
  );
}

function ScoreRing({ score, color }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(pct * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);
  return (
    <div className="relative w-24 h-24 flex items-center justify-center mx-auto sm:mx-0 shrink-0">
      <svg viewBox="0 0 96 96" width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={r}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="display text-[30px] font-extrabold text-ink-900 tabular">
          {display}
        </span>
        <span className="text-[9px] uppercase tracking-[0.16em] text-ink-500 font-bold mt-0.5">
          ATS score
        </span>
      </div>
    </div>
  );
}
