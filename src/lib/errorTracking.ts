/**
 * Error Tracking Service
 *
 * Centralized error tracking abstraction layer.
 * Currently logs errors to console and provides hooks for Sentry integration.
 *
 * To enable Sentry:
 * 1. Install: pnpm add @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in .env
 * 4. Update this file to use Sentry SDK
 */

import { logger } from '@/lib/logger';

interface ErrorContext {
  componentStack?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}

interface BreadcrumbData {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

type SentryApi = {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, context?: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
  setUser: (user: { id?: string; email?: string; role?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  withScope: (callback: (scope: {
    setTag: (key: string, value: string) => void;
    setExtra: (key: string, value: unknown) => void;
    setUser: (user: { id?: string; email?: string; role?: string } | null) => void;
  }) => void) => void;
};

/**
 * Check if Sentry is available
 */
function isSentryAvailable(): boolean {
  // Check if Sentry global is available (set by @sentry/nextjs)
  return typeof window !== 'undefined' && 'Sentry' in window;
}

/**
 * Get Sentry instance if available
 */
function getSentry(): SentryApi | null {
  if (isSentryAvailable()) {
    return (window as unknown as { Sentry?: SentryApi }).Sentry ?? null;
  }
  return null;
}

/**
 * Capture an exception and report it to error tracking service
 */
export function captureException(error: Error, context?: ErrorContext): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.captureException(error, {
      extra: {
        componentStack: context?.componentStack,
        ...context?.extra,
      },
      tags: context?.tags,
      user: context?.user,
    });
  }

  // Always log to our logger
  logger.error('Exception captured', error, {
    component: 'errorTracking',
    ...context?.extra,
  });
}

/**
 * Capture a message (non-exception) and report it
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Omit<ErrorContext, 'componentStack'>
): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.captureMessage(message, {
      level,
      extra: context?.extra,
      tags: context?.tags,
    });
  }

  // Log based on level
  if (level === 'error') {
    logger.error(message, undefined, context?.extra);
  } else if (level === 'warning') {
    logger.warn(message, context?.extra);
  } else {
    logger.info(message, context?.extra);
  }
}

/**
 * Add a breadcrumb for debugging context
 */
export function addBreadcrumb(data: BreadcrumbData): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.addBreadcrumb({
      category: data.category,
      message: data.message,
      level: data.level || 'info',
      data: data.data,
    });
  }

  // Also log breadcrumbs in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[${data.category}] ${data.message}`, data.data);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string; role?: string } | null): void {
  const sentry = getSentry();

  if (sentry) {
    if (user) {
      sentry.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } else {
      sentry.setUser(null);
    }
  }
}

/**
 * Set a tag for all subsequent events
 */
export function setTag(key: string, value: string): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.setTag(key, value);
  }
}

/**
 * Set extra context data for all subsequent events
 */
export function setExtra(key: string, value: unknown): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.setExtra(key, value);
  }
}

/**
 * Create a custom scope for error tracking
 * Useful for capturing errors with specific context
 */
export function withScope(
  callback: (scope: {
    setTag: (key: string, value: string) => void;
    setExtra: (key: string, value: unknown) => void;
    setUser: (user: { id?: string; email?: string } | null) => void;
  }) => void
): void {
  const sentry = getSentry();

  if (sentry) {
    sentry.withScope((scope) => {
      callback({
        setTag: (key, value) => scope.setTag(key, value),
        setExtra: (key, value) => scope.setExtra(key, value),
        setUser: (user) => scope.setUser(user),
      });
    });
  } else {
    // Provide a no-op implementation when Sentry is not available
    callback({
      setTag: () => {},
      setExtra: () => {},
      setUser: () => {},
    });
  }
}

export const errorTracking = {
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setExtra,
  withScope,
  isSentryAvailable,
};

export default errorTracking;
