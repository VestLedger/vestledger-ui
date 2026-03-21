import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardProviders } from '../providers-dashboard';

let pathname = '/home';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

vi.mock('@/store/runtime/dashboard-runtime', () => ({
  DashboardRuntime: () => <div data-testid="dashboard-runtime" />,
}));

vi.mock('@/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('@/contexts/fund-context', () => ({
  FundProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="fund-provider">{children}</div>
  ),
}));

describe('DashboardProviders', () => {
  it('starts dashboard runtime for dashboard routes', () => {
    pathname = '/home';
    render(
      <DashboardProviders>
        <div>dashboard child</div>
      </DashboardProviders>
    );

    expect(screen.getByTestId('dashboard-runtime')).toBeInTheDocument();
    expect(screen.getByTestId('fund-provider')).toBeInTheDocument();
    expect(screen.getByText('dashboard child')).toBeInTheDocument();
  });

  it('skips dashboard runtime on the login route', () => {
    pathname = '/login';
    render(
      <DashboardProviders>
        <div>login child</div>
      </DashboardProviders>
    );

    expect(screen.queryByTestId('dashboard-runtime')).not.toBeInTheDocument();
    expect(screen.getByTestId('fund-provider')).toBeInTheDocument();
    expect(screen.getByText('login child')).toBeInTheDocument();
  });

  it('does not start dashboard runtime for the admin shell', () => {
    pathname = '/admin/overview';
    render(
      <DashboardProviders runtime="admin">
        <div>admin child</div>
      </DashboardProviders>
    );

    expect(screen.queryByTestId('dashboard-runtime')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fund-provider')).not.toBeInTheDocument();
    expect(screen.getByText('admin child')).toBeInTheDocument();
  });

  it('keeps dashboard runtime enabled for the standalone Vesta route', () => {
    pathname = '/vesta';
    render(
      <DashboardProviders>
        <div>vesta child</div>
      </DashboardProviders>
    );

    expect(screen.getByTestId('dashboard-runtime')).toBeInTheDocument();
    expect(screen.getByText('vesta child')).toBeInTheDocument();
  });
});
