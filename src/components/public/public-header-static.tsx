import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';

/**
 * Pure server-side header for public pages
 * Only client component is ThemeToggle (~2 KB)
 * Login button redirects to app subdomain login page
 */
export function PublicHeaderStatic() {
  // Determine login URL based on environment
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.vestledger.local:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const loginUrl = `${protocol}://${appDomain}/login`;

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
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/security"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            >
              Security
            </Link>
            <Link
              href="/about"
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            >
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href={loginUrl}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm bg-[var(--app-primary)] text-white hover:opacity-90 transition-opacity"
          >
            Login
          </a>
          <Link
            href="/eoi"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm border-2 border-[var(--app-primary)] text-[var(--app-primary)] hover:bg-[var(--app-primary-bg)] transition-colors"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
