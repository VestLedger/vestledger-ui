import type { RootState } from '../rootReducer';
import type { AsyncState } from '../types/AsyncState';

/**
 * Factory to create standardized selectors for async state slices
 * Eliminates scattered useAppSelector((s) => s.foo.bar) patterns
 */
export function createAsyncSelectors<T>(sliceName: keyof RootState) {
  return {
    selectData: (state: RootState): T | null =>
      (state[sliceName] as AsyncState<T>).data,

    selectStatus: (state: RootState) =>
      (state[sliceName] as AsyncState<T>).status,

    selectError: (state: RootState) =>
      (state[sliceName] as AsyncState<T>).error,

    selectIsLoading: (state: RootState) =>
      (state[sliceName] as AsyncState<T>).status === 'loading',

    selectIsSucceeded: (state: RootState) =>
      (state[sliceName] as AsyncState<T>).status === 'succeeded',

    selectIsFailed: (state: RootState) =>
      (state[sliceName] as AsyncState<T>).status === 'failed',

    selectState: (state: RootState): AsyncState<T> =>
      state[sliceName] as AsyncState<T>,
  };
}
