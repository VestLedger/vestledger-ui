import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { LoginButton } from './login-button';

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
            <Image
              src="/logo/Print_Transparent.svg"
              alt="VestLedger logo"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-xl sm:text-2xl tracking-tight text-[var(--app-primary)] font-bold">
              VestLedger
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/features"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/security"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors"
            >
              Security
            </Link>
            <Link
              href="/about"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors"
            >
              About
            </Link>
          </div>
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
        </div>
      </div>
    </nav>
  );
}
