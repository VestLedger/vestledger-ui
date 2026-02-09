/**
 * AsyncStateRenderer - Eliminates 35+ duplicate loading/error/empty patterns
 *
 * BEFORE (12 lines per component):
 * ```tsx
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState error={error} onRetry={refetch} />;
 * if (!data || data.length === 0) return <EmptyState />;
 * return <ActualContent data={data} />;
 * ```
 *
 * AFTER (3 lines):
 * ```tsx
 * <AsyncStateRenderer data={data} isLoading={isLoading} error={error} onRetry={refetch}>
 *   {(data) => <ActualContent data={data} />}
 * </AsyncStateRenderer>
 * ```
 */

import React from 'react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from '@/ui';

export interface AsyncStateRendererProps<T> {
  /** The data to render (null during loading or on error) */
  data: T | null | undefined;

  /** Whether data is currently loading */
  isLoading: boolean;

  /** Error object if request failed */
  error?: NormalizedError;

  /** Callback to retry failed request */
  onRetry?: () => void;

  /** Render function called with non-null data */
  children: (data: T) => React.ReactNode;

  // Optional customization
  loadingMessage?: string;
  loadingFullHeight?: boolean;
  errorTitle?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };

  /** Custom empty state check (default: !data) */
  isEmpty?: (data: T) => boolean;
}

/**
 * Unified async state renderer that handles loading, error, empty, and success states
 * Eliminates repetitive conditional rendering across 35+ components
 */
export function AsyncStateRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage,
  loadingFullHeight,
  errorTitle,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  isEmpty,
}: AsyncStateRendererProps<T>) {
  // Loading state
  if (isLoading && !data) {
    return <LoadingState message={loadingMessage} fullHeight={loadingFullHeight} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        title={errorTitle}
        onRetry={onRetry}
      />
    );
  }

  // Empty state
  const isDataEmpty = isEmpty ? isEmpty(data as T) : !data;
  if (isDataEmpty) {
    const emptyActionNode = emptyAction ? (
      <Button onPress={emptyAction.onClick} className="bg-[var(--app-primary)] text-white">
        {emptyAction.label}
      </Button>
    ) : undefined;

    return (
      <EmptyState
        icon={emptyIcon || Inbox}
        title={emptyTitle || 'No data available'}
        message={emptyMessage}
        action={emptyActionNode}
      />
    );
  }

  // Success state - render children with data
  return <>{children(data as T)}</>;
}

/**
 * Variant for array data with built-in empty check
 */
export function AsyncArrayRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage,
  errorTitle = 'Failed to load data',
  emptyTitle = 'No data available',
  emptyMessage,
  emptyAction,
  emptyIcon,
}: Omit<AsyncStateRendererProps<T[]>, 'isEmpty'> & {
  data: T[] | null | undefined;
  children: (data: T[]) => React.ReactNode;
}) {
  return (
    <AsyncStateRenderer
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingMessage={loadingMessage}
      errorTitle={errorTitle}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      emptyAction={emptyAction}
      isEmpty={(arr) => arr.length === 0}
    >
      {children}
    </AsyncStateRenderer>
  );
}
