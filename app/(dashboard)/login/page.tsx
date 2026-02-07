'use client';

import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/ui/async-states/LoadingState';

// Dynamic import with ssr: false to prevent hydration mismatch
const LoginForm = dynamic(
  () => import('@/components/login-form').then((mod) => ({ default: mod.LoginForm })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md bg-[var(--app-surface)] rounded-lg p-8">
        <LoadingState fullHeight={false} message="Loading..." />
      </div>
    )
  }
);

// Login page is fully client-side to avoid hydration issues with auth state
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
