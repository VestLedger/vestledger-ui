/**
 * Centralized Logger Utility
 *
 * Provides consistent logging across the application with support for:
 * - Development console logging with colors
 * - Production error tracking (Sentry-ready)
 * - Structured log format for observability
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API call failed', error, { endpoint: '/api/users' });
 * logger.warn('Deprecated feature used', { feature: 'oldAuth' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isServer = typeof window === 'undefined';

  /**
   * Format a log entry for console output
   */
  private formatEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    let output = `${prefix} ${message}`;

    if (context && Object.keys(context).length > 0) {
      output += ` ${JSON.stringify(context)}`;
    }

    if (error) {
      output += `\n  Error: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack.split('\n').slice(1, 4).join('\n        ')}`;
      }
    }

    return output;
  }

  /**
   * Create a structured log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      stack: error?.stack,
    };
  }

  /**
   * Output log to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.isDevelopment && entry.level === 'debug') {
      return; // Skip debug logs in production
    }

    const formatted = this.formatEntry(entry);

    // Use colors in Node.js (server-side)
    if (this.isServer) {
      const color = LOG_COLORS[entry.level];
      console[entry.level === 'debug' ? 'log' : entry.level](
        `${color}${formatted}${RESET_COLOR}`
      );
    } else {
      // Browser console with CSS styling
      const styles: Record<LogLevel, string> = {
        debug: 'color: #6b7280',
        info: 'color: #10b981',
        warn: 'color: #f59e0b',
        error: 'color: #ef4444; font-weight: bold',
      };

      console[entry.level === 'debug' ? 'log' : entry.level](
        `%c${formatted}`,
        styles[entry.level]
      );
    }
  }

  /**
   * Send error to external tracking service
   * TODO: Integrate with Sentry or similar service
   */
  private sendToErrorTracker(entry: LogEntry): void {
    if (entry.level !== 'error') return;

    // Placeholder for Sentry integration
    // Example:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(entry.error, {
    //     extra: entry.context,
    //     tags: { source: 'logger' },
    //   });
    // }

    // For now, we'll just log that we would send this to a tracker
    if (this.isDevelopment) {
      console.log('[Logger] Would send to error tracker:', entry.message);
    }
  }

  /**
   * Log a debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    const entry = this.createEntry('debug', message, undefined, context);
    this.logToConsole(entry);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createEntry('info', message, undefined, context);
    this.logToConsole(entry);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createEntry('warn', message, undefined, context);
    this.logToConsole(entry);
  }

  /**
   * Log an error message with optional error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    const entry = this.createEntry('error', message, normalizedError, context);
    this.logToConsole(entry);
    this.sendToErrorTracker(entry);
  }

  /**
   * Create a child logger with preset context
   * Useful for adding consistent context to all logs from a module
   */
  child(baseContext: LogContext): ChildLogger {
    return new ChildLogger(this, baseContext);
  }
}

/**
 * Child logger with preset context merged into all log calls
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private baseContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.baseContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogContext, LogEntry };
