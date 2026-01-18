'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/ui';
import { Select, SelectItem } from '@nextui-org/react';
import { useAuth, PERSONA_CONFIG, UserRole } from '@/contexts/auth-context';
import Image from 'next/image';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('gp');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, hydrated, status, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAttemptedLogin = useRef(false);

  // Get redirect parameter from URL
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Handle successful authentication - redirect to intended page
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [hydrated, isAuthenticated, router, redirectTo]);

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
  }, [email, password, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    hasAttemptedLogin.current = true;
    login(email, password, role);
  };

  const isLoading = isSubmitting && status === 'loading';

  // Show loading state while auth is hydrating
  if (!hydrated) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <div className="animate-pulse text-[var(--app-text-muted)]">
            Loading...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="/logo/Print_Transparent.svg"
            alt="VestLedger logo"
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
          <span className="text-2xl font-bold text-[var(--app-primary)]">VestLedger</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-sm text-[var(--app-text-muted)]">
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

        <Select
          label="Select Role (Demo)"
          placeholder="Select a persona"
          selectedKeys={[role]}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disallowEmptySelection
          variant="bordered"
          classNames={{
            trigger: 'bg-[var(--app-surface-hover)] border border-[var(--app-border-subtle)]',
          }}
        >
          {Object.values(PERSONA_CONFIG).map((persona) => (
            <SelectItem key={persona.id} value={persona.id} textValue={persona.label}>
              <div className="flex flex-col">
                <span className="text-small">{persona.label}</span>
                <span className="text-tiny text-[var(--app-text-muted)]">
                  {persona.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </Select>

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
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error.message || 'Login failed. Please check your credentials.'}
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

        <div className="text-center text-sm text-[var(--app-text-muted)]">
          Don&apos;t have an account?{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_PUBLIC_DOMAIN ? `https://${process.env.NEXT_PUBLIC_PUBLIC_DOMAIN}` : 'http://vestledger.local:3000'}/eoi`}
            className="text-[var(--app-primary)] hover:underline"
          >
            Request Access
          </a>
        </div>
      </form>
    </Card>
  );
}
