'use client';

import { Button } from '@/ui';
import {
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Rocket,
  Heart,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { SignalRings } from '@/components/public/visuals';

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Trust is verifiable, not assumed. Every workflow is auditable by default.'
    },
    {
      icon: Sparkles,
      title: 'Innovation First',
      description: 'We ship modern infrastructure that replaces outdated fund operations.'
    },
    {
      icon: Users,
      title: 'Partner Success',
      description: 'We measure success by the operating velocity of our partner funds.'
    },
    {
      icon: Rocket,
      title: 'Move Fast',
      description: 'We deliver value quickly while maintaining institutional rigor.'
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
      description: 'Founded to modernize venture capital operations with verifiable ownership.'
    },
    {
      year: '2023',
      title: 'First Pilot',
      description: 'Piloted with VC firms managing $500M in AUM.'
    },
    {
      year: '2024',
      title: 'Series A',
      description: 'Series A to accelerate product development and compliance readiness.'
    },
    {
      year: '2025',
      title: 'Platform Launch',
      description: 'Launched the Triad OS platform for trust, ops, and intelligence.'
    }
  ];

  const stats = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '50+', label: 'Fund Partners' },
    { value: '1000+', label: 'Portfolio Companies' },
    { value: '99.9%', label: 'Uptime SLA' }
  ];

  return (
    <div className="text-[var(--app-text)]">
      {/* Hero Section */}
      <section className="py-12 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Building the <span className="text-[var(--app-primary)]">operating system</span> for modern funds.
          </h1>
          <p className="text-xl text-[var(--app-text-muted)] max-w-3xl mx-auto mb-6">
            We help venture, private equity, and crypto funds replace spreadsheets and manual workflows with a secure, unified operating system.
          </p>
          <div className="mt-8 flex justify-center">
            <SignalRings className="w-56 h-56" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 bg-[var(--app-surface)]/85 border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-3">
                Empowering fund managers with verifiable infrastructure.
              </h2>
              <p className="text-lg text-[var(--app-text-muted)] mb-5">
                Fund operations still rely on fragmented tooling. We built VestLedger to give funds a clear system of record.
              </p>
              <p className="text-lg text-[var(--app-text-muted)]">
                VestLedger combines blockchain-based ownership, intelligent automation, and AI-powered insights so funds can operate with institutional clarity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="border-t border-[var(--app-border)] pt-4">
                  <div className="text-3xl font-bold text-[var(--app-primary)] mb-2">{stat.value}</div>
                  <div className="text-sm text-[var(--app-text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">What Drives Us</h2>
            <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
              Our values guide every decision we make and every feature we build.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
            {values.map((value) => (
              <li key={value.title} className="flex items-start gap-3 border-t border-[var(--app-border)] pt-4">
                <Heart className="w-4 h-4 text-[var(--app-secondary)] mt-0.5" />
                <div>
                  <p className="text-[var(--app-text)] font-semibold">{value.title}</p>
                  <p>{value.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 bg-[var(--app-surface)]/85 border-y border-[var(--app-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">Building the Future of Fund Operations</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5 text-sm text-[var(--app-text-muted)]">
            {timeline.map((milestone) => (
              <div key={milestone.year} className="border-t border-[var(--app-border)] pt-4">
                <time className="text-xs uppercase tracking-[0.2em]">{milestone.year}</time>
                <h3 className="text-lg font-bold mt-2 mb-2">{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">Meet the Team</h2>
            <p className="text-lg text-[var(--app-text-muted)] max-w-2xl mx-auto">
              We&apos;re a team of builders, operators, and technologists with deep expertise in venture capital,
              blockchain, and enterprise software.
            </p>
            <p className="text-xs text-[var(--app-text-muted)] mt-2">Team profiles shown here are illustrative placeholders.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {team.map((member) => (
              <div key={member.name} className="border-t border-[var(--app-border)] pt-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center text-white text-sm font-bold" role="img" aria-label={`${member.name} profile picture`}>
                    {member.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{member.name}</h3>
                    <p className="text-sm text-[var(--app-primary)]">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--app-text-muted)]">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center px-4 bg-[var(--app-surface)]/85 border-t border-[var(--app-border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Join Us on This Journey</h2>
          <p className="text-lg text-[var(--app-text-muted)] mb-6">
            We&apos;re building the future of venture capital operations. Whether you&apos;re a fund manager looking to transform
            your operations or a talented individual wanting to join our mission, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button as={Link} href="/eoi" color="primary" size="lg" endContent={<ArrowRight className="w-4 h-4" />}>
              Request Demo
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
