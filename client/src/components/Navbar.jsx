import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { LogoMark } from "./Logo.jsx";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="shrink-0 z-30 backdrop-blur-xl bg-ink-900/70 border-b border-white/5"
    >
      <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between">
        <LogoMark />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <span className="hidden md:inline-flex chip">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Powered by Opus 4.7
          </span>
          <a
            href="https://github.com/"
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
