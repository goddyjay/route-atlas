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
  Lightbulb,
  Flame,
  Snowflake,
  Minus,
  TrendingUp,
} from "lucide-react";

const CATEGORY_STYLES = {
  "Local Formal": { bg: "bg-sky-500/15", text: "text-sky-200", border: "border-sky-400/30" },
  "Local Informal": { bg: "bg-amber-500/15", text: "text-amber-200", border: "border-amber-400/30" },
  "Remote Digital": { bg: "bg-emerald-500/15", text: "text-emerald-200", border: "border-emerald-400/30" },
  "Trade/Apprenticeship": { bg: "bg-orange-500/15", text: "text-orange-200", border: "border-orange-400/30" },
  "JAPA": { bg: "bg-purple-500/15", text: "text-purple-200", border: "border-purple-400/30" },
  "Entrepreneurship": { bg: "bg-pink-500/15", text: "text-pink-200", border: "border-pink-400/30" },
  "Hybrid": { bg: "bg-indigo-500/15", text: "text-indigo-200", border: "border-indigo-400/30" },
};

const DEMAND_STYLES = {
  High: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
    Icon: Flame,
    label: "High demand",
  },
  Medium: {
    bg: "bg-amber-500/15",
    text: "text-amber-200",
    border: "border-amber-400/30",
    Icon: Minus,
    label: "Medium demand",
  },
  Low: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-white/10",
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

function humanMonths(n) {
  if (typeof n !== "number" || n <= 0) return "right away";
  if (n < 1) return "under a month";
  if (n === 1) return "1 month";
  if (n < 12) return `${n} months`;
  if (n === 12) return "a year";
  return `${(n / 12).toFixed(1)} years`;
}

