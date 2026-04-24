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
      className="shrink-0 z-30 backdrop-blur-xl bg-white/80 border-b border-ink-200"
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
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold bg-ink-100 hover:bg-ink-100 border border-ink-200 hover:border-emerald-200 text-ink-700 transition"
            >
              <ShieldCheck size={11} />
              CV check
            </Link>
          )}
          {onLanding ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition"
            >
              Open the app
              <ArrowRight size={12} />
            </Link>
          ) : onCv ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition"
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
            className="p-2 rounded-lg border border-ink-200 bg-ink-50 text-ink-500 hover:text-ink-900 hover:bg-ink-100 hover:border-ink-300 transition"
            aria-label="GitHub"
          >
            <Github size={14} />
          </a>
        </motion.div>
      </div>
    </motion.header>
  );
}
