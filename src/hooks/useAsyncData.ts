import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/rootReducer';
import type { AsyncThunkAction, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { emitRecoverableErrorToast } from '@/utils/errors/recoverableToast';

/**
 * Options for the useAsyncData hook
 */
export interface UseAsyncDataOptions<T, TParams = void> {
  /** Parameters to pass to the action dispatcher */
  params?: TParams;
  /** Whether to fetch data on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies array for re-fetching (similar to useEffect deps) */
  dependencies?: React.DependencyList;
  /** Callback when data is successfully loaded */
  onSuccess?: (data: T) => void;
  /** Callback when an error occurs */
  onError?: (error: NormalizedError) => void;
}

/**
 * Return type for the useAsyncData hook
 */
export interface UseAsyncDataReturn<T> {
  /** The current data from the store */
  data: T | null;
  /** Current loading status */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  /** The current error, if any */
  error: NormalizedError | undefined;
  /** Function to manually trigger a refetch */
  refetch: () => void;
  /** Whether this is the initial load (status is loading and data is null) */
  isInitialLoad: boolean;
  /** Helper: is currently loading */
  isLoading: boolean;
  /** Helper: has succeeded */
  isSucceeded: boolean;
  /** Helper: has failed */
  isFailed: boolean;
}

/**
 * useAsyncData Hook
 *
 * Eliminates Redux boilerplate by combining useAppDispatch, useAppSelector,
 * and useEffect lifecycle management for async data fetching.
 *
 * **Before (10+ lines per component):**
 * ```tsx
 * const dispatch = useAppDispatch();
 * const data = useAppSelector(crmSelectors.selectData);
 * const status = useAppSelector(crmSelectors.selectStatus);
 * const error = useAppSelector(crmSelectors.selectError);
 *
 * useEffect(() => {
 *   dispatch(loadCRMDataOperation({ fundId }));
 * }, [dispatch]);
 *
 * if (status === 'loading') return <LoadingState />;
 * if (status === 'failed') return <ErrorState error={error} onRetry={() => dispatch(loadCRMDataOperation({ fundId }))} />;
 * ```
 *
 * **After (3 lines):**
 * ```tsx
 * const { data, isLoading, error, refetch } = useAsyncData(loadCRMDataOperation, crmSelectors.select);
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState error={error} onRetry={refetch} />;
 * ```
 *
 * @example
 * ```tsx
 * // Simple usage
 * import { loadCRMDataOperation } from '@/store/async/dataOperations';
 * import { crmSelectors } from '@/store/slices/crmSlice';
 *
 * function ContactsList() {
 *   const { data, isLoading, error, refetch } = useAsyncData(
 *     loadCRMDataOperation,
 *     crmSelectors.select
 *   );
 *
 *   if (isLoading) return <LoadingState />;
 *   if (error) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const contacts = data?.contacts || [];
 *   return <div>{contacts.map(c => <ContactCard key={c.id} contact={c} />)}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With parameters
 * import { loadFundAdminOperation } from '@/store/async/backOfficeOperations';
 * import { fundAdminSelectors } from '@/store/slices/backOfficeSlice';
 *
 * function FundAdmin({ fundId }: { fundId: string }) {
 *   const { data, status } = useAsyncData(
 *     loadFundAdminOperation,
 *     fundAdminSelectors.select,
 *     {
 *       params: { fundId },
 *       dependencies: [fundId], // Refetch when fundId changes
 *     }
 *   );
 * }
 * ```
 */
export function useAsyncData<T, TParams = void>(
  operation: (params: TParams) => PayloadAction<TParams> | AsyncThunkAction<unknown, TParams, never> | unknown,
  selector: (state: RootState) => AsyncState<T>,
  options: UseAsyncDataOptions<T, TParams> = {}
): UseAsyncDataReturn<T> {
  const {
    params,
    fetchOnMount = true,
    dependencies = [],
    onSuccess,
    onError,
  } = options;

  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selector);

  // Fetch function that can be called manually or automatically
  const fetchData = () => {
    const request = dispatch(operation(params as TParams) as never) as {
      abort?: () => void;
    };
    return request;
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    let request: { abort?: () => void } | undefined;

    if (fetchOnMount) {
      request = fetchData();
    }

    return () => {
      request?.abort?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, ...dependencies]);

  // Call success/error callbacks when status changes
  useEffect(() => {
    if (status === 'succeeded' && data && onSuccess) {
      onSuccess(data);
    }
    if (status === 'failed' && error && onError) {
      onError(error);
    }
  }, [status, data, error, onSuccess, onError]);

  useEffect(() => {
    if (status !== 'failed' || !error) {
      return;
    }

    emitRecoverableErrorToast(error, {
      title: 'Could not refresh data',
      fallbackMessage: 'Unable to load the latest data.',
      context: 'useAsyncData',
    });
  }, [status, error]);

  // Helpers
  const isLoading = status === 'loading';
  const isSucceeded = status === 'succeeded';
  const isFailed = status === 'failed';
  const isInitialLoad = status === 'loading' && data === null;

  return {
    data,
    status,
    error,
    refetch: fetchData,
    isInitialLoad,
    isLoading,
    isSucceeded,
    isFailed,
  };
}

export default useAsyncData;
