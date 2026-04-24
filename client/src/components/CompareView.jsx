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
  "Local Formal": "bg-sky-50 text-sky-700 border-sky-200",
  "Local Informal": "bg-amber-50 text-amber-700 border-amber-200",
  "Remote Digital": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Trade/Apprenticeship": "bg-orange-50 text-orange-700 border-orange-200",
  "JAPA": "bg-purple-50 text-purple-700 border-purple-200",
  "Entrepreneurship": "bg-pink-50 text-pink-700 border-pink-200",
  "Hybrid": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const DEMAND_META = {
  High: { Icon: Flame, color: "text-emerald-600" },
  Medium: { Icon: Minus, color: "text-amber-700" },
  Low: { Icon: Snowflake, color: "text-ink-500" },
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
      <span className="text-emerald-600 font-semibold tabular">{fmtNaira(r.real_pay?.entry_ngn)}</span>
    )},
    { label: "Senior pay / mo", icon: Wallet, render: (r) => (
      <span className="text-emerald-600 font-semibold tabular">{fmtNaira(r.real_pay?.senior_ngn)}+</span>
    )},
    { label: "First income in", icon: Clock, render: (r) => (
      <span className="text-ink-900 font-semibold tabular">{humanMonths(r.real_cost?.time_months)}</span>
    )},
    { label: "Upfront cost", icon: Wallet, render: (r) => (
      <span className="text-ink-900 tabular">{fmtNaira(r.real_cost?.money_ngn)}</span>
    )},
    { label: "Why it fits", icon: null, render: (r) => (
      <span className="text-[11.5px] text-ink-700 leading-snug block">
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
            <tr className="border-b border-ink-200">
              <th className="text-left p-3 text-[10px] uppercase tracking-wider text-ink-500 font-semibold sticky left-0 bg-white/85 backdrop-blur">
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
                    <span className="text-[12px] font-semibold text-ink-900 leading-tight">
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
                  className="border-b border-ink-200 last:border-b-0 hover:bg-ink-50 transition"
                >
                  <td className="p-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider sticky left-0 bg-white/70 backdrop-blur">
                    <span className="flex items-center gap-1.5">
                      {Icon && <Icon size={10} className="text-brand-600" />}
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
  const color = pct >= 85 ? "#5361A8" : pct >= 70 ? "#fbbf24" : "#98A0C7";
  return (
    <div className="w-full max-w-[120px]">
      <div className="flex items-center gap-1.5">
        <span className="tabular font-semibold text-ink-900 text-[13px]">{pct}%</span>
        {isTop && <Crown size={10} className="text-amber-600" />}
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
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
