import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";
import { describe, expect, it, beforeEach } from "vitest";
import {
  abortableThunkRegistryMiddleware,
  resetAbortableThunkRegistry,
} from "../abortableThunkRegistry";
import { createLatestOperation } from "../async/createLatestOperation";
import { logoutRequested } from "../slices/authSlice";
import type { AsyncState, NormalizedError } from "../types/AsyncState";

type TestData = {
  value: string;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const requested = createAction<void>("test/requested");
const loaded = createAction<TestData>("test/loaded");
const failed = createAction<NormalizedError>("test/failed");

const testReducer = createReducer<AsyncState<TestData>>(
  {
    data: null,
    status: "idle",
    error: undefined,
  },
  (builder) => {
    builder
      .addCase(requested, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(loaded, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(failed, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
);

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe("abortableThunkRegistryMiddleware", () => {
  beforeEach(() => {
    resetAbortableThunkRegistry();
  });

  it("aborts in-flight latest operations on logout before they can commit stale results", async () => {
    const pendingRequest = createDeferred<TestData>();
    const operation = createLatestOperation<void, TestData>({
      typePrefix: "test/load",
      requestType: requested.type,
      run: async () => pendingRequest.promise,
      onSuccess: (result) => loaded(result),
      onFailure: (error) => failed(error),
    });

    const store = configureStore({
      reducer: {
        test: testReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }).prepend(abortableThunkRegistryMiddleware),
    });

    const request = store.dispatch(operation(undefined) as never);

    expect(store.getState().test.status).toBe("loading");

    store.dispatch(logoutRequested());
    pendingRequest.resolve({ value: "stale" });

    const action = (await request) as { meta: { aborted?: boolean } };

    expect(action.meta.aborted).toBe(true);
    expect(store.getState().test.data).toBeNull();
    expect(store.getState().test.status).toBe("loading");
  });
});
