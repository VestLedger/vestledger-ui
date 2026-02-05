'use client';

import { Card, Button } from '@/ui';
import {
  Brain, Clock, Zap, Users, Bot, ArrowRight,
  TrendingUp, FileText, Eye,
  Calendar, CheckCircle2, History,
  DollarSign, Mail, Shield,
  Building, UserPlus, Network
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Map capability titles to their illustrations
const illustrationMap: Record<string, string> = {
  'Decision Intelligence': '/illustrations/decision-intelligence.svg',
  'Temporal Memory': '/illustrations/temporal-memory.svg',
  'Operational Autonomy': '/illustrations/operational-autonomy.svg',
  'Relationship Intelligence': '/illustrations/relationship-intelligence.svg',
};

export default function FeaturesPage() {
  // Vesta's four capabilities with sub-features
  const vestaCapabilities = [
    {
      title: 'Decision Intelligence',
      description: 'Vesta brings institutional rigor to every investment decision.',
      icon: Brain,
      variant: 'primary' as const,
      features: [
        {
          title: 'Investment Analysis',
          description: 'Vesta synthesizes diligence materials, market data, and historical patterns into actionable insights.',
          icon: TrendingUp,
          variant: 'primary' as const,
        },
        {
          title: 'Memo Support',
          description: 'From first draft to IC-ready, Vesta helps you build and refine investment memos with live data.',
          icon: FileText,
          variant: 'primary' as const,
        },
        {
          title: 'Pattern Recognition',
          description: 'Vesta spots trends, outliers, and risks across your portfolio before they become problems.',
          icon: Eye,
          variant: 'gold' as const,
        }
      ]
    },
    {
      title: 'Temporal Memory',
      description: 'Vesta never forgets what matters—and makes sure you don\'t either.',
      icon: Clock,
      variant: 'gold' as const,
      features: [
        {
          title: 'Deadline Awareness',
          description: 'Covenant dates, subscription periods, reporting deadlines—all tracked and proactively surfaced.',
          icon: Calendar,
          variant: 'gold' as const,
        },
        {
          title: 'Obligation Tracking',
          description: 'Vesta remembers commitments across LPs, co-investors, and portfolio companies.',
          icon: CheckCircle2,
          variant: 'gold' as const,
        },
        {
          title: 'Contextual History',
          description: 'Every conversation, every document, every decision—Vesta builds on what came before.',
          icon: History,
          variant: 'primary' as const,
        }
      ]
    },
    {
      title: 'Operational Autonomy',
      description: 'Vesta handles the routine so you can focus on the exceptional.',
      icon: Zap,
      variant: 'primary' as const,
      features: [
        {
          title: 'Capital Operations',
          description: 'Capital calls and distributions executed end-to-end, with full audit trails.',
          icon: DollarSign,
          variant: 'gold' as const,
        },
        {
          title: 'LP Communications',
          description: 'Quarterly updates, ad-hoc reports, and performance narratives—generated from live data.',
          icon: Mail,
          variant: 'primary' as const,
        },
        {
          title: 'Compliance Automation',
          description: 'Accreditation checks, jurisdiction rules, and regulatory filings—handled automatically.',
          icon: Shield,
          variant: 'gold' as const,
        }
      ]
    },
    {
      title: 'Relationship Intelligence',
      description: 'Vesta maintains institutional memory across your entire network.',
      icon: Users,
      variant: 'gold' as const,
      features: [
        {
          title: 'LP Context',
          description: 'Vesta knows your LPs—their preferences, history, and communication patterns.',
          icon: Building,
          variant: 'gold' as const,
        },
        {
          title: 'Founder Relationships',
          description: 'Every portfolio company interaction builds on previous context.',
          icon: UserPlus,
          variant: 'primary' as const,
        },
        {
          title: 'Co-Investor Network',
          description: 'Track syndicate relationships, past deals, and future opportunities.',
          icon: Network,
          variant: 'primary' as const,
        }
      ]
    }
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero */}
      <section className="hero-bg py-20 sm:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-app-primary/10 dark:bg-app-dark-primary/15 text-app-primary dark:text-app-dark-primary text-sm font-medium mb-6">
            <Bot className="w-4 h-4" aria-hidden="true" />
            <span>Vesta Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Your <span className="text-gold">Fund</span>. <span className="text-vesta">Her Intelligence.</span>
          </h1>
          <p className="text-xl text-app-text-muted dark:text-app-dark-text-muted mb-4">
            Four capabilities that make Vesta your indispensable counterpart.
          </p>
          <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted max-w-2xl mx-auto mb-10">
            Vesta is not a feature. She is a persistent, role-aware agent who analyzes, remembers, acts, and connects—so you can focus on what only you can do.
          </p>
          <Button as={Link} href="/eoi" className="btn-primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
            Start with Vesta
          </Button>
        </div>
      </section>

      {/* Vesta Capabilities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24">
        {vestaCapabilities.map((capability, index) => {
          const CapabilityIcon = capability.icon;
          const isEven = index % 2 === 0;
          const capIconStyles = capability.variant === 'gold'
            ? 'icon-gold'
            : 'bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent';
          return (
            <section key={index} id={capability.title.toLowerCase().replace(/ /g, '-')}>
              {/* Header with illustration */}
              <div className={`mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                <div className={`flex items-start gap-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${capIconStyles}`}>
                    <CapabilityIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{capability.title}</h2>
                    <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted">{capability.description}</p>
                  </div>
                </div>
                <div className={`flex justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative w-full max-w-[300px] aspect-[4/3] opacity-80 hover:opacity-100 transition-opacity">
                    <Image
                      src={illustrationMap[capability.title]}
                      alt={`${capability.title} illustration`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {capability.features.map((feature, fIndex) => {
                  const FeatureIcon = feature.icon;
                  const featureIconBg = feature.variant === 'gold'
                    ? 'bg-app-secondary/10 dark:bg-app-dark-secondary/15'
                    : 'bg-app-primary/10 dark:bg-app-dark-primary/15';
                  const featureIconColor = feature.variant === 'gold'
                    ? 'text-app-secondary dark:text-app-dark-secondary'
                    : 'text-app-primary dark:text-app-dark-primary';
                  return (
                    <Card key={fIndex} padding="lg" className="card-elevated h-full">
                      <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${featureIconBg}`}>
                        <FeatureIcon className={`w-6 h-6 ${featureIconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-app-text-muted dark:text-app-dark-text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* What Powers Vesta (downplayed infrastructure) */}
      <section className="py-16 sm:py-20 bg-app-surface dark:bg-app-dark-surface border-y border-app-border dark:border-app-dark-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">What Powers <span className="text-vesta-gold">Vesta</span></h2>
          <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted max-w-2xl mx-auto">
            Behind Vesta is VestLedger&apos;s institutional infrastructure—immutable records, automated operations, and unified data. You never touch it. Vesta does.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-app-primary via-app-accent to-app-primary dark:from-app-dark-primary dark:via-app-dark-accent dark:to-app-dark-primary flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] ring-2 ring-app-secondary/30 dark:ring-app-dark-secondary/30 ring-offset-2 ring-offset-app-bg dark:ring-offset-app-dark-bg">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">See How <span className="text-gold">Vesta</span> Works For Your Fund</h2>
          <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted mb-8">
            Every fund is unique. Let us show you how Vesta adapts to yours.
          </p>
          <Button as={Link} href="/eoi" className="btn-primary" size="lg">
            Request a Demo
          </Button>
        </div>
      </section>
    </div>
  );
}
