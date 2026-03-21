import type { AnyAction } from "@reduxjs/toolkit";
import {
  searchCleared,
  searchFailed,
  searchLoaded,
  searchRequested,
} from "@/store/slices/searchSlice";
import { normalizeError } from "@/store/utils/normalizeError";
import type { TopbarSearchResult } from "@/services/topbarSearchService";

type TimeoutHandle = ReturnType<typeof setTimeout>;

type TopbarSearchControllerOptions = {
  dispatch: (action: AnyAction) => unknown;
  search: (query: string) => Promise<TopbarSearchResult[]>;
  delayMs?: number;
  schedule?: (callback: () => void, delay: number) => TimeoutHandle;
  cancelScheduled?: (handle: TimeoutHandle) => void;
};

export type TopbarSearchController = {
  update: (query: string) => void;
  cancel: () => void;
};

export function createTopbarSearchController({
  dispatch,
  search,
  delayMs = 300,
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancelScheduled = (handle) => clearTimeout(handle),
}: TopbarSearchControllerOptions): TopbarSearchController {
  let latestRequestId = 0;
  let timeoutHandle: TimeoutHandle | null = null;

  const cancel = () => {
    latestRequestId += 1;
    if (timeoutHandle !== null) {
      cancelScheduled(timeoutHandle);
      timeoutHandle = null;
    }
  };

  const update = (query: string) => {
    cancel();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      dispatch(searchCleared());
      return;
    }

    const requestId = latestRequestId;
    dispatch(searchRequested({ query: trimmedQuery }));
    timeoutHandle = schedule(() => {
      void (async () => {
        try {
          const results = await search(trimmedQuery);
          if (latestRequestId !== requestId) return;
          dispatch(searchLoaded({ results, query: trimmedQuery }));
        } catch (error: unknown) {
          if (latestRequestId !== requestId) return;
          dispatch(searchFailed(normalizeError(error)));
        }
      })();
    }, delayMs);
  };

  return { update, cancel };
}
