import { motion } from "framer-motion";
import { Crown, Clock, Wallet, ArrowDown } from "lucide-react";

// Compact scan-bar above the detailed route cards. Shows all routes at a
// glance — name, fit score, time-to-income, entry salary — so the user
// can orient themselves before diving in. Clicking a tile smooth-scrolls
// to the corresponding full card below. Deliberately kept visually distinct
// from the detailed cards (tighter padding, smaller type, lower saturation).
//
// Not a replacement for the Compare view — that's a full side-by-side table.
// This is a one-line orientation layer.

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

export function RouteComparisonBar({ routes }) {
  if (!routes || routes.length === 0) return null;

  // The top-fit route is always index 0 (backend orders best-first), but we
  // compute it defensively in case any route gets re-ordered client-side.
  const topFit = Math.max(...routes.map((r) => r.fit_score ?? 0));

  const handleFocus = (route) => {
    const el = document.getElementById(`route-${route.id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className="card p-3 sm:p-4 no-print"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
        <span className="eyebrow text-slate-400">Quick compare</span>
        <span className="text-[10.5px] text-slate-500 hidden sm:inline">
          Click a tile to open its full card
        </span>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {routes.map((route, i) => {
          const isRec = (route.fit_score ?? 0) === topFit;
          return (
            <motion.button
              key={route.id ?? i}
              type="button"
              onClick={() => handleFocus(route)}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] },
                },
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={`group relative text-left rounded-xl p-3 border transition min-h-[100px]
                ${
                  isRec
                    ? "bg-emerald-500/[0.08] border-emerald-400/40 hover:border-emerald-400/60"
                    : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              style={
                isRec
                  ? {
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 24px -8px rgba(16,185,129,0.45)",
                    }
                  : undefined
              }
              aria-label={`Jump to ${route.title}`}
            >
              {/* Recommended badge — top-fit only */}
              {isRec && (
                <span
                  className="absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full pl-1 pr-2 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(245,158,11,0.95))",
                    color: "#422006",
                    border: "1px solid rgba(255,255,255,0.35)",
                  }}
                >
                  <Crown size={9} />
                  Recommended
                </span>
              )}

              {/* Top: route name (2-line clamp) */}
              <div className="text-[12px] font-semibold text-white leading-snug line-clamp-2 min-h-[32px]">
                {route.title}
              </div>

              {/* Middle: big fit score */}
              <div className="mt-2 flex items-baseline gap-1">
                <span
                  className={`display text-[22px] sm:text-[24px] font-extrabold tabular tracking-extra-tight leading-none ${
                    isRec ? "text-emerald-300" : "text-white"
                  }`}
                >
                  {Math.round(route.fit_score ?? 0)}
                </span>
                <span className={`text-[10px] font-bold ${isRec ? "text-emerald-400" : "text-slate-500"}`}>
                  % fit
                </span>
              </div>

              {/* Bottom: stats row */}
              <div className="mt-2 pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-1">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-0.5">
                    <Clock size={8} /> Income in
                  </div>
                  <div className="text-[11.5px] font-semibold text-slate-200 tabular mt-0.5">
                    {humanMonths(route.real_cost?.time_months)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-0.5">
                    <Wallet size={8} /> Entry
                  </div>
                  <div className="text-[11.5px] font-semibold text-emerald-300 tabular mt-0.5">
                    {fmtNaira(route.real_pay?.entry_ngn)}
                  </div>
                </div>
              </div>

              {/* Hover affordance */}
              <ArrowDown
                size={10}
                className={`absolute bottom-2 right-2 transition ${
                  isRec ? "text-emerald-400/70" : "text-slate-600"
                } group-hover:translate-y-0.5 group-hover:opacity-100 opacity-60`}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
