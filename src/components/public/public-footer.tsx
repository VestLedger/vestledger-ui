'use client';

import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="border-t border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <Image
                src="/logo/Print_Transparent.svg"
                alt="VestLedger logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <h4 className="text-base sm:text-lg text-app-primary dark:text-app-dark-primary font-bold">VestLedger</h4>
            </Link>
            <p className="text-xs sm:text-sm text-app-text-muted dark:text-app-dark-text-muted">
              AI-native fund intelligence, powered by Vesta.
            </p>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Product</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <div><Link href="/features" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Features</Link></div>
              <div><Link href="/security" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Security</Link></div>
              <div><Link href="/eoi" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Early Access</Link></div>
            </div>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Company</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <div><Link href="/about" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">About</Link></div>
              <div><Link href="#" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Careers</Link></div>
              <div><Link href="#" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Contact</Link></div>
            </div>
          </div>
          <div>
            <h5 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Legal</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <div><Link href="#" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Privacy</Link></div>
              <div><Link href="#" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Terms</Link></div>
              <div><Link href="#" className="hover:text-app-text dark:hover:text-app-dark-text transition-colors">Compliance</Link></div>
            </div>
          </div>
        </div>
        <div className="pt-6 sm:pt-8 border-t border-app-border dark:border-app-dark-border text-xs sm:text-sm text-app-text-muted dark:text-app-dark-text-muted text-center">
          © {new Date().getFullYear()} vestledger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
