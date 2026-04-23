import { motion } from "framer-motion";
import {
  Crown,
  Flame,
  Snowflake,
  Minus,
  Wallet,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";

const CATEGORY_STYLES = {
  "Local Formal": "bg-sky-500/15 text-sky-200 border-sky-400/30",
  "Local Informal": "bg-amber-500/15 text-amber-200 border-amber-400/30",
  "Remote Digital": "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  "Trade/Apprenticeship": "bg-orange-500/15 text-orange-200 border-orange-400/30",
  "JAPA": "bg-purple-500/15 text-purple-200 border-purple-400/30",
  "Entrepreneurship": "bg-pink-500/15 text-pink-200 border-pink-400/30",
  "Hybrid": "bg-indigo-500/15 text-indigo-200 border-indigo-400/30",
};

const DEMAND_META = {
  High: { Icon: Flame, color: "text-emerald-300" },
  Medium: { Icon: Minus, color: "text-amber-200" },
  Low: { Icon: Snowflake, color: "text-slate-400" },
};

function fmtNaira(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${n}`;
}

function humanMonths(n) {
  if (typeof n !== "number" || n <= 0) return "now";
  if (n < 1) return "<1mo";
  if (n < 12) return `${n}mo`;
  return `${(n / 12).toFixed(1)}yr`;
}

// Side-by-side comparison of all 4 routes on the metrics a judge scans:
// fit score, demand, pay bands, time-to-income, cost, and one fit_reason.
// Grid scrolls horizontally on narrow viewports — on desktop the 4 columns
// fit naturally.
export function CompareView({ routes }) {
  if (!routes?.length) return null;

  const rows = [
    { label: "Fit score", icon: Target, render: (r) => <FitBar score={r.fit_score} isTop={routes.indexOf(r) === 0} /> },
    { label: "Category", icon: null, render: (r) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES.Hybrid}`}>
        {r.category}
      </span>
    )},
    { label: "Demand", icon: TrendingUp, render: (r) => {
      const meta = DEMAND_META[r.demand] ?? DEMAND_META.Medium;
      const Icon = meta.Icon;
      return (
        <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${meta.color}`}>
          <Icon size={11} />
          {r.demand}
        </span>
      );
    }},
    { label: "Entry pay / mo", icon: Wallet, render: (r) => (
      <span className="text-emerald-300 font-semibold tabular">{fmtNaira(r.real_pay?.entry_ngn)}</span>
    )},
    { label: "Senior pay / mo", icon: Wallet, render: (r) => (
      <span className="text-emerald-300 font-semibold tabular">{fmtNaira(r.real_pay?.senior_ngn)}+</span>
    )},
    { label: "First income in", icon: Clock, render: (r) => (
      <span className="text-white font-semibold tabular">{humanMonths(r.real_cost?.time_months)}</span>
    )},
    { label: "Upfront cost", icon: Wallet, render: (r) => (
      <span className="text-white tabular">{fmtNaira(r.real_cost?.money_ngn)}</span>
    )},
    { label: "Why it fits", icon: null, render: (r) => (
      <span className="text-[11.5px] text-slate-300 leading-snug block">
        {r.fit_reasons?.[0]?.note ?? "—"}
      </span>
    )},
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left p-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold sticky left-0 bg-ink-800/80 backdrop-blur">
                Compare
              </th>
              {routes.map((r, i) => (
                <motion.th
                  key={r.id ?? i}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="text-left p-3 align-top min-w-[180px]"
                >
                  <div className="flex items-start gap-2">
                    {i === 0 && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 rounded-full pl-1 pr-1.5 py-0.5 text-[9px] font-semibold"
                        style={{
                          background: "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(245,158,11,0.95))",
                          color: "#422006",
                          border: "1px solid rgba(255,255,255,0.35)",
                        }}
                      >
                        <Crown size={8} />
                        Best
                      </span>
                    )}
                    <span className="text-[12px] font-semibold text-white leading-tight">
                      {r.title}
                    </span>
                  </div>
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const Icon = row.icon;
              return (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 + rowIdx * 0.04 }}
                  className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.015] transition"
                >
                  <td className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-ink-800/60 backdrop-blur">
                    <span className="flex items-center gap-1.5">
                      {Icon && <Icon size={10} className="text-brand-300" />}
                      {row.label}
                    </span>
                  </td>
                  {routes.map((r, i) => (
                    <td key={r.id ?? i} className="p-3 align-top">
                      {row.render(r)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Inline bar chart for the fit score row — gives the table visual heat.
function FitBar({ score, isTop }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const color = pct >= 85 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#2dd4bf";
  return (
    <div className="w-full max-w-[120px]">
      <div className="flex items-center gap-1.5">
        <span className="tabular font-semibold text-white text-[13px]">{pct}%</span>
        {isTop && <Crown size={10} className="text-amber-300" />}
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
            boxShadow: `0 0 10px -2px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}
