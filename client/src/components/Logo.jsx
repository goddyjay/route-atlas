import { motion } from "framer-motion";

// Route Atlas mark — hand-coded SVG version of the generated lockup.
// Center: map pin with an inner hole. Behind the pin: 3 topographic contour
// rings. Branching out in an X-pattern: 4 routes with waypoint dots and
// differentiated endpoints (emerald arrow, amber target, teal dot, amber
// arrow). Draws in on mount in a staggered sequence so the landing feels alive.
//
// Keeping this as SVG (not the PNG) because the mark needs to resolve cleanly
// at 16–64px in the navbar and favicon contexts. The PNG lockup lives at
// /public/route-atlas-logo.png for README, social, and hero usage.
export function Logo({ size = 44, className = "" }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      aria-label="Route Atlas"
      role="img"
    >
      <defs>
        <linearGradient id="ra-to-target" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="ra-to-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="ra-to-amber-down" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="ra-pin-glow" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="rgba(110,231,183,0.55)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </radialGradient>
      </defs>

      {/* Topographic contour rings — concentric, subtle. */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <circle
          cx="32"
          cy="30"
          r="14"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="1.4 1.8"
        />
        <circle
          cx="32"
          cy="30"
          r="10"
          stroke="rgba(16,185,129,0.22)"
          strokeWidth="0.8"
          fill="none"
        />
        <circle
          cx="32"
          cy="30"
          r="6.5"
          stroke="rgba(20,184,166,0.3)"
          strokeWidth="0.8"
          fill="none"
        />
      </motion.g>

      {/* Soft pin glow backdrop. */}
      <circle cx="32" cy="28" r="12" fill="url(#ra-pin-glow)" />

      {/* Upper-left route — pure emerald, ends in arrow. */}
      <motion.path
        d="M 28.5 25 L 22 18 L 14 10"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
      />
      <motion.polygon
        points="14,10 18,11.5 16,14.5"
        fill="#10b981"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 0.9, ease: "backOut" }}
        style={{ transformOrigin: "15px 12px" }}
      />
      <motion.circle
        cx="22"
        cy="18"
        r="1.4"
        fill="#10b981"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 0.55, ease: "backOut" }}
        style={{ transformOrigin: "22px 18px" }}
      />

      {/* Upper-right route — emerald → amber, ends in open target circle. */}
      <motion.path
        d="M 35.5 25 L 44 20 L 54 11"
        stroke="url(#ra-to-target)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.65, delay: 0.42, ease: "easeInOut" }}
      />
      <motion.circle
        cx="54"
        cy="11"
        r="3"
        stroke="#f59e0b"
        strokeWidth="1.6"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.05, ease: "backOut" }}
        style={{ transformOrigin: "54px 11px" }}
      />
      <motion.circle
        cx="54"
        cy="11"
        r="1.2"
        fill="#f59e0b"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 1.15, ease: "backOut" }}
        style={{ transformOrigin: "54px 11px" }}
      />
      <motion.circle
        cx="44"
        cy="20"
        r="1.4"
        fill="#10b981"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 0.7, ease: "backOut" }}
        style={{ transformOrigin: "44px 20px" }}
      />

      {/* Lower-right route — emerald → teal, ends in filled dot. */}
      <motion.path
        d="M 35.5 35 L 46 44 L 55 52"
        stroke="url(#ra-to-teal)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.55, ease: "easeInOut" }}
      />
      <motion.circle
        cx="55"
        cy="52"
        r="1.9"
        fill="#14b8a6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 1.18, ease: "backOut" }}
        style={{ transformOrigin: "55px 52px" }}
      />
      <motion.circle
        cx="46"
        cy="44"
        r="1.4"
        fill="#14b8a6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 0.82, ease: "backOut" }}
        style={{ transformOrigin: "46px 44px" }}
      />

      {/* Lower-left route — emerald → amber, ends in arrow. */}
      <motion.path
        d="M 28.5 35 L 20 44 L 11 54"
        stroke="url(#ra-to-amber-down)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.68, ease: "easeInOut" }}
      />
      <motion.polygon
        points="11,54 14,52 13,56.5"
        fill="#f59e0b"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 1.28, ease: "backOut" }}
        style={{ transformOrigin: "12px 54px" }}
      />
      <motion.circle
        cx="20"
        cy="44"
        r="1.4"
        fill="#10b981"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: 0.95, ease: "backOut" }}
        style={{ transformOrigin: "20px 44px" }}
      />

      {/* Center map pin — drawn last so it's always on top of the routes. */}
      <motion.g
        initial={{ scale: 0, y: -3 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.2 }}
        style={{ transformOrigin: "32px 28px" }}
      >
        <path
          d="M 32 19 C 36 19, 39 22, 39 26 C 39 31, 32 39, 32 39 C 32 39, 25 31, 25 26 C 25 22, 28 19, 32 19 Z"
          fill="#10b981"
          stroke="#6ee7b7"
          strokeWidth="0.6"
        />
        <circle cx="32" cy="26" r="2.2" fill="#0a0b0f" />
      </motion.g>
    </motion.svg>
  );
}

// Full lockup pairing — logo mark + wordmark + tagline in a compact cluster.
// Used in the navbar. The wordmark stays as text (not baked into the image)
// so it's crisp at any size and selectable.
export function LogoMark({ size = 40, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <Logo
        size={size}
        className="shrink-0 drop-shadow-[0_6px_14px_rgba(16,185,129,0.45)]"
      />
      <div className="leading-tight">
        <motion.div
          className="display text-[15px] text-white tracking-extra-tight"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          Route Atlas
        </motion.div>
        <motion.div
          className="text-[10px] text-slate-500 -mt-0.5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          the map out of survival work
        </motion.div>
      </div>
    </motion.div>
  );
}

// Full-image lockup (wordmark + tagline baked in). Useful for READMEs, hero
// sections, social share previews, or anywhere you want the generated PNG
// exactly as designed. Not used in the app shell — use <LogoMark /> there.
export function LogoLockup({ className = "", alt = "Route Atlas" }) {
  return (
    <img
      src="/route-atlas-logo.png"
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
