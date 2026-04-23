import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { AtlasView } from "../components/AtlasView.jsx";
import { fetchSharedAtlas } from "../lib/api.js";

// Read-only view of a previously-shared atlas. Loaded by short ID from
// /api/atlas/:id. The app shell hides the form pane in this mode and the
// entire viewport is given to the atlas content.
export default function SharedAtlasPage() {
  const { id } = useParams();
  const [atlas, setAtlas] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAtlas(null);
    fetchSharedAtlas(id)
      .then((data) => {
        if (!cancelled) {
          setAtlas(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load shared atlas.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="w-full max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-4 flex items-center justify-between flex-wrap gap-2"
      >
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft size={12} />
          Draw your own atlas
        </Link>
        <span className="text-[10.5px] text-slate-500 uppercase tracking-wider">
          Shared atlas · /atlas/{id}
        </span>
      </motion.div>

      {loading ? (
        <LoadingShared />
      ) : error ? (
        <ErrorShared message={error} />
      ) : (
        <AtlasView loading={false} error={null} atlas={atlas} onRetry={() => {}} />
      )}
    </main>
  );
}

function LoadingShared() {
  return (
    <div className="card p-6 text-center">
      <Loader2 size={18} className="animate-spin mx-auto text-brand-300" />
      <p className="text-[12px] text-slate-400 mt-3">
        Loading shared atlas…
      </p>
    </div>
  );
}

function ErrorShared({ message }) {
  return (
    <div
      className="card p-6"
      style={{
        borderColor: "rgba(244, 63, 94, 0.3)",
        background: "rgba(244, 63, 94, 0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-rose-300 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-rose-100">Can't load this atlas</h3>
          <p className="text-sm text-rose-200/80 mt-1">{message}</p>
          <p className="text-xs text-rose-200/60 mt-2">
            Shared atlases expire after 30 days. You can draw a fresh one any time.
          </p>
          <Link to="/app" className="btn-secondary mt-3 inline-flex">
            <ArrowLeft size={14} />
            Draw a new atlas
          </Link>
        </div>
      </div>
    </div>
  );
}
