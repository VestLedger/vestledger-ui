import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  Mail,
  Network,
  Shield,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features — Vesta Capabilities",
  description:
    "Explore how Vesta brings decision intelligence, persistent memory, operational autonomy, and relationship intelligence to every fund professional.",
  openGraph: {
    title: "Features — Vesta Capabilities | VestLedger",
    description:
      "Four capabilities that make Vesta your indispensable AI fund partner.",
    type: "website",
  },
};

type Accent = "blue" | "gold" | "cyan";

const capabilities = [
  {
    accent: "blue" as Accent,
    eyebrow: "Decision intelligence",
    title: "Investment work becomes a live operating loop.",
    description:
      "Vesta connects thesis, prior committee history, and incoming signals so every decision begins with better context — not a blank page.",
    icon: Brain,
    features: [
      {
        title: "Investment Analysis",
        description:
          "Synthesize diligence materials, market data, and historical patterns into actionable insights.",
        icon: TrendingUp,
      },
      {
        title: "Memo Support",
        description:
          "From first draft to IC-ready, Vesta helps build and refine investment memos with live data.",
        icon: FileText,
      },
      {
        title: "Pattern Recognition",
        description:
          "Spot trends, outliers, and risks across your portfolio before they become problems.",
        icon: Eye,
      },
    ],
    sceneTitle: "Investment Command",
    sceneMetric: "4 source layers linked",
    sceneRows: [
      { label: "Pattern watch", value: "Burn multiple widened" },
      { label: "Committee memory", value: "2 prior objections surfaced" },
      { label: "Next move", value: "Prep updated memo draft" },
    ],
    sceneFooter:
      "Decision context stays attached to the company, not a single operator.",
  },
  {
    accent: "gold" as Accent,
    eyebrow: "Temporal memory",
    title: "Memory stays attached to the people and funds that created it.",
    description:
      "Institutional context compounds instead of resetting every quarter or every personnel change. Vesta never forgets what matters.",
    icon: Clock,
    features: [
      {
        title: "Deadline Awareness",
        description:
          "Covenant dates, subscription periods, reporting deadlines — all tracked and proactively surfaced.",
        icon: Calendar,
      },
      {
        title: "Obligation Tracking",
        description:
          "Commitments across LPs, co-investors, and portfolio companies stay visible and actionable.",
        icon: CheckCircle2,
      },
      {
        title: "Contextual History",
        description:
          "Every conversation, every document, every decision — Vesta builds on what came before.",
        icon: History,
      },
    ],
    sceneTitle: "Memory Graph",
    sceneMetric: "Cross-fund memory active",
    sceneRows: [
      { label: "LP context", value: "Mandate shift noted" },
      { label: "Deadline", value: "Q3 report due in 6 days" },
      { label: "Continuity", value: "3 prior exchanges linked" },
    ],
    sceneFooter:
      "Memory becomes an operating advantage, not a dependency on a few people.",
  },
  {
    accent: "blue" as Accent,
    eyebrow: "Operational autonomy",
    title: "Execution moves from reactive coordination to guided action.",
    description:
      "Vesta drafts, routes, and surfaces next steps across diligence, LP operations, compliance, and communication — so your team spends less time choreographing.",
    icon: Zap,
    features: [
      {
        title: "Capital Operations",
        description:
          "Capital calls and distributions coordinated end-to-end, with full audit trails.",
        icon: Building2,
      },
      {
        title: "LP Communications",
        description:
          "Quarterly updates and performance narratives generated from live portfolio data.",
        icon: Mail,
      },
      {
        title: "Compliance Automation",
        description:
          "Accreditation checks, jurisdiction rules, and regulatory filings handled systematically.",
        icon: Shield,
      },
    ],
    sceneTitle: "Operator Queue",
    sceneMetric: "7 actions coordinated",
    sceneRows: [
      { label: "Capital activity", value: "Distribution review ready" },
      { label: "LP touchpoint", value: "Quarterly note drafted" },
      { label: "Timeline", value: "2 deadlines inside 72 hours" },
    ],
    sceneFooter:
      "Operational momentum stays visible, even when multiple teams are in motion.",
  },
  {
    accent: "cyan" as Accent,
    eyebrow: "Relationship intelligence",
    title: "Your network becomes cumulative instead of fragmented.",
    description:
      "Vesta maintains the narrative thread across LPs, founders, and co-investors so every interaction starts deeper — not from scratch.",
    icon: Users,
    features: [
      {
        title: "LP Context",
        description:
          "Vesta knows your LPs — their preferences, history, and communication patterns.",
        icon: Building2,
      },
      {
        title: "Founder Relationships",
        description:
          "Every portfolio company interaction builds on previous context automatically.",
        icon: UserPlus,
      },
      {
        title: "Co-Investor Network",
        description:
          "Track syndicate relationships, past deals, and emerging opportunities.",
        icon: Network,
      },
    ],
    sceneTitle: "Relationship Graph",
    sceneMetric: "Cross-fund memory active",
    sceneRows: [
      { label: "LP context", value: "Mandate shift noted" },
      { label: "Founder history", value: "2 earlier concerns linked" },
      { label: "Network signal", value: "Co-investor overlap rising" },
    ],
    sceneFooter:
      "Memory becomes an operating advantage, not a dependency on a few people.",
  },
];

