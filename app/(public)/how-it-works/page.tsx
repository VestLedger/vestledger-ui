import { StaticButton } from '@/ui/static';
import { Link as LinkIcon, RefreshCw, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WorkflowFlow } from '@/components/public/visuals';

export default function HowItWorksPage() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Pilot',
      duration: '4-6 Weeks',
      items: [
        'IC workflow integration',
        'Tokenized ownership model',
        'KPI ingestion from portfolio',
        'Initial LP portal setup',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Operating Replacement',
      duration: '2-3 Months',
      items: [
        'Remove legacy CRMs & spreadsheets',
        'Standardize all fund workflows',
        'Full automation of capital calls & distributions',
        'Real-time LP reporting live',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Intelligence Layer',
      duration: 'Ongoing',
      items: [
        'NAV oracles and advanced analytics',
        'AI-driven anomaly detection',
        'Governance add-on modules',
        'Cross-fund benchmarking insights',
      ],
    },
  ];

  const requirements = [
    'Fund documentation and LP roster.',
    'Current reporting and workflow templates.',
    'Portfolio KPI sources and data owners.',
    'Security and compliance requirements.',
  ];

  const deliverables = [
    'Tokenized ownership registry baseline.',
    'Automated capital call and distribution workflows.',
    'LP reporting portal with live data.',
    'AI insight layer configured to your fund.',
  ];

  return (
    <div className="text-[var(--app-text)]">
      {/* Hero */}
      <section className="py-12 text-center px-4 bg-[var(--app-surface)]/85 border-b border-[var(--app-border)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            How the Triad OS replaces legacy fund operations.
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto">
            VestLedger rolls out in a phased engagement so you see measurable value before expanding scope. Each layer compounds trust, automation, and intelligence.
          </p>
          <div className="mt-8 flex justify-center">
            <WorkflowFlow className="w-72 h-32" />
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-5">The Unified Architecture</h2>
          <p className="text-lg text-[var(--app-text-muted)] text-center max-w-2xl mx-auto mb-6">
            Token Layer provides real-time immutable truth. Ops Engine automates workflows anchored to that state. AI Advisor uses the clean data to guide decisions. All connected via a unified data fabric.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-sm text-[var(--app-text-muted)]">
            <div className="border-t border-[var(--app-border)] pt-4">
              <div className="flex items-center gap-2 mb-3 text-[var(--app-primary)]">
                <LinkIcon className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.2em]">Tokenized Trust</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Immutable ownership</h3>
              <p>On-chain ownership, cryptographic proofs, programmable compliance.</p>
            </div>
            <div className="border-t border-[var(--app-border)] pt-4">
              <div className="flex items-center gap-2 mb-3 text-[var(--app-secondary)]">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.2em]">Automated Ops</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Workflow engine</h3>
              <p>Capital calls, distributions, NAV, and LP reporting automated end-to-end.</p>
            </div>
            <div className="border-t border-[var(--app-border)] pt-4">
              <div className="flex items-center gap-2 mb-3 text-[var(--app-accent)]">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.2em]">AI Advisor</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Intelligence layer</h3>
              <p>Briefs, anomaly detection, and LP narratives from live data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Model */}
      <section className="py-12 bg-[var(--app-surface)]/85 border-y border-[var(--app-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-5">Engagement Model</h2>
          <p className="text-lg text-[var(--app-text-muted)] text-center max-w-2xl mx-auto mb-6">
            We partner with funds in a phased approach, ensuring value at each step before expanding scope.
          </p>

          <div className="space-y-4">
            {phases.map((phase, idx) => (
              <div key={idx} className="border-t border-[var(--app-border)] pt-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase text-[var(--app-primary)]">{phase.phase}</span>
                  <span className="text-xs text-[var(--app-text-muted)]">{phase.duration}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{phase.title}</h3>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[var(--app-text-muted)]">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Need / What You Get */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3">What we need from you</h3>
              <ul className="space-y-2 text-sm text-[var(--app-text-muted)]">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--app-primary)] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">What you get</h3>
              <ul className="space-y-2 text-sm text-[var(--app-text-muted)]">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Case */}
      <section className="py-12 bg-[var(--app-surface)]/85 border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[0.6fr_0.4fr] gap-6 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-text-muted)] mb-2">Pilot Example</p>
              <h2 className="text-3xl font-bold mb-3">A mid-market VC firm reduced reporting time by 60%.</h2>
              <p className="text-[var(--app-text-muted)]">
                After implementing Tokenized Trust and Automated Operations, the fund moved LP reporting to a live portal, eliminating quarterly manual close processes.
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Time to first automated report</p>
              <p className="text-4xl font-semibold text-[var(--app-secondary)] mb-2">27 days</p>
              <p className="text-xs text-[var(--app-text-muted)]">from kickoff to pilot delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-5">Ready to Transform Your Fund Operations?</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-6">
            VestLedger invites VCs, PE firms, and crypto funds to adopt the Triad OS as their institutional operating infrastructure.
          </p>
          <StaticButton href="/eoi" color="primary" size="lg" className="inline-flex items-center gap-2">
            Request Demo
            <ArrowRight className="w-4 h-4" />
          </StaticButton>
        </div>
      </section>
    </div>
  );
}
