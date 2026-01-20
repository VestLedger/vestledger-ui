'use client';

import { Card, Button } from '@/ui';
import {
  Target,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
  Building2,
  Rocket,
  Heart,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Your Vesta is sovereign to you. Her intelligence stays with your fund—never shared, never averaged.'
    },
    {
      icon: Sparkles,
      title: 'AI-Native Thinking',
      description: 'We don\'t add AI to old tools. We build from the ground up around what intelligent systems make possible.'
    },
    {
      icon: Users,
      title: 'Partner Success',
      description: 'Our success is measured by how much time Vesta gives back to fund professionals.'
    },
    {
      icon: Rocket,
      title: 'Continuous Learning',
      description: 'Vesta gets smarter every day. The longer you work together, the more valuable she becomes.'
    }
  ];

  const team = [
    {
      name: 'Alex Thompson',
      role: 'Co-Founder & CEO',
      bio: 'Former VP at Sequoia Capital. 15 years in venture capital and fund operations.',
      image: 'AT'
    },
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CTO',
      bio: 'Ex-Principal Engineer at Coinbase. Built crypto infrastructure at scale.',
      image: 'SC'
    },
    {
      name: 'Michael Rodriguez',
      role: 'VP of Product',
      bio: 'Led product at AngelList Stack. Deep expertise in fund admin workflows.',
      image: 'MR'
    },
    {
      name: 'Emily Park',
      role: 'Head of Compliance',
      bio: 'Former SEC counsel. 10 years ensuring regulatory compliance in fintech.',
      image: 'EP'
    }
  ];

  const timeline = [
    {
      year: '2022',
      title: 'Founded',
      description: 'VestLedger was founded to bring modern technology to venture capital operations.'
    },
    {
      year: '2023',
      title: 'First Pilot',
      description: 'Launched pilot program with 5 early-stage VC firms managing $500M in AUM.'
    },
    {
      year: '2024',
      title: 'Series A',
      description: 'Raised $15M Series A led by Andreessen Horowitz to accelerate product development.'
    },
    {
      year: '2025',
      title: 'Vesta Launch',
      description: 'Introduced Vesta—an AI-native fund intelligence system that learns, remembers, and acts alongside every fund professional.'
    }
  ];

  const stats = [
    { value: '$2.5B+', label: 'Assets Under Intelligence' },
    { value: '50+', label: 'Funds with Vesta' },
    { value: '1000+', label: 'Portfolio Companies Tracked' },
    { value: '99.9%', label: 'Vesta Uptime' }
  ];

  return (
    <div className="bg-[var(--app-bg)]">
      {/* Hero Section */}
      <section className="hero-bg py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            <span>About VestLedger</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Building the Future of <span className="text-vesta">Fund Intelligence</span>
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-3xl mx-auto mb-10">
            We believe every fund professional deserves an intelligent counterpart—an AI that thinks, remembers, and acts alongside them. That&apos;s why we built Vesta.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-secondary-bg)] text-[var(--app-secondary)] text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                The Vesta Vision
              </h2>
              <p className="text-lg text-[var(--app-text-muted)] mb-6">
                Traditional fund operations demand too much of the wrong things—data entry, manual tracking, context switching. We asked: what if every fund professional had their own AI?
              </p>
              <p className="text-lg text-[var(--app-text-muted)]">
                One that understood their fund, their relationships, their rhythm. One that got smarter over time. Vesta is that vision, realized.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx} padding="lg" className="text-center card-elevated">
                  <div className="text-3xl font-bold text-gold mb-2">{stat.value}</div>
                  <div className="text-sm text-[var(--app-text-muted)]">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-accent-bg)] text-[var(--app-accent)] text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              <span>Our Values</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">What Drives Us</h2>
            <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
              Our values guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <Card key={idx} padding="lg" className="text-center card-elevated">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#047857] to-[#10b981] flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-[var(--app-text-muted)] text-sm">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-[var(--app-surface)] border-y border-[var(--app-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-secondary-bg)] text-[var(--app-secondary)] text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Our Journey</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Building the Future of Fund Operations</h2>
          </div>
          <div className="space-y-8">
            {timeline.map((milestone, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full icon-gold text-white flex items-center justify-center font-bold shrink-0" role="img" aria-label={milestone.year}>
                    {milestone.year.slice(2)}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-[var(--app-border)] mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-8">
                  <time className="text-sm text-gold font-semibold mb-1 block">{milestone.year}</time>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-[var(--app-text-muted)]">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Our Team</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
            <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
              We&apos;re a team of builders, operators, and technologists with deep expertise in venture capital,
              blockchain, and enterprise software.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <Card key={idx} padding="lg" className="text-center hover:border-[var(--app-primary)] transition-colors">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4" role="img" aria-label={`${member.name} profile picture`}>
                  {member.image}
                </div>
                <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-[var(--app-primary)] mb-3">{member.role}</p>
                <p className="text-sm text-[var(--app-text-muted)] mb-4">{member.bio}</p>
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors" aria-label={`View ${member.name}'s LinkedIn profile`}>
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors" aria-label={`View ${member.name}'s Twitter profile`}>
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors" aria-label={`Email ${member.name}`}>
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center px-4 bg-[var(--app-surface)] border-t border-[var(--app-border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Join the Vesta Movement</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-8">
            We&apos;re building the future of fund intelligence. Whether you&apos;re a fund manager ready for an AI counterpart
            or a talented builder who wants to shape the future of finance, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as={Link} href="/eoi" className="btn-primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
              Meet Your Vesta
            </Button>
            <Button as={Link} href="/careers" variant="bordered" size="lg" endContent={<Globe className="w-4 h-4" />}>
              View Careers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
