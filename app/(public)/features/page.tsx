import { StaticButton } from '@/ui/static';
import { Link as LinkIcon, RefreshCw, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TriadOrbit, WorkflowFlow, SignalRings } from '@/components/public/visuals';

const visualMap = {
  triad: TriadOrbit,
  flow: WorkflowFlow,
  signals: SignalRings,
} as const;

type VisualKey = keyof typeof visualMap;

type Pillar = {
  title: string;
  description: string;
  icon: typeof LinkIcon;
  color: 'primary' | 'secondary' | 'accent';
  outcomes: string[];
  visual: VisualKey;
};

export default function FeaturesPage() {
  const triadPillars: Pillar[] = [
    {
      title: "Tokenized Trust Layer",
      description: "A compliance-native ownership layer that makes capital events verifiable by default.",
      icon: LinkIcon,
      color: 'primary',
      outcomes: [
        "On-chain ownership registry with immutable audit trails.",
        "Cryptographic proofs for capital calls and distributions.",
        "Programmable compliance rules enforced in real time.",
      ],
      visual: "triad",
    },
    {
      title: "Automated Operations Layer",
      description: "A workflow engine that replaces spreadsheets with real-time automation.",
      icon: RefreshCw,
      color: 'secondary',
      outcomes: [
        "Capital calls and distributions run end-to-end.",
        "LP reporting updated from live portfolio data.",
        "Standardized KPI ingestion across portfolio systems.",
      ],
      visual: "flow",
    },
    {
      title: "AI Advisor Layer",
      description: "Institutional insight delivered from clean operational data.",
      icon: Sparkles,
      color: 'accent',
      outcomes: [
        "IC-ready briefs with variance and scenario analysis.",
        "Anomaly detection across portfolio KPI trends.",
        "LP narratives generated from live data.",
      ],
      visual: "signals",
    }
  ];

  const outcomesBand = [
    {
      title: "Reduce close cycles",
      value: "35%",
      description: "Faster capital event completion with verifiable ownership.",
    },
    {
      title: "Lower reporting effort",
      value: "60%",
      description: "Automated LP reporting and data ingestion.",
    },
    {
      title: "Improve audit readiness",
      value: "100%",
      description: "Always-on compliance logs and traceability.",
    },
  ];

  const integrations = [
    "Fund admin platforms",
    "CRM and deal tracking",
    "Portfolio KPI sources",
    "Accounting systems",
    "Data warehouses",
  ];

  return (
    <div className="text-[var(--app-text)]">
      {/* Hero */}
      <section className="py-12 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            A single system for trust, operations, and intelligence.
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto mb-6">
            VestLedger gives institutional funds a coherent infrastructure for tokenized ownership, automated workflows, and AI-driven decision support.
          </p>
          <StaticButton href="/eoi" color="primary" size="lg" className="inline-flex items-center gap-2">
            Request Demo
            <ArrowRight className="w-4 h-4" />
          </StaticButton>
          <div className="mt-8 flex justify-center">
            <TriadOrbit className="w-64 h-64" />
          </div>
        </div>
      </section>

      {/* Triad Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-12">
        {triadPillars.map((pillar, index) => {
          const PillarIcon = pillar.icon;
          const Visual = visualMap[pillar.visual];
          return (
            <section key={index} id={pillar.title.toLowerCase().replace(/ /g, '-')}>
              <div className="grid lg:grid-cols-[0.55fr_0.45fr] gap-6 items-center">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-[var(--app-${pillar.color}-bg)] text-[var(--app-${pillar.color})]`}>
                      <PillarIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-3">{pillar.title}</h2>
                  <p className="text-lg text-[var(--app-text-muted)] mb-5">{pillar.description}</p>
                  <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
                    {pillar.outcomes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]/80 p-5">
                  <Visual className="w-full h-48" />
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Outcomes Band */}
      <section className="py-12 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Operational impact you can measure.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 text-sm text-[var(--app-text-muted)]">
            {outcomesBand.map((item) => (
              <div key={item.title}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2">{item.title}</p>
                <p className="text-3xl font-semibold text-[var(--app-secondary)] mb-2">{item.value}</p>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Strip */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Designed to fit your stack.</h2>
          <p className="text-[var(--app-text-muted)] mb-6">
            VestLedger connects with the systems your teams already use, without brittle integrations.
          </p>
          <p className="text-sm text-[var(--app-text-muted)]">
            {integrations.join(' • ')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center px-4">
        <h2 className="text-3xl font-bold mb-5">Ready to adopt the Triad OS?</h2>
        <StaticButton href="/eoi" color="primary" size="lg">
          Request Demo
        </StaticButton>
      </section>
    </div>
  );
}
