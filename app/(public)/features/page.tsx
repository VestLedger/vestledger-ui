'use client';

import { Card, Button } from '@/ui';
import { Link as LinkIcon, RefreshCw, Sparkles, Shield, Layers, ArrowRight, Eye, FileText, BarChart3, Bot, Database, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  // Triad OS Pillars
  const triadPillars = [
    {
      title: "Tokenized Trust Layer",
      description: "A modern, compliance-native foundation for fund administration and LP trust.",
      icon: LinkIcon,
      color: 'primary',
      features: [
        {
          title: "On-Chain Ownership",
          description: "Real-time, immutable ownership records verified on the blockchain.",
          icon: Database
        },
        {
          title: "Cryptographic Proofs",
          description: "Capital calls, distributions, and balances are cryptographically provable.",
          icon: Shield
        },
        {
          title: "Programmable Compliance",
          description: "Accreditation, jurisdiction checks, transfer restrictions, and lockups are enforced automatically.",
          icon: CheckCircle2
        }
      ]
    },
    {
      title: "Automated Operations Layer",
      description: "A consistent, efficient, audit-perfect operating rhythm for the entire fund lifecycle.",
      icon: RefreshCw,
      color: 'secondary',
      features: [
        {
          title: "Automated Capital Calls & Distributions",
          description: "End-to-end automation from initiation to settlement. No spreadsheets.",
          icon: RefreshCw
        },
        {
          title: "Real-Time LP Reporting",
          description: "Replace quarterly PDFs with a live portal of performance data.",
          icon: BarChart3
        },
        {
          title: "Unified KPI Ingestion",
          description: "Standardized, real-time KPI data from all portfolio companies.",
          icon: Layers
        }
      ]
    },
    {
      title: "AI Advisor Layer",
      description: "Better decisions, earlier risk detection, and a smarter investment rhythm.",
      icon: Sparkles,
      color: 'accent',
      features: [
        {
          title: "Investment Committee Ready Briefs",
          description: "Synthesize diligence into IC-ready documents with variance and scenario analysis.",
          icon: FileText
        },
        {
          title: "Anomaly Detection",
          description: "Detect outliers and anomalies in portfolio KPIs before they become problems.",
          icon: Eye
        },
        {
          title: "LP Narrative Generation",
          description: "Produce investor updates and internal reports from live operational data.",
          icon: Bot
        }
      ]
    }
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero */}
      <section className="py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] text-sm font-medium mb-6">
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>The Triad OS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Three Layers. <span className="text-[var(--app-primary)]">One System.</span> Total Transformation.
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto mb-10">
            VestLedger unifies Tokenized Trust, Automated Operations, and AI Advisor into a single, coherent infrastructure for VCs, PE firms, and crypto funds.
          </p>
          <Button as={Link} href="/eoi" color="primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
            Start Your Pilot
          </Button>
        </div>
      </section>

      {/* Triad Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-24">
        {triadPillars.map((pillar, index) => {
          const PillarIcon = pillar.icon;
           return (
             <section key={index} id={pillar.title.toLowerCase().replace(/ /g, '-')}>
               <div className="mb-12 flex items-center gap-4 border-b border-[var(--app-border)] pb-6">
                 <div className={`p-4 rounded-xl bg-[var(--app-${pillar.color}-bg)] text-[var(--app-${pillar.color})]`}>
                   <PillarIcon className="w-10 h-10" />
                 </div>
                <div>
                   <h2 className="text-3xl font-bold">{pillar.title}</h2>
                   <p className="text-lg text-[var(--app-text-muted)]">{pillar.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {pillar.features.map((feature, fIndex) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <Card key={fIndex} padding="lg" className="h-full border-[var(--app-border-subtle)] hover:border-[var(--app-primary)] transition-colors">
                      <div className="mb-4 w-12 h-12 rounded-lg bg-[var(--app-surface-hover)] flex items-center justify-center text-[var(--app-secondary)]">
                        <FeatureIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-[var(--app-text-muted)] leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </section>
           )
        })}
      </div>

      {/* Architecture Diagram Placeholder */}
      <section className="py-20 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Unified Architecture</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-12 max-w-2xl mx-auto">
            Token Layer provides immutable truth. Ops Engine automates workflows. AI Advisor guides decisions. All synchronized by a unified data fabric.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--app-primary-bg)] text-[var(--app-primary)] font-medium">
              <LinkIcon className="w-5 h-5" /> Token Layer
            </div>
            <ArrowRight className="w-6 h-6 text-[var(--app-text-muted)] hidden sm:block" />
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--app-secondary-bg)] text-[var(--app-secondary)] font-medium">
              <RefreshCw className="w-5 h-5" /> Ops Engine
            </div>
            <ArrowRight className="w-6 h-6 text-[var(--app-text-muted)] hidden sm:block" />
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-medium">
              <Sparkles className="w-5 h-5" /> AI Advisor
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
       <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-bold mb-6">Ready to adopt the Triad OS?</h2>
        <Button as={Link} href="/eoi" color="secondary" size="lg">
          Request Demo Access
        </Button>
      </section>
    </div>
  );
}
