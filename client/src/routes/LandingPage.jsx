import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Compass,
  MapPin,
  Plane,
  Wrench,
  Coins,
  Users,
  Briefcase,
  Heart,
  Crown,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Logo } from "../components/Logo.jsx";

// Landing page — the product's entry point. Its ONLY job is to make the
// moat visible before a skeptical viewer decides this is "a Claude wrapper."
// That means: problem framing they recognize themselves in, a dense grid
// of "what this atlas knows" so the Nigerian-specificity is impossible to
// miss, and one sample route card as social proof the thing works.
//
// Everything routes to /app for the actual intake experience.
export default function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <ProblemStory />
      <WhatItKnows />
      <SampleRoute />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ----- Hero --------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand-500/20 blur-[140px] ambient-pulse"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/4 w-[600px] h-[400px] rounded-full bg-accent-500/10 blur-[120px]"
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex justify-center mb-5 sm:mb-6"
        >
          <Logo size={64} className="drop-shadow-[0_12px_28px_rgba(16,185,129,0.45)] sm:w-20 sm:h-20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 chip mb-5"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          A Nigerian product · For Nigerian graduates
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="display text-[30px] xs:text-[34px] sm:text-[44px] md:text-[60px] leading-[1.05] sm:leading-[1.02] tracking-extra-tight text-white max-w-[900px] mx-auto px-2"
        >
          Nigerian graduates don't need career advice.
          <br className="hidden xs:inline" />{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            They need a map.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-slate-300 text-[14px] sm:text-[15.5px] md:text-[17px] leading-relaxed max-w-[720px] mx-auto mt-4 sm:mt-5 px-2"
        >
          Route Atlas maps 4 real paths forward from your exact situation — grounded in NYSC
          mechanics, JAPA economics, corridor pharma, Igba Boi, bootcamp reality, and the 2026
          Nigerian job market that actually exists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-[420px] sm:max-w-none mx-auto"
        >
          <Link
            to="/app"
            className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white font-semibold text-[14px] gradient-shift border border-white/15 min-h-[48px]"
            style={{
              background:
                "linear-gradient(120deg, #059669 0%, #10b981 30%, #2dd4bf 50%, #14b8a6 70%, #059669 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px -10px rgba(20,184,166,0.55)",
            }}
          >
            Try the atlas
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="https://github.com/goddyjay/route-atlas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13.5px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 transition min-h-[48px]"
          >
            <Github size={14} />
            View on GitHub
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-5 text-[11.5px] text-slate-500"
        >
          Free · No sign-up · 4-second demo · Opus 4.7 reasoning, Nigerian context
        </motion.p>
      </div>
    </section>
  );
}

// ----- Problem story -----------------------------------------------------

function ProblemStory() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 border-t border-white/[0.04]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="eyebrow text-emerald-300/80">The problem</div>
          <h2 className="display text-[28px] md:text-[36px] leading-tight tracking-extra-tight text-white mt-3">
            You finish NYSC and the job market doesn't want your degree.
          </h2>
          <div className="mt-6 space-y-4 text-slate-300 text-[15px] leading-relaxed">
            <p>
              A Microbiology graduate posts out in November with a 2:1, ₦200k saved, and no clear
              next move. Six months later she's teaching JSS chemistry lessons for ₦40k a month,
              sending ₦25k home to her mother, and watching her coursemates drift the same way.
            </p>
            <p>
              LinkedIn shows jobs, not routes. Parents give advice from a 1990s job market. Generic
              AI doesn't know the Sagamu-Ota pharma corridor exists, can't tell her an
              ACCA-eligible audit associate has a fast-track UK Skilled Worker visa path, and has
              never heard of Igba Boi.
            </p>
            <p className="text-white">
              The decision that shapes the next 10 years of her life gets made on vibes and
              proximity.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ----- What this atlas knows (THE MOAT) ---------------------------------

