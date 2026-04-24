import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import AtlasPage from "./routes/AtlasPage.jsx";
import LandingPage from "./routes/LandingPage.jsx";
import SharedAtlasPage from "./routes/SharedAtlasPage.jsx";
import CvCheckPage from "./routes/CvCheckPage.jsx";
import { warmBackend } from "./lib/api.js";

// App shell: fills the viewport. Navbar is a fixed-height row; everything
// below it (the split panels in AtlasPage) is one flex-1 region that owns
// its own overflow behavior. On mobile the shell collapses to natural flow
// so the page scrolls as a whole.
export default function App() {
  // Wake up the Render backend on page load so the first Try Demo click
  // doesn't eat the ~30s cold-start penalty. Runs once per session.
  useEffect(() => {
    warmBackend();
  }, []);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AtlasPage />} />
        <Route path="/cv" element={<CvCheckPage />} />
        <Route path="/atlas/:id" element={<SharedAtlasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

// The app shell treats the marketing landing page and the product page very
// differently: the landing scrolls naturally and has its own flow, while the
// /app route fills the viewport with the split-pane dashboard. We toggle
// the outer container's height model based on the active route so the same
// shell can host both without fighting each other.
function AppShell({ children }) {
  const location = useLocation();
  // /app is the only route that needs the full-viewport split-pane layout.
  // Everything else (landing, CV check, shared atlas) scrolls naturally.
  const isApp = location.pathname === "/app";
  return (
    <div className={`${isApp ? "lg:h-screen" : "min-h-screen"} flex flex-col relative`}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 grid-bg opacity-[0.15] mask-fade-b" />
      </div>
      <Navbar />
      {children}
    </div>
  );
}
