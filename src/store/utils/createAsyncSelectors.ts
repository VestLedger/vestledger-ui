import type { RootState } from '../rootReducer';
import type { AsyncState } from '../types/AsyncState';

/**
 * Factory to create standardized selectors for async state slices
 * Eliminates scattered useAppSelector((s) => s.foo.bar) patterns
 */
export function createAsyncSelectors<T>(
  slice: keyof RootState | ((state: RootState) => AsyncState<T>)
) {
  const selectState =
    typeof slice === 'function'
      ? slice
      : (state: RootState) => state[slice] as AsyncState<T>;

  return {
    selectData: (state: RootState): T | null => selectState(state).data,
    selectStatus: (state: RootState) => selectState(state).status,
    selectError: (state: RootState) => selectState(state).error,
    selectIsLoading: (state: RootState) => selectState(state).status === 'loading',
    selectIsSucceeded: (state: RootState) => selectState(state).status === 'succeeded',
    selectIsFailed: (state: RootState) => selectState(state).status === 'failed',
    selectState,
  };
}
