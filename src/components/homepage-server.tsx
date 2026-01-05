import { Link as LinkIcon, RefreshCw, Sparkles, Shield, CheckCircle2, Gauge, Database } from 'lucide-react';
import { StaticCard, StaticButton } from '@/ui/static';
import Image from 'next/image';
import { DashboardMockup } from '@/components/public/dashboard-mockup';
import { WorkflowFlow } from '@/components/public/visuals';

export function HomepageServer() {
  const proofPoints = [
    { value: '$2.4B+', label: 'AUM tracked' },
    { value: '500+', label: 'Active deals' },
    { value: '150+', label: 'Firms on platform' },
    { value: '99.9%', label: 'Uptime SLA' },
  ];

  const painPoints = [
    {
      title: 'Fragmented ownership data',
      description: 'Cap tables, side letters, and ownership records live across tools and spreadsheets.',
    },
    {
      title: 'Manual fund operations',
      description: 'Capital calls, NAV updates, and LP reporting require bespoke spreadsheets and email chains.',
    },
    {
      title: 'Reactive insight',
      description: 'Reporting cycles lag behind portfolio reality, hiding risk until it is too late.',
    },
  ];

  const pillars = [
    {
      icon: LinkIcon,
      title: 'Tokenized Trust Layer',
      description: 'On-chain ownership, cryptographic proofs, and programmable compliance as the source of truth.',
      details: ['Immutable ownership registry', 'Compliance rules enforced automatically', 'Audit trails in minutes'],
    },
    {
      icon: RefreshCw,
      title: 'Automated Operations',
      description: 'Replace manual spreadsheets with a live, automated operating rhythm.',
      details: ['Capital calls and distributions', 'LP reporting with real-time data', 'KPI ingestion across funds'],
    },
    {
      icon: Sparkles,
      title: 'AI Advisor',
      description: 'Actionable insights from clean operational data and investment context.',
      details: ['IC-ready brief generation', 'Anomaly detection in KPI trends', 'LP narratives from live data'],
    },
  ];

  const outcomes = [
    {
      icon: Gauge,
      title: 'Faster close cycles',
      description: 'Compress fund operations from weeks to days with verified ownership.',
    },
    {
      icon: Shield,
      title: 'Lower compliance risk',
      description: 'Audit-ready workflows with programmable controls and traceability.',
    },
    {
      icon: Database,
      title: 'Unified fund intelligence',
      description: 'Portfolio signals aggregated into a single, trusted data fabric.',
    },
  ];

  return (
    <div className="text-[var(--app-text)]">
      {/* Hero Section */}
      <section className="public-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo/Print_Transparent.svg"
                alt="VestLedger logo"
                width={40}
                height={40}
                className="h-9 w-9 logo-mark"
                priority
                fetchPriority="high"
              />
              <span className="text-xs uppercase tracking-[0.32em] text-[var(--app-text-muted)]">VestLedger</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] dark:text-[var(--app-text)] text-xs sm:text-sm mb-5">
              Triad OS • Private Markets Infrastructure
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-5 leading-tight">
              The operating system for funds that need provable ownership and real-time insight.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[var(--app-text-muted)] mb-6 leading-relaxed max-w-xl">
              VestLedger unifies tokenized trust, automated operations, and AI guidance so venture, PE, and crypto funds can operate with institutional-grade clarity.
            </p>
            {/* CTA Buttons - Server Rendered */}
            <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4">
              <StaticButton href="/eoi" color="primary" size="lg">
                Request Demo
              </StaticButton>
              <StaticButton href="/how-it-works" variant="bordered" size="lg">
                Watch Demo
              </StaticButton>
            </div>
            <p className="text-xs text-[var(--app-text-muted)] mt-4">
              Demo video coming soon. For now, explore the workflow.
            </p>
          </div>
          <div className="relative z-10">
            <DashboardMockup className="w-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--app-border)] bg-[var(--app-surface)]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {proofPoints.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 text-[var(--app-secondary)]">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[var(--app-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid lg:grid-cols-[0.45fr_0.55fr] gap-6 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl mb-4">Private markets need a real system of record.</h2>
            <p className="text-base sm:text-lg text-[var(--app-text-muted)] leading-relaxed">
              Legacy tools were not built for tokenized ownership or real-time LP expectations. VestLedger gives funds a unified system that scales with the complexity of modern capital.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
            {painPoints.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--app-text-muted)]" />
                <div>
                  <p className="text-[var(--app-text)] font-semibold">{item.title}</p>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl mb-3">Three layers. One operating rhythm.</h2>
          <p className="text-base sm:text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
            The Triad OS keeps ownership, operations, and intelligence synchronized across every fund workflow.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="border-t border-[var(--app-border)] pt-5">
                <div className="w-10 h-10 rounded-lg bg-[var(--app-primary-bg)] text-[var(--app-primary)] flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl mb-2">{pillar.title}</h3>
                <p className="text-sm text-[var(--app-text-muted)] mb-3">{pillar.description}</p>
                <ul className="space-y-2 text-sm text-[var(--app-text-muted)]">
                  {pillar.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--app-success)]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[var(--app-surface)]/85 border-y border-[var(--app-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid md:grid-cols-[0.55fr_0.45fr] gap-6 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl mb-4">Operate like an institution, not a patchwork.</h2>
              <p className="text-base sm:text-lg text-[var(--app-text-muted)] mb-5 leading-relaxed">
                VestLedger replaces fragmented workflows with a single system built for auditability, speed, and collaboration across fund teams and LPs.
              </p>
              <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
                {outcomes.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[var(--app-secondary)] mt-0.5" />
                    <div>
                      <p className="text-[var(--app-text)] font-semibold">{item.title}</p>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-primary)]/90 to-[var(--app-secondary)]/85 p-6 sm:p-8 text-[var(--app-text)] dark:text-white">
              <WorkflowFlow className="w-full h-32 mb-5" />
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-text-muted)] dark:text-white/80 mb-3">Unified Data Fabric</p>
              <h3 className="text-2xl sm:text-3xl mb-3">Every workflow anchored to verifiable ownership.</h3>
              <p className="text-sm sm:text-base text-[var(--app-text-muted)] dark:text-white/85 mb-5">
                From capital calls to LP reporting, the data fabric keeps every team aligned and every decision auditable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <StaticCard className="rounded-xl border-[var(--app-border)] bg-[var(--app-surface)]/90" padding="lg">
          <div className="grid md:grid-cols-[0.6fr_0.4fr] gap-6 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3">Ready to run your fund on a real system?</h3>
              <p className="text-base sm:text-lg text-[var(--app-text-muted)]">
                Schedule a pilot and see how tokenized trust, automated ops, and AI guidance work together.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 sm:gap-4 md:items-end">
              <StaticButton href="/eoi" color="primary" size="lg">
                Request Demo
              </StaticButton>
              <StaticButton href="/how-it-works" variant="bordered" size="lg">
                See How It Works
              </StaticButton>
            </div>
          </div>
        </StaticCard>
      </section>
    </div>
  );
}
