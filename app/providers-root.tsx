'use client';

import { useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ReactNode } from 'react';
import { getThemeFromCookie, setThemeCookie } from '@/lib/theme-sync';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/ui';

/**
 * Syncs theme between next-themes (localStorage) and cookies (cross-subdomain)
 * Cookie is the source of truth for cross-subdomain consistency
 */
function ThemeSyncWrapper({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync cookie immediately on mount - run only once
  useEffect(() => {
    if (mounted) return;

    const cookieTheme = getThemeFromCookie();
    console.log('[ThemeSync] Initial mount:', { cookieTheme, theme, resolvedTheme });

    if (cookieTheme) {
      // Cookie exists - it's the source of truth
      // Force set the theme from cookie
      console.log('[ThemeSync] Forcing theme from cookie:', cookieTheme);
      setTheme(cookieTheme);
    }

    setMounted(true);
  }, [mounted, theme, resolvedTheme, setTheme]);

  // When theme changes after mount, sync to cookie
  useEffect(() => {
    if (!mounted) return; // Only sync changes after initial mount

    if (theme === 'light' || theme === 'dark') {
      const cookieTheme = getThemeFromCookie();
      // Only update cookie if different to avoid infinite loops
      if (cookieTheme !== theme) {
        console.log('[ThemeSync] Theme changed, updating cookie:', theme);
        setThemeCookie(theme);
      }
    }
  }, [mounted, theme]);

  // Also watch for resolvedTheme changes to set initial cookie if none exists
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    const cookieTheme = getThemeFromCookie();
    if (!cookieTheme && (resolvedTheme === 'light' || resolvedTheme === 'dark')) {
      console.log('[ThemeSync] Setting initial cookie from resolvedTheme:', resolvedTheme);
      setThemeCookie(resolvedTheme);
    }
  }, [mounted, resolvedTheme]);

  return <>{children}</>;
}

/**
 * Root provider stack shared by all routes (public and dashboard)
 * Includes: NextUIProvider, NextThemesProvider, ThemeSyncWrapper
 *
 * These providers are needed by both public and dashboard routes, so they're
 * defined once at the root level to eliminate duplication.
 *
 * ThemeSyncWrapper syncs theme across subdomains using cookies:
 * - domain.com and app.domain.com share the same theme preference
 * - Cookie domain=.vestledger.com allows cross-subdomain access
 */
export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <NextThemesProvider attribute="class" defaultTheme="dark" storageKey="theme">
        <ThemeSyncWrapper>
          <NextUIProvider>
            <ToastProvider>{children}</ToastProvider>
          </NextUIProvider>
        </ThemeSyncWrapper>
      </NextThemesProvider>
    </ErrorBoundary>
  );
}