const KNOWLEDGE_TILES = [
  {
    icon: Compass,
    title: "NYSC mechanics",
    body: "PPA postings, Clause 22 spousal redeployment, passing-out timing, corper stipend realities by state.",
    color: "emerald",
  },
  {
    icon: Briefcase,
    title: "Corridor pharma",
    body: "Sagamu-Ota-Agbara belt: Emzor, Fidson, May & Baker, GSK, entry QA bands, and which interview days HR actually screens.",
    color: "sky",
  },
  {
    icon: Plane,
    title: "JAPA economics 2026",
    body: "Canada SDS, UK Skilled Worker / Health & Care, Germany Chancenkarte + Ausbildung, Australia 189/190 — real ₦ costs and real odds.",
    color: "violet",
  },
  {
    icon: Wrench,
    title: "Igba Boi",
    body: "Igbo apprenticeship economics — 5–7 year term, settlement figures, trade centres (Onitsha, Aba, Nnewi, Alaba), and who it actually fits.",
    color: "amber",
  },
  {
    icon: Coins,
    title: "Nigerian salary bands",
    body: "Entry/mid/senior ₦ for banking tier-1/2, fintech, Big 4 audit, pharma QA, oil & gas IOC, FMCG, NGO, teaching, remote dev — by sector and city.",
    color: "teal",
  },
  {
    icon: MapPin,
    title: "Survival-work exits",
    body: "POS agent, lesson teaching, Bolt/Indriver, network marketing — what each pays, what it costs, and the route out by type.",
    color: "rose",
  },
  {
    icon: Flame,
    title: "Bootcamp reality",
    body: "Which Nigerian bootcamps actually place graduates in 2026, which don't, and what the saturated junior market means for your odds.",
    color: "emerald",
  },
  {
    icon: Heart,
    title: "Family-stage math",
    body: "Married grads with working spouse, children under 5, family-reunion JAPA routes, housing floors for grads who can't stay with parents.",
    color: "sky",
  },
];

const TILE_COLORS = {
  emerald: "border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-300",
  sky: "border-sky-400/25 bg-sky-500/[0.06] text-sky-300",
  violet: "border-violet-400/25 bg-violet-500/[0.06] text-violet-300",
  amber: "border-amber-400/25 bg-amber-500/[0.06] text-amber-300",
  teal: "border-teal-400/25 bg-teal-500/[0.06] text-teal-300",
  rose: "border-rose-400/25 bg-rose-500/[0.06] text-rose-300",
};

