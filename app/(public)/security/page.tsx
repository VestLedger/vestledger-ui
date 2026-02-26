'use client';

import { Card } from '@/ui';
import { Shield, Lock, Server, FileCheck, Eye, Key, Database, Globe, Bot, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  const securityPillars = [
    {
      title: 'Bank-Grade Encryption',
      description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your financial data is as secure as it is with your bank.',
      icon: Lock,
      variant: 'primary' as const,
    },
    {
      title: 'SOC 2 Type II Certified',
      description: 'Our controls and processes are audited annually by independent third-party firms to ensure we meet the highest standards of security and availability.',
      icon: FileCheck,
      variant: 'gold' as const,
    },
    {
      title: 'Role-Based Access Control',
      description: 'Granular permission settings allow you to control exactly who sees what. Restrict sensitive deal data to partners only.',
      icon: Key,
      variant: 'gold' as const,
    },
    {
      title: 'Continuous Monitoring',
      description: 'Our security team utilizes 24/7 automated threat detection and response systems to identify and block potential attacks.',
      icon: Eye,
      variant: 'primary' as const,
    },
    {
      title: 'Data Sovereignty',
      description: 'We offer regional data hosting options to ensure you meet local data residency requirements (GDPR, CCPA).',
      icon: Globe,
      variant: 'gold' as const,
    },
    {
      title: 'Secure Infrastructure',
      description: 'Hosted on AWS with multi-AZ redundancy, regular backups, and strict network isolation.',
      icon: Server,
      variant: 'primary' as const,
    }
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Header */}
      <section className="hero-bg py-16 sm:py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-app-primary/10 dark:bg-app-dark-primary/15 text-app-primary dark:text-app-dark-primary rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Enterprise Security</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Security is Our <span className="text-gold">Foundation</span>
          </h1>
          <p className="text-xl text-app-text-muted dark:text-app-dark-text-muted max-w-2xl mx-auto">
            Trust is the currency of private markets. That&apos;s why VestLedger is built with security-first architecture—for VCs, PE firms, and crypto funds alike.
          </p>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {securityPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const iconStyles = pillar.variant === 'gold'
              ? 'icon-gold'
              : 'bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent';
            return (
              <Card key={index} padding="lg" className="card-elevated h-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg ${iconStyles}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-app-text-muted dark:text-app-dark-text-muted leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tokenized Trust Spotlight */}
      <section className="py-16 sm:py-20 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-app-secondary/10 dark:bg-app-dark-secondary/15 text-app-secondary dark:text-app-dark-secondary rounded-full text-sm font-medium mb-6">
                <Database className="w-4 h-4" />
                <span>Immutable Infrastructure</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Security at the <span className="text-gold">Protocol</span> Level</h2>
              <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted mb-8 leading-relaxed">
                VestLedger&apos;s infrastructure provides cryptographic proof of ownership, capital flows, and compliance status. This isn&apos;t just encryption—it&apos;s an immutable, verifiable source of truth.
              </p>
              <ul className="space-y-3">
                {['On-chain ownership verification', 'Immutable audit trails', 'Programmable compliance rules', 'Secondary-ready asset tokenization'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-app-secondary dark:text-app-dark-secondary flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-premium p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full icon-gold flex items-center justify-center mb-4 shadow-lg">
                <Database className="w-10 h-10 text-white" />
              </div>
              <p className="text-2xl font-bold mb-2">Verification in <span className="text-gold">Minutes</span></p>
              <p className="text-app-text-muted dark:text-app-dark-text-muted">Not weeks. No manual reconciliation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Badge Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Compliance & <span className="text-gold">Standards</span></h2>
          <p className="text-app-text-muted dark:text-app-dark-text-muted mb-12">Trusted by institutional investors worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { icon: Shield, label: 'SOC 2 Type II' },
              { icon: Database, label: 'GDPR Ready' },
              { icon: Lock, label: 'ISO 27001' }
            ].map((badge, i) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={i} className="card-premium p-6 sm:p-8 flex flex-col items-center gap-4 min-w-[160px]">
                  <div className="w-16 h-16 rounded-full icon-gold flex items-center justify-center">
                    <BadgeIcon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-bold text-center">{badge.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-12">
            <button className="btn-secondary" disabled>
              Download Security Whitepaper (Planned)
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Private Infrastructure */}
      <section className="py-16 sm:py-20 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-app-primary/10 dark:bg-app-dark-primary/15 text-app-primary dark:text-app-dark-primary rounded-full text-sm font-medium mb-6">
              <Server className="w-4 h-4" />
              <span>Institutional-Grade Infrastructure</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Built for VCs, PE Firms &amp; <span className="text-gold">Crypto Funds</span></h2>
            <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted max-w-2xl mx-auto">
              VestLedger&apos;s private infrastructure serves the entire private markets ecosystem—from traditional PE and VC to crypto-native funds—with future-ready architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card padding="lg" className="card-elevated h-full">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-app-secondary dark:text-app-dark-secondary" />
                Private, Permissioned Network
              </h3>
              <p className="text-app-text-muted dark:text-app-dark-text-muted mb-4">
                Our permissioned ledger ensures institutional-grade privacy and control. Only authorized parties—GPs, LPs, and auditors—can access and verify transactions.
              </p>
              <ul className="space-y-2 text-sm">
                {['Enterprise SLAs & uptime guarantees', 'Transaction finality in seconds', 'Full regulatory compliance'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-app-secondary dark:text-app-dark-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card padding="lg" className="card-elevated h-full">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
                Future-Ready Architecture
              </h3>
              <p className="text-app-text-muted dark:text-app-dark-text-muted mb-4">
                Enable advanced use cases like tokenized LP interests, on-chain NAV oracles, and programmable secondary markets—when and if regulation permits—without re-platforming.
              </p>
              <ul className="space-y-2 text-sm">
                {['Composable smart contracts', 'Bridge-ready for public chains', 'Crypto VC native workflows'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 sm:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-app-primary via-app-accent to-app-primary dark:from-app-dark-primary dark:via-app-dark-accent dark:to-app-dark-primary flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Have Specific <span className="text-gold">Security</span> Requirements?</h2>
          <p className="text-app-text-muted dark:text-app-dark-text-muted mb-8">
            Our security team is available to answer your due diligence questionnaires.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:security@vestledger.com" className="btn-primary btn-lg">
              Contact Security Team
            </a>
            <Link href="/eoi" className="btn-secondary btn-lg">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