function getAccentClasses(accent: Accent) {
  if (accent === "gold") {
    return {
      glow: "from-amber-300/30 via-amber-200/10 to-transparent dark:from-amber-300/35",
      tint: "border-amber-300/35 bg-amber-100/85 text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-300",
      bar: "from-amber-300 via-yellow-200 to-amber-300",
      chip: "border-amber-300/35 bg-amber-100/80 text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-50",
    };
  }

  if (accent === "cyan") {
    return {
      glow: "from-cyan-300/28 via-cyan-200/10 to-transparent dark:from-cyan-300/30",
      tint: "border-cyan-300/35 bg-cyan-100/85 text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50",
      icon: "text-cyan-600 dark:text-cyan-300",
      bar: "from-cyan-300 via-sky-200 to-cyan-300",
      chip: "border-cyan-300/35 bg-cyan-100/80 text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50",
    };
  }

  return {
    glow: "from-blue-400/28 via-sky-300/10 to-transparent dark:from-blue-400/32",
    tint: "border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/30 dark:bg-blue-300/10 dark:text-blue-50",
    icon: "text-blue-600 dark:text-blue-300",
    bar: "from-blue-400 via-cyan-200 to-blue-300",
    chip: "border-blue-300/35 bg-blue-100/80 text-blue-700 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-50",
  };
}

