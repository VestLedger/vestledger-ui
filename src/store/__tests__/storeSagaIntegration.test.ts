import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import type { Store } from "@reduxjs/toolkit";
import { rootReducer, type RootState } from "@/store/rootReducer";
import { rootSaga } from "@/store/rootSaga";
import { distributionsRequested } from "@/store/slices/distributionSlice";
import { calculateWaterfallRequested } from "@/store/slices/waterfallSlice";
import type { Distribution } from "@/types/distribution";
import { mockWaterfallScenarios } from "@/data/mocks/analytics/waterfall";
import * as distributionService from "@/services/backOffice/distributionService";
import * as waterfallService from "@/services/analytics/waterfallService";

vi.mock("@/services/backOffice/distributionService", async () => {
  const actual = await vi.importActual<typeof import("@/services/backOffice/distributionService")>(
    "@/services/backOffice/distributionService"
  );
  return {
    ...actual,
    fetchDistributions: vi.fn(),
  };
});

vi.mock("@/services/analytics/waterfallService", async () => {
  const actual = await vi.importActual<typeof import("@/services/analytics/waterfallService")>(
    "@/services/analytics/waterfallService"
  );
  return {
    ...actual,
    performWaterfallCalculation: vi.fn(),
  };
});

const setupStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false, immutableCheck: false }).concat(
        sagaMiddleware
      ),
  });
  const sagaTask = sagaMiddleware.run(rootSaga);
  return { store, sagaTask };
};

const waitForState = (
  store: Store<RootState>,
  predicate: (state: RootState) => boolean
) =>
  new Promise<void>((resolve) => {
    if (predicate(store.getState())) {
      resolve();
      return;
    }
    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        unsubscribe();
        resolve();
      }
    });
  });

describe("store + saga integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads distributions through saga and updates store", async () => {
    const { store, sagaTask } = setupStore();
    const mockDistributions: Distribution[] = [
      {
        id: "dist-1",
        fundId: "fund-1",
        fundName: "Test Fund",
        name: "Q4 Distribution",
        eventType: "dividend",
        eventDate: "2024-12-31",
        paymentDate: "2024-12-31",
        status: "draft",
        grossProceeds: 10000000,
        totalFees: 0,
        totalExpenses: 0,
        netProceeds: 10000000,
        totalTaxWithholding: 0,
        totalDistributed: 10000000,
        feeLineItems: [],
        lpAllocations: [],
        approvalChainId: "",
        approvalSteps: [],
        statementsGenerated: false,
        statements: [],
        createdBy: "user-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        isDraft: true,
        revisionNumber: 1,
        comments: [],
        isRecurring: false,
      },
    ];

    vi.mocked(distributionService.fetchDistributions).mockResolvedValue(mockDistributions);

    store.dispatch(distributionsRequested());
    await waitForState(
      store,
      (state) => state.distribution.distributions.status === "succeeded"
    );

    expect(store.getState().distribution.distributions.data?.distributions).toEqual(
      mockDistributions
    );
    sagaTask.cancel();
  });

  it("runs waterfall calculation through saga and stores results", async () => {
    const { store, sagaTask } = setupStore();
    const mockScenario = mockWaterfallScenarios[0];
    const mockResults = mockScenario.results!;

    vi.mocked(waterfallService.performWaterfallCalculation).mockResolvedValue(mockResults);

    store.dispatch(calculateWaterfallRequested({ scenario: mockScenario }));
    await waitForState(
      store,
      (state) => state.waterfall.calculation.status === "succeeded"
    );

    expect(store.getState().waterfall.calculation.data?.results).toEqual(mockResults);
    sagaTask.cancel();
  });
});
