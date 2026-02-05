'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal } from '@/ui';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/utils/auth-error-message';

type LoginModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  title?: string;
  description?: string;
  signUpHref?: string;
  signUpLabel?: string;
};

export function LoginModal({
  isOpen,
  onOpenChange,
  redirectTo = '/dashboard',
  title = 'Welcome back',
  description = 'Sign in to your vestledger account',
  signUpHref = '/eoi',
  signUpLabel = 'Sign up',
}: LoginModalProps) {
  const { login, isAuthenticated, hydrated, status, error, clearError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAttemptedLogin = useRef(false);

  useEffect(() => {
    if (isOpen && hydrated && isAuthenticated) {
      setIsSubmitting(false);
      setPassword('');
      onOpenChange(false);
      router.push(redirectTo);
    }
  }, [isOpen, hydrated, isAuthenticated, onOpenChange, redirectTo, router]);

  useEffect(() => {
    if (status === 'failed' && hasAttemptedLogin.current) {
      setIsSubmitting(false);
    }
  }, [status]);

  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setPassword('');
      hasAttemptedLogin.current = false;
      if (error) {
        clearError();
      }
    }
  }, [isOpen, error, clearError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    hasAttemptedLogin.current = true;
    login(email, password);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setIsSubmitting(false);
      setPassword('');
      if (error) {
        clearError();
      }
    }
  };

  const isLoading = isSubmitting && status === 'loading';

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="md"
      title={
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-[var(--app-text-muted)]">{description}</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          isRequired
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          isRequired
        />
        {error && (
          <div className="p-3 rounded-md bg-[var(--app-danger-bg)] border border-[var(--app-danger-bg)] text-[var(--app-danger)] text-sm">
            {getAuthErrorMessage(error)}
          </div>
        )}
        <Button type="submit" color="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
          Sign In
        </Button>
        <div className="text-center text-xs sm:text-sm text-[var(--app-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href={signUpHref} className="text-[var(--app-primary)] hover:underline">
            {signUpLabel}
          </Link>
        </div>
      </form>
    </Modal>
  );
}
