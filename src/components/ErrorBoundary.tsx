'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/ui';
import { captureException, addBreadcrumb } from '@/lib/errorTracking';
import { ROUTE_PATHS } from '@/config/routes';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => logToSentry(error)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Add breadcrumb for context
    addBreadcrumb({
      category: 'error-boundary',
      message: `Error caught: ${error.message}`,
      level: 'error',
      data: {
        errorName: error.name,
        hasComponentStack: !!errorInfo.componentStack,
      },
    });

    // Send to error tracking service (Sentry when configured)
    captureException(error, {
      componentStack: errorInfo.componentStack || undefined,
      tags: {
        errorBoundary: 'true',
        errorType: error.name,
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = ROUTE_PATHS.dashboard;
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--app-danger-bg)] flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[var(--app-danger)]" />
            </div>

            <h1 className="text-xl font-semibold text-[var(--app-text)] mb-2">
              Something went wrong
            </h1>

            <p className="text-[var(--app-text-muted)] mb-6">
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-[var(--app-danger-bg)] rounded-lg text-left overflow-auto max-h-40">
                <p className="text-sm font-mono text-[var(--app-danger)]">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs font-mono text-[var(--app-text-muted)] mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="solid"
                color="primary"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={this.handleReload}
              >
                Reload Page
              </Button>

              <Button
                variant="bordered"
                startContent={<Home className="w-4 h-4" />}
                onPress={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </div>

            <p className="mt-6 text-xs text-[var(--app-text-subtle)]">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-friendly wrapper for error boundary reset
 * Use this to programmatically reset the error boundary
 */
export function useErrorBoundaryReset(): () => void {
  return () => {
    // This is a placeholder - in a real implementation,
    // you'd use a context to communicate with the error boundary
    window.location.reload();
  };
}

export default ErrorBoundary;