function CapabilityScene({
  capability,
}: {
  capability: (typeof capabilities)[number];
}) {
  const Icon = capability.icon;
  const accent = getAccentClasses(capability.accent);

  return (
    <div className="public-marketing-panel public-marketing-panel-contrast relative overflow-hidden rounded-[24px] p-6 sm:p-7">
      <div
        className={`public-marketing-glow absolute inset-x-12 top-0 h-40 rounded-full bg-gradient-to-b blur-3xl ${accent.glow}`}
      />
      <div className="relative flex items-center justify-between gap-4 border-b border-[color:var(--marketing-contrast-soft-border)] pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accent.tint}`}
          >
            <Icon className={`h-5 w-5 ${accent.icon}`} />
          </span>
          <div>
            <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
              {capability.eyebrow}
            </p>
            <h4
              data-public-display="true"
              className="public-marketing-contrast-heading mt-1 text-xl font-semibold"
            >
              {capability.sceneTitle}
            </h4>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.chip}`}
        >
          {capability.sceneMetric}
        </span>
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="public-marketing-contrast-soft rounded-[20px] p-5 shadow-[0_20px_50px_rgba(2,6,17,0.08)] dark:shadow-[0_20px_50px_rgba(2,6,17,0.28)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
                Live brief
              </p>
              <p className="public-marketing-contrast-heading mt-2 text-lg font-semibold">
                {capability.title}
              </p>
            </div>
            <Sparkles className={`h-5 w-5 ${accent.icon}`} />
          </div>
          <div className="mt-5 space-y-3">
            {capability.sceneRows.map((row) => (
              <div
                key={row.label}
                className="public-marketing-contrast-deep rounded-2xl px-4 py-3"
              >
                <p className="public-marketing-contrast-label text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {row.label}
                </p>
                <p className="public-marketing-contrast-copy mt-1 text-sm">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="public-marketing-contrast-soft rounded-[20px] p-4">
            <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
              Capabilities
            </p>
            <div className="mt-3 space-y-2">
              {capability.features.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-3 py-3"
                  >
                    <FeatureIcon
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent.icon}`}
                    />
                    <div>
                      <p className="public-marketing-contrast-heading text-sm font-medium">
                        {feature.title}
                      </p>
                      <p className="public-marketing-contrast-copy mt-0.5 text-xs leading-5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-[20px] border border-[color:var(--marketing-contrast-soft-border)] bg-gradient-to-br from-white/70 to-white/35 p-4 dark:from-white/10 dark:to-transparent">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${accent.bar}`}
            />
            <p className="public-marketing-contrast-copy mt-4 text-sm leading-6">
              {capability.sceneFooter}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section
        id="features-hero"
        data-testid="features-hero"
        className="relative isolate overflow-hidden border-b border-[var(--app-border)]"
      >
        <div className="absolute left-[10%] top-20 h-64 w-64 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[8%] top-32 h-52 w-52 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-drift" />
        <div className="absolute bottom-20 right-[22%] h-44 w-44 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-pulse" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <Bot className="h-4 w-4" />
                Vesta Capabilities
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Your <span className="text-brand-gold">Fund</span>. Her{" "}
              <span className="text-brand">Intelligence.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
              Four capabilities that make Vesta your indispensable counterpart.
              She analyzes, remembers, acts, and connects — so you can focus on
              what only you can do.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/eoi"
                className="btn-primary btn-lg rounded-full px-7"
              >
                Start with Vesta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Sections */}
      <section
        id="capabilities"
        data-testid="capabilities"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="space-y-20">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              const reverse = index % 2 === 1;
              const accent = getAccentClasses(capability.accent);

              return (
                <article
                  key={capability.title}
                  id={capability.eyebrow.toLowerCase().replace(/ /g, "-")}
                  className={`grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] ${reverse ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}
                >
                  <div className={reverse ? "lg:order-2" : undefined}>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-muted)] shadow-[0_12px_30px_rgba(7,16,32,0.08)] backdrop-blur-xl dark:bg-white/5">
                      <Icon className={`h-4 w-4 ${accent.icon}`} />
                      {capability.eyebrow}
                    </div>
                    <h2
                      data-public-display="true"
                      className="mt-6 text-3xl font-semibold leading-tight text-[var(--app-text)] sm:text-4xl"
                    >
                      {capability.title}
                    </h2>
                    <p className="mt-4 text-base leading-8 text-[var(--app-text-muted)] sm:text-lg">
                      {capability.description}
                    </p>
                    <div className="mt-6 space-y-3">
                      {capability.features.map((feature) => (
                        <div
                          key={feature.title}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2
                            className={`mt-1 h-5 w-5 flex-shrink-0 ${accent.icon}`}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[var(--app-text)] sm:text-base">
                              {feature.title}
                            </p>
                            <p className="mt-0.5 text-sm leading-6 text-[var(--app-text-muted)]">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={reverse ? "lg:order-1" : undefined}>
                    <CapabilityScene capability={capability} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Powers Vesta */}
      <section
        id="infrastructure"
        data-testid="features-infrastructure"
        className="public-marketing-stage relative overflow-hidden border-y px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="absolute left-[14%] top-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl public-marketing-glow" />
        <div className="absolute right-[10%] bottom-8 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl public-marketing-pulse" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <div className="public-marketing-kicker">
              <BadgeCheck className="h-4 w-4" />
              What powers Vesta
            </div>
          </div>
          <h2
            data-public-display="true"
            className="public-marketing-contrast-heading mt-6 text-3xl font-semibold sm:text-4xl"
          >
            Behind the scenes is institutional infrastructure you never need to
            touch.
          </h2>
          <p className="public-marketing-contrast-copy mx-auto mt-5 max-w-2xl text-lg leading-8">
            Immutable records. Automated workflows. Unified data. All invisible.
            All reliable. Vesta handles the complexity so you can focus on the
            work that moves the fund forward.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        id="features-cta"
        data-testid="features-cta"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(251,191,36,0.12),transparent_40%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="public-marketing-kicker">
                  <Sparkles className="h-4 w-4" />
                  Get started
                </div>
                <h2
                  data-public-display="true"
                  className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl"
                >
                  See how Vesta works for your fund.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  Every fund is unique. Let us show you how Vesta adapts to
                  yours — your thesis, your relationships, your rhythm.
                </p>
                <div className="mt-8">
                  <Link
                    href="/eoi"
                    className="btn-primary btn-lg rounded-full px-7"
                  >
                    Request a Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(2,6,17,0.36)] backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-300/10 text-blue-50">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Four capabilities
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      One intelligent operating layer.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: Brain,
                      text: "Analyze signal and synthesize committee-ready context.",
                      color: "text-blue-300",
                    },
                    {
                      icon: Clock,
                      text: "Remember every obligation, mandate, and relationship nuance.",
                      color: "text-amber-300",
                    },
                    {
                      icon: Zap,
                      text: "Execute operations with guided, reviewable workflows.",
                      color: "text-cyan-300",
                    },
                    {
                      icon: Users,
                      text: "Connect the network into cumulative institutional memory.",
                      color: "text-blue-300",
                    },
                  ].map(({ icon: ItemIcon, text, color }) => (
                    <div
                      key={text}
                      className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 px-4 py-4"
                    >
                      <ItemIcon
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color}`}
                      />
                      <p className="text-sm leading-6 text-slate-200">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
