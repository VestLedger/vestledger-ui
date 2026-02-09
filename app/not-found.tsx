'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildPublicWebUrl, PUBLIC_WEB_URL } from '@/config/env';

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const publicHomepageUrl =
    typeof window !== 'undefined'
      ? buildPublicWebUrl(window.location.hostname)
      : PUBLIC_WEB_URL;

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to public homepage
          window.location.href = publicHomepageUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [publicHomepageUrl, router]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-[var(--app-primary)] mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-[var(--app-text)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--app-text-muted)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mb-8">
          <p className="text-sm text-[var(--app-text-muted)]">
            Redirecting to homepage in{' '}
            <span className="text-[var(--app-primary)] font-semibold text-lg">
              {countdown}
            </span>{' '}
            {countdown === 1 ? 'second' : 'seconds'}...
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href={publicHomepageUrl}
            className="px-6 py-3 bg-[var(--app-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </Link>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--app-border)] rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
