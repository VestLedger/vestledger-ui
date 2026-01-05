import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LoginButton } from './login-button';
import { StaticButton } from '@/ui/static';

export function PublicHeaderServer() {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 w-full border-b border-[var(--app-border)] bg-[var(--app-surface)]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--app-surface)]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/Print_Transparent.svg"
              alt="VestLedger logo"
              width={32}
              height={32}
              className="h-8 w-8 logo-mark"
              priority
              fetchPriority="high"
            />
            <span className="text-xl sm:text-2xl tracking-tight text-[var(--app-primary)] dark:text-[var(--app-text)] font-bold">
              VestLedger
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/features" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">
              How It Works
            </Link>
            <Link href="/security" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">
              Security
            </Link>
            <Link href="/about" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LoginButton />
          <StaticButton href="/eoi" color="primary">
            Request Demo
          </StaticButton>
        </div>
      </div>
    </nav>
  );
}
