import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Heart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Your Vesta is sovereign to you. Her intelligence stays with your fund — never shared, never averaged.",
  },
  {
    icon: Sparkles,
    title: "AI-Native Thinking",
    description:
      "We don't add AI to old tools. We build from the ground up around what intelligent systems make possible.",
  },
  {
    icon: Users,
    title: "Partner Success",
    description:
      "Our success is measured by how much time Vesta gives back to fund professionals.",
  },
  {
    icon: Rocket,
    title: "Continuous Learning",
    description:
      "Vesta gets smarter every day. The longer you work together, the more valuable she becomes.",
  },
];

const timeline = [
  {
    year: "2022",
    title: "Founded",
    description:
      "VestLedger was founded to bring modern AI-native technology to venture capital operations.",
    accent: "blue",
  },
  {
    year: "2023",
    title: "First Pilot",
    description:
      "Launched pilot program with 5 early-stage VC firms managing $500M in AUM.",
    accent: "gold",
  },
  {
    year: "2024",
    title: "Series A",
    description:
      "Raised $15M Series A to accelerate product development and expand the Vesta intelligence platform.",
    accent: "cyan",
  },
  {
    year: "2025",
    title: "Vesta Launch",
    description:
      "Introduced Vesta — an AI-native fund intelligence system that learns, remembers, and acts alongside every fund professional.",
    accent: "blue",
  },
];

const stats = [
  { value: "$2.5B+", label: "Assets Under Intelligence" },
  { value: "50+", label: "Funds with Vesta" },
  { value: "1,000+", label: "Portfolio Companies Tracked" },
  { value: "99.9%", label: "Vesta Uptime" },
];

function getTimelineDot(accent: string) {
  if (accent === "gold")
    return "bg-amber-400 dark:bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)]";
  if (accent === "cyan")
    return "bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.4)]";
  return "bg-blue-400 dark:bg-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.4)]";
}

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section
        id="about-hero"
        data-testid="about-hero"
        className="relative isolate overflow-hidden border-b border-[var(--app-border)]"
      >
        <div className="absolute left-[8%] top-24 h-60 w-60 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[14%] top-32 h-48 w-48 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-drift" />
        <div className="absolute bottom-16 left-[24%] h-44 w-44 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-pulse" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <Building2 className="h-4 w-4" />
                About VestLedger
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Building the future of{" "}
              <span className="text-brand">fund intelligence.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
              We believe every fund professional deserves an intelligent
              counterpart — an AI that thinks, remembers, and acts alongside
              them. That&apos;s why we built Vesta.
            </p>
          </div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section
        id="mission"
        data-testid="about-mission"
        className="public-marketing-stage relative overflow-hidden border-b px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="public-marketing-kicker inline-flex">
                <Target className="h-4 w-4" />
                Our mission
              </div>
              <h2
                data-public-display="true"
                className="public-marketing-contrast-heading mt-6 text-3xl font-semibold leading-tight sm:text-4xl"
              >
                The Vesta vision.
              </h2>
              <p className="public-marketing-contrast-copy mt-4 text-base leading-8 sm:text-lg">
                Traditional fund operations demand too much of the wrong things
                — data entry, manual tracking, context switching. We asked: what
                if every fund professional had their own AI?
              </p>
              <p className="public-marketing-contrast-copy mt-4 text-base leading-8 sm:text-lg">
                One that understood their fund, their relationships, their
                rhythm. One that got smarter over time. Vesta is that vision,
                realized.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="public-marketing-stat">
                  <p
                    data-public-display="true"
                    className="public-marketing-contrast-heading text-2xl font-semibold sm:text-3xl"
                  >
                    <span className="text-brand-gold">{stat.value}</span>
                  </p>
                  <p className="public-marketing-contrast-copy mt-2 text-xs uppercase tracking-[0.18em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        id="values"
        data-testid="about-values"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.06),transparent_22%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <Heart className="h-4 w-4" />
                Our values
              </div>
            </div>
            <h2
              data-public-display="true"
              className="mt-6 text-3xl font-semibold text-[var(--app-text)] sm:text-4xl"
            >
              What drives us.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)]">
              Our values guide every decision we make and every feature we
              build.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="public-marketing-panel public-marketing-panel-contrast rounded-[22px] p-6 text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-200">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3
                    data-public-display="true"
                    className="public-marketing-contrast-heading mt-5 text-lg font-semibold"
                  >
                    {value.title}
                  </h3>
                  <p className="public-marketing-contrast-copy mt-3 text-sm leading-7">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="about-cta"
        data-testid="about-cta"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(251,191,36,0.12),transparent_40%)]" />
            <div className="relative text-center">
              <div className="flex justify-center">
                <div className="public-marketing-kicker">
                  <Sparkles className="h-4 w-4" />
                  Join the movement
                </div>
              </div>
              <h2
                data-public-display="true"
                className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl"
              >
                Join the Vesta movement.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                We&apos;re building the future of fund intelligence. Whether
                you&apos;re a fund manager ready for an AI counterpart or a
                talented builder who wants to shape the future of finance,
                we&apos;d love to hear from you.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/eoi"
                  className="btn-primary btn-lg rounded-full px-7"
                >
                  Meet Your Vesta
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
