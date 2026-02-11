'use client';

import Link from 'next/link';
import { Building2, LogOut, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/ui';
import { ROUTE_PATHS } from '@/config/routes';
import { buildPublicWebUrl } from '@/config/env';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    sessionStorage.setItem('isLoggingOut', 'true');
    logout();
    window.location.href = buildPublicWebUrl(window.location.hostname);
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-[var(--app-primary-bg)] p-2">
              <ShieldCheck className="h-5 w-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--app-text-muted)]">Internal</p>
              <p className="text-sm font-semibold">Superadmin Console</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href={ROUTE_PATHS.superadmin}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === ROUTE_PATHS.superadmin
                  ? 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Tenant Operations</span>
            </Link>
          </nav>

          <div className="mt-8 border-t border-[var(--app-border)] pt-4">
            <Button
              variant="bordered"
              className="w-full justify-start"
              startContent={<LogOut className="h-4 w-4" />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold">VestLedger Superadmin</h1>
                <p className="text-sm text-[var(--app-text-muted)]">
                  Tenant lifecycle and onboarding operations
                </p>
              </div>
              <div className="text-right text-sm text-[var(--app-text-muted)]">
                <p>{user?.name ?? 'Internal User'}</p>
                <p>{user?.email}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
