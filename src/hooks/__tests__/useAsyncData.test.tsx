import { act, render, screen, waitFor } from '@testing-library/react';
import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { createLatestOperation } from '@/store/async/createLatestOperation';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { useAsyncData } from '../useAsyncData';

type TestData = {
  value: string;
};

type TestState = {
  test: AsyncState<TestData>;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error?: unknown) => void;
};

const requested = createAction<string | undefined>('test/requested');
const loaded = createAction<TestData>('test/loaded');
const failed = createAction<NormalizedError>('test/failed');

const testReducer = createReducer<AsyncState<TestData>>(
  {
    data: null,
    status: 'idle',
    error: undefined,
  },
  (builder) => {
    builder
      .addCase(requested, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(loaded, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = undefined;
      })
      .addCase(failed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
);

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createTestOperation(requests: Map<string, Deferred<TestData>>) {
  return createLatestOperation<string | undefined, TestData>({
    typePrefix: 'test/load',
    requestType: requested.type,
    run: async ({ arg }) => {
      const key = arg ?? 'default';
      const request = requests.get(key);
      if (!request) {
        throw new Error(`Missing request for ${key}`);
      }
      return request.promise;
    },
    onSuccess: (result) => loaded(result),
    onFailure: (error) => failed(error),
  });
}

function TestHarness({
  operation,
  query,
  fetchOnMount = true,
}: {
  operation: ReturnType<typeof createTestOperation>;
  query?: string;
  fetchOnMount?: boolean;
}) {
  const selector = ((state: TestState) => state.test) as never;
  const { data, status } = useAsyncData<TestData, string | undefined>(operation as never, selector, {
    params: query,
    fetchOnMount,
    dependencies: [query],
  });

  return (
    <>
      <span data-testid="status">{status}</span>
      <span data-testid="value">{data?.value ?? ''}</span>
    </>
  );
}

function renderHarness(ui: ReactElement) {
  const store = configureStore({
    reducer: {
      test: testReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

describe('useAsyncData', () => {
  it('honors fetchOnMount before starting an operation', async () => {
    const requests = new Map<string, Deferred<TestData>>();
    requests.set('alpha', createDeferred<TestData>());

    const operation = createTestOperation(requests);
    const view = renderHarness(
      <TestHarness operation={operation} query="alpha" fetchOnMount={false} />
    );

    expect(screen.getByTestId('status').textContent).toBe('idle');

    view.rerender(
      <Provider store={view.store}>
        <TestHarness operation={operation} query="alpha" fetchOnMount />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('loading');
    });

    await act(async () => {
      requests.get('alpha')?.resolve({ value: 'alpha' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('value').textContent).toBe('alpha');
    });
  });

  it('aborts the previous request when dependencies change and keeps the latest result', async () => {
    const requests = new Map<string, Deferred<TestData>>();
    requests.set('alpha', createDeferred<TestData>());
    requests.set('beta', createDeferred<TestData>());

    const operation = createTestOperation(requests);
    const view = renderHarness(<TestHarness operation={operation} query="alpha" />);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('loading');
    });

    view.rerender(
      <Provider store={view.store}>
        <TestHarness operation={operation} query="beta" />
      </Provider>
    );

    await act(async () => {
      requests.get('alpha')?.resolve({ value: 'alpha' });
      requests.get('beta')?.resolve({ value: 'beta' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('value').textContent).toBe('beta');
    });

    expect(view.store.getState().test.data?.value).toBe('beta');
  });

  it('aborts in-flight operations on unmount without committing stale data', async () => {
    const requests = new Map<string, Deferred<TestData>>();
    requests.set('alpha', createDeferred<TestData>());

    const operation = createTestOperation(requests);
    const view = renderHarness(<TestHarness operation={operation} query="alpha" />);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('loading');
    });

    view.unmount();

    await act(async () => {
      requests.get('alpha')?.resolve({ value: 'alpha' });
      await Promise.resolve();
    });

    expect(view.store.getState().test.data).toBeNull();
    expect(view.store.getState().test.status).toBe('loading');
  });
});