export function RouteCard({ route, index, isTop }) {
  const [expanded, setExpanded] = useState(isTop);
  const cat = CATEGORY_STYLES[route.category] ?? CATEGORY_STYLES["Hybrid"];
  const demand = DEMAND_STYLES[route.demand] ?? DEMAND_STYLES["Medium"];

  return (
    <motion.article
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
              "radial-gradient(60% 60% at 50% 50%, rgba(45,212,191,0.35) 0%, rgba(16,185,129,0.18) 50%, transparent 75%)",
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
          <h3 className="display text-[17px] sm:text-[18px] md:text-[20px] leading-[1.15] tracking-extra-tight text-white mt-2 sm:mt-2.5">
            {route.title}
          </h3>
          <p className="text-[12px] sm:text-[12.5px] text-slate-400 mt-1.5 leading-snug">
            {route.one_liner}
          </p>
        </div>
        <ConfidenceRing score={route.fit_score} />
      </header>

      {/* "Why this fits you" callout — personalized reasons */}
      <div className="mt-4 rounded-xl border border-brand-400/20 bg-brand-500/[0.05] p-3.5">
        <div className="eyebrow text-brand-300 flex items-center gap-1.5 mb-2">
          <Target size={10} /> Why this fits you
        </div>
        <div className="space-y-1.5">
          {route.fit_reasons?.slice(0, 3).map((fr, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-2 text-[12.5px] text-slate-200"
            >
              <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <span className="text-brand-300/80 font-semibold">{fr.dimension}:</span>{" "}
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
              <span className="text-slate-500"> → </span>
              {fmtNaira(route.real_pay?.senior_ngn)}
              <span className="text-slate-500">+</span>
            </>
          }
          accent="emerald"
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 w-full inline-flex items-center justify-between gap-2 rounded-lg px-3.5 py-3 sm:py-2.5 text-[12.5px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition min-h-[44px]"
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
            <ExpandedDetail route={route} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.article>
  );
}

function ExpandedDetail({ route }) {
  return (
    <div className="pt-4 space-y-4">
      {/* FUTURE SIMULATION callout — the "if you follow this for 2 years" pane */}
      {route.two_year_projection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl p-4 border border-accent-400/25"
          style={{
            background:
              "radial-gradient(110% 100% at 100% 0%, rgba(45, 212, 191, 0.18) 0%, transparent 55%), radial-gradient(80% 80% at 0% 100%, rgba(16, 185, 129, 0.14) 0%, transparent 60%), rgba(255,255,255,0.02)",
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
              className="w-8 h-8 rounded-lg bg-accent-500/20 border border-accent-400/30 flex items-center justify-center shrink-0"
            >
              <CrystalBallIcon />
            </motion.div>
            <div>
              <div className="eyebrow text-accent-300 flex items-center gap-1.5">
                <TrendingUp size={10} /> If you follow this for 2 years…
              </div>
              <p className="text-[13px] text-teal-50/90 mt-1.5 leading-relaxed">
                {route.two_year_projection}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Row>
        <Column title="Real cost">
          <DL>
            <DT>Money</DT>
            <DD>{fmtNaira(route.real_cost?.money_ngn)}</DD>
            <DT>Time</DT>
            <DD>{route.real_cost?.time_months} months</DD>
            <DT>What you give up</DT>
            <DD className="text-slate-300">{route.real_cost?.what_you_give_up}</DD>
          </DL>
        </Column>
        <Column title="Real pay (monthly)">
          <DL>
            <DT>Entry</DT>
            <DD>{fmtNaira(route.real_pay?.entry_ngn)}</DD>
            <DT>Mid</DT>
            <DD>{fmtNaira(route.real_pay?.mid_ngn)}</DD>
            <DT>Senior</DT>
            <DD>{fmtNaira(route.real_pay?.senior_ngn)}+</DD>
          </DL>
          {route.real_pay?.range_note && (
            <p className="text-[11px] text-slate-500 mt-2 leading-snug">
              {route.real_pay.range_note}
            </p>
          )}
        </Column>
      </Row>

      <Row>
        <Column title="Who this fits" icon={Users}>
          <p className="text-[12.5px] text-slate-300 leading-relaxed">
            {route.who_this_fits}
          </p>
        </Column>
        <Column title="Who this breaks" icon={AlertTriangle} danger>
          <p className="text-[12.5px] text-rose-100/80 leading-relaxed">
            {route.who_this_breaks}
          </p>
        </Column>
      </Row>

      {route.break_reasons?.length > 0 && (
        <Column title="Break reasons" icon={AlertTriangle} danger>
          <div className="space-y-1.5">
            {route.break_reasons.map((br, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-slate-300">
                <SeverityPill severity={br.severity} />
                <span>{br.risk}</span>
              </div>
            ))}
          </div>
        </Column>
      )}

      {route.cheapest_test && (
        <Column title="Cheapest test this week" icon={Target}>
          <p className="text-[12.5px] text-slate-200 leading-relaxed">
            {route.cheapest_test.what}
          </p>
          <div className="mt-2 flex gap-3 text-[11px] text-slate-400">
            <span className="chip">Cost: {fmtNaira(route.cheapest_test.cost_ngn)}</span>
            <span className="chip">Time: {route.cheapest_test.time_hours}h</span>
          </div>
          <p className="text-[11.5px] text-slate-500 mt-2 leading-snug">
            <span className="text-slate-400">Signal:</span>{" "}
            {route.cheapest_test.expected_signal}
          </p>
        </Column>
      )}

      <Column title="Monday actions" icon={ArrowUpRight}>
        <motion.ol
          className="space-y-1.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        >
          {route.monday_actions?.map((m, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, x: -6 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } },
              }}
              className="flex items-start gap-2.5 text-[12.5px] text-slate-200 leading-relaxed"
            >
              <motion.span
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="shrink-0 w-5 h-5 rounded-md bg-brand-500/20 text-brand-200 text-[10px] font-bold inline-flex items-center justify-center mt-0.5"
              >
                {i + 1}
              </motion.span>
              <span className="flex-1">
                {m.step}
                <span className="text-slate-500 text-[11px]"> · within {m.deadline_days}d</span>
              </span>
            </motion.li>
          ))}
        </motion.ol>
      </Column>

      <Column title="Roadmap" icon={Clock}>
        <Timeline roadmap={route.roadmap ?? []} />
      </Column>

      {route.nigerian_notes && (
        <Column title="Nigerian notes" icon={MapPin}>
          <p className="text-[12.5px] text-slate-300 leading-relaxed">
            {route.nigerian_notes}
          </p>
        </Column>
      )}

      {route.communities?.length > 0 && (
        <Column title="Communities to join" icon={Users}>
          <div className="space-y-1.5">
            {route.communities.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="chip shrink-0">{c.where}</span>
                <div>
                  <div className="text-slate-200 font-semibold">{c.name}</div>
                  <div className="text-slate-500 text-[11.5px]">{c.how_to_join}</div>
                </div>
              </div>
            ))}
          </div>
        </Column>
      )}

      {/* PRO TIPS — lives at the bottom of the expanded detail. */}
      {route.pro_tips?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-4"
        >
          <div className="eyebrow text-amber-300 flex items-center gap-1.5 mb-3">
            <Lightbulb size={10} /> Pro tips for this route
          </div>
          <ul className="space-y-2">
            {route.pro_tips.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-2.5 text-[12.5px] text-amber-50/90 leading-relaxed"
              >
                <span className="shrink-0 w-5 h-5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-bold inline-flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

// ----- Supporting components --------------------------------------------

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
              className="absolute left-[5px] top-1.5 w-[14px] h-[14px] rounded-full border-2 border-brand-400 bg-ink-800"
              style={{
                boxShadow: "0 0 0 3px rgba(16,185,129,0.2), 0 0 14px -2px rgba(16,185,129,0.55)",
              }}
            />
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                    {ph.period}
                  </div>
                  <div className="text-[13px] text-white font-semibold mt-0.5">
                    {ph.focus}
                  </div>
                </div>
                <div className="text-[11px] tabular text-emerald-300 font-semibold shrink-0">
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
                    className="text-[12px] text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-slate-600 mt-0.5">·</span>
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
  const color = pct >= 85 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#2dd4bf";
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
        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
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
    <span className="text-[15px] font-bold text-white tabular">
      {display}
      <span className="text-brand-300 text-[9px] font-semibold">%</span>
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
  const valColor = accent === "emerald" ? "text-emerald-300" : "text-white";
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
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
      ? "bg-rose-500/20 text-rose-200 border-rose-400/30"
      : severity === "Medium"
      ? "bg-amber-500/20 text-amber-200 border-amber-400/30"
      : "bg-white/[0.04] text-slate-300 border-white/10";
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
          ? "border-rose-400/20 bg-rose-500/[0.04]"
          : "border-white/[0.06] bg-white/[0.015]"
      }`}
    >
      <div
        className={`eyebrow flex items-center gap-1.5 mb-2 ${
          danger ? "text-rose-300" : "text-brand-300/80"
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
  return <dt className="text-slate-500">{children}</dt>;
}
function DD({ children, className = "" }) {
  return <dd className={`text-slate-200 font-semibold tabular ${className}`}>{children}</dd>;
}

// Inline crystal-ball SVG for the "2-year projection" callout. lucide doesn't
// ship a crystal-ball icon so we draw a tiny orb with a highlight.
function CrystalBallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <defs>
        <radialGradient id="orb" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="45%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
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
