'use client';

import { useEffect, useState } from 'react';
import { DashboardProviders } from '../providers-dashboard';
import { useAuth } from '@/contexts/auth-context';
import { AdminShell } from '@/components/internal/admin-shell';
import { LoadingState } from '@/ui/async-states';
import { buildAppLoginUrl, buildAppWebUrl } from '@/config/env';
import { isSuperadminUser, resolveUserDomainTarget } from '@/utils/auth/internal-access';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const isLoggingOut = typeof window !== 'undefined' && sessionStorage.getItem('isLoggingOut') === 'true';

    if (!hydrated || isLoggingOut) {
      return;
    }

    if (!isAuthenticated) {
      setIsRedirecting(true);
      window.location.href = buildAppLoginUrl(window.location.hostname);
      return;
    }

    if (!user) {
      setIsRedirecting(true);
      window.location.href = buildAppLoginUrl(window.location.hostname);
      return;
    }

    if (resolveUserDomainTarget(user) !== 'admin' || !isSuperadminUser(user)) {
      setIsRedirecting(true);
      window.location.href = `${buildAppWebUrl(window.location.hostname)}/home`;
    }
  }, [hydrated, isAuthenticated, user]);

  if (!hydrated || !isAuthenticated || !user || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState fullHeight={false} message="Loading admin console..." />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </DashboardProviders>
  );
}
