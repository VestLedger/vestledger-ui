import { describe, expect, it, vi } from "vitest";
import {
  searchCleared,
  searchFailed,
  searchLoaded,
  searchRequested,
} from "@/store/slices/searchSlice";
import { createTopbarSearchController } from "@/components/topbar-search-controller";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("topbar search controller", () => {
  it("clears immediately for empty queries", () => {
    const dispatch = vi.fn();
    const search = vi.fn();
    const controller = createTopbarSearchController({ dispatch, search });

    controller.update("   ");

    expect(dispatch).toHaveBeenCalledWith(searchCleared());
    expect(search).not.toHaveBeenCalled();
  });

  it("ignores stale results after a newer query is issued", async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const alpha =
      deferred<Array<{ id: string; title: string; type: "action" }>>();
    const beta =
      deferred<Array<{ id: string; title: string; type: "action" }>>();
    const search = vi
      .fn()
      .mockImplementationOnce(() => alpha.promise)
      .mockImplementationOnce(() => beta.promise);
    const controller = createTopbarSearchController({ dispatch, search });

    controller.update("alpha");
    expect(dispatch).toHaveBeenCalledWith(searchRequested({ query: "alpha" }));
    await vi.advanceTimersByTimeAsync(300);

    controller.update("beta");
    expect(dispatch).toHaveBeenCalledWith(searchRequested({ query: "beta" }));
    await vi.advanceTimersByTimeAsync(300);

    alpha.resolve([{ id: "alpha", title: "Alpha", type: "action" }]);
    await Promise.resolve();

    expect(dispatch).not.toHaveBeenCalledWith(
      searchLoaded({
        results: [{ id: "alpha", title: "Alpha", type: "action" }],
        query: "alpha",
      }),
    );

    beta.resolve([{ id: "beta", title: "Beta", type: "action" }]);
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(
      searchLoaded({
        results: [{ id: "beta", title: "Beta", type: "action" }],
        query: "beta",
      }),
    );
    vi.useRealTimers();
  });

  it("drops in-flight results after the query is cleared", async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const pending =
      deferred<Array<{ id: string; title: string; type: "action" }>>();
    const search = vi.fn().mockImplementation(() => pending.promise);
    const controller = createTopbarSearchController({ dispatch, search });

    controller.update("fund admin");
    await vi.advanceTimersByTimeAsync(300);
    controller.update("");

    pending.resolve([
      { id: "fund-admin", title: "Fund Admin", type: "action" },
    ]);
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(searchCleared());
    expect(dispatch).not.toHaveBeenCalledWith(
      searchLoaded({
        results: [{ id: "fund-admin", title: "Fund Admin", type: "action" }],
        query: "fund admin",
      }),
    );
    vi.useRealTimers();
  });

  it("dispatches normalized failures for the active query", async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const search = vi.fn().mockRejectedValue(new Error("Search down"));
    const controller = createTopbarSearchController({ dispatch, search });

    controller.update("docs");
    await vi.advanceTimersByTimeAsync(300);
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(
      searchFailed(expect.objectContaining({ message: "Search down" })),
    );
    vi.useRealTimers();
  });
});
