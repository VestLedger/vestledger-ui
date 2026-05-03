import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — The Vesta Journey",
  description:
    "Vesta doesn't arrive fully formed. She grows alongside your fund — learning your thesis, your relationships, your rhythm. Here's how that journey unfolds.",
  openGraph: {
    title: "How It Works — The Vesta Journey | VestLedger",
    description:
      "From onboarding to full operating intelligence — see how Vesta learns your fund.",
    type: "website",
  },
};

type Accent = "blue" | "gold" | "cyan";

const vestaJourney = [
  {
    phase: "Phase 1",
    title: "Onboarding Your Vesta",
    duration: "4–6 Weeks",
    icon: BookOpen,
    accent: "blue" as Accent,
    description:
      "Vesta learns your fund — its structure, relationships, and operational patterns. She begins building the context graph that will power every interaction going forward.",
    items: [
      "Fund structure and LP data ingestion",
      "Historical document and deal analysis",
      "Calendar and deadline mapping",
      "Initial decision intelligence setup",
    ],
  },
  {
    phase: "Phase 2",
    title: "Vesta Takes the Wheel",
    duration: "2–3 Months",
    icon: Zap,
    accent: "gold" as Accent,
    description:
      "Vesta begins handling operations, freeing you from routine tasks. She drafts communications, tracks obligations, and keeps the whole team synchronized.",
    items: [
      "Automated capital call and distribution workflows",
      "Real-time LP portal with live reporting",
      "Proactive deadline and obligation alerts",
      "Relationship context building across all touchpoints",
    ],
  },
  {
    phase: "Phase 3",
    title: "Vesta Evolves With You",
    duration: "Ongoing",
    icon: Sparkles,
    accent: "cyan" as Accent,
    description:
      "The longer you work together, the smarter Vesta becomes. She moves from reactive support to proactive intelligence that sees around corners.",
    items: [
      "Pattern recognition across your portfolio",
      "Predictive insights and anomaly detection",
      "Cross-fund benchmarking (anonymized)",
      "Continuous learning from your decisions and corrections",
    ],
  },
];

function getAccentClasses(accent: Accent) {
  if (accent === "gold") {
    return {
      tint: "border-amber-300/35 bg-amber-100/85 text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-300",
      chip: "border-amber-300/35 bg-amber-100/80 text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-50",
      bullet: "text-amber-500 dark:text-amber-300",
      dot: "bg-amber-400 dark:bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]",
    };
  }

  if (accent === "cyan") {
    return {
      tint: "border-cyan-300/35 bg-cyan-100/85 text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50",
      icon: "text-cyan-600 dark:text-cyan-300",
      chip: "border-cyan-300/35 bg-cyan-100/80 text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50",
      bullet: "text-cyan-500 dark:text-cyan-300",
      dot: "bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]",
    };
  }

  return {
    tint: "border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/30 dark:bg-blue-300/10 dark:text-blue-50",
    icon: "text-blue-600 dark:text-blue-300",
    chip: "border-blue-300/35 bg-blue-100/80 text-blue-700 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-50",
    bullet: "text-blue-500 dark:text-blue-300",
    dot: "bg-blue-400 dark:bg-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.4)]",
  };
}

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section
        id="hiw-hero"
        data-testid="hiw-hero"
        className="relative isolate overflow-hidden border-b border-[var(--app-border)]"
      >
        <div className="absolute left-[8%] top-24 h-60 w-60 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[12%] top-28 h-48 w-48 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-drift" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <BadgeCheck className="h-4 w-4" />
                The Vesta Journey
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white"
            >
              How <span className="text-brand">Vesta</span> learns your fund.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
              Vesta doesn&apos;t arrive fully formed. She grows alongside your
              fund — learning your thesis, your relationships, your rhythm.
              Here&apos;s how that journey unfolds.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section
        id="journey"
        data-testid="hiw-journey"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_22%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="relative space-y-10">
            {/* Connecting line */}
            <div className="public-marketing-timeline-line hidden lg:block" />

            {vestaJourney.map((phase) => {
              const PhaseIcon = phase.icon;
              const accent = getAccentClasses(phase.accent);

              return (
                <div key={phase.phase} className="relative lg:pl-16">
                  {/* Timeline dot (desktop) */}
                  <div className="absolute left-0 top-7 hidden lg:block">
                    <div
                      className={`h-11 w-11 rounded-full ${accent.dot} flex items-center justify-center`}
                    >
                      <PhaseIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="public-marketing-panel public-marketing-panel-contrast rounded-[24px] p-6 sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      {/* Phase icon (mobile) */}
                      <div className="flex-shrink-0 lg:hidden">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${accent.tint}`}
                        >
                          <PhaseIcon className={`h-7 w-7 ${accent.icon}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="public-marketing-contrast-label text-xs font-bold uppercase tracking-[0.22em]">
                            {phase.phase}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.chip}`}
                          >
                            {phase.duration}
                          </span>
                        </div>
                        <h3
                          data-public-display="true"
                          className="public-marketing-contrast-heading text-2xl font-semibold sm:text-3xl"
                        >
                          {phase.title}
                        </h3>
                        <p className="public-marketing-contrast-copy mt-3 text-base leading-8 sm:text-lg">
                          {phase.description}
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          {phase.items.map((item) => (
                            <div
                              key={item}
                              className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-4 py-3"
                            >
                              <CheckCircle2
                                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent.bullet}`}
                              />
                              <p className="public-marketing-contrast-copy text-sm">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Behind the Scenes */}
      <section
        id="behind-scenes"
        data-testid="hiw-infrastructure"
        className="public-marketing-stage relative overflow-hidden border-y px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="absolute left-[12%] top-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl public-marketing-glow" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <div className="public-marketing-kicker">
              <BadgeCheck className="h-4 w-4" />
              Behind the scenes
            </div>
          </div>
          <h2
            data-public-display="true"
            className="public-marketing-contrast-heading mt-6 text-3xl font-semibold sm:text-4xl"
          >
            Powered by infrastructure you&apos;ll never need to touch.
          </h2>
          <p className="public-marketing-contrast-copy mx-auto mt-5 max-w-2xl text-lg leading-8">
            Vesta is powered by VestLedger&apos;s institutional infrastructure —
            immutable records, automated workflows, and unified data. You never
            touch it. Vesta does.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        id="hiw-cta"
        data-testid="hiw-cta"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.12),transparent_40%)]" />
            <div className="relative text-center">
              <div className="flex justify-center">
                <div className="public-marketing-kicker">
                  <Sparkles className="h-4 w-4" />
                  Ready to begin?
                </div>
              </div>
              <h2
                data-public-display="true"
                className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl"
              >
                Ready to meet your Vesta?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Start the journey from managing tools to working with
                intelligence. We&apos;ll onboard Vesta to your fund and show you
                what sharper operations look like.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/eoi"
                  className="btn-primary btn-lg rounded-full px-7"
                >
                  Begin Onboarding
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="btn-secondary btn-lg rounded-full border-white/15 bg-white/[0.06] px-7 text-white hover:text-white"
                >
                  Explore capabilities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
