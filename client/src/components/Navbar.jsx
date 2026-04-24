import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Github, ShieldCheck } from "lucide-react";
import { LogoMark } from "./Logo.jsx";

export function Navbar() {
  const location = useLocation();
  const onLanding = location.pathname === "/";
  const onCv = location.pathname === "/cv";
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="shrink-0 z-30 backdrop-blur-xl bg-ink-900/70 border-b border-white/5"
    >
      <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <LogoMark />
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          {!onCv && (
            <Link
              to="/cv"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/30 text-slate-300 transition"
            >
              <ShieldCheck size={11} />
              CV check
            </Link>
          )}
          {onLanding ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 transition"
            >
              Open the app
              <ArrowRight size={12} />
            </Link>
          ) : onCv ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 transition"
            >
              Atlas
              <ArrowRight size={12} />
            </Link>
          ) : (
            <span className="hidden md:inline-flex chip">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Powered by Opus 4.7
            </span>
          )}
          <a
            href="https://github.com/goddyjay/route-atlas"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition"
            aria-label="GitHub"
          >
            <Github size={14} />
          </a>
        </motion.div>
      </div>
    </motion.header>
  );
}
