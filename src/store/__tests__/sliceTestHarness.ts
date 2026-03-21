import type { AsyncState } from "../types/AsyncState";
import type { NormalizedError } from "../types/AsyncState";

type Action<TPayload> = { type: string; payload: TPayload };

/**
 * Test harness utilities for async state slice reducers
 * Ensures all slices follow the standard AsyncState<T> contract
 *
 * Usage: Import these utilities when writing slice tests with Jest/Vitest
 */

/**
 * Creates test data and expectations for slice reducer tests
 *
 * @example
 * ```typescript
 * import { getSliceTestExpectations } from '@/store/__tests__/sliceTestHarness';
 *
 * describe('dealIntelligenceSlice', () => {
 *   const { reducer, actions } = dealIntelligenceSlice;
 *   const mockData = { activeDeals: [], documents: [] };
 *   const expectations = getSliceTestExpectations({ mockData });
 *
 *   it('has correct initial state', () => {
 *     const state = reducer(undefined, { type: '@@INIT' });
 *     expect(state).toEqual(expectations.initialState);
 *   });
 *
 *   it('sets loading state on requested', () => {
 *     const state = reducer(expectations.initialState, actions.dealIntelligenceRequested({}));
 *     expect(state.status).toBe('loading');
 *     expect(state.error).toBeUndefined();
 *   });
 * });
 * ```
 */
export function getSliceTestExpectations<T>(config: { mockData: T }) {
  const { mockData } = config;

  const initialState: AsyncState<T> = {
    data: null,
    status: "idle",
    error: undefined,
  };

  const loadingState: AsyncState<T> = {
    data: null,
    status: "loading",
    error: undefined,
  };

  const succeededState: AsyncState<T> = {
    data: mockData,
    status: "succeeded",
    error: undefined,
  };

  const testError: NormalizedError = {
    message: "Test error",
    code: "TEST_ERROR",
  };

  const failedState: AsyncState<T> = {
    data: null,
    status: "failed",
    error: testError,
  };

  return {
    initialState,
    loadingState,
    succeededState,
    failedState,
    testError,
    mockData,
  };
}

/**
 * Creates a complete set of slice reducer tests
 * Returns an object with test functions that can be called in your test suite
 */
export function createSliceTests<T, Params = Record<string, never>>(config: {
  reducer: (
    state: AsyncState<T> | undefined,
    action: { type: string; payload?: T | Params | NormalizedError },
  ) => AsyncState<T>;
  actions: {
    requested: (params: Params) => Action<Params>;
    loaded: (data: T) => Action<T>;
    failed: (error: NormalizedError) => Action<NormalizedError>;
  };
  mockData: T;
  mockParams?: Params;
}) {
  const { reducer, actions, mockData, mockParams } = config;
  const expectations = getSliceTestExpectations({ mockData });
  const requestedParams = mockParams ?? ({} as Params);

  return {
    /**
     * Verify initial state follows AsyncState<T> contract
     */
    getInitialState: () => {
      return reducer(undefined, { type: "@@INIT" });
    },
    expectedInitialState: expectations.initialState,

    /**
     * Verify requested action sets loading state
     */
    getLoadingState: () => {
      return reducer(
        expectations.initialState,
        actions.requested(requestedParams),
      );
    },
    expectedLoadingStatus: "loading" as const,

    /**
     * Verify loaded action sets data and succeeded status
     */
    getSucceededState: () => {
      return reducer(expectations.loadingState, actions.loaded(mockData));
    },
    expectedSucceededState: expectations.succeededState,

    /**
     * Verify failed action sets error and failed status
     */
    getFailedState: () => {
      return reducer(
        expectations.loadingState,
        actions.failed(expectations.testError),
      );
    },
    expectedFailedState: expectations.failedState,

    // Export expectations for custom assertions
    expectations,
  };
}
