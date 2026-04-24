import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, Brain, Route, MapPin } from "lucide-react";
import { Logo } from "../components/Logo.jsx";

// Contextual imagery for the landing page. Sources: Unsplash CDN (free,
// credit not required but recommended). If a specific photo ID ever 404s,
// the <ContextualImage> wrapper falls back to a brand-tinted gradient so
// the layout never breaks visually. Swap URLs for your own licensed
// photos before a final demo.
const HERO_IMAGE = "/hero-professional.jpg";
const WORK_IMAGE =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80";
const PLANNING_IMAGE =
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80";

// Image container with onError fallback. Renders the photo when it loads,
// otherwise a brand-tinted gradient placeholder keeps the layout intact.
function ContextualImage({ src, alt, className = "", aspect = "aspect-[4/5]" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ink-200 bg-brand-50 ${aspect} ${className}`}
      style={{
        boxShadow:
          "0 1px 2px 0 rgba(17, 24, 39, 0.06), 0 16px 40px -12px rgba(67, 79, 140, 0.18)",
      }}
    >
      {failed ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(83,97,168,0.18) 0%, rgba(149,120,95,0.18) 60%, rgba(83,97,168,0.08) 100%)",
          }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

// Landing page — calm and spacious. Four sections:
//   1. Hero          — big headline, short subtext, one CTA
//   2. How it works  — 3 steps: Input → Analysis → Routes
//   3. Why different — Nigerian context focus, three short points
//   4. Final CTA     — echo of the hero CTA, brief sign-off
export default function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <HowItWorks />
      <PlanningBeat />
      <WhyDifferent />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ----- Hero --------------------------------------------------------------

function Hero() {
  return (
    <section className="relative">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left — copy + CTA */}
          <div className="md:col-span-7 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              className="flex justify-center md:justify-start mb-5 sm:mb-6"
            >
              <Logo size={52} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="display text-[30px] sm:text-[42px] md:text-[52px] leading-[1.05] tracking-extra-tight text-ink-900"
            >
              Stop guessing your next move.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-ink-600 text-[15px] sm:text-[17px] leading-relaxed max-w-[520px] mx-auto md:mx-0 mt-5"
            >
              For Nigerian graduates thinking about what comes after NYSC.
              A short intake, a clear map of four real paths forward, each
              grounded in your situation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col items-center md:items-start gap-3"
            >
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[14px] px-6 py-3.5 transition duration-200 min-h-[48px]"
                style={{
                  boxShadow:
                    "0 1px 2px 0 rgba(67, 79, 140, 0.25), 0 10px 30px -8px rgba(67, 79, 140, 0.35)",
                }}
              >
                Start Your Route
                <ArrowRight size={15} />
              </Link>
              <p className="text-ink-500 text-[12px]">
                Free · No sign-up · About a minute
              </p>
            </motion.div>
          </div>

          {/* Right — contextual image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="md:col-span-5 relative"
          >
            <ContextualImage
              src={HERO_IMAGE}
              alt="A young professional working at a laptop, thinking through their next career move"
              aspect="aspect-[4/3]"
            />
            {/* Small accent: subtle floating stat chip anchored off the corner */}
            <div
              className="hidden sm:flex absolute -bottom-4 -left-4 bg-white rounded-xl border border-ink-200 px-3.5 py-2.5 items-center gap-2.5"
              style={{
                boxShadow:
                  "0 1px 2px 0 rgba(17, 24, 39, 0.06), 0 10px 24px -8px rgba(17, 24, 39, 0.1)",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <div className="text-[11px] font-semibold text-ink-700 leading-tight">
                4 ranked paths
                <div className="text-[10px] text-ink-500 font-normal mt-0.5">
                  real ₦ pay · real actions
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ----- How it works ------------------------------------------------------

function HowItWorks() {
  const steps = [
    {
      Icon: ClipboardList,
      label: "Input",
      body: "Share your situation — degree, state, savings, NYSC status, family, JAPA appetite.",
    },
    {
      Icon: Brain,
      label: "Analysis",
      body: "We read your intake against real Nigerian market data and filter out what won't fit.",
    },
    {
      Icon: Route,
      label: "Routes",
      body: "Four ranked paths with real Naira pay, time to first income, and first-week actions.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-ink-200">
      <div className="max-w-[960px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="eyebrow text-ink-500">How it works</div>
          <h2 className="display text-[24px] sm:text-[30px] tracking-extra-tight text-ink-900 mt-2">
            Input. Analysis. Routes.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"
        >
          {steps.map((step, i) => {
            const { Icon } = step;
            return (
              <motion.div
                key={step.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
                  },
                }}
                className="card card-hover p-6 sm:p-7 transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-brand-200 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Icon size={17} />
                  </div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-500">
                    Step {i + 1}
                  </div>
                </div>
                <h3 className="display text-[20px] tracking-extra-tight text-ink-900 mt-4">
                  {step.label}
                </h3>
                <p className="text-ink-600 text-[13.5px] mt-2 leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ----- Why different -----------------------------------------------------

function WhyDifferent() {
  const points = [
    {
      title: "NYSC-aware",
      body: "Understands stream timing, PPA postings, state-of-origin redeployment, and what follows passing out.",
    },
    {
      title: "Priced in Naira",
      body: "Real 2026 salary bands by sector and city. JAPA costs and odds by destination — no guessed numbers.",
    },
    {
      title: "Specific to your situation",
      body: "Every route cites what you told us — your savings, your family pressure, your JAPA appetite — not generic career advice.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-ink-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          {/* Left — image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
            className="md:col-span-5 order-2 md:order-1"
          >
            <ContextualImage
              src={WORK_IMAGE}
              alt="Colleagues discussing career paths in a modern workplace"
              aspect="aspect-[5/6]"
            />
          </motion.div>

          {/* Right — text */}
          <div className="md:col-span-7 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-8 sm:mb-10 max-w-[560px]"
            >
              <div className="eyebrow text-ink-500 flex items-center gap-1.5">
                <MapPin size={11} />
                Why it's different
              </div>
              <h2 className="display text-[24px] sm:text-[30px] md:text-[34px] tracking-extra-tight text-ink-900 mt-2 leading-tight">
                Built for Nigerian post-NYSC reality, not a global average.
              </h2>
            </motion.div>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-5 sm:space-y-6 max-w-[560px]"
            >
              {points.map((p, i) => (
                <motion.li
                  key={p.title}
                  variants={{
                    hidden: { opacity: 0, x: -6 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
                    },
                  }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-[11px] font-bold tabular flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-ink-900">
                      {p.title}
                    </div>
                    <p className="text-ink-600 text-[13.5px] mt-1 leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Quiet "planning / decision making" beat between How it works and Why
// different. One image, one line of copy. Breathing room, not a full
// section with heavy CTAs.
function PlanningBeat() {
  return (
    <section className="py-14 sm:py-20 border-t border-ink-200">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="eyebrow text-ink-500">Planned, not guessed</div>
              <h3 className="display text-[22px] sm:text-[28px] tracking-extra-tight text-ink-900 mt-2 leading-tight">
                Four routes you can actually start next Monday.
              </h3>
              <p className="text-ink-600 text-[14px] mt-3 leading-relaxed max-w-[440px]">
                Each comes with first-week actions, real salaries, and a
                two-year scene — so you know what's ahead before you move.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
            className="md:col-span-6"
          >
            <ContextualImage
              src={PLANNING_IMAGE}
              alt="A graduate reviewing notes and weighing options"
              aspect="aspect-[4/3]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ----- Final CTA ---------------------------------------------------------

function FinalCta() {
  return (
    <section className="py-16 sm:py-24 border-t border-ink-200">
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="display text-[24px] sm:text-[30px] tracking-extra-tight text-ink-900"
        >
          Ready when you are.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-ink-600 text-[14px] mt-3 max-w-[480px] mx-auto leading-relaxed"
        >
          A short intake, four ranked paths, real numbers. Takes about a minute.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-7"
        >
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[14px] px-6 py-3.5 transition duration-200 min-h-[48px]"
            style={{
              boxShadow:
                "0 1px 2px 0 rgba(67, 79, 140, 0.25), 0 10px 30px -8px rgba(67, 79, 140, 0.35)",
            }}
          >
            Start Your Route
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ----- Footer ------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-ink-200 py-10">
      <div className="max-w-[960px] mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <div className="text-[12px] text-ink-500">
            <span className="text-ink-700 font-semibold">Route Atlas</span>
            <span className="mx-1.5">·</span>
            MIT licensed
          </div>
        </div>
        <div className="text-[12px] text-ink-500">
          <a
            href="https://github.com/goddyjay/route-atlas"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-900 transition duration-200"
          >
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
