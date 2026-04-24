import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, Brain, Route, MapPin } from "lucide-react";
import { Logo } from "../components/Logo.jsx";

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
      <div className="max-w-[900px] mx-auto px-5 sm:px-6 pt-16 sm:pt-20 md:pt-28 pb-12 sm:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <Logo size={60} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="display text-[32px] sm:text-[44px] md:text-[56px] leading-[1.05] tracking-extra-tight text-ink-900"
        >
          Stop guessing your next move.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-ink-600 text-[15px] sm:text-[17px] leading-relaxed max-w-[580px] mx-auto mt-5 sm:mt-6"
        >
          For Nigerian graduates thinking about what comes after NYSC.
          A short intake, a clear map of four real paths forward, each grounded
          in your situation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10"
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
          <p className="text-ink-500 text-[12px] mt-4">
            Free · No sign-up · About a minute
          </p>
        </motion.div>
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
      <div className="max-w-[960px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 max-w-[640px]"
        >
          <div className="eyebrow text-ink-500 flex items-center gap-1.5">
            <MapPin size={11} />
            Why it's different
          </div>
          <h2 className="display text-[24px] sm:text-[30px] tracking-extra-tight text-ink-900 mt-2">
            Built for Nigerian post-NYSC reality, not a global average.
          </h2>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-5 sm:space-y-6 max-w-[720px]"
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
