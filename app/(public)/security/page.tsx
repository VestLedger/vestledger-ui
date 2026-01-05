import { StaticButton } from '@/ui/static';
import { Shield, Lock, Server, FileCheck, CheckCircle2 } from 'lucide-react';
import { ShieldMatrix } from '@/components/public/visuals';

export default function SecurityPage() {
  const securityPillars = [
    {
      title: "Controls",
      description: "Security controls are enforced by default across data, access, and workflow layers.",
      icon: Lock,
      items: [
        "AES-256 encryption at rest and TLS 1.3 in transit.",
        "Role-based access control with least-privilege defaults.",
        "Continuous monitoring and automated incident alerts.",
      ],
    },
    {
      title: "Compliance",
      description: "Independent audits and data residency options support institutional requirements.",
      icon: FileCheck,
      items: [
        "SOC 2 Type II controls audited annually.",
        "GDPR and CCPA-aligned data handling practices.",
        "Regional hosting options for data sovereignty.",
      ],
    },
    {
      title: "Infrastructure",
      description: "Enterprise-grade cloud architecture with resilience and isolation built-in.",
      icon: Server,
      items: [
        "Multi-AZ redundancy with automated backups.",
        "Strict network segmentation and isolation.",
        "Continuous vulnerability scanning and patching.",
      ],
    },
  ];

  return (
    <div className="text-[var(--app-text)]">
      {/* Header */}
      <section className="py-12 text-center px-4 bg-[var(--app-surface)]/85 border-b border-[var(--app-border)]">
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-[var(--app-success-bg)] rounded-full text-[var(--app-success)]" role="img" aria-label="Security shield">
            <Shield className="w-12 h-12" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-5">
          Security is the operating foundation.
        </h1>
        <p className="text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto">
          VestLedger is designed for institutional trust, with verifiable controls, audited compliance, and secure infrastructure across the platform.
        </p>
        <div className="mt-8 flex justify-center">
          <ShieldMatrix className="w-56 h-64" />
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-[var(--app-text-muted)]">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="border-t border-[var(--app-border)] pt-4">
                <div className="mb-3 flex items-center gap-2 text-[var(--app-primary)]">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">{pillar.title}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{pillar.title}</h3>
                <p className="leading-relaxed mb-3">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 text-center px-4">
        <h2 className="text-3xl font-bold mb-5">Have specific security requirements?</h2>
        <p className="text-[var(--app-text-muted)] mb-6">Our security team is available to answer your due diligence questionnaires.</p>
        <StaticButton href="mailto:security@vestledger.com" color="default" variant="flat">
          Contact Security Team
        </StaticButton>
      </section>
    </div>
  );
}
