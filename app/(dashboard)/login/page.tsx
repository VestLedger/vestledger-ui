'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false to prevent hydration mismatch
const LoginForm = dynamic(
  () => import('@/components/login-form').then((mod) => ({ default: mod.LoginForm })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md bg-[var(--app-surface)] rounded-lg p-8">
        <div className="text-center py-12">
          <div className="animate-pulse text-[var(--app-text-muted)]">
            Loading...
          </div>
        </div>
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
