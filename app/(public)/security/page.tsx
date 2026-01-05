'use client';

import { Card, Button } from '@/ui';
import { Shield, Lock, Server, FileCheck, Eye, Key, Database, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  const securityPillars = [
    {
      title: "Bank-Grade Encryption",
      description: "We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your financial data is as secure as it is with your bank.",
      icon: Lock
    },
    {
      title: "SOC 2 Type II Certified",
      description: "Our controls and processes are audited annually by independent third-party firms to ensure we meet the highest standards of security and availability.",
      icon: FileCheck
    },
    {
      title: "Role-Based Access Control",
      description: "Granular permission settings allow you to control exactly who sees what. Restrict sensitive deal data to partners only.",
      icon: Key
    },
    {
      title: "Continuous Monitoring",
      description: "Our security team utilizes 24/7 automated threat detection and response systems to identify and block potential attacks.",
      icon: Eye
    },
    {
      title: "Data Sovereignty",
      description: "We offer regional data hosting options to ensure you meet local data residency requirements (GDPR, CCPA).",
      icon: Globe
    },
    {
      title: "Secure Infrastructure",
      description: "Hosted on AWS with multi-AZ redundancy, regular backups, and strict network isolation.",
      icon: Server
    }
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Header */}
      <section className="py-20 text-center px-4 bg-[var(--app-surface)] border-b border-[var(--app-border)]">
         <div className="flex justify-center mb-6">
            <div className="p-4 bg-[var(--app-success-bg)] rounded-full text-[var(--app-success)]" role="img" aria-label="Security shield">
                <Shield className="w-12 h-12" aria-hidden="true" />
            </div>
         </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Security is our <span className="text-[var(--app-success)]">Foundation</span>
        </h1>
        <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto">
          Trust is the currency of private markets. That&apos;s why VestLedger is built with security-first architecture—for VCs, PE firms, and crypto funds alike.
        </p>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                    <Card key={index} padding="lg" className="border-[var(--app-border-subtle)]">
                        <div className="mb-4 text-[var(--app-primary)]">
                            <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                        <p className="text-[var(--app-text-muted)] leading-relaxed">
                            {pillar.description}
                        </p>
                    </Card>
                )
            })}
        </div>
      </section>

      {/* Tokenized Trust Spotlight */}
      <section className="py-20 bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] text-sm font-medium mb-6">
                <Database className="w-4 h-4" />
                <span>Tokenized Trust Layer</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Security at the Protocol Level</h2>
              <p className="text-lg text-[var(--app-text-muted)] mb-8 leading-relaxed">
                VestLedger&apos;s Tokenized Trust Layer provides cryptographic proof of ownership, capital flows, and compliance status. This isn&apos;t just encryption—it&apos;s an immutable, verifiable source of truth.
              </p>
              <ul className="space-y-3">
                {['On-chain ownership verification', 'Immutable audit trails', 'Programmable compliance rules', 'Secondary-ready asset tokenization'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--app-success)]/20 flex items-center justify-center text-[var(--app-success)]">
                      <Shield className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-8 text-center shadow-xl">
              <Database className="w-20 h-20 mx-auto text-[var(--app-primary)] mb-4 opacity-80" />
              <p className="text-2xl font-bold mb-2">Verification in Minutes</p>
              <p className="text-[var(--app-text-muted)]">Not weeks. No manual reconciliation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Badge Section */}
      <section className="py-20 bg-[var(--app-surface-hover)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold mb-12">Compliance & Standards</h2>
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Visual placeholders for compliance logos - using text for now */}
                <div className="flex flex-col items-center gap-2">
                    <Shield className="w-16 h-16 text-[var(--app-text)]" />
                    <span className="font-bold">SOC 2 Type II</span>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <Database className="w-16 h-16 text-[var(--app-text)]" />
                    <span className="font-bold">GDPR Ready</span>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <Lock className="w-16 h-16 text-[var(--app-text)]" />
                    <span className="font-bold">ISO 27001</span>
                </div>
            </div>
             <div className="mt-12">
                 <Button as={Link} href="/security/whitepaper" variant="bordered" disabled>
                     Download Security Whitepaper (Coming Soon)
                 </Button>
            </div>
        </div>
      </section>

      {/* Institutional Private Blockchain */}
      <section className="py-20 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--app-primary-bg)] to-[var(--app-secondary-bg)] text-[var(--app-primary)] text-sm font-medium mb-6">
              <Server className="w-4 h-4" />
              <span>Institutional-Grade Private Blockchain</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Built for VCs, PE Firms &amp; Crypto Funds</h2>
            <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
              VestLedger&apos;s private blockchain infrastructure serves the entire private markets ecosystem—from traditional PE and VC to crypto-native funds—with DeFi-ready architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card padding="lg" className="border-[var(--app-border-subtle)]">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--app-primary)]" />
                Private, Permissioned Network
              </h3>
              <p className="text-[var(--app-text-muted)] mb-4">
                Unlike public chains, our permissioned ledger ensures institutional-grade privacy and control. Only authorized parties—GPs, LPs, and auditors—can access and verify transactions.
              </p>
              <ul className="space-y-2 text-sm">
                {['Enterprise SLAs & uptime guarantees', 'Transaction finality in seconds', 'Full regulatory compliance'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[var(--app-success)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card padding="lg" className="border-[var(--app-border-subtle)]">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--app-secondary)]" />
                DeFi-Ready Architecture
              </h3>
              <p className="text-[var(--app-text-muted)] mb-4">
                Enable DeFi use cases like tokenized LP interests, on-chain NAV oracles, and programmable secondary markets—when and if regulation permits—without re-platforming.
              </p>
              <ul className="space-y-2 text-sm">
                {['Composable smart contracts', 'Bridge-ready for public chains', 'Crypto VC native workflows'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[var(--app-success)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-bold mb-6">Have specific security requirements?</h2>
        <p className="text-[var(--app-text-muted)] mb-8">Our security team is available to answer your due diligence questionnaires.</p>
        <Button as={Link} href="mailto:security@vestledger.com" color="default" variant="flat">
          Contact Security Team
        </Button>
      </section>
    </div>
  );
}
