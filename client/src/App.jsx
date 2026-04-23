import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import AtlasPage from "./routes/AtlasPage.jsx";
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
    <div className="lg:h-screen flex flex-col relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 grid-bg opacity-[0.15] mask-fade-b" />
      </div>

      <Navbar />

      <Routes>
        <Route path="/" element={<AtlasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
