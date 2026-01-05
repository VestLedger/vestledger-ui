'use client';

import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                src="/logo/Print_Transparent.svg"
                alt="VestLedger logo"
                width={24}
                height={24}
                className="h-6 w-6 logo-mark"
              />
              <h4 className="text-base sm:text-lg text-[var(--app-primary)] font-bold">VestLedger</h4>
            </Link>
            <p className="text-sm sm:text-base text-[var(--app-text-muted)]">
              The operating system for fund managers who want provable ownership, automated ops, and real-time insight.
            </p>
          </div>
          <Link
            href="/eoi"
            className="inline-flex items-center justify-center rounded-md bg-[var(--app-primary)] text-white text-sm sm:text-base px-5 py-2.5 shadow-sm hover:bg-[var(--app-primary-hover)] transition-colors"
          >
            Request Demo
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Product</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
              <div><Link href="/features" className="hover:text-[var(--app-text)] transition-colors">Features</Link></div>
              <div><Link href="/how-it-works" className="hover:text-[var(--app-text)] transition-colors">How It Works</Link></div>
              <div><Link href="/security" className="hover:text-[var(--app-text)] transition-colors">Security</Link></div>
            </div>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Company</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
              <div><Link href="/about" className="hover:text-[var(--app-text)] transition-colors">About</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Careers</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Contact</Link></div>
            </div>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Resources</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
              <div><Link href="/eoi" className="hover:text-[var(--app-text)] transition-colors">Request Demo</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Security Brief</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Documentation</Link></div>
            </div>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Legal</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--app-text-muted)]">
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Privacy</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Terms</Link></div>
              <div><Link href="#" className="hover:text-[var(--app-text)] transition-colors">Compliance</Link></div>
            </div>
          </div>
        </div>
        <div className="pt-5 sm:pt-6 border-t border-[var(--app-border)] text-xs sm:text-sm text-[var(--app-text-muted)] text-center">
          © {new Date().getFullYear()} vestledger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
