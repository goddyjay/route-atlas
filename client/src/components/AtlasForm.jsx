import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Loader2,
  Compass,
  GraduationCap,
  MapPin,
  Wallet,
  Heart,
  Shield,
  Target,
  Plus,
} from "lucide-react";
import {
  NIGERIAN_STATES,
  COMMON_DEGREES,
  UNIVERSITY_TIERS,
  CLASS_OF_DEGREE_OPTIONS,
  NYSC_STATUS,
  FAMILY_PRESSURE,
  JAPA_APPETITE,
  RISK_TOLERANCE,
  TIME_HORIZON,
  HARD_NO_OPTIONS,
  SKILL_OPTIONS,
  MARITAL_STATUS,
  SPOUSE_EMPLOYMENT,
} from "../lib/nigerian.js";

const schema = z.object({
  degree: z.string().min(2, "Pick a degree"),
  class_of_degree: z.string().optional(),
  university_tier: z.string().optional(),
  nysc_status: z.enum(["not_started", "serving", "completed", "skipped"]),
  years_since_nysc: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0)
    .max(30)
    .optional(),
  state: z.string().min(2, "Pick your state"),
  city: z.string().min(2, "Enter your city"),
  savings_ngn: z
    .number({ invalid_type_error: "Enter savings in ₦" })
    .int()
    .min(0),
  current_monthly_income_ngn: z
    .number({ invalid_type_error: "Enter income in ₦" })
    .int()
    .min(0),
  current_work: z.string().min(2, "Describe your current work"),
  dependents: z.number().int().min(0).max(20),
  monthly_family_obligation_ngn: z.number().int().min(0),
  family_pressure_level: z.enum(["low", "medium", "high"]),
  marital_status: z.enum([
    "single",
    "in_relationship",
    "married",
    "prefer_not_to_say",
  ]),
  children_count: z.number().int().min(0).max(10),
  spouse_employment: z
    .enum(["unemployed", "formal", "self_employed", "abroad", "prefer_not_to_say"])
    .optional(),
  spouse_monthly_income_ngn: z.number().int().min(0).optional(),
  health_constraints: z.string().max(400).optional(),
  japa_appetite: z.enum(["none", "curious", "committed"]),
  risk_tolerance: z.enum(["low", "medium", "high"]),
  time_horizon_months: z.number().int().min(3).max(120),
  existing_skills: z.array(z.string()).optional(),
  hard_nos: z.array(z.string()).optional(),
});

const defaultValues = {
  degree: "Microbiology",
  class_of_degree: "Second Class Upper",
  university_tier: "federal",
  nysc_status: "completed",
  years_since_nysc: 1,
  state: "Oyo",
  city: "Ibadan",
  savings_ngn: 200000,
  current_monthly_income_ngn: 40000,
  current_work: "Home lesson teacher",
  dependents: 0,
  monthly_family_obligation_ngn: 0,
  family_pressure_level: "medium",
  marital_status: "single",
  children_count: 0,
  spouse_employment: "prefer_not_to_say",
  spouse_monthly_income_ngn: 0,
  health_constraints: "",
  japa_appetite: "curious",
  risk_tolerance: "medium",
  time_horizon_months: 24,
  existing_skills: [],
  hard_nos: ["Yahoo / cybercrime"],
};

