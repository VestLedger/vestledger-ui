'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/ui';
import { LoadingState } from '@/ui/async-states';
import { useAuth } from '@/contexts/auth-context';
import { BrandLogo } from './brand-logo';
import { getAuthErrorMessage } from '@/utils/auth-error-message';
import { ROUTE_PATHS } from '@/config/routes';
import { buildAdminSuperadminUrl, buildAppWebUrl } from '@/config/env';
import { resolveUserDomainTarget } from '@/utils/auth/internal-access';

const LEGACY_DASHBOARD_PATH = '/dashboard';

const normalizeRedirectPath = (redirectPath: string | null) => {
  if (!redirectPath) {
    return ROUTE_PATHS.dashboard;
  }

  if (redirectPath === LEGACY_DASHBOARD_PATH) {
    return ROUTE_PATHS.dashboard;
  }

  if (
    redirectPath.startsWith(`${LEGACY_DASHBOARD_PATH}/`) ||
    redirectPath.startsWith(`${LEGACY_DASHBOARD_PATH}?`)
  ) {
    return `${ROUTE_PATHS.dashboard}${redirectPath.slice(LEGACY_DASHBOARD_PATH.length)}`;
  }

  return redirectPath;
};

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, hydrated, status, error, clearError, user } = useAuth();
  const searchParams = useSearchParams();
  const hasAttemptedLogin = useRef(false);

  // Normalize legacy dashboard redirects to the new app home path
  const redirectTo = normalizeRedirectPath(searchParams.get('redirect'));

  // Handle successful authentication - redirect to intended page
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user || typeof window === 'undefined') {
      return;
    }

    const domainTarget = resolveUserDomainTarget(user);
    const nextUrl =
      domainTarget === 'admin'
        ? buildAdminSuperadminUrl(window.location.hostname)
        : `${buildAppWebUrl(window.location.hostname)}${redirectTo}`;

    if (window.location.href !== nextUrl) {
      window.location.href = nextUrl;
    }
  }, [hydrated, isAuthenticated, user, redirectTo]);

  // Handle login failure - stop spinner and show error
  useEffect(() => {
    if (status === 'failed' && hasAttemptedLogin.current) {
      setIsSubmitting(false);
    }
  }, [status]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
    // Only clear on input changes, not when error changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    hasAttemptedLogin.current = true;
    login(email, password);
  };

  const isLoading = isSubmitting && status === 'loading';

  // Show loading state while auth is hydrating
  if (!hydrated) {
    return (
      <Card padding="lg">
        <LoadingState fullHeight={false} message="Loading..." />
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4 text-2xl text-app-primary dark:text-app-dark-primary">
          <BrandLogo className="h-[1em] w-[1em]" />
          <span className="font-bold">VestLedger</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">
          Sign in to your VestLedger account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          isRequired
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          isRequired
          autoComplete="current-password"
        />

        {error && (
          <div className="p-3 rounded-md bg-[var(--app-danger-bg)] border border-[var(--app-danger-bg)] text-[var(--app-danger)] text-sm">
            {getAuthErrorMessage(error)}
          </div>
        )}

        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>

        <div className="text-center text-sm text-app-text-muted dark:text-app-dark-text-muted">
          Don&apos;t have an account?{' '}
          <a
            href="/eoi"
            className="text-app-primary dark:text-app-dark-primary hover:underline"
          >
            Request Access
          </a>
        </div>
      </form>
    </Card>
  );
}
