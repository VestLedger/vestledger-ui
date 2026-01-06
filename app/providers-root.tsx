'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

/**
 * Root provider stack shared by all routes (public and dashboard)
 * Includes: NextUIProvider, NextThemesProvider
 *
 * These providers are needed by both public and dashboard routes, so they're
 * defined once at the root level to eliminate duplication.
 */
export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </NextThemesProvider>
  );
}
