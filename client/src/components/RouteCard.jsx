import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Crown,
  AlertTriangle,
  Wallet,
  Clock,
  MapPin,
  Users,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Flame,
  Snowflake,
  Minus,
  TrendingUp,
  ExternalLink,
  Globe,
  MessageCircleQuestion,
} from "lucide-react";

const CATEGORY_STYLES = {
  "Local Formal": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  "Local Informal": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Remote Digital": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Trade/Apprenticeship": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "JAPA": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "Entrepreneurship": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  "Hybrid": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

const DEMAND_STYLES = {
  High: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    Icon: Flame,
    label: "High demand",
  },
  Medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    Icon: Minus,
    label: "Medium demand",
  },
  Low: {
    bg: "bg-slate-500/15",
    text: "text-ink-700",
    border: "border-ink-200",
    Icon: Snowflake,
    label: "Low demand",
  },
};

function fmtNaira(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${n}`;
}

// Safe URL → hostname extractor. Falls back to the raw URL if parsing fails
// (e.g. the model returns a malformed URL — shouldn't happen given the
// validator, but we don't want a bad URL to crash the card render).
function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function humanMonths(n) {
  if (typeof n !== "number" || n <= 0) return "right away";
  if (n < 1) return "under a month";
  if (n === 1) return "1 month";
  if (n < 12) return `${n} months`;
  if (n === 12) return "a year";
  return `${(n / 12).toFixed(1)} years`;
}

export function RouteCard({
  route,
  index,
  isTop,
  progress = {},
  onToggleAction,
  forceExpanded = false,
  onAskFollowup,
}) {
  const [localExpanded, setLocalExpanded] = useState(isTop);
  // Parent can force-expand (e.g. when the user triggers Export PDF and we
  // want every card's detail visible in the print output). Local state is
  // preserved otherwise so users can toggle cards independently.
  const expanded = forceExpanded || localExpanded;
  const setExpanded = setLocalExpanded;
  const cat = CATEGORY_STYLES[route.category] ?? CATEGORY_STYLES["Hybrid"];
  const demand = DEMAND_STYLES[route.demand] ?? DEMAND_STYLES["Medium"];

  const actions = route.monday_actions ?? [];
  const isDone = (i) => progress[`${route.id}::${i}`] === true;
  const doneCount = actions.reduce((n, _, i) => n + (isDone(i) ? 1 : 0), 0);

  return (
    <motion.article
      id={`route-${route.id}`}
      style={{ scrollMarginTop: "16px" }}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className="card card-hover p-4 sm:p-5 relative overflow-visible"
    >
      {/* Top card "bloom" — one-time radial halo that announces the best fit
         to the eye. Lives inside the card, behind all content. */}
      {isTop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0 rounded-2xl bloom"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(152, 160, 199,0.35) 0%, rgba(83, 97, 168,0.18) 50%, transparent 75%)",
          }}
        />
      )}

      {/* Inner wrapper keeps content above the bloom layer. */}
      <div className="relative z-10">
      <header className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {isTop && <BestFitBadge />}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cat.bg} ${cat.text} ${cat.border}`}
            >
              {route.category}
            </span>
            <DemandChip demand={demand} />
          </div>
          <h3 className="display text-[17px] sm:text-[18px] md:text-[20px] leading-[1.15] tracking-extra-tight text-ink-900 mt-2 sm:mt-2.5">
            {route.title}
          </h3>
          <p className="text-[12px] sm:text-[12.5px] text-ink-500 mt-1.5 leading-snug">
            {route.one_liner}
          </p>
        </div>
        <ConfidenceRing score={route.fit_score} />
      </header>

      {/* "Why this fits you" callout — personalized reasons */}
      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
        <div className="eyebrow text-brand-600 flex items-center gap-1.5 mb-2">
          <Target size={10} /> Why this fits you
        </div>
        <div className="space-y-1.5">
          {route.fit_reasons?.slice(0, 3).map((fr, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-2 text-[12.5px] text-ink-800"
            >
              <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <span className="text-brand-600/80 font-semibold">{fr.dimension}:</span>{" "}
                <span>{fr.note}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guided helper row — earning timeline + pay range */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <GuidedStat
          icon={Clock}
          label="Start earning in"
          value={humanMonths(route.real_cost?.time_months)}
          accent="brand"
        />
        <GuidedStat
          icon={Wallet}
          label="Monthly pay"
          value={
            <>
              {fmtNaira(route.real_pay?.entry_ngn)}
              <span className="text-ink-500"> → </span>
              {fmtNaira(route.real_pay?.senior_ngn)}
              <span className="text-ink-500">+</span>
            </>
          }
          accent="emerald"
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 w-full inline-flex items-center justify-between gap-2 rounded-lg px-3.5 py-3 sm:py-2.5 text-[12.5px] font-semibold bg-ink-100 hover:bg-ink-100 border border-ink-200 text-ink-900 transition min-h-[44px]"
      >
        <span>{expanded ? "Collapse the route" : "See the full route"}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ExpandedDetail
              route={route}
              isDone={isDone}
              onToggleAction={onToggleAction}
              doneCount={doneCount}
              onAskFollowup={onAskFollowup}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.article>
  );
}

function ExpandedDetail({ route, isDone, onToggleAction, doneCount, onAskFollowup }) {
  const actions = route.monday_actions ?? [];
  const roadmap = route.roadmap ?? [];
  // Income path derives entry/12mo/24mo from the 3-phase roadmap. If a
  // roadmap phase is missing we fall back to real_pay bands.
  const incomePath = [
    {
      label: "Entry",
      amount: roadmap[0]?.income_by_end_ngn ?? route.real_pay?.entry_ngn,
      focus: roadmap[0]?.focus ?? "First 90 days",
      milestones: roadmap[0]?.milestones ?? [],
    },
    {
      label: "12 months",
      amount: roadmap[1]?.income_by_end_ngn ?? route.real_pay?.mid_ngn,
      focus: roadmap[1]?.focus ?? "Mid stretch",
      milestones: roadmap[1]?.milestones ?? [],
    },
    {
      label: "24 months",
      amount: roadmap[2]?.income_by_end_ngn ?? route.real_pay?.senior_ngn,
      focus: roadmap[2]?.focus ?? "Year 2",
      milestones: roadmap[2]?.milestones ?? [],
    },
  ];
  return (
    <div className="pt-5 space-y-6">
      {/* === WHY THIS FITS === */}
      <DossierSection label="Why this fits">
        <ul className="space-y-2">
          {route.fit_reasons?.map((fr, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
              className="flex items-start gap-2.5 text-[13px] text-ink-800 leading-relaxed"
            >
              <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-emerald-600">{fr.dimension}:</span>{" "}
                {fr.note}
              </span>
            </motion.li>
          ))}
        </ul>
      </DossierSection>

      {/* === INCOME PATH === entry → 12mo → 24mo progression */}
      <DossierSection label="Income path">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {incomePath.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
              className="relative rounded-xl border border-ink-200 bg-ink-50 p-3.5"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 tabular">
                {step.label}
              </div>
              <div className="mt-1 display text-[22px] tracking-extra-tight text-emerald-600 tabular leading-none">
                {fmtNaira(step.amount)}
                <span className="text-[10px] font-semibold text-ink-500 ml-1 tracking-normal">/mo</span>
              </div>
              <div className="mt-1.5 text-[11.5px] text-ink-500 font-semibold">
                {step.focus}
              </div>
              {step.milestones?.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {step.milestones.slice(0, 2).map((m, j) => (
                    <li key={j} className="text-[11px] text-ink-500 leading-snug flex items-start gap-1">
                      <span className="text-ink-400">·</span>
                      <span className="flex-1">{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </DossierSection>

      {/* === KEY NUMBERS === inline stats row */}
      <DossierSection label="Numbers">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat label="Time to first income" value={humanMonths(route.real_cost?.time_months)} />
          <Stat label="Upfront cost" value={fmtNaira(route.real_cost?.money_ngn)} />
          <Stat
            label="Senior ceiling"
            value={<>{fmtNaira(route.real_pay?.senior_ngn)}<span className="text-emerald-600">+</span></>}
            accent="emerald"
          />
        </div>
        {route.real_cost?.what_you_give_up && (
          <p className="mt-2.5 text-[11.5px] text-ink-500 leading-snug italic">
            What you give up: {route.real_cost.what_you_give_up}
          </p>
        )}
      </DossierSection>

      {/* === 2-YEAR PROJECTION === */}
      {route.two_year_projection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl p-4 border border-accent-300"
          style={{
            background:
              "radial-gradient(110% 100% at 100% 0%, rgba(152, 160, 199, 0.18) 0%, transparent 55%), radial-gradient(80% 80% at 0% 100%, rgba(83, 97, 168, 0.14) 0%, transparent 60%), rgba(255,255,255,0.02)",
          }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-8 w-32 h-32 rounded-full bg-accent-500/25 blur-3xl ambient-pulse"
          />
          <div className="relative flex items-start gap-2.5">
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-lg bg-accent-100 border border-accent-300 flex items-center justify-center shrink-0"
            >
              <CrystalBallIcon />
            </motion.div>
            <div>
              <div className="eyebrow text-accent-600 flex items-center gap-1.5">
                <TrendingUp size={10} /> 2-year projection
              </div>
              <p className="text-[13px] text-teal-50/90 mt-1.5 leading-relaxed">
                {route.two_year_projection}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <DossierSection
        label={
          <span className="inline-flex items-center gap-2">
            Monday actions
            {actions.length > 0 && (
              <span
                className={`text-[10px] font-bold tabular px-1.5 py-0.5 rounded ${
                  doneCount > 0
                    ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                    : "bg-ink-100 text-ink-500 border border-ink-200"
                }`}
              >
                {doneCount}/{actions.length}
              </span>
            )}
          </span>
        }
        icon={ArrowUpRight}
      >
        <motion.ol
          className="space-y-1.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        >
          {actions.map((m, i) => {
            const done = isDone?.(i) ?? false;
            return (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -6 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } },
                }}
                className="flex items-start gap-2.5 text-[12.5px] text-ink-800 leading-relaxed"
              >
                <motion.button
                  type="button"
                  onClick={() => onToggleAction?.(route.id, i)}
                  aria-pressed={done}
                  aria-label={done ? "Mark action undone" : "Mark action done"}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className={`shrink-0 w-5 h-5 rounded-md inline-flex items-center justify-center mt-0.5 transition min-w-[20px] ${
                    done
                      ? "bg-emerald-100 text-emerald-600 border border-emerald-300"
                      : "bg-ink-100 text-ink-500 border border-ink-200 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[10px] font-bold tabular">{i + 1}</span>
                  )}
                </motion.button>
                <span
                  className={`flex-1 transition ${
                    done ? "line-through text-ink-500" : ""
                  }`}
                >
                  {m.step}
                  <span className="text-ink-500 text-[11px]"> · within {m.deadline_days}d</span>
                </span>
              </motion.li>
            );
          })}
        </motion.ol>
      </DossierSection>

      {/* === INSIDER EDGE === (was Pro tips) */}
      {route.pro_tips?.length > 0 && (
        <DossierSection label="Insider edge" accent="amber">
          <ul className="space-y-2">
            {route.pro_tips.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-2.5 text-[13px] text-amber-50/90 leading-relaxed"
              >
                <Lightbulb size={12} className="text-amber-600 mt-0.5 shrink-0" />
                <span className="flex-1">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </DossierSection>
      )}

      {/* === THIS ROUTE BREAKS IF === (merged break_reasons + who_this_breaks) */}
      <DossierSection label="This route breaks if" accent="rose">
        <ul className="space-y-2">
          {route.break_reasons?.map((br, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-rose-700/90 leading-relaxed">
              <SeverityPill severity={br.severity} />
              <span className="flex-1">{br.risk}</span>
            </li>
          ))}
          {route.who_this_breaks && (
            <li className="flex items-start gap-2.5 text-[12.5px] text-rose-700/70 leading-relaxed italic pt-1 border-t border-rose-400/10 mt-1">
              <AlertTriangle size={11} className="text-rose-600 mt-0.5 shrink-0" />
              <span className="flex-1">{route.who_this_breaks}</span>
            </li>
          )}
        </ul>
      </DossierSection>

      {/* === WHERE TO APPLY === */}
      {route.job_sites?.length > 0 && (
        <DossierSection label="Where to apply">
          <div className="flex flex-col gap-1.5">
            {route.job_sites.map((site, i) => (
              <motion.a
                key={i}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + i * 0.06 }}
                whileHover={{ x: 2 }}
                className="group flex items-start justify-between gap-3 rounded-lg border border-ink-200 bg-ink-50 hover:bg-ink-100 hover:border-emerald-300 px-3.5 py-3 transition min-h-[52px]"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <ExternalLink
                    size={13}
                    className="text-emerald-600 mt-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900 truncate">
                      {site.name}
                    </div>
                    <div className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
                      {site.why}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-ink-400 font-mono shrink-0 hidden sm:inline self-center">
                  {hostnameFromUrl(site.url)}
                </span>
              </motion.a>
            ))}
          </div>
        </DossierSection>
      )}

      {route.nigerian_notes && (
        <p className="text-[12px] text-ink-500 leading-snug italic border-l-2 border-slate-700 pl-3">
          {route.nigerian_notes}
        </p>
      )}

      {onAskFollowup && (
        <motion.button
          type="button"
          onClick={() => onAskFollowup(route)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="w-full inline-flex items-center justify-between gap-2 rounded-xl
                     px-4 py-3 text-[13px] font-semibold
                     bg-emerald-50 hover:bg-emerald-100
                     border border-emerald-200 hover:border-emerald-300
                     text-emerald-700 transition min-h-[48px] no-print"
        >
          <span className="inline-flex items-center gap-2">
            <MessageCircleQuestion size={14} />
            Ask a follow-up about this route
          </span>
          <ArrowUpRight size={12} className="text-emerald-600" />
        </motion.button>
      )}
    </div>
  );
}

// ----- Supporting components --------------------------------------------

// Dossier-style section wrapper. Uppercase eyebrow label + divider line +
// content. Gives each section a strong visual break so the expanded route
// reads as a structured report rather than a wall of text.
function DossierSection({ label, accent = "default", children }) {
  const accentMap = {
    default: "text-ink-500 border-ink-200",
    amber: "text-amber-600 border-amber-200",
    rose: "text-rose-600 border-rose-200",
    emerald: "text-emerald-600 border-emerald-200",
  };
  const color = accentMap[accent] ?? accentMap.default;
  return (
    <section className="space-y-3">
      <div
        className={`flex items-center gap-2 pb-2 border-b text-[10.5px] font-bold uppercase tracking-[0.16em] ${color}`}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

// Inline stat card — used in the Numbers row.
function Stat({ label, value, accent = "default" }) {
  const valColor = accent === "emerald" ? "text-emerald-600" : "text-ink-900";
  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
        {label}
      </div>
      <div className={`mt-1 display text-[18px] font-bold tabular tracking-extra-tight ${valColor}`}>
        {value}
      </div>
    </div>
  );
}

// Gold "Best fit" pill — lives inline with the category chip row on the top
// card so it doesn't collide with the confidence ring on the right.
function BestFitBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.25 }}
    >
      <motion.span
        animate={{
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px -2px rgba(245,158,11,0.4)",
            "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 14px -2px rgba(245,158,11,0.75)",
            "inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px -2px rgba(245,158,11,0.4)",
          ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5 text-[10px] font-semibold"
        style={{
          background: "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(245,158,11,0.95))",
          color: "#422006",
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <Crown size={10} />
        Best fit
      </motion.span>
    </motion.span>
  );
}

// Vertical journey with a gradient connector line that fills as phases land.
// Each phase slides in, then its milestones stagger after it — the whole thing
// reads as a 20–30 month journey unfolding.
function Timeline({ roadmap }) {
  return (
    <motion.div
      className="relative"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
    >
      {/* Vertical connector line — draws in once the first phase lands. */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        style={{ originY: 0 }}
        className="absolute left-[11px] top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-brand-400/70 via-brand-500/30 to-transparent"
      />

      <div className="space-y-3">
        {roadmap.map((ph, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
              },
            }}
            className="relative pl-7"
          >
            {/* Node dot on the connector line. */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: 0.2 + i * 0.14,
              }}
              className="absolute left-[5px] top-1.5 w-[14px] h-[14px] rounded-full border-2 border-brand-400 bg-white"
              style={{
                boxShadow: "0 0 0 3px rgba(83, 97, 168,0.2), 0 0 14px -2px rgba(83, 97, 168,0.55)",
              }}
            />
            <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                    {ph.period}
                  </div>
                  <div className="text-[13px] text-ink-900 font-semibold mt-0.5">
                    {ph.focus}
                  </div>
                </div>
                <div className="text-[11px] tabular text-emerald-600 font-semibold shrink-0">
                  {fmtNaira(ph.income_by_end_ngn)}/mo
                </div>
              </div>
              <motion.ul
                className="mt-2 space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.3 + i * 0.14,
                    },
                  },
                }}
              >
                {ph.milestones?.map((ms, j) => (
                  <motion.li
                    key={j}
                    variants={{
                      hidden: { opacity: 0, x: -4 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.25, ease: "easeOut" },
                      },
                    }}
                    className="text-[12px] text-ink-700 flex items-start gap-2"
                  >
                    <span className="text-ink-400 mt-0.5">·</span>
                    <span>{ms}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ConfidenceRing({ score }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = pct >= 85 ? "#5361A8" : pct >= 70 ? "#fbbf24" : "#98A0C7";
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className="shrink-0 relative w-14 h-14 flex items-center justify-center"
      aria-label={`${pct} percent fit`}
      title={`${pct}% match`}
    >
      <svg viewBox="0 0 56 56" width="56" height="56" className="-rotate-90">
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
          fill="none"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <AnimatedPercent value={pct} />
        <span className="text-[8.5px] uppercase tracking-[0.14em] text-ink-500 font-bold mt-0.5">
          fit
        </span>
      </div>
    </motion.div>
  );
}

function AnimatedPercent({ value }) {
  // Ease-out cubic tween from 0 to `value` over ~1s using rAF.
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="text-[17px] font-extrabold text-ink-900 tabular leading-none">
      {display}
      <span className="text-brand-600 text-[10px] font-bold">%</span>
    </span>
  );
}

function DemandChip({ demand }) {
  const { Icon } = demand;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${demand.bg} ${demand.text} ${demand.border}`}
    >
      <Icon size={9} />
      {demand.label}
    </span>
  );
}

function GuidedStat({ icon: Icon, label, value, accent = "brand" }) {
  const valColor = accent === "emerald" ? "text-emerald-600" : "text-ink-900";
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
        <Icon size={10} />
        {label}
      </div>
      <div className={`mt-1 text-[13px] font-semibold tabular ${valColor}`}>
        {value}
      </div>
    </div>
  );
}

function SeverityPill({ severity }) {
  const color =
    severity === "High"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : severity === "Medium"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-ink-100 text-ink-700 border-ink-200";
  return (
    <span className={`text-[9.5px] font-semibold rounded border px-1.5 py-0.5 shrink-0 mt-0.5 ${color}`}>
      {severity}
    </span>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Column({ title, icon: Icon, danger, children }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        danger
          ? "border-rose-200 bg-rose-50"
          : "border-ink-200 bg-ink-50"
      }`}
    >
      <div
        className={`eyebrow flex items-center gap-1.5 mb-2 ${
          danger ? "text-rose-600" : "text-brand-600/80"
        }`}
      >
        {Icon && <Icon size={10} />} {title}
      </div>
      {children}
    </div>
  );
}

function DL({ children }) {
  return <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">{children}</dl>;
}
function DT({ children }) {
  return <dt className="text-ink-500">{children}</dt>;
}
function DD({ children, className = "" }) {
  return <dd className={`text-ink-800 font-semibold tabular ${className}`}>{children}</dd>;
}

// Inline crystal-ball SVG for the "2-year projection" callout. lucide doesn't
// ship a crystal-ball icon so we draw a tiny orb with a highlight.
function CrystalBallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <defs>
        <radialGradient id="orb" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="45%" stopColor="#B3B9DB" />
          <stop offset="100%" stopColor="#292F53" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="11" r="7" fill="url(#orb)" />
      <path
        d="M6 20 Q 12 17 18 20"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="8.5" r="1.4" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}
