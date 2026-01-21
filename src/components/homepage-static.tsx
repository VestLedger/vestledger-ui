import { Brain, Clock, Zap, Users, CheckCircle2, Bot } from 'lucide-react';
import { StaticCard } from '@/ui/static';
import { LoginButton } from './public/login-button';

/**
 * Vesta-centric Homepage
 * Repositioned from "Triad OS" to "Meet Vesta" AI assistant framing
 */
export function HomepageStatic() {
  // Vesta's four core capabilities
  const capabilities = [
    {
      icon: Brain,
      title: 'Decision Intelligence',
      description: 'Vesta analyzes deals, supports investment memos, evaluates scenarios, and surfaces patterns you might miss.',
      variant: 'primary' as const,
    },
    {
      icon: Clock,
      title: 'Temporal Memory',
      description: 'Vesta remembers every deadline, covenant, and obligation. Your calendar becomes a system of proactive nudges.',
      variant: 'gold' as const,
    },
    {
      icon: Zap,
      title: 'Operational Autonomy',
      description: 'Capital calls, LP updates, compliance checks—Vesta executes routine operations without you orchestrating every step.',
      variant: 'primary' as const,
    },
    {
      icon: Users,
      title: 'Relationship Intelligence',
      description: 'Vesta maintains institutional memory across LPs, founders, and co-investors. Every interaction builds on context.',
      variant: 'gold' as const,
    },
  ];

  const stats = [
    { value: '$2.4B+', label: 'Assets Under Intelligence' },
    { value: '500+', label: 'Deals Analyzed' },
    { value: '150+', label: 'Funds with Vesta' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero Section */}
      <section className="hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-block px-4 py-2 bg-[var(--app-primary-bg)] text-[var(--app-primary)] rounded-full text-sm font-medium mb-6">
              AI-Native Fund Intelligence
            </div>

            {/* Vesta Presence */}
            <div className="flex justify-center mb-8">
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#047857] via-[#0d9488] to-[#10b981] flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)]"
              >
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Meet <span className="text-vesta">Vesta.</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-app-text-muted dark:text-app-dark-text-muted mb-4">
              Your personal AI for fund management.
            </p>
            <p className="text-base sm:text-lg text-app-text-muted dark:text-app-dark-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              VestLedger gives every fund professional an intelligent assistant—to analyze faster, remember everything, act proactively, and influence outcomes across the fund lifecycle.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LoginButton className="btn-primary btn-lg">
                Get Started with Vesta
              </LoginButton>
              <a
                href="/how-it-works"
                className="btn-secondary btn-lg"
              >
                See How Vesta Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--app-border)] bg-[var(--app-surface)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2 text-gold">{stat.value}</div>
                <div className="text-sm text-[var(--app-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">What <span className="text-gold">Vesta</span> Does For You</h2>
          <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted max-w-2xl mx-auto">
            Vesta is not a chatbot. She is a persistent, role-aware fund agent who thinks alongside you.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const iconStyles = capability.variant === 'gold'
              ? 'icon-gold'
              : 'bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent';
            return (
              <div key={index} className="card-vesta p-6 sm:p-8 hover:transform hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg ${iconStyles}`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-app-text dark:text-app-dark-text mb-3">
                  {capability.title}
                </h3>
                <p className="text-app-text-muted dark:text-app-dark-text-muted leading-relaxed">
                  {capability.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Your <span className="text-vesta">Vesta</span>. Your Fund. Your <span className="text-gold">Intelligence</span>.
              </h2>
              <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted mb-6 leading-relaxed">
                Every Vesta is unique to your fund. She learns your investment thesis, understands your LP relationships, knows your operational rhythm. The longer you work together, the smarter she becomes.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-app-primary dark:text-app-dark-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Contextual</div>
                    <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">Vesta knows your fund's history, not just today's data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-app-primary dark:text-app-dark-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Proactive</div>
                    <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">She surfaces what matters before you ask</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-app-secondary dark:text-app-dark-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1 text-app-secondary dark:text-app-dark-secondary">Sovereign</div>
                    <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">Your Vesta's intelligence stays with you—never shared, never averaged</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-vesta p-8 sm:p-12 flex items-center justify-center order-first md:order-last">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-app-primary via-app-accent to-app-primary dark:from-app-dark-primary dark:via-app-dark-accent dark:to-app-dark-primary flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)]">
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                  <Bot className="w-16 h-16 text-white relative z-10" />
                </div>
                <p className="text-xl font-medium text-app-text dark:text-app-dark-text">Vesta</p>
                <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">Your <span className="text-app-secondary dark:text-app-dark-secondary">AI</span> Fund Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="card-premium rounded-2xl p-8 sm:p-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Meet Your <span className="text-gold">Vesta</span>?</h2>
            <p className="text-lg text-app-text-muted dark:text-app-dark-text-muted mb-8 max-w-2xl mx-auto">
              Join funds who have moved from managing tools to working with intelligence.
            </p>
            <LoginButton className="btn-primary btn-lg">
              Get Started
            </LoginButton>
          </div>
        </div>
      </section>
    </div>
  );
}
