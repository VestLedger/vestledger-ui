'use client';

import { useEffect } from 'react';
import { Button } from '@/ui';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useUIKey } from '@/store/ui';
import { BrandLogo } from '../brand-logo';
import { LoginModal } from '@/components/login-modal';

export function PublicHeader() {
  const { theme, setTheme } = useTheme();
  const { value: headerUI, patch: patchHeaderUI } = useUIKey('public-header', {
    mounted: false,
    showLoginModal: false,
  });
  const mounted = headerUI.mounted;
  const showLoginModal = headerUI.showLoginModal;

  useEffect(() => {
    patchHeaderUI({ mounted: true });
  }, [patchHeaderUI]);

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 w-full border-b border-app-border dark:border-app-dark-border bg-app-surface/90 dark:bg-app-dark-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-app-surface/75 dark:supports-[backdrop-filter]:bg-app-dark-surface/75"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo className="h-8 w-8 text-[var(--app-primary)]" />
              <span className="text-xl sm:text-2xl tracking-tight text-app-primary dark:text-app-dark-primary font-bold">
                VestLedger
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-app-secondary dark:after:bg-app-dark-secondary after:transition-all hover:after:w-full">Features</Link>
              <Link href="/how-it-works" className="text-sm text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-app-secondary dark:after:bg-app-dark-secondary after:transition-all hover:after:w-full">How It Works</Link>
              <Link href="/security" className="text-sm text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-app-secondary dark:after:bg-app-dark-secondary after:transition-all hover:after:w-full">Security</Link>
              <Link href="/eoi" className="text-sm font-medium text-app-secondary dark:text-app-dark-secondary hover:text-app-secondary-hover dark:hover:text-app-dark-secondary-hover transition-colors">Get Early Access</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="text-app-text-muted dark:text-app-dark-text-muted"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </Button>
            <Button color="primary" onPress={() => patchHeaderUI({ showLoginModal: true })}>
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onOpenChange={(open) => patchHeaderUI({ showLoginModal: open })}
      />
    </>
  );
}
