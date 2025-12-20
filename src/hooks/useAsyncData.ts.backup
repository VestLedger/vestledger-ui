import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/rootReducer';
import type { AsyncThunk } from '@reduxjs/toolkit';

/**
 * Generic async state structure from the Redux store
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Options for the useAsyncData hook
 */
export interface UseAsyncDataOptions<TParams = void> {
  /** Parameters to pass to the async thunk */
  params?: TParams;
  /** Whether to fetch data on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies array for re-fetching (similar to useEffect deps) */
  dependencies?: React.DependencyList;
  /** Callback when data is successfully loaded */
  onSuccess?: (data: any) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

/**
 * Return type for the useAsyncData hook
 */
export interface UseAsyncDataReturn<T> {
  /** The current data from the store */
  data: T | null;
  /** Whether the data is currently loading */
  loading: boolean;
  /** The current error message, if any */
  error: string | null;
  /** Function to manually trigger a refetch */
  refetch: () => void;
  /** Whether this is the first load (data is null and loading) */
  isInitialLoad: boolean;
}

/**
 * useAsyncData Hook
 *
 * A reusable custom hook that eliminates Redux boilerplate by combining:
 * - useAppDispatch
 * - useAppSelector
 * - useEffect with dispatch
 * - Loading, error, and data state management
 *
 * This hook automatically dispatches async thunks and subscribes to their state in the Redux store.
 *
 * @template T - The type of data returned by the async operation
 * @template TParams - The type of parameters accepted by the async thunk (default: void)
 *
 * @param asyncThunk - The Redux async thunk to dispatch
 * @param selector - The selector function to get the async state from the store
 * @param options - Configuration options for the hook
 *
 * @returns An object containing data, loading, error states, and a refetch function
 *
 * @example
 * ```tsx
 * // Simple usage without parameters
 * import { fetchAlerts } from '@/store/slices/alertsSlice';
 *
 * function AlertsList() {
 *   const { data: alerts, loading, error, refetch } = useAsyncData(
 *     fetchAlerts,
 *     (state) => state.alerts
 *   );
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *
 *   return (
 *     <div>
 *       {alerts?.map(alert => <AlertItem key={alert.id} alert={alert} />)}
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Usage with parameters
 * import { fetchFundById } from '@/store/slices/fundSlice';
 *
 * function FundDetails({ fundId }: { fundId: string }) {
 *   const { data: fund, loading, error } = useAsyncData(
 *     fetchFundById,
 *     (state) => state.fund,
 *     {
 *       params: fundId,
 *       dependencies: [fundId], // Refetch when fundId changes
 *       onSuccess: (fund) => {
 *         console.log('Fund loaded:', fund.name);
 *       },
 *       onError: (error) => {
 *         console.error('Failed to load fund:', error);
 *       }
 *     }
 *   );
 *
 *   // ... render logic
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Manual fetch control
 * function ManualFetchComponent() {
 *   const { data, loading, refetch } = useAsyncData(
 *     fetchData,
 *     (state) => state.data,
 *     { fetchOnMount: false } // Don't fetch automatically
 *   );
 *
 *   return (
 *     <div>
 *       <button onClick={refetch}>Load Data</button>
 *       {loading && <LoadingSpinner />}
 *       {data && <DataDisplay data={data} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAsyncData<T, TParams = void>(
  asyncThunk: AsyncThunk<any, TParams, any>,
  selector: (state: RootState) => AsyncState<T>,
  options: UseAsyncDataOptions<TParams> = {}
): UseAsyncDataReturn<T> {
  const {
    params,
    fetchOnMount = true,
    dependencies = [],
    onSuccess,
    onError,
  } = options;

  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(selector);

  // Fetch function that can be called manually or automatically
  const fetchData = () => {
    const action = dispatch(asyncThunk(params as any) as any);

    // Handle callbacks if provided
    if (onSuccess || onError) {
      action.unwrap?.()
        .then((result: any) => {
          if (onSuccess) onSuccess(result);
        })
        .catch((err: any) => {
          if (onError) onError(err.message || 'An error occurred');
        });
    }
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, ...dependencies]);

  // Determine if this is the initial load
  const isInitialLoad = data === null && loading;

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isInitialLoad,
  };
}

/**
 * useAsyncMutation Hook
 *
 * A variant of useAsyncData specifically for mutations (POST, PUT, DELETE operations).
 * Unlike useAsyncData, this hook does NOT fetch on mount and is designed to be triggered manually.
 *
 * @template T - The type of data returned by the async operation
 * @template TParams - The type of parameters accepted by the async thunk
 *
 * @param asyncThunk - The Redux async thunk to dispatch
 * @param selector - The selector function to get the async state from the store
 * @param options - Configuration options (onSuccess, onError)
 *
 * @returns An object containing mutation state and a mutate function
 *
 * @example
 * ```tsx
 * import { createFund } from '@/store/slices/fundSlice';
 *
 * function CreateFundForm() {
 *   const { mutate, loading, error } = useAsyncMutation(
 *     createFund,
 *     (state) => state.fund,
 *     {
 *       onSuccess: (fund) => {
 *         console.log('Fund created:', fund.id);
 *         navigate(`/funds/${fund.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to create fund: ${error}`);
 *       }
 *     }
 *   );
 *
 *   const handleSubmit = (formData: FundFormData) => {
 *     mutate(formData);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/ * form fields * /}
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Creating...' : 'Create Fund'}
 *       </button>
 *       {error && <ErrorMessage message={error} />}
 *     </form>
 *   );
 * }
 * ```
 */
export function useAsyncMutation<T, TParams>(
  asyncThunk: AsyncThunk<any, TParams, any>,
  selector: (state: RootState) => AsyncState<T>,
  options: Pick<UseAsyncDataOptions<TParams>, 'onSuccess' | 'onError'> = {}
): Omit<UseAsyncDataReturn<T>, 'refetch' | 'isInitialLoad'> & {
  mutate: (params: TParams) => void;
} {
  const { onSuccess, onError } = options;

  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(selector);

  const mutate = (params: TParams) => {
    const action = dispatch(asyncThunk(params as any) as any);

    // Handle callbacks if provided
    if (onSuccess || onError) {
      action.unwrap?.()
        .then((result: any) => {
          if (onSuccess) onSuccess(result);
        })
        .catch((err: any) => {
          if (onError) onError(err.message || 'An error occurred');
        });
    }
  };

  return {
    data,
    loading,
    error,
    mutate,
  };
}

export default useAsyncData;
