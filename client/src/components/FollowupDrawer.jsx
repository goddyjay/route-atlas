import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircleQuestion,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { streamFollowup } from "../lib/api.js";

// Suggested pre-filled follow-ups. These target the things users usually
// want to ask after seeing a route: interview process, specific companies
// to target, typical day-to-day, hardest part of the transition.
const SUGGESTED_QUESTIONS = [
  "What does a typical day in this role look like?",
  "What should I expect in the interview process?",
  "Who are the best employers for this route right now?",
  "What's the hardest part of this transition?",
  "What certifications or courses actually matter here?",
];

// Bottom-sheet-on-mobile / side-drawer-on-desktop modal that streams a
// focused Q&A answer about one route. Scoped to the route + intake so the
// model can reason about this user's specific situation.
export function FollowupDrawer({ open, onClose, route, intake }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState("idle"); // idle | streaming | done | error
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const answerRef = useRef(null);

  // Reset drawer contents when it opens on a new route (or re-opens).
  useEffect(() => {
    if (open) {
      setQuestion("");
      setAnswer("");
      setState("idle");
      setError(null);
      // Focus the input after the drawer lands.
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, route?.id]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Auto-scroll the answer as tokens stream in.
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const ask = async (q) => {
    const text = (q ?? question).trim();
    if (!text || state === "streaming") return;
    setQuestion(text);
    setAnswer("");
    setError(null);
    setState("streaming");
    try {
      await streamFollowup(
        {
          route_title: route.title,
          route_category: route.category,
          route_one_liner: route.one_liner,
          route_nigerian_notes: route.nigerian_notes,
          question: text,
          intake,
        },
        (chunk) => setAnswer((prev) => prev + chunk)
      );
      setState("done");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setState("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer — bottom sheet on mobile, right-side drawer on desktop */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-y-0 md:left-auto md:right-0 md:bottom-0 md:top-0 md:w-[480px] md:h-full
                       bg-ink-800 border-t md:border-t-0 md:border-l border-white/10
                       flex flex-col max-h-[92vh] md:max-h-none"
            style={{
              boxShadow: "0 -24px 60px -10px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-start gap-3 p-4 sm:p-5 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
                <MessageCircleQuestion size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="eyebrow text-emerald-300/80">Ask a follow-up</div>
                <div className="text-[13.5px] font-semibold text-white mt-0.5 leading-snug line-clamp-2">
                  {route?.title}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body — question area OR streaming answer */}
            <div className="flex-1 overflow-y-auto pretty-scroll p-4 sm:p-5 space-y-4">
              {state === "idle" ? (
                <>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">
                    Pick a question or type your own. Claude Opus 4.7 answers with
                    the same Nigerian context the atlas uses.
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <motion.button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        whileHover={{ x: 2 }}
                        className="group w-full text-left inline-flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-400/30 px-3.5 py-3 text-[12.5px] text-slate-200 transition min-h-[48px]"
                      >
                        <Sparkles size={12} className="text-emerald-300 mt-0.5 shrink-0" />
                        <span className="flex-1">{q}</span>
                        <ArrowRight
                          size={12}
                          className="text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition mt-0.5 shrink-0"
                        />
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <div className="eyebrow text-slate-400 mb-1">You asked</div>
                    <div className="text-[13px] text-slate-200 leading-relaxed">
                      {question}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3.5">
                    <div className="eyebrow text-emerald-300 flex items-center gap-1.5 mb-2">
                      {state === "streaming" && (
                        <Loader2 size={10} className="animate-spin" />
                      )}
                      Opus 4.7
                    </div>
                    <div
                      ref={answerRef}
                      className="text-[13px] text-slate-100 leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto pretty-scroll"
                    >
                      {answer}
                      {state === "streaming" && (
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-emerald-300 animate-pulse align-middle" />
                      )}
                    </div>
                  </div>

                  {state === "error" && (
                    <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[12px] text-rose-200">
                      {error}
                    </div>
                  )}

                  {(state === "done" || state === "error") && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestion("");
                        setAnswer("");
                        setState("idle");
                      }}
                      className="btn-secondary w-full"
                    >
                      Ask another question
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Composer — always visible at bottom so the user can type anytime */}
            <div className="shrink-0 border-t border-white/[0.06] p-3 sm:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your own question…"
                  maxLength={500}
                  disabled={state === "streaming"}
                  className="field-input flex-1 text-[13px] py-2.5 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || state === "streaming"}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/40 text-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Ask"
                >
                  {state === "streaming" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