export function AtlasForm({ onSubmit, loading, seed }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const nyscStatus = watch("nysc_status");
  const maritalStatus = watch("marital_status");
  const spouseEmployment = watch("spouse_employment");
  const isPartnered = maritalStatus === "in_relationship" || maritalStatus === "married";
  const spouseEarns =
    isPartnered &&
    spouseEmployment &&
    spouseEmployment !== "unemployed" &&
    spouseEmployment !== "prefer_not_to_say";

  // Demo seeding: when the parent hands down a new intake (from a preset click),
  // populate the form. If seed.autoSubmit !== false, also fire a submission —
  // this is how uncached presets run live through the API. Cached presets set
  // autoSubmit=false because the parent has already served the cached atlas
  // directly and doesn't want a duplicate live call.
  const lastSeedRef = useRef(null);
  useEffect(() => {
    if (!seed || seed.version === lastSeedRef.current) return;
    lastSeedRef.current = seed.version;
    reset({ ...defaultValues, ...seed.values });
    if (seed.autoSubmit === false) return;
    const t = setTimeout(() => handleSubmit(onSubmit)(), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="card p-5 md:p-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } }}
    >
      <FormHero />

      <Section icon={<GraduationCap size={14} />} color="emerald" title="Education" subtitle="What you studied and where">
        <Grid cols={2}>
          <Field label="Degree" error={errors.degree?.message}>
            <select className="field-select" {...register("degree")}>
              {COMMON_DEGREES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Class of degree">
            <select className="field-select" {...register("class_of_degree")}>
              <option value="">— select (optional) —</option>
              {CLASS_OF_DEGREE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </Grid>
        <Grid cols={1} className="mt-3">
          <Field label="University tier">
            <select className="field-select" {...register("university_tier")}>
              <option value="">— select (optional) —</option>
              {UNIVERSITY_TIERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section icon={<MapPin size={14} />} color="sky" title="NYSC + location" subtitle="Where you are right now">
        <Grid cols={2}>
          <Field label="NYSC status" error={errors.nysc_status?.message}>
            <select className="field-select" {...register("nysc_status")}>
              {NYSC_STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Years since NYSC">
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              disabled={nyscStatus !== "completed"}
              {...register("years_since_nysc", { valueAsNumber: true })}
            />
          </Field>
        </Grid>
        <Grid cols={2} className="mt-3">
          <Field label="State" error={errors.state?.message}>
            <select className="field-select" {...register("state")}>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="City / town" error={errors.city?.message}>
            <input
              className="field-input"
              placeholder="e.g. Ibadan"
              {...register("city")}
            />
          </Field>
        </Grid>
      </Section>

      <Section icon={<Wallet size={14} />} color="amber" title="Money + obligations" subtitle="The numbers that shape what's possible">
        <Grid cols={2}>
          <Field label="Savings (₦)" error={errors.savings_ngn?.message}>
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              {...register("savings_ngn", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Current monthly income (₦)" error={errors.current_monthly_income_ngn?.message}>
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              {...register("current_monthly_income_ngn", { valueAsNumber: true })}
            />
          </Field>
        </Grid>
        <Grid cols={1} className="mt-3">
          <Field label="Current work" error={errors.current_work?.message}>
            <input
              className="field-input"
              placeholder="e.g. Home lesson teacher, POS agent, unemployed"
              {...register("current_work")}
            />
          </Field>
        </Grid>
        <Grid cols={3} className="mt-3">
          <Field label="Dependents" error={errors.dependents?.message}>
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              {...register("dependents", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Monthly family obligation (₦)" error={errors.monthly_family_obligation_ngn?.message}>
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              {...register("monthly_family_obligation_ngn", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Family pressure" error={errors.family_pressure_level?.message}>
            <select className="field-select" {...register("family_pressure_level")}>
              {FAMILY_PRESSURE.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section icon={<Heart size={14} />} color="rose" title="Relationship + family" subtitle="Married? Partner? Kids? This shifts the whole map">
        <Grid cols={2}>
          <Field label="Relationship status" error={errors.marital_status?.message}>
            <select className="field-select" {...register("marital_status")}>
              {MARITAL_STATUS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Children under 18" error={errors.children_count?.message}>
            <input
              type="number" inputMode="numeric"
              className="field-input"
              placeholder="0"
              {...register("children_count", { valueAsNumber: true })}
            />
          </Field>
        </Grid>
        {isPartnered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Grid cols={spouseEarns ? 2 : 1} className="mt-3">
              <Field label="Partner's employment">
                <select className="field-select" {...register("spouse_employment")}>
                  {SPOUSE_EMPLOYMENT.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              {spouseEarns && (
                <Field label="Partner's monthly income (₦)">
                  <input
                    type="number" inputMode="numeric"
                    className="field-input"
                    placeholder="0"
                    {...register("spouse_monthly_income_ngn", { valueAsNumber: true })}
                  />
                </Field>
              )}
            </Grid>
          </motion.div>
        )}
      </Section>

      <Section icon={<Shield size={14} />} color="violet" title="Constraints" subtitle="Anything that narrows the map">
        <Grid cols={1}>
          <Field label="Health constraints (optional)">
            <textarea
              rows={2}
              className="field-input resize-none"
              placeholder="e.g. Mother has diabetes, need to be reachable from Ibadan"
              {...register("health_constraints")}
            />
          </Field>
        </Grid>
      </Section>

      <Section icon={<Target size={14} />} color="teal" title="Orientation" subtitle="How you'd like the map drawn">
        <Grid cols={2}>
          <Field label="JAPA appetite" error={errors.japa_appetite?.message}>
            <select className="field-select" {...register("japa_appetite")}>
              {JAPA_APPETITE.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Risk tolerance" error={errors.risk_tolerance?.message}>
            <select className="field-select" {...register("risk_tolerance")}>
              {RISK_TOLERANCE.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>
        </Grid>
        <Grid cols={1} className="mt-3">
          <Field label="Planning horizon" error={errors.time_horizon_months?.message}>
            <select
              className="field-select"
              {...register("time_horizon_months", { valueAsNumber: true })}
            >
              {TIME_HORIZON.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </Grid>
        <div className="mt-3">
          <label className="field-label">Existing skills</label>
          <Controller
            control={control}
            name="existing_skills"
            render={({ field }) => (
              <ChipPicker
                options={SKILL_OPTIONS}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Tap to add · skills you already have"
                allowCustom
              />
            )}
          />
        </div>
        <div className="mt-3">
          <label className="field-label">Hard nos (things you refuse to consider)</label>
          <Controller
            control={control}
            name="hard_nos"
            render={({ field }) => (
              <ChipPicker
                options={HARD_NO_OPTIONS}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Tap to exclude"
                variant="danger"
                allowCustom
              />
            )}
          />
        </div>
      </Section>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.015, y: -1 } : {}}
        whileTap={!loading ? { scale: 0.985 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        variants={sectionVariants}
        className="btn-primary gradient-shift w-full mt-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, #059669 0%, #10b981 30%, #14b8a6 60%, #10b981 100%)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Drawing your atlas…
          </>
        ) : (
          <>
            <Compass size={16} />
            Draw my route atlas
          </>
        )}
        {!loading && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{
              duration: 2.6,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
            style={{
              background:
                "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
            }}
          />
        )}
      </motion.button>
      <motion.p variants={sectionVariants} className="mt-2 text-center text-[11px] text-slate-500">
        Streaming live · Opus 4.7 with Nigerian context · 5 ranked routes
      </motion.p>
    </motion.form>
  );
}

// Shared entrance variant for sections, the submit button, and the trailing
// hint line — the parent form orchestrates stagger via `staggerChildren`.
const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
  },
};

function FormHero() {
  return (
    <motion.div
      variants={sectionVariants}
      className="relative overflow-hidden rounded-xl p-5 mb-5 border border-white/[0.08]"
      style={{
        background:
          "radial-gradient(120% 100% at 100% 0%, rgba(20, 184, 166, 0.22) 0%, transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(16, 185, 129, 0.22) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
      }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-accent-500/20 blur-3xl"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="eyebrow text-brand-300/90 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-400" />
          </span>
          Tell us your situation
        </div>
        <h2 className="display text-[22px] md:text-[24px] leading-[1.1] tracking-extra-tight text-white mt-2">
          Where you stand,<br />in your own numbers.
        </h2>
        <p className="text-[12.5px] text-slate-400 mt-2 leading-relaxed max-w-[42ch]">
          The atlas only works if the intake is honest. No platitudes in — no platitudes out.
        </p>
      </div>
    </motion.div>
  );
}

// Per-section accent palette. Each section header's icon bubble picks up
// its own color — keeps the form scannable and stops every section from
// reading as the same brand-emerald.
const SECTION_COLORS = {
  emerald: { text: "text-emerald-300", bg: "bg-emerald-500/12", border: "border-emerald-400/25" },
  sky: { text: "text-sky-300", bg: "bg-sky-500/12", border: "border-sky-400/25" },
  amber: { text: "text-amber-300", bg: "bg-amber-500/12", border: "border-amber-400/25" },
  rose: { text: "text-rose-300", bg: "bg-rose-500/12", border: "border-rose-400/25" },
  violet: { text: "text-violet-300", bg: "bg-violet-500/12", border: "border-violet-400/25" },
  teal: { text: "text-teal-300", bg: "bg-teal-500/12", border: "border-teal-400/25" },
};

function Section({ icon, color = "emerald", title, subtitle, children }) {
  const c = SECTION_COLORS[color] ?? SECTION_COLORS.emerald;
  return (
    <motion.section
      variants={sectionVariants}
      className="mt-5 pt-5 border-t border-white/[0.06] first-of-type:border-t-0 first-of-type:pt-0"
    >
      <header className="flex items-start gap-3 mb-3">
        <motion.div
          whileHover={{ rotate: -6, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className={`p-1.5 rounded-md border ${c.bg} ${c.border} ${c.text}`}
        >
          {icon}
        </motion.div>
        <div>
          <h3 className="text-[13px] font-semibold text-white leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11.5px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </motion.section>
  );
}

function Grid({ cols = 2, className = "", children }) {
  // 3-col steps through 1 → 2 → 3 so narrow panes (our 42% desktop form
  // pane) don't cram three selects into ~160px each.
  const map = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  };
  return <div className={`grid ${map[cols]} gap-3 ${className}`}>{children}</div>;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

// Chip picker with optional free-text add. When `allowCustom` is true, a
// compact text input at the end lets users type skills/nos that aren't in
// the preset list; Enter or the + button adds them as chips alongside the
// presets. Custom chips behave identically to preset ones (toggle-off to
// remove).
function ChipPicker({ options, value, onChange, placeholder, variant, allowCustom }) {
  const [custom, setCustom] = useState("");
  const selected = new Set(value);

  const toggle = (opt) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(Array.from(next));
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    if (selected.has(trimmed)) {
      setCustom("");
      return;
    }
    onChange([...value, trimmed]);
    setCustom("");
  };

  // Merge presets with any custom values the user has added so they render
  // as chips too. De-duplicate while preserving order.
  const customExtras = value.filter((v) => !options.includes(v));
  const allChips = [...options, ...customExtras];

  const onColor =
    variant === "danger"
      ? "bg-rose-500/20 text-rose-200 border-rose-400/40"
      : "bg-brand-500/20 text-brand-200 border-brand-400/40";

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {allChips.map((opt) => {
          const on = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`text-[11px] font-semibold rounded-full border px-2.5 py-1 transition ${
                on ? onColor : "bg-white/[0.03] text-slate-300 border-white/10 hover:border-white/25"
              }`}
            >
              {opt}
            </button>
          );
        })}
        {allChips.length === 0 && placeholder && (
          <span className="text-[11px] text-slate-600 self-center ml-1">
            {placeholder}
          </span>
        )}
      </div>
      {allowCustom && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={
              variant === "danger"
                ? "+ Add your own hard-no"
                : "+ Add your own skill"
            }
            className="field-input flex-1 text-[12px] py-1.5"
            maxLength={60}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!custom.trim()}
            className="btn-secondary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      )}
    </div>
  );
}
