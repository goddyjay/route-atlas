import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  ArrowRight,
  Trash2,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { AtlasView } from "../components/AtlasView.jsx";
import {
  listLocalAtlases,
  getLocalAtlas,
  removeLocalAtlas,
} from "../lib/savedAtlases.js";

// Local list of atlases the user has generated in this browser. Reads
// entirely from localStorage — no server calls, no account. Click an entry
// to re-open it in the same AtlasView used for live generations.
export default function SavedAtlasesPage() {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setItems(listLocalAtlases());
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    removeLocalAtlas(id);
    setItems(listLocalAtlases());
    if (openId === id) setOpenId(null);
  };

  const openEntry = openId ? getLocalAtlas(openId) : null;

  if (openEntry) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-600 hover:text-ink-900 transition duration-200 mb-4"
        >
          <ArrowLeft size={12} />
          Back to saved
        </button>
        <AtlasView
          loading={false}
          error={null}
          atlas={openEntry.atlas}
          onRetry={() => {}}
        />
      </main>
    );
  }

  return (
    <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-500">
          <Bookmark size={11} />
          Saved routes
        </div>
        <h1 className="display text-[26px] sm:text-[32px] tracking-extra-tight text-ink-900 mt-2 leading-tight">
          Your generated routes
        </h1>
        <p className="text-ink-600 text-[13.5px] mt-2 leading-relaxed max-w-[640px]">
          Atlases you've generated in this browser. Stored locally — nothing is
          sent anywhere. Progress you've checked off is preserved per route.
        </p>
      </motion.div>

      <AnimatePresence>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-2"
          >
            {items.map((it) => (
              <motion.li
                key={it.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(it.id)}
                  className="card card-hover group w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 transition duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">
                      <FileText size={10} />
                      {formatDate(it.savedAt)}
                    </div>
                    <div className="text-[15px] font-semibold text-ink-900 mt-1.5 leading-tight line-clamp-2">
                      {it.topTitle}
                    </div>
                    <div className="text-[12px] text-ink-500 mt-1.5 tabular">
                      {(it.atlas?.routes?.length ?? 0)} routes · from{" "}
                      {it.atlas?.user?.degree ?? "your intake"}
                      {it.atlas?.user?.city ? ` · ${it.atlas.user.city}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(it.id, e)}
                      className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition duration-200"
                      aria-label="Remove saved atlas"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ArrowRight
                      size={14}
                      className="text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition duration-200"
                    />
                  </div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-8 sm:p-10 text-center"
    >
      <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-50 border border-brand-200 text-brand-600 mb-4">
        <Bookmark size={20} />
      </div>
      <h3 className="display text-[18px] sm:text-[20px] tracking-extra-tight text-ink-900">
        Nothing saved yet
      </h3>
      <p className="text-ink-600 text-[13.5px] mt-2 leading-relaxed max-w-[420px] mx-auto">
        Routes you generate from your own intake will appear here for later
        reference. Demo presets aren't saved automatically.
      </p>
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 mt-5 rounded-lg px-4 py-2.5 text-[13px] font-semibold bg-brand-600 hover:bg-brand-700 text-white transition duration-200"
      >
        Start analysis
        <ArrowRight size={13} />
      </Link>
    </motion.div>
  );
}

function formatDate(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const now = Date.now();
  const diffH = (now - ms) / (1000 * 60 * 60);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  const diffD = diffH / 24;
  if (diffD < 7) return `${Math.round(diffD)}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
