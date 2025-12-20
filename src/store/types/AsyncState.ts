/**
 * Standard async state shape for all Redux slices
 * Replaces inconsistent loading:boolean + error:string|null patterns
 */
export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error?: NormalizedError;
}

export interface NormalizedError {
  message: string;
  code?: string;
  field?: string; // For form validation errors
  details?: unknown; // For GraphQL error extensions
}

/**
 * Helper to create initial async state
 */
export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    status: 'idle',
    error: undefined,
  };
}

/**
 * Type guard for checking async state status
 */
export function isLoading<T>(state: AsyncState<T>): boolean {
  return state.status === 'loading';
}

export function isSucceeded<T>(state: AsyncState<T>): boolean {
  return state.status === 'succeeded';
}

export function isFailed<T>(state: AsyncState<T>): boolean {
  return state.status === 'failed';
}
