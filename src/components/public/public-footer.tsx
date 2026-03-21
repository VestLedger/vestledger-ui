"use client";

import Link from "next/link";
import { BrandLogo } from "../brand-logo";
import { ArrowRight, BadgeCheck, Brain, ShieldCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="public-marketing-footer-surface relative overflow-hidden border-t">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_24%)]" />
      <div className="public-marketing-grid absolute inset-0 opacity-0 dark:opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-xl">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3 text-[color:var(--marketing-footer-text)]"
            >
              <span className="public-marketing-shell-control flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--app-primary)] shadow-[0_18px_40px_rgba(5,11,22,0.16)] dark:shadow-[0_18px_40px_rgba(5,11,22,0.32)]">
                <BrandLogo className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span
                  data-public-display="true"
                  className="text-xl font-semibold leading-none"
                >
                  VestLedger
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--marketing-footer-subtle)]">
                  Vesta Operating System
                </span>
              </span>
            </Link>
            <p className="text-base leading-7 text-[color:var(--marketing-footer-muted)]">
              An AI-native operating layer for funds that need sharper memory,
              cleaner execution, and institutional-grade trust.
            </p>
          </div>
          <div className="public-marketing-panel public-marketing-panel-dark rounded-[22px] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Ready to see it live?
                </p>
                <h4
                  data-public-display="true"
                  className="mt-2 text-2xl font-semibold text-white"
                >
                  Bring Vesta into your fund stack.
                </h4>
              </div>
              <Link
                href="/eoi"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                Request access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="public-marketing-card p-5 text-slate-900 dark:text-slate-100">
            <BadgeCheck className="mb-3 h-5 w-5 text-[var(--app-secondary)]" />
            <p className="text-sm font-semibold">Role-aware memory</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Institutional context stays attached to the people, funds, and
              obligations that created it.
            </p>
          </div>
          <div className="public-marketing-card p-5 text-slate-900 dark:text-slate-100">
            <Brain className="mb-3 h-5 w-5 text-[var(--app-primary)]" />
            <p className="text-sm font-semibold">Operator-grade reasoning</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              From diligence through LP communications, Vesta turns fragmented
              workflow into one operating thread.
            </p>
          </div>
          <div className="public-marketing-card p-5 text-slate-900 dark:text-slate-100">
            <ShieldCheck className="mb-3 h-5 w-5 text-cyan-400" />
            <p className="text-sm font-semibold">Auditable by design</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Actions, approvals, and source context remain visible,
              permissioned, and reviewable.
            </p>
          </div>
        </div>

        <div className="grid gap-8 border-t border-[color:var(--marketing-footer-border)] pt-8 md:grid-cols-[1fr_1fr_1fr]">
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--marketing-footer-subtle)]">
              Product
            </h5>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/features" className="public-marketing-footer-link">
                  Features
                </Link>
              </div>
              <div>
                <Link
                  href="/how-it-works"
                  className="public-marketing-footer-link"
                >
                  How It Works
                </Link>
              </div>
              <div>
                <Link href="/security" className="public-marketing-footer-link">
                  Security
                </Link>
              </div>
            </div>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--marketing-footer-subtle)]">
              Company
            </h5>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/about" className="public-marketing-footer-link">
                  About
                </Link>
              </div>
              <div>
                <Link href="/eoi" className="public-marketing-footer-link">
                  Early Access
                </Link>
              </div>
              <div>
                <Link
                  href="/how-it-works"
                  className="public-marketing-footer-link"
                >
                  Product Story
                </Link>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--marketing-footer-subtle)]">
              Footing
            </h5>
            <p className="text-sm leading-6 text-[color:var(--marketing-footer-muted)]">
              Built for venture, private equity, and modern capital teams that
              expect better operating leverage from software.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--marketing-footer-border)] pt-6 text-xs uppercase tracking-[0.18em] text-[color:var(--marketing-footer-subtle)]">
          © {new Date().getFullYear()} VestLedger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
