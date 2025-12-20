import type { NormalizedError } from '../types/AsyncState';
import { ApiError, normalizeApiError } from '@/api/errors';

/**
 * Normalize any error into structured format
 * Used by all sagas for consistent error handling
 */
export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return normalizeApiError(error);
  }

  // GraphQL errors
  if (error && typeof error === 'object') {
    if ('graphQLErrors' in error && Array.isArray((error as any).graphQLErrors)) {
      const gqlError = (error as any).graphQLErrors[0];
      return {
        message: gqlError?.message || 'GraphQL error',
        code: gqlError?.extensions?.code,
        details: gqlError?.extensions,
      };
    }

    // Standard Error objects
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code,
      };
    }

    // API error responses
    if ('message' in error && typeof error.message === 'string') {
      return {
        message: error.message,
        code: 'code' in error ? error.code as string : undefined,
        field: 'field' in error ? error.field as string : undefined,
      };
    }
  }

  // String errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}
