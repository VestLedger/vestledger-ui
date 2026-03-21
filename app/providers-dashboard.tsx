'use client';

import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/contexts/auth-context';
import { FundProvider } from '@/contexts/fund-context';
import { DashboardRuntime } from '@/store/runtime/dashboard-runtime';

/**
 * Dashboard-specific provider stack
 * Includes: Redux, AuthProvider, FundProvider
 *
 * These providers are only needed by dashboard routes, not public routes.
 * Shared UI providers (NextUI, Theme) are in RootProviders at app/layout.tsx
 */
type DashboardProvidersProps = {
  children: React.ReactNode;
  runtime?: 'dashboard' | 'admin';
};

export function DashboardProviders({
  children,
  runtime = 'dashboard',
}: DashboardProvidersProps) {
  const pathname = usePathname();
  const enableDashboardRuntime = runtime === 'dashboard' && pathname !== '/login';

  return (
    <Provider store={store}>
      {enableDashboardRuntime ? <DashboardRuntime /> : null}
      <AuthProvider>
        {runtime === 'dashboard' ? <FundProvider>{children}</FundProvider> : children}
      </AuthProvider>
    </Provider>
  );
}
