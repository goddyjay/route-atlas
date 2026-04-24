import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./Logo.jsx";

// Top navigation bar. Sticky, same canvas colour as the page (no contrast
// block), thin bottom border for separation. Mobile collapses into a slide-
// down menu.
const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Start Analysis", to: "/app" },
  { label: "Saved Routes", to: "/saved" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="sticky top-0 shrink-0 z-30 bg-ink-50/85 backdrop-blur-xl border-b border-ink-200"
    >
      <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <LogoMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-[13px] font-semibold transition duration-200 ${
                  isActive
                    ? "text-ink-900 bg-ink-100"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 rounded-lg text-ink-700 hover:bg-ink-100 transition duration-200"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile slide-down */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="md:hidden overflow-hidden border-t border-ink-200 bg-ink-50/95 backdrop-blur-xl"
          >
            <ul className="px-3 py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `block px-3 py-3 rounded-lg text-[14px] font-semibold transition duration-200 ${
                        isActive
                          ? "text-ink-900 bg-ink-100"
                          : "text-ink-600 hover:text-ink-900 hover:bg-ink-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
