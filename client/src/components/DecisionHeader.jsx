import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Target, Crown, Clock, Gauge } from "lucide-react";

// Executive summary at the very top of the atlas results. Five data points
// rendered as a report header: total viable routes, top recommendation,
// fit score (large), confidence level, time to first income.
//
// Deliberately factual and dense — no prose, no narrative, no insight.
// The SnapshotCard below it carries the conversational beat; this block
// is the bullet-list on page one of a consulting deck.

function humanMonths(n) {
  if (typeof n !== "number" || n <= 0) return "Immediately";
  if (n < 1) return "< 1 month";
  if (n === 1) return "1 month";
  if (n < 12) return `${n} months`;
  if (n === 12) return "1 year";
  return `${(n / 12).toFixed(1)} years`;
}

// Confidence banding derived from the top route's fit score. Matches the
// same thresholds the ConfidenceRing uses so users aren't confused by
// two different color codings of the same number.
function getConfidence(fitScore) {
  const s = Number(fitScore) || 0;
  if (s >= 85) {
    return {
      label: "High",
      text: "text-emerald-300",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/40",
      barFill: "bg-emerald-400",
      bars: 3,
    };
  }
  if (s >= 65) {
    return {
      label: "Medium",
      text: "text-amber-300",
      bg: "bg-amber-500/15",
      border: "border-amber-400/40",
      barFill: "bg-amber-300",
      bars: 2,
    };
  }
  return {
    label: "Low",
    text: "text-rose-300",
    bg: "bg-rose-500/15",
    border: "border-rose-400/40",
    barFill: "bg-rose-300",
    bars: 1,
  };
}

export function DecisionHeader({ atlas }) {
  const routes = atlas?.routes ?? [];
  const top = routes[0];
  const confidence = getConfidence(top?.fit_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className="card p-5 sm:p-6 md:p-7 relative overflow-hidden"
    >
      {/* Subtle backdrop so the header reads as "chapter cover", not card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 w-80 h-40 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Eyebrow */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-slate-400" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Decision summary
            </span>
          </div>
          <span className="text-[10.5px] text-slate-500 tabular">
            {routes.length} routes analyzed · ranked best-fit first
          </span>
        </div>

        {/* Grid — stacked 2-col on mobile, 5-col on desktop. Fit Score
            spans 2 columns on mobile so its number stays visually dominant. */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-x-5 gap-y-5">
          <Cell
            icon={FileText}
            label="Viable routes"
            value={<BigNumber value={routes.length} />}
          />
          <Cell
            icon={Crown}
            label="Top recommendation"
            value={
              <span className="block text-[14px] sm:text-[15px] md:text-[16px] font-bold text-white leading-tight line-clamp-2">
                {top?.title ?? "—"}
              </span>
            }
            wide
          />
          <Cell
            icon={Target}
            label="Fit score"
            value={
              <div className="flex items-baseline gap-1">
                <AnimatedBigNumber value={Math.round(top?.fit_score ?? 0)} />
                <span className="display text-[14px] font-bold text-emerald-300">%</span>
              </div>
            }
            emphasized
            span2
          />
          <Cell
            icon={Gauge}
            label="Confidence"
            value={
              <div className="flex items-center gap-2">
                <span
                  className={`display text-[22px] font-extrabold tracking-extra-tight ${confidence.text}`}
                >
                  {confidence.label}
                </span>
                <ConfidenceBars barFill={confidence.barFill} bars={confidence.bars} />
              </div>
            }
          />
          <Cell
            icon={Clock}
            label="Time to first income"
            value={
              <span className="display text-[20px] sm:text-[22px] font-extrabold text-white tabular tracking-extra-tight leading-none">
                {humanMonths(top?.real_cost?.time_months)}
              </span>
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

// Single data cell. Uppercase label on top, value below. Separator lines
// between cells on desktop so the grid reads as a table, not floating text.
function Cell({ icon: Icon, label, value, emphasized = false, span2 = false, wide = false }) {
  return (
    <div
      className={`flex flex-col min-w-0 ${span2 ? "col-span-2 md:col-span-1" : ""} ${
        wide ? "col-span-2 md:col-span-1" : ""
      } md:border-l md:first:border-l-0 md:pl-5 md:first:pl-0 ${
        emphasized ? "md:bg-emerald-500/[0.04] md:rounded-lg md:-my-2 md:py-2 md:px-4" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {Icon && <Icon size={10} />}
        {label}
      </div>
      <div className="mt-2">{value}</div>
    </div>
  );
}

function BigNumber({ value }) {
  return (
    <span className="display text-[32px] sm:text-[36px] font-extrabold text-white tabular tracking-extra-tight leading-none">
      {value}
    </span>
  );
}

// Counts up from 0 over 900ms so the fit score lands with energy.
function AnimatedBigNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 900;
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
    <span className="display text-[40px] sm:text-[44px] font-extrabold text-emerald-300 tabular tracking-extra-tight leading-none">
      {display}
    </span>
  );
}

// Signal-bars indicator next to the confidence text (3 bars for High, etc.)
function ConfidenceBars({ barFill, bars }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3].map((i) => {
        const active = i <= bars;
        return (
          <div
            key={i}
            className={`w-1.5 rounded-[1px] transition ${
              active ? barFill : "bg-white/[0.08]"
            }`}
            style={{ height: `${i * 5 + 2}px` }}
          />
        );
      })}
    </div>
  );
}
