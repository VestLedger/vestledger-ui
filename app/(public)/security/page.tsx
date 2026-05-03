import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  FileCheck,
  Globe,
  Key,
  Lock,
  Server,
  Shield,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Security — Enterprise-Grade Protection",
  description:
    "Trust is the currency of private markets. VestLedger is built with security-first architecture — bank-grade encryption, SOC 2 compliance, and role-based access controls.",
  openGraph: {
    title: "Security — Enterprise-Grade Protection | VestLedger",
    description:
      "Security-first architecture for VCs, PE firms, and modern capital teams.",
    type: "website",
  },
};

type Accent = "blue" | "gold" | "cyan";

const securityPillars = [
  {
    title: "Bank-Grade Encryption",
    description:
      "AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your financial data is as secure as it is with your bank.",
    icon: Lock,
    accent: "blue" as Accent,
  },
  {
    title: "SOC 2 Type II Certified",
    description:
      "Controls and processes audited annually by independent third-party firms to ensure the highest standards of security and availability.",
    icon: FileCheck,
    accent: "gold" as Accent,
  },
  {
    title: "Role-Based Access Control",
    description:
      "Granular permission settings control exactly who sees what. Restrict sensitive deal data to partners only.",
    icon: Key,
    accent: "cyan" as Accent,
  },
  {
    title: "Continuous Monitoring",
    description:
      "24/7 automated threat detection and response systems identify and block potential attacks in real time.",
    icon: Eye,
    accent: "blue" as Accent,
  },
  {
    title: "Data Sovereignty",
    description:
      "Regional data hosting options ensure you meet local data residency requirements including GDPR and CCPA.",
    icon: Globe,
    accent: "gold" as Accent,
  },
  {
    title: "Secure Infrastructure",
    description:
      "Hosted on AWS with multi-AZ redundancy, regular backups, and strict network isolation.",
    icon: Server,
    accent: "cyan" as Accent,
  },
];

const complianceBadges = [
  { icon: Shield, label: "SOC 2 Type II", accent: "blue" as Accent },
  { icon: Database, label: "GDPR Ready", accent: "gold" as Accent },
  { icon: Lock, label: "ISO 27001", accent: "cyan" as Accent },
];

function getAccentClasses(accent: Accent) {
  if (accent === "gold") {
    return {
      tint: "border-amber-300/35 bg-amber-100/85 text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-300",
    };
  }
  if (accent === "cyan") {
    return {
      tint: "border-cyan-300/35 bg-cyan-100/85 text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50",
      icon: "text-cyan-600 dark:text-cyan-300",
    };
  }
  return {
    tint: "border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/30 dark:bg-blue-300/10 dark:text-blue-50",
    icon: "text-blue-600 dark:text-blue-300",
  };
}

