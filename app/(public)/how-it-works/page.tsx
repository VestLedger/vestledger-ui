'use client';

import { Card, Button } from '@/ui';
import { Link as LinkIcon, RefreshCw, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero */}
      <section className="py-20 text-center px-4 bg-[var(--app-surface)] border-b border-[var(--app-border)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            How <span className="text-[var(--app-primary)]">Triad OS</span> Works
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto">
            Whether you&apos;re a VC, PE firm, or crypto fund, VestLedger&apos;s architecture is designed so each layer reinforces the others—creating compounding operational leverage and decision intelligence.
          </p>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-6">The Unified Architecture</h2>
          <p className="text-lg text-[var(--app-text-muted)] text-center max-w-2xl mx-auto mb-16">
            Token Layer provides real-time immutable truth. Ops Engine automates workflows anchored to that state. AI Advisor uses the clean data to guide decisions. All connected via a unified data fabric.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Token Layer */}
            <Card padding="lg" className="text-center border-2 border-[var(--app-primary)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)]" role="img" aria-label="Tokenized Trust Layer icon">
                <LinkIcon className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Tokenized Trust</h3>
              <p className="text-[var(--app-text-muted)]">On-chain ownership, cryptographic proofs, programmable compliance. The immutable source of truth.</p>
            </Card>

            {/* Ops Engine */}
            <Card padding="lg" className="text-center border-2 border-[var(--app-secondary)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--app-secondary-bg)] flex items-center justify-center text-[var(--app-secondary)]" role="img" aria-label="Automated Operations icon">
                <RefreshCw className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Automated Ops</h3>
              <p className="text-[var(--app-text-muted)]">Capital calls, distributions, NAV calculations, and LP reporting—all automated end-to-end.</p>
            </Card>

            {/* AI Advisor */}
            <Card padding="lg" className="text-center border-2 border-[var(--app-accent)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--app-accent-bg)] flex items-center justify-center text-[var(--app-accent)]" role="img" aria-label="AI Advisor icon">
                <Sparkles className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. AI Advisor</h3>
              <p className="text-[var(--app-text-muted)]">Synthesizes diligence, detects anomalies, generates LP narratives from live operational data.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Engagement Model */}
      <section className="py-24 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-6">Engagement Model</h2>
          <p className="text-lg text-[var(--app-text-muted)] text-center max-w-2xl mx-auto mb-16">
            We partner with funds in a phased approach, ensuring value at each step before expanding scope.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {phases.map((phase, idx) => (
              <Card key={idx} padding="lg" className="border-[var(--app-border-subtle)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase text-[var(--app-primary)]">{phase.phase}</span>
                  <span className="text-xs text-[var(--app-text-muted)]">({phase.duration})</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Fund Operations?</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-8">
            VestLedger invites VCs, PE firms, and crypto funds to adopt the Triad OS as their institutional operating infrastructure.
          </p>
          <Button as={Link} href="/eoi" color="primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
            Express Interest
          </Button>
        </div>
      </section>
    </div>
  );
}
