'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { PublicNavLinks } from './public-nav-links';
import { LoginButton } from './login-button';

export function PublicMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-transparent"
          />
          <div className="absolute left-0 right-0 top-full z-[60] mt-2">
            <div className="w-full border-y border-[var(--app-border)] bg-[var(--app-bg)] shadow-xl">
              <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="mx-auto w-full max-w-sm">
                  <PublicNavLinks
                    orientation="vertical"
                    onNavigate={() => setIsOpen(false)}
                  />
                  <LoginButton className="mt-3 w-full justify-center btn-secondary btn-sm" />
                  <Link
                    href="/eoi"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 flex w-full justify-center px-3 py-2 rounded-md text-sm font-semibold text-white bg-[var(--app-primary)] hover:opacity-90 transition-opacity"
                  >
                    Meet Vesta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