export default function SecurityPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section
        id="security-hero"
        data-testid="security-hero"
        className="relative isolate overflow-hidden border-b border-[var(--app-border)]"
      >
        <div className="absolute left-[6%] top-20 h-64 w-64 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[10%] top-36 h-52 w-52 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-drift" />
        <div className="absolute bottom-20 left-[20%] h-44 w-44 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-pulse" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <Shield className="h-4 w-4" />
                Enterprise Security
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Security is our{" "}
              <span className="text-brand-gold">foundation.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
              Trust is the currency of private markets. That&apos;s why
              VestLedger is built with security-first architecture — for VCs, PE
              firms, and modern capital teams alike.
            </p>
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section
        id="pillars"
        data-testid="security-pillars"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {securityPillars.map((pillar) => {
              const Icon = pillar.icon;
              const accent = getAccentClasses(pillar.accent);

              return (
                <article
                  key={pillar.title}
                  className="public-marketing-panel public-marketing-panel-contrast rounded-[22px] p-6"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${accent.tint}`}
                  >
                    <Icon className={`h-6 w-6 ${accent.icon}`} />
                  </span>
                  <h3
                    data-public-display="true"
                    className="public-marketing-contrast-heading mt-5 text-xl font-semibold"
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
        </div>
      </section>

      {/* Institutional Infrastructure */}
      <section
        id="infrastructure"
        data-testid="security-infrastructure"
        className="public-marketing-stage relative overflow-hidden border-y px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="absolute left-[14%] top-10 h-56 w-56 rounded-full bg-cyan-400/16 blur-3xl public-marketing-glow" />
        <div className="absolute right-[8%] bottom-10 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl public-marketing-pulse" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="public-marketing-kicker inline-flex">
                <ShieldCheck className="h-4 w-4" />
                Institutional infrastructure
              </div>
              <h2
                data-public-display="true"
                className="public-marketing-contrast-heading mt-6 text-3xl font-semibold leading-tight sm:text-4xl"
              >
                Security at the protocol level.
              </h2>
              <p className="public-marketing-contrast-copy mt-4 text-base leading-8 sm:text-lg">
                VestLedger&apos;s infrastructure provides verifiable proof of
                ownership, capital flows, and compliance status. An immutable,
                auditable source of truth for every fund operation.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Verifiable ownership records",
                  "Immutable audit trails",
                  "Programmable compliance rules",
                  "Enterprise SLAs and uptime guarantees",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-cyan-500 dark:text-cyan-300" />
                    <span className="public-marketing-contrast-heading text-sm font-medium sm:text-base">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="public-marketing-panel public-marketing-panel-contrast rounded-[24px] p-6 text-center sm:p-8">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/35 bg-amber-100/85 shadow-[0_0_40px_rgba(212,163,50,0.2)] dark:border-amber-300/25 dark:bg-amber-300/10">
                <Database className="h-10 w-10 text-amber-600 dark:text-amber-300" />
              </span>
              <h3
                data-public-display="true"
                className="public-marketing-contrast-heading mt-6 text-2xl font-semibold"
              >
                Verification in{" "}
                <span className="text-brand-gold">minutes.</span>
              </h3>
              <p className="public-marketing-contrast-copy mt-3 text-base">
                Not weeks. No manual reconciliation. Full compliance posture
                maintained while moving faster.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: "99.9%", label: "Uptime" },
                  { value: "<1s", label: "Finality" },
                  { value: "24/7", label: "Monitoring" },
                ].map((stat) => (
                  <div key={stat.label} className="public-marketing-stat">
                    <p
                      data-public-display="true"
                      className="public-marketing-contrast-heading text-xl font-semibold"
                    >
                      {stat.value}
                    </p>
                    <p className="public-marketing-contrast-label mt-1 text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Badges */}
      <section
        id="compliance"
        data-testid="security-compliance"
        className="relative px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="flex justify-center">
            <div className="public-marketing-kicker">
              <BadgeCheck className="h-4 w-4" />
              Compliance &amp; standards
            </div>
          </div>
          <h2
            data-public-display="true"
            className="mt-6 text-3xl font-semibold text-[var(--app-text)] sm:text-4xl"
          >
            Trusted by institutional investors worldwide.
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-8">
            {complianceBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              const accent = getAccentClasses(badge.accent);

              return (
                <div
                  key={badge.label}
                  className="public-marketing-panel public-marketing-panel-contrast flex min-w-[160px] flex-col items-center gap-4 rounded-[22px] p-6 sm:p-8"
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full border ${accent.tint}`}
                  >
                    <BadgeIcon className={`h-8 w-8 ${accent.icon}`} />
                  </span>
                  <span
                    data-public-display="true"
                    className="public-marketing-contrast-heading text-base font-semibold"
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Private Network */}
      <section
        id="private-network"
        data-testid="security-network"
        className="public-marketing-stage relative overflow-hidden border-y px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="public-marketing-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="public-marketing-panel public-marketing-panel-contrast rounded-[22px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-100/85 text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-200">
                  <Lock className="h-5 w-5" />
                </span>
                <h3
                  data-public-display="true"
                  className="public-marketing-contrast-heading text-xl font-semibold"
                >
                  Private, Permissioned Network
                </h3>
              </div>
              <p className="public-marketing-contrast-copy text-sm leading-7 mb-4">
                Institutional-grade privacy and control. Only authorized parties
                — GPs, LPs, and auditors — can access and verify transactions.
              </p>
              <div className="space-y-2">
                {[
                  "Enterprise SLAs & uptime guarantees",
                  "Transaction finality in seconds",
                  "Full regulatory compliance",
                ].map((item) => (
                  <div
                    key={item}
                    className="public-marketing-contrast-deep flex items-center gap-2 rounded-xl px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-500 dark:text-cyan-300" />
                    <span className="public-marketing-contrast-copy text-sm">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="public-marketing-panel public-marketing-panel-contrast rounded-[22px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/35 bg-blue-100/85 text-blue-700 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-200">
                  <Globe className="h-5 w-5" />
                </span>
                <h3
                  data-public-display="true"
                  className="public-marketing-contrast-heading text-xl font-semibold"
                >
                  Future-Ready Architecture
                </h3>
              </div>
              <p className="public-marketing-contrast-copy text-sm leading-7 mb-4">
                Built to evolve with the regulatory landscape. Advanced
                capabilities are ready to deploy when and if regulation permits
                — without re-platforming.
              </p>
              <div className="space-y-2">
                {[
                  "Composable operational modules",
                  "Multi-jurisdiction support",
                  "Extensible API architecture",
                ].map((item) => (
                  <div
                    key={item}
                    className="public-marketing-contrast-deep flex items-center gap-2 rounded-xl px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-300" />
                    <span className="public-marketing-contrast-copy text-sm">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="security-cta"
        data-testid="security-cta"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_40%)]" />
            <div className="relative text-center">
              <div className="flex justify-center">
                <div className="public-marketing-kicker">
                  <Bot className="h-4 w-4" />
                  Security team
                </div>
              </div>
              <h2
                data-public-display="true"
                className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl"
              >
                Have specific security requirements?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Our security team is available to answer your due diligence
                questionnaires and walk through our architecture in detail.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="mailto:security@vestledger.com"
                  className="btn-primary btn-lg rounded-full px-7"
                >
                  Contact Security Team
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/eoi"
                  className="btn-secondary btn-lg rounded-full border-white/15 bg-white/[0.06] px-7 text-white hover:text-white"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
