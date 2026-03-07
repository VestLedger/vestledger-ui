import type { Middleware } from '@reduxjs/toolkit';
import { loggedOut, logoutRequested } from '@/store/slices/authSlice';

type AbortablePromise = Promise<unknown> & {
  abort?: () => void;
};

const activeAbortables = new Set<AbortablePromise>();

function isAbortablePromise(value: unknown): value is AbortablePromise {
  return (
    typeof value === 'object'
    && value !== null
    && 'abort' in value
    && typeof (value as AbortablePromise).abort === 'function'
    && 'finally' in value
    && typeof (value as AbortablePromise).finally === 'function'
  );
}

export function abortTrackedThunks() {
  for (const request of Array.from(activeAbortables)) {
    request.abort?.();
  }
  activeAbortables.clear();
}

export function resetAbortableThunkRegistry() {
  activeAbortables.clear();
}

export const abortableThunkRegistryMiddleware: Middleware = () => (next) => (action) => {
  if (action && typeof action === 'object' && 'type' in action) {
    const actionType = String(action.type);
    if (actionType === logoutRequested.type || actionType === loggedOut.type) {
      abortTrackedThunks();
    }
  }

  const result = next(action);

  if (typeof action === 'function' && isAbortablePromise(result)) {
    activeAbortables.add(result);
    result.finally(() => {
      activeAbortables.delete(result);
    });
  }

  return result;
};
