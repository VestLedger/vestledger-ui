'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { AuthProvider } from '@/contexts/auth-context';
import { FundProvider } from '@/contexts/fund-context';

/**
 * Dashboard-specific provider stack
 * Includes: Redux, AuthProvider, FundProvider
 *
 * These providers are only needed by dashboard routes, not public routes.
 * Shared UI providers (NextUI, Theme) are in RootProviders at app/layout.tsx
 */
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(clientMounted());
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <FundProvider>
          {children}
        </FundProvider>
      </AuthProvider>
    </Provider>
  );
}
