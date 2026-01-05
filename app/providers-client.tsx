'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { FundProvider } from '@/contexts/fund-context';
import { ThemeSync } from '@/components/theme-sync';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(clientMounted());
  }, []);

  return (
    <Provider store={store}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <ThemeSync />
          <AuthProvider>
            <FundProvider>
              {children}
            </FundProvider>
          </AuthProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </Provider>
  );
}

export function PublicProviders({ children }: { children: React.ReactNode }) {
  // Minimal providers for public pages - NO ThemeProvider (uses CSS media query)
  // ThemeProvider causes hydration delay, public pages use system theme via CSS
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
