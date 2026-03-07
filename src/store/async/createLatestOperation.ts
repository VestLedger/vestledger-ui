import { createAsyncThunk, type AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { AppDispatch } from '@/store/store';
import type { NormalizedError } from '@/store/types/AsyncState';
import { normalizeError } from '@/store/utils/normalizeError';

type DispatchableResult = AnyAction | AnyAction[] | void;

type OperationApi<Arg> = {
  arg: Arg;
  dispatch: AppDispatch;
  getState: () => RootState;
  signal: AbortSignal;
  requestId: string;
  rejectWithValue: (value: NormalizedError) => never;
};

type LatestOperationConfig<Arg, Result> = {
  typePrefix: string;
  requestType: string;
  run: (api: OperationApi<Arg>) => Promise<Result>;
  onSuccess?: (result: Result, arg: Arg) => DispatchableResult;
  onFailure?: (error: NormalizedError, arg: Arg) => DispatchableResult;
};

function dispatchResult(dispatch: AppDispatch, result: DispatchableResult) {
  if (!result) return;
  if (Array.isArray(result)) {
    result.forEach((action) => dispatch(action));
    return;
  }
  dispatch(result);
}

export function createLatestOperation<Arg, Result>(
  config: LatestOperationConfig<Arg, Result>
) {
  let latestRequestId: string | null = null;

  return createAsyncThunk<Result, Arg, { state: RootState; dispatch: AppDispatch; rejectValue: NormalizedError }>(
    config.typePrefix,
    async (arg, thunkApi) => {
      latestRequestId = thunkApi.requestId;
      thunkApi.dispatch({
        type: config.requestType,
        payload: arg,
      } as AnyAction);

      try {
        const result = await config.run({
          arg,
          dispatch: thunkApi.dispatch,
          getState: thunkApi.getState,
          signal: thunkApi.signal,
          requestId: thunkApi.requestId,
          rejectWithValue: thunkApi.rejectWithValue as (value: NormalizedError) => never,
        });

        if (!thunkApi.signal.aborted && latestRequestId === thunkApi.requestId) {
          dispatchResult(thunkApi.dispatch, config.onSuccess?.(result, arg));
        }

        return result;
      } catch (error: unknown) {
        const normalized = normalizeError(error);

        if (!thunkApi.signal.aborted && latestRequestId === thunkApi.requestId) {
          dispatchResult(thunkApi.dispatch, config.onFailure?.(normalized, arg));
        }

        return thunkApi.rejectWithValue(normalized);
      }
    }
  );
}

export function sleep(ms: number, signal?: AbortSignal) {
  if (!signal) {
    return new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId);
      signal.removeEventListener('abort', onAbort);
    };

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener('abort', onAbort, { once: true });
  });
}
