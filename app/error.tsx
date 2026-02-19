'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/ui';
import { logger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled route error', error, {
      component: 'app/error',
      digest: error.digest,
    });
    console.error('Unhandled route error', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--app-danger-bg)] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[var(--app-danger)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--app-text)] mb-2">Something went wrong</h1>
        <p className="text-[var(--app-text-muted)] mb-6">
          We hit a temporary issue. You can retry without losing your session.
        </p>
        <Button
          variant="solid"
          color="primary"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={reset}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
