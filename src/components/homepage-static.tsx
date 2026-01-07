import { Link as LinkIcon, RefreshCw, Sparkles, Shield, CheckCircle2, Layers } from 'lucide-react';
import { StaticCard } from '@/ui/static';
import Image from 'next/image';
import { LoginButton } from './public/login-button';

/**
 * Pure server-side homepage
 * Minimal client-side JavaScript: theme toggle + login button
 * Replaces NextUI Card with StaticCard
 * Login dynamically detects app subdomain
 */
export function HomepageStatic() {

  // Triad OS Feature Cards
  const features = [
    {
      icon: LinkIcon,
      title: 'Tokenized Trust Layer',
      description: 'Real-time, on-chain ownership records with cryptographic proofs & programmable compliance.',
    },
    {
      icon: RefreshCw,
      title: 'Automated Operations',
      description: 'Capital calls, distributions, and NAV calculations automated end-to-end. Zero spreadsheets.',
    },
    {
      icon: Sparkles,
      title: 'AI Advisor',
      description: 'Synthesize diligence, detect anomalies, and generate LP narratives from live data.',
    },
    {
      icon: Shield,
      title: 'Immutable Audit Trails',
      description: 'Verification in minutes instead of weeks. Compliance-native by design.',
    },
    {
      icon: Layers,
      title: 'Unified Data Fabric',
      description: 'Smart-contract events sync seamlessly with operational and analytical systems.',
    },
    {
      icon: CheckCircle2,
      title: 'Secondary-Ready Assets',
      description: 'Assets are digital and compliant-by-design, ready for secondary liquidity when regulation permits.',
    },
  ];

  const stats = [
    { value: '$2.4B+', label: 'Assets Under Management' },
    { value: '500+', label: 'Active Deals Tracked' },
    { value: '150+', label: 'VC Firms Using' },
    { value: '99.9%', label: 'Uptime Guarantee' },
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo/Print_Transparent.svg"
              alt="VestLedger logo"
              width={48}
              height={48}
              className="h-10 w-10"
              priority
              fetchPriority="high"
            />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--app-text-muted)]">VestLedger</span>
          </div>
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--app-primary-bg)] text-[var(--app-primary)] rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
            Tokenized Trust • Automated Operations • AI Advisor
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
            The <span className="text-[var(--app-primary)]">Triad OS</span> for Private Markets
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--app-text-muted)] mb-6 sm:mb-8 leading-relaxed px-4">
            VestLedger is an institutional operating system for venture capital, private equity, and crypto funds. Tokenized ownership, automated operations, and AI-powered intelligence—unified on one platform.
          </p>
          {/* Static CTA Buttons - Server Rendered */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <LoginButton className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium bg-[var(--app-primary)] text-white hover:opacity-90 transition-opacity">
              Get Started
            </LoginButton>
            <a
              href="/how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium border-2 border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
            >
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 text-[var(--app-secondary)]">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[var(--app-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Everything You Need to Scale</h3>
          <p className="text-base sm:text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto px-4">
            Built by VCs, for VCs. VestLedger provides comprehensive tools to streamline your investment workflow.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaticCard key={index} className="hover:border-[var(--app-border-subtle)] transition-all" padding="md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--app-primary-bg)] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--app-secondary)]" />
                </div>
                <h4 className="text-lg sm:text-xl mb-2 sm:mb-3">{feature.title}</h4>
                <p className="text-sm sm:text-base text-[var(--app-text-muted)] leading-relaxed">{feature.description}</p>
              </StaticCard>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">Built for Modern VCs</h3>
              <p className="text-base sm:text-lg text-[var(--app-text-muted)] mb-4 sm:mb-6 leading-relaxed">
                VestLedger was born from the frustration of managing deals across spreadsheets, emails, and disconnected tools.
                We built a platform that brings everything together in one seamless experience.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--app-success)] flex-shrink-0 mt-1" />
                  <div>
                    <div className="mb-1 text-sm sm:text-base">Collaborative Workflows</div>
                    <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">Work seamlessly with your investment team in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--app-success)] flex-shrink-0 mt-1" />
                  <div>
                    <div className="mb-1 text-sm sm:text-base">Automated Reporting</div>
                    <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">Generate LP reports and performance updates automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--app-success)] flex-shrink-0 mt-1" />
                  <div>
                    <div className="mb-1 text-sm sm:text-base">Enterprise Security</div>
                    <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">Bank-level encryption and compliance standards</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-8 sm:p-12 flex items-center justify-center order-first md:order-last shadow-lg" aria-label="Triad OS Stack visualization" style={{ background: 'linear-gradient(135deg, var(--app-primary) 0%, var(--app-secondary) 100%)' }}>
              <div className="text-white text-center">
                <Layers className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 opacity-90" aria-hidden="true" />
                <p className="text-xl sm:text-2xl font-medium">The Triad OS Stack</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <StaticCard className="rounded-2xl" padding="lg">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Ready to Get Started?</h3>
            <p className="text-base sm:text-lg text-[var(--app-text-muted)] mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join leading venture capital firms who are already using VestLedger to manage their portfolios.
            </p>
            <LoginButton className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium bg-[var(--app-primary)] text-white hover:opacity-90 transition-opacity">
              Start Your Free Trial
            </LoginButton>
          </div>
        </StaticCard>
      </section>
    </div>
  );
}
