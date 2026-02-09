import Link from 'next/link';
import { BrandLogo } from '../brand-logo';
import { ThemeToggle } from './theme-toggle';
import { LoginButton } from './login-button';
import { PublicNavLinks } from './public-nav-links';
import { PublicMobileMenu } from './public-mobile-menu';

/**
 * Pure server-side header for public pages
 * Client components: ThemeToggle, LoginButton (minimal JS, ~3 KB total)
 */
export function PublicHeaderStatic() {

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 w-full border-b border-[var(--app-border)] bg-[var(--app-surface)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--app-surface)]/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8 text-[var(--app-primary)]" />
            <span className="text-xl sm:text-2xl tracking-tight text-[var(--app-primary)] font-bold">
              VestLedger
            </span>
          </Link>
          <PublicNavLinks className="hidden md:flex" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LoginButton />
          <Link
            href="/eoi"
            className="hidden sm:flex btn-primary btn-sm"
          >
            Meet Vesta
          </Link>
          <PublicMobileMenu />
        </div>
      </div>
    </nav>
  );
}