function WhatItKnows() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 border-t border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="eyebrow text-emerald-300/80">The moat</div>
          <h2 className="display text-[28px] md:text-[36px] leading-tight tracking-extra-tight text-white mt-3 max-w-[680px]">
            What this atlas knows that generic AI doesn't.
          </h2>
          <p className="text-slate-400 text-[14.5px] mt-3 max-w-[680px] leading-relaxed">
            ~7,000 tokens of dense Nigerian context encoded into the system prompt. Real companies,
            real WhatsApp groups, real ₦ figures from 2026. No hallucinations about "opportunities
            in Nigeria" — specific routes with specific costs.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {KNOWLEDGE_TILES.map((tile) => {
            const Icon = tile.icon;
            const color = TILE_COLORS[tile.color];
            return (
              <motion.div
                key={tile.title}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
                  },
                }}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="card card-hover p-5"
              >
                <div
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${color}`}
                >
                  <Icon size={16} />
                </div>
                <h3 className="text-white font-semibold text-[14.5px] mt-3.5">{tile.title}</h3>
                <p className="text-slate-400 text-[12.5px] mt-1.5 leading-relaxed">{tile.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ----- Sample route (social proof) --------------------------------------

function SampleRoute() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 border-t border-white/[0.04]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-[720px] mx-auto"
        >
          <div className="eyebrow text-emerald-300/80">A real output</div>
          <h2 className="display text-[28px] md:text-[36px] leading-tight tracking-extra-tight text-white mt-3">
            This is what Opus 4.7 writes when it knows Nigeria.
          </h2>
          <p className="text-slate-400 text-[14.5px] mt-3 leading-relaxed">
            The top route returned for a Microbiology grad in Ibadan with ₦200k savings, a
            diabetic mother, and a ₦40k teaching hustle. Not hypothetical — copy-pasted from the
            live atlas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55 }}
          className="card card-hover mt-10 p-6 md:p-7 max-w-[860px] mx-auto relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(45,212,191,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(245,158,11,0.95))",
                  color: "#422006",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                <Crown size={10} />
                Best fit
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-sky-500/15 text-sky-200 border-sky-400/30">
                Local Formal
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-emerald-500/15 text-emerald-300 border-emerald-400/30">
                <Flame size={10} />
                High demand
              </span>
              <span className="ml-auto text-[10.5px] font-bold rounded-full border px-2 py-0.5 tabular text-emerald-300 bg-emerald-500/15 border-emerald-400/30">
                91% fit
              </span>
            </div>

            <h3 className="display text-[22px] md:text-[24px] leading-tight tracking-extra-tight text-white mt-3">
              Pharma QA Analyst → International Lab Tech (Canada MLT)
            </h3>
            <p className="text-slate-400 text-[13px] mt-2 leading-snug">
              Land a QA role at Emzor, Fidson or May & Baker in the Sagamu-Ota corridor within
              4 months, stack 2 years, then route to Canada as a Medical Lab Technologist via the
              CSMLS bridge.
            </p>

            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3.5">
              <div className="eyebrow text-emerald-300 flex items-center gap-1.5 mb-2">
                Why this fits you
              </div>
              <div className="space-y-1.5 text-[12.5px] text-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <span className="text-emerald-300/80 font-semibold">Degree:</span>{" "}
                    Microbiology maps straight into pharma QA — no retraining, no bootcamp.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <span className="text-emerald-300/80 font-semibold">Location:</span> Ibadan to
                    Sagamu is under 2 hours — you stay reachable for your mother's emergencies.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Monthly pay
                </div>
                <div className="text-[14px] font-semibold tabular text-emerald-300 mt-0.5">
                  ₦150k → ₦500k+
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Start earning in
                </div>
                <div className="text-[14px] font-semibold tabular text-white mt-0.5">
                  ~4 months
                </div>
              </div>
            </div>

            <div className="mt-5 text-[12px] text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-semibold">Pro tip from the atlas:</span>{" "}
              <span className="text-slate-300">
                Apply Tuesday 8am on MyJobMag — HR screens CVs before weekly production meetings.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ----- Final CTA ---------------------------------------------------------

function FinalCta() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 border-t border-white/[0.04]">
      <div className="max-w-[860px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="display text-[24px] sm:text-[28px] md:text-[36px] leading-tight tracking-extra-tight text-white"
        >
          Where do you stand?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-400 text-[14.5px] mt-3 max-w-[540px] mx-auto leading-relaxed"
        >
          Fill the intake, or click a preset. 4 seconds for a demo persona. ~90 seconds for your
          own situation. No sign-up, no email, no follow-ups.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-7 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-white font-semibold text-[14.5px] gradient-shift border border-white/15"
            style={{
              background:
                "linear-gradient(120deg, #059669 0%, #10b981 30%, #2dd4bf 50%, #14b8a6 70%, #059669 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 14px 36px -10px rgba(20,184,166,0.55)",
            }}
          >
            Draw my route atlas
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ----- Footer ------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <Logo size={32} className="shrink-0" />
          <div className="text-[12px] text-slate-500 leading-snug">
            <div className="text-slate-300 font-semibold">Route Atlas</div>
            <div>Built for the Claude Opus Hackathon · MIT licensed</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <a
            href="https://github.com/goddyjay/route-atlas"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition flex items-center gap-1.5"
          >
            <Github size={13} /> goddyjay/route-atlas
          </a>
          <Link to="/app" className="hover:text-white transition flex items-center gap-1.5">
            <Users size={13} /> Open the app
          </Link>
        </div>
      </div>
    </footer>
  );
}
