'use client'

import { useState } from 'react';
import { ArrowRight, BarChart3, Users, TrendingUp, Shield, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button, Input, Card, Modal } from '@/ui';

export function Homepage() {
  const { login } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Pipeline Management',
      description: 'Visualize and track deals through every stage with intuitive kanban and list views.',
    },
    {
      icon: Users,
      title: 'Portfolio Tracking',
      description: 'Monitor your investments with real-time performance metrics and insights.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reporting',
      description: 'Make data-driven decisions with comprehensive analytics and visual reports.',
    },
    {
      icon: Shield,
      title: 'Due Diligence Workflows',
      description: 'Streamline DD processes with checklists, task management, and team collaboration.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and activity tracking across your portfolio.',
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Access your deal flow from anywhere with our cloud-based platform.',
    },
  ];

  const stats = [
    { value: '$2.4B+', label: 'Assets Under Management' },
    { value: '500+', label: 'Active Deals Tracked' },
    { value: '150+', label: 'VC Firms Using' },
    { value: '99.9%', label: 'Uptime Guarantee' },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {/* Navigation */}
      <nav
        className="sticky top-0 left-0 right-0 z-50 w-full border-b border-[var(--app-border)] bg-[var(--app-surface)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--app-surface)]/75"
        style={{ position: 'sticky', top: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <h1 className="text-xl sm:text-2xl tracking-tight text-[var(--app-primary)]">vestledger</h1>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">Features</a>
              <a href="#about" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">About</a>
              <a href="#pricing" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">Pricing</a>
            </div>
          </div>
          <Button color="primary" onPress={() => setShowLoginModal(true)}>
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--app-primary-bg)] text-[var(--app-primary)] rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
            The Future of Venture Capital Operations
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
            Manage Your VC Portfolio with <span className="text-[var(--app-primary)]">Precision</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--app-text-muted)] mb-6 sm:mb-8 leading-relaxed px-4">
            vestledger is the next-generation workflow management system designed for venture capitalists.
            Track deals, manage due diligence, and analyze portfolio performance—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button size="lg" color="primary" onPress={() => setShowLoginModal(true)} className="w-full sm:w-auto" endContent={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}>
              Get Started
            </Button>
            <Button variant="bordered" color="secondary" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
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
            Built by VCs, for VCs. vestledger provides comprehensive tools to streamline your investment workflow.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:border-[var(--app-border-subtle)] transition-all" padding="md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--app-primary-bg)] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--app-secondary)]" />
                </div>
                <h4 className="text-lg sm:text-xl mb-2 sm:mb-3">{feature.title}</h4>
                <p className="text-sm sm:text-base text-[var(--app-text-muted)] leading-relaxed">{feature.description}</p>
              </Card>
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
                vestledger was born from the frustration of managing deals across spreadsheets, emails, and disconnected tools.
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
            <div className="bg-gradient-to-br from-[var(--app-primary)] via-[var(--app-accent)] to-[var(--app-secondary)] rounded-2xl p-8 sm:p-12 flex items-center justify-center order-first md:order-last shadow-lg">
              <div className="text-white text-center">
                <BarChart3 className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 opacity-90" />
                <p className="text-xl sm:text-2xl font-medium">Transform Your Deal Flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <Card className="rounded-2xl" padding="lg">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Ready to Get Started?</h3>
            <p className="text-base sm:text-lg text-[var(--app-text-muted)] mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join leading venture capital firms who are already using vestledger to manage their portfolios.
            </p>
            <Button size="lg" color="primary" onPress={() => setShowLoginModal(true)} endContent={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}>
              Start Your Free Trial
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-base sm:text-lg mb-3 sm:mb-4 text-[var(--app-primary)]">vestledger</h4>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
                The next-generation VC workflow management platform.
              </p>
            </div>
            <div>
              <h5 className="mb-3 sm:mb-4 text-sm sm:text-base">Product</h5>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Features</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Pricing</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Security</a></div>
              </div>
            </div>
            <div>
              <h5 className="mb-3 sm:mb-4 text-sm sm:text-base">Company</h5>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">About</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Careers</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Contact</a></div>
              </div>
            </div>
            <div>
              <h5 className="mb-3 sm:mb-4 text-sm sm:text-base">Legal</h5>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Privacy</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Terms</a></div>
                <div><a href="#" className="hover:text-[var(--app-text)] transition-colors">Compliance</a></div>
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-[var(--app-border)] text-xs sm:text-sm text-[var(--app-text-muted)] text-center">
            © 2024 vestledger. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onOpenChange={setShowLoginModal}
        size="md"
        title={
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium">Welcome back</h3>
            <p className="text-sm text-[var(--app-text-muted)]">Sign in to your vestledger account</p>
          </div>
        }
      >
        <form onSubmit={handleLogin} className="space-y-4 pb-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            isRequired
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            isRequired
          />
          <Button type="submit" color="primary" className="w-full">
            Sign In
          </Button>
          <div className="text-center text-xs sm:text-sm text-[var(--app-text-muted)]">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-[var(--app-primary)] hover:underline">Sign up</a>
          </div>
        </form>
      </Modal>
    </div>
  );
}
