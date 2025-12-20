import { Card, Button } from '@/ui';
import { AlertCircle } from 'lucide-react';
import type { NormalizedError } from '@/store/types/AsyncState';

interface ErrorStateProps {
  error: NormalizedError;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong'
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card padding="lg" className="max-w-md">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--app-danger)]" />
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-[var(--app-text-muted)] mb-2">{error.message}</p>

          {error.code && (
            <p className="text-xs text-[var(--app-text-subtle)] mb-4">
              Error code: {error.code}
            </p>
          )}

          {error.code === 'API_NOT_IMPLEMENTED' && (
            <p className="text-xs text-[var(--app-info)] mb-4">
              💡 This feature requires backend API. Switch to mock mode to view sample data.
            </p>
          )}

          {onRetry && (
            <Button
              onPress={onRetry}
              className="bg-[var(--app-primary)] text-white"
            >
              Try Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
