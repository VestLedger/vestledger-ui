'use client';

import { Card, Button } from '@/ui';
import { Bot, ArrowRight, CheckCircle2, Sparkles, BookOpen, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const vestaJourney = [
    {
      phase: 'Phase 1',
      title: 'Onboarding Your Vesta',
      duration: '4-6 Weeks',
      icon: BookOpen,
      description: 'Vesta learns your fund—its structure, relationships, and operational patterns.',
      items: [
        'Fund structure and LP data ingestion',
        'Historical document and deal analysis',
        'Calendar and deadline mapping',
        'Initial decision intelligence setup',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Vesta Takes the Wheel',
      duration: '2-3 Months',
      icon: Zap,
      description: 'Vesta begins handling operations, freeing you from routine tasks.',
      items: [
        'Automated capital call and distribution workflows',
        'Real-time LP portal with live reporting',
        'Proactive deadline and obligation alerts',
        'Relationship context building',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Vesta Evolves With You',
      duration: 'Ongoing',
      icon: Sparkles,
      description: 'The longer you work together, the smarter Vesta becomes.',
      items: [
        'Pattern recognition across your portfolio',
        'Predictive insights and anomaly detection',
        'Cross-fund benchmarking (anonymized)',
        'Continuous learning from your decisions',
      ],
    },
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero */}
      <section className="hero-bg py-20 sm:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Vesta Presence */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--app-primary)] via-[var(--app-accent)] to-[var(--app-primary-hover)] flex items-center justify-center shadow-[var(--brand-glow)]">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <Bot className="w-10 h-10 text-white relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            How <span className="text-vesta">Vesta</span> Learns Your Fund
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto">
            Vesta doesn&apos;t arrive fully formed. She grows alongside your fund—learning your thesis, your relationships, your rhythm. Here&apos;s how that journey unfolds.
          </p>
        </div>
      </section>

      {/* The Vesta Journey */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {vestaJourney.map((phase, idx) => {
              const PhaseIcon = phase.icon;
              return (
                <div key={idx} className="card-vesta p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Phase indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center shadow-lg">
                        <PhaseIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-sm font-bold uppercase text-[var(--app-primary)]">{phase.phase}</span>
                        <span className="text-sm font-semibold text-gold">({phase.duration})</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3">{phase.title}</h3>
                      <p className="text-lg text-[var(--app-text-muted)] mb-6">{phase.description}</p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {phase.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-[var(--app-text-muted)]">
                            <CheckCircle2 className="w-5 h-5 text-[var(--app-primary)] flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Powers Vesta (subtle infrastructure mention) */}
      <section className="py-16 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Behind the Scenes</h2>
          <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
            Vesta is powered by VestLedger&apos;s infrastructure—but you&apos;ll never need to touch it. Immutable records. Automated workflows. Unified data. All invisible. All reliable.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[var(--app-primary)] via-[var(--app-accent)] to-[var(--app-primary-hover)] flex items-center justify-center shadow-[var(--brand-glow)]">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Meet Your Vesta?</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-8">
            Start the journey from managing tools to working with intelligence.
          </p>
          <Button as={Link} href="/eoi" className="btn-primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
            Begin Onboarding
          </Button>
        </div>
      </section>
    </div>
  );
}
