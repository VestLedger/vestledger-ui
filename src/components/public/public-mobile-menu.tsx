'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { PublicNavLinks } from './public-nav-links';

export function PublicMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden relative">
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
            className="fixed inset-0 z-40 bg-black/20"
          />
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl p-2">
            <PublicNavLinks
              orientation="vertical"
              onNavigate={() => setIsOpen(false)}
            />
            <Link
              href="/eoi"
              onClick={() => setIsOpen(false)}
              className="mt-1 flex px-3 py-2 rounded-md text-sm font-semibold text-white bg-[var(--app-primary)] hover:opacity-90 transition-opacity"
            >
              Meet Vesta
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
