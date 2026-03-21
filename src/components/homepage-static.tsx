import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Mail,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type Accent = "blue" | "gold" | "cyan";

const workflowSteps = [
  {
    id: "see",
    label: "See",
    title: "Vesta ingests fund context before you ask.",
    description:
      "Live data, memos, capital events, obligations, and relationship history are stitched into one operating graph.",
    icon: Brain,
    cue: "Deal packets, LP notes, approvals, reporting deadlines",
  },
  {
    id: "remember",
    label: "Remember",
    title: "Memory stays attached to the people and funds that created it.",
    description:
      "Institutional context compounds instead of resetting every quarter or every personnel change.",
    icon: History,
    cue: "Mandates, prior debates, covenant drift, relationship nuance",
  },
  {
    id: "act",
    label: "Act",
    title: "Execution moves from reactive coordination to guided action.",
    description:
      "Vesta drafts, routes, and surfaces next steps across diligence, LP operations, compliance, and communication.",
    icon: Zap,
    cue: "Queue the memo, prep the update, notify the owner, track the trail",
  },
];

const productModules = [
  {
    accent: "blue" as Accent,
    eyebrow: "Decision intelligence",
    title: "Investment work becomes a live operating loop.",
    description:
      "Vesta connects thesis, prior committee history, and incoming signals so every decision begins with better context.",
    bullets: [
      "Surface what changed since the last debate",
      "Draft IC-ready narratives from current data",
      "Flag signal drift before it becomes a blind spot",
    ],
    icon: Brain,
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
    eyebrow: "Fund operations",
    title: "Operations stop living across disconnected follow-ups.",
    description:
      "Capital call prep, LP reporting, and stakeholder follow-through move through one system with fewer dropped threads.",
    bullets: [
      "Draft the next LP update from live portfolio context",
      "Keep time-sensitive obligations visible across the fund",
      "Move from inbox choreography to guided execution",
    ],
    icon: Mail,
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
    eyebrow: "Trust and controls",
    title: "Every action stays permissioned, reviewable, and attributable.",
    description:
      "Vesta accelerates the work without hiding the reasoning, the sources, or the approval trail behind it.",
    bullets: [
      "Trace outputs back to the originating context",
      "Keep approvals and handoffs visible by default",
      "Maintain a cleaner compliance posture while moving faster",
    ],
    icon: ShieldCheck,
    sceneTitle: "Control Surface",
    sceneMetric: "Full source trace enabled",
    sceneRows: [
      { label: "Access mode", value: "Role-aware and scoped" },
      { label: "Audit trail", value: "Draft to approval preserved" },
      { label: "Review status", value: "Ready for legal + ops" },
    ],
    sceneFooter: "Speed is useful only when trust survives the acceleration.",
  },
  {
    accent: "blue" as Accent,
    eyebrow: "Relationship memory",
    title: "Your network becomes cumulative instead of fragmented.",
    description:
      "Vesta maintains the narrative thread across LPs, founders, and co-investors so every interaction starts deeper.",
    bullets: [
      "Preserve nuance around mandates and preferences",
      "Carry prior conversations into the next touchpoint",
      "Spot relationship gaps before they become surprises",
    ],
    icon: Users,
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

const trustPillars = [
  {
    title: "Operator-grade memory",
    description:
      "Context persists across funds, counterparties, obligations, and time.",
    icon: History,
  },
  {
    title: "Permissioned execution",
    description:
      "Actions stay role-aware, reviewable, and intentionally routed.",
    icon: ShieldCheck,
  },
  {
    title: "Institutional coverage",
    description:
      "Decision work, LP ops, compliance, and relationships live in one system.",
    icon: Building2,
  },
  {
    title: "Source-backed output",
    description:
      "Reasoning and recommendations keep a visible path back to context.",
    icon: FileText,
  },
];

const operatingCoverage = [
  "Diligence synthesis",
  "IC memo support",
  "Capital event coordination",
  "LP reporting drafts",
  "Compliance checkpoints",
  "Relationship continuity",
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

function ProductScene({ module }: { module: (typeof productModules)[number] }) {
  const Icon = module.icon;
  const accent = getAccentClasses(module.accent);

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
              {module.eyebrow}
            </p>
            <h4
              data-public-display="true"
              className="public-marketing-contrast-heading mt-1 text-xl font-semibold"
            >
              {module.sceneTitle}
            </h4>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.chip}`}
        >
          {module.sceneMetric}
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
                {module.title}
              </p>
            </div>
            <Sparkles className={`h-5 w-5 ${accent.icon}`} />
          </div>
          <div className="mt-5 space-y-3">
            {module.sceneRows.map((row) => (
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
              Queued actions
            </p>
            <div className="mt-3 space-y-2">
              {module.bullets.slice(0, 2).map((bullet) => (
                <div
                  key={bullet}
                  className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-3 py-3"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent.icon}`}
                  />
                  <p className="public-marketing-contrast-copy text-sm">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-[color:var(--marketing-contrast-soft-border)] bg-gradient-to-br from-white/70 to-white/35 p-4 dark:from-white/10 dark:to-transparent">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${accent.bar}`}
            />
            <p className="public-marketing-contrast-copy mt-4 text-sm leading-6">
              {module.sceneFooter}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomepageStatic() {
  return (
    <div className="relative overflow-hidden">
      <section
        id="hero"
        data-testid="home-hero"
        className="relative isolate overflow-hidden border-b border-[var(--app-border)]"
      >
        <div className="absolute inset-0">
          <Image
            src="/marketing-hero-atmosphere.svg"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-80 dark:opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(248,250,252,0.98)_0%,rgba(248,250,252,0.94)_38%,rgba(248,250,252,0.6)_58%,rgba(248,250,252,0.08)_76%,rgba(5,11,22,0.16)_100%)] dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_18%_18%,rgba(251,191,36,0.12),transparent_22%),linear-gradient(180deg,rgba(5,11,22,0.12),rgba(5,11,22,0.5))]" />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--app-bg) 100%)",
          }}
        />
        <div className="absolute left-[6%] top-24 h-64 w-64 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[10%] top-36 h-52 w-52 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-drift" />
        <div className="absolute bottom-24 right-[18%] h-48 w-48 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-pulse" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-2xl">
              <div className="public-marketing-kicker">
                <Sparkles className="h-4 w-4" />
                AI-native fund intelligence
              </div>
              <h1
                data-public-display="true"
                className="mt-7 text-5xl font-semibold leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white"
              >
                Meet <span className="text-brand-gold">Vesta</span>, the fund
                operator that sees around corners.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
                VestLedger gives every fund professional an AI operating layer
                that sees the signal, remembers the context, and turns next
                actions into forward motion.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/eoi"
                  className="btn-primary btn-lg rounded-full px-7"
                >
                  Meet Vesta
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn-secondary btn-lg rounded-full border-[color:var(--marketing-shell-control-border)] bg-[color:var(--marketing-shell-control-bg)] px-7 text-[var(--app-text)] backdrop-blur-md hover:bg-[color:var(--marketing-shell-control-hover)] dark:text-white"
                >
                  See how it works
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="public-marketing-chip">
                  <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  Auditable by design
                </span>
                <span className="public-marketing-chip">
                  <Clock3 className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                  Persistent memory
                </span>
                <span className="public-marketing-chip">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Role-aware execution
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-16 hidden h-24 w-24 rounded-full border border-slate-200/60 bg-white/60 blur-2xl dark:border-white/15 dark:bg-white/10 lg:block" />
              <div className="absolute -right-4 bottom-6 hidden h-28 w-28 rounded-full border border-blue-200/60 bg-[var(--marketing-glow-blue)] blur-3xl dark:border-white/10 lg:block" />
              <div className="public-marketing-panel public-marketing-panel-contrast relative overflow-hidden rounded-[28px] p-5 sm:p-6">
                <div className="public-marketing-grid absolute inset-0" />
                <div className="absolute inset-x-10 top-0 h-36 rounded-full bg-gradient-to-b from-blue-400/20 via-cyan-300/10 to-transparent blur-3xl" />
                <div className="relative flex items-center justify-between gap-4 border-b border-[color:var(--marketing-contrast-soft-border)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-200">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.22em]">
                        Vesta command center
                      </p>
                      <p
                        data-public-display="true"
                        className="public-marketing-contrast-heading mt-1 text-xl font-semibold"
                      >
                        Fund context is already in motion.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-cyan-300/35 bg-cyan-100/80 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50">
                    Live context graph
                  </span>
                </div>

                <div className="relative mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="public-marketing-contrast-soft rounded-[22px] p-5 shadow-[0_20px_60px_rgba(2,6,17,0.12)] dark:shadow-[0_20px_60px_rgba(2,6,17,0.24)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
                          Morning brief
                        </p>
                        <p className="public-marketing-contrast-heading mt-2 text-lg font-semibold">
                          Two funds need direct operator attention before noon.
                        </p>
                      </div>
                      <Bell className="h-5 w-5 text-amber-500 dark:text-amber-300" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="public-marketing-contrast-deep rounded-2xl px-4 py-3">
                        <p className="public-marketing-contrast-label text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Priority shift
                        </p>
                        <p className="public-marketing-contrast-copy mt-1 text-sm">
                          Liquidity runway tightened across one watchlist
                          company.
                        </p>
                      </div>
                      <div className="public-marketing-contrast-deep rounded-2xl px-4 py-3">
                        <p className="public-marketing-contrast-label text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Relationship signal
                        </p>
                        <p className="public-marketing-contrast-copy mt-1 text-sm">
                          LP mandate nuance from the last quarterly call is
                          linked to the upcoming update.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="public-marketing-contrast-soft rounded-[20px] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
                          Context stack
                        </p>
                        <Brain className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-blue-300/35 bg-blue-100/80 px-3 py-1 text-xs text-blue-700 dark:border-blue-300/20 dark:bg-blue-300/10 dark:text-blue-50">
                          Memo history
                        </span>
                        <span className="rounded-full border border-cyan-300/35 bg-cyan-100/80 px-3 py-1 text-xs text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-50">
                          LP preferences
                        </span>
                        <span className="rounded-full border border-amber-300/35 bg-amber-100/80 px-3 py-1 text-xs text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-50">
                          Deadlines
                        </span>
                        <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          Approval state
                        </span>
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-[color:var(--marketing-contrast-soft-border)] bg-gradient-to-br from-white/76 to-white/42 p-4 dark:from-white/10 dark:to-transparent">
                      <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
                        Action queue
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-3 py-3">
                          <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                          <p className="public-marketing-contrast-copy text-sm">
                            Refresh the IC narrative with updated burn and
                            cohort data.
                          </p>
                        </div>
                        <div className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-3 py-3">
                          <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-300" />
                          <p className="public-marketing-contrast-copy text-sm">
                            Draft the LP update with the right mandate context
                            already attached.
                          </p>
                        </div>
                        <div className="public-marketing-contrast-deep flex items-start gap-3 rounded-2xl px-3 py-3">
                          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-300" />
                          <p className="public-marketing-contrast-copy text-sm">
                            Hold the compliance step until the owner confirms
                            jurisdiction notes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-5 top-20 hidden rounded-full border border-blue-300/35 bg-white/82 px-4 py-2 text-xs text-blue-700 shadow-[0_18px_40px_rgba(5,11,22,0.12)] backdrop-blur-xl dark:border-blue-300/20 dark:bg-[#07111f]/[0.85] dark:text-blue-50 dark:shadow-[0_18px_40px_rgba(5,11,22,0.35)] lg:block">
                Multi-fund memory active
              </div>
              <div className="absolute -right-5 bottom-16 hidden rounded-full border border-amber-300/35 bg-white/82 px-4 py-2 text-xs text-amber-700 shadow-[0_18px_40px_rgba(5,11,22,0.12)] backdrop-blur-xl dark:border-amber-300/20 dark:bg-[#07111f]/[0.85] dark:text-amber-50 dark:shadow-[0_18px_40px_rgba(5,11,22,0.35)] lg:block">
                7 guided actions queued
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow-rail"
        data-testid="workflow-rail"
        className="public-marketing-stage relative overflow-hidden border-b px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_22%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="public-marketing-kicker">
              <BadgeCheck className="h-4 w-4" />
              How Vesta works
            </div>
            <h2
              data-public-display="true"
              className="public-marketing-contrast-heading mt-6 text-4xl font-semibold leading-tight sm:text-5xl"
            >
              One operating thread from signal to action.
            </h2>
            <p className="public-marketing-contrast-copy mt-5 text-lg leading-8">
              Vesta is not a chatbot bolted onto your stack. She is a role-aware
              operating layer that sees the fund, remembers the context, and
              moves the work forward.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.id}
                  className="public-marketing-panel public-marketing-panel-contrast rounded-[24px] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="public-marketing-contrast-soft public-marketing-contrast-label rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                      0{index + 1} / {step.label}
                    </span>
                    <span className="public-marketing-contrast-soft flex h-11 w-11 items-center justify-center rounded-2xl text-blue-600 dark:text-blue-200">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3
                    data-public-display="true"
                    className="public-marketing-contrast-heading mt-6 text-2xl font-semibold"
                  >
                    {step.title}
                  </h3>
                  <p className="public-marketing-contrast-copy mt-4 text-sm leading-7">
                    {step.description}
                  </p>
                  <div className="public-marketing-contrast-deep mt-6 rounded-[20px] p-4">
                    <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.2em]">
                      Signal layer
                    </p>
                    <p className="public-marketing-contrast-copy mt-3 text-sm leading-6">
                      {step.cue}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="product-proof"
        data-testid="product-proof"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="public-marketing-kicker">
              <Bot className="h-4 w-4" />
              Product proof
            </div>
            <h2
              data-public-display="true"
              className="mt-6 text-4xl font-semibold leading-tight text-[var(--app-text)] sm:text-5xl"
            >
              Built to explain the work, not just decorate the page.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--app-text-muted)]">
              Every section below shows how Vesta changes the operating posture
              of a fund: sharper signal detection, cleaner execution, and
              institutional memory that compounds.
            </p>
          </div>

          <div className="mt-14 space-y-10">
            {productModules.map((module, index) => {
              const Icon = module.icon;
              const reverse = index % 2 === 1;

              return (
                <article
                  key={module.title}
                  className={`grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] ${reverse ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}
                >
                  <div className={reverse ? "lg:order-2" : undefined}>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-muted)] shadow-[0_12px_30px_rgba(7,16,32,0.08)] backdrop-blur-xl dark:bg-white/5">
                      <Icon className="h-4 w-4 text-[var(--app-primary)]" />
                      {module.eyebrow}
                    </div>
                    <h3
                      data-public-display="true"
                      className="mt-6 text-3xl font-semibold leading-tight text-[var(--app-text)] sm:text-4xl"
                    >
                      {module.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-[var(--app-text-muted)] sm:text-lg">
                      {module.description}
                    </p>
                    <div className="mt-6 space-y-3">
                      {module.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[var(--app-primary)]" />
                          <p className="text-sm leading-7 text-[var(--app-text-muted)] sm:text-base">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={reverse ? "lg:order-1" : undefined}>
                    <ProductScene module={module} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="trust-layer"
        data-testid="trust-layer"
        className="public-marketing-stage relative overflow-hidden border-y px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="absolute left-[12%] top-14 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl public-marketing-glow" />
        <div className="absolute right-[8%] bottom-10 h-56 w-56 rounded-full bg-amber-300/12 blur-3xl public-marketing-pulse" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="public-marketing-kicker">
              <ShieldCheck className="h-4 w-4" />
              Trust layer
            </div>
            <h2
              data-public-display="true"
              className="public-marketing-contrast-heading mt-6 text-4xl font-semibold leading-tight sm:text-5xl"
            >
              Cutting-edge only matters if the operating trust survives it.
            </h2>
            <p className="public-marketing-contrast-copy mt-5 text-lg leading-8">
              Vesta accelerates the work without turning the system opaque. The
              reasoning, permissions, and handoffs stay visible so operators can
              move faster without losing control.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="public-marketing-panel public-marketing-panel-contrast rounded-[22px] p-5"
                >
                  <span className="public-marketing-contrast-soft flex h-11 w-11 items-center justify-center rounded-2xl text-cyan-600 dark:text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3
                    data-public-display="true"
                    className="public-marketing-contrast-heading mt-5 text-2xl font-semibold"
                  >
                    {pillar.title}
                  </h3>
                  <p className="public-marketing-contrast-copy mt-3 text-sm leading-7">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="public-marketing-panel public-marketing-panel-contrast mt-8 rounded-[26px] p-6 sm:p-7">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="public-marketing-contrast-label text-xs font-semibold uppercase tracking-[0.24em]">
                  Operating coverage
                </p>
                <h3
                  data-public-display="true"
                  className="public-marketing-contrast-heading mt-3 text-3xl font-semibold"
                >
                  One system across the work that usually breaks apart.
                </h3>
                <p className="public-marketing-contrast-copy mt-4 text-base leading-8">
                  The point is not more AI theatre. The point is one coherent
                  operating layer that can reason, remember, and assist across
                  the fund lifecycle without fragmenting the trail behind it.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {operatingCoverage.map((item) => (
                  <div
                    key={item}
                    className="public-marketing-contrast-soft public-marketing-contrast-heading rounded-[20px] px-4 py-4 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="final-cta"
        data-testid="home-cta"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0">
              <Image
                src="/marketing-footer-waves.svg"
                alt=""
                fill
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,11,22,0.28),rgba(5,11,22,0.62))]" />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="public-marketing-kicker">
                  <Sparkles className="h-4 w-4" />
                  Final CTA
                </div>
                <h2
                  data-public-display="true"
                  className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl"
                >
                  Bring a sharper operating posture to the whole fund.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  If your team is still coordinating signal, memory, and
                  execution across too many surfaces, Vesta is the layer that
                  pulls them back together.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(2,6,17,0.36)] backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-50">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Start the conversation
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      See what Vesta looks like inside your fund.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 px-4 py-4">
                    <Network className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                    <p className="text-sm leading-6 text-slate-200">
                      Explore how Vesta handles your investment, LP, and
                      compliance workflows as one operating system.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 px-4 py-4">
                    <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-300" />
                    <p className="text-sm leading-6 text-slate-200">
                      Keep your existing route to early access while upgrading
                      the way the product story is told.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/eoi"
                    className="btn-primary w-full justify-center rounded-full px-5 sm:w-auto"
                  >
                    Request access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="btn-secondary w-full justify-center rounded-full border-white/15 bg-white/[0.06] px-5 text-white hover:text-white sm:w-auto"
                  >
                    Review the workflow
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
