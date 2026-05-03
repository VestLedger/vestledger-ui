"use client";

import Link from "next/link";
import { BrandLogo } from "../brand-logo";

export function PublicFooter() {
  return (
    <footer className="public-marketing-footer-surface relative overflow-hidden border-t">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_24%)]" />
      <div className="public-marketing-grid absolute inset-0 opacity-0 dark:opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 border-t border-[color:var(--marketing-footer-border)] pt-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[color:var(--marketing-footer-text)]"
            >
              <span className="public-marketing-shell-control flex h-10 w-10 items-center justify-center rounded-xl text-[var(--app-primary)] shadow-sm">
                <BrandLogo className="h-5 w-5" />
              </span>
              <span
                data-public-display="true"
                className="text-lg font-semibold leading-none"
              >
                VestLedger
              </span>
            </Link>
          </div>
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
              Legal
            </h5>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/privacy" className="public-marketing-footer-link">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link href="/terms" className="public-marketing-footer-link">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--marketing-footer-border)] pt-6 text-xs uppercase tracking-[0.18em] text-[color:var(--marketing-footer-subtle)]">
          © {new Date().getFullYear()} VestLedger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
