import { describe, it, expect } from "vitest";
import { call, put } from "redux-saga/effects";
import type { WaterfallResults, WaterfallScenario } from "@/types/waterfall";
import {
  scenariosRequested,
  scenariosLoaded,
  scenariosFailed,
  calculateWaterfallRequested,
  calculateWaterfallSucceeded,
  calculateWaterfallFailed,
} from "@/store/slices/waterfallSlice";
import {
  loadScenariosWorker,
  calculateWaterfallWorker,
} from "@/store/sagas/waterfallSaga";
import {
  fetchWaterfallScenarios,
  performWaterfallCalculation,
} from "@/services/analytics/waterfallService";
import { normalizeError } from "@/store/utils/normalizeError";

describe("waterfallSaga", () => {
  const mockScenario: WaterfallScenario = {
    id: "scenario-1",
    name: "Base Case",
    model: "european",
    investorClasses: [],
    tiers: [],
    exitValue: 100_000_000,
    totalInvested: 50_000_000,
    managementFees: 0,
    isFavorite: false,
    isTemplate: false,
    version: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    createdBy: "user-1",
  };

  const mockResults: WaterfallResults = {
    totalExitValue: 100_000_000,
    totalInvested: 50_000_000,
    totalReturned: 100_000_000,
    gpCarry: 10_000_000,
    gpCarryPercentage: 10,
    gpManagementFees: 0,
    gpTotalReturn: 10_000_000,
    lpTotalReturn: 90_000_000,
    lpAverageMultiple: 1.8,
    investorClassResults: [],
    tierBreakdown: [],
  };

  it("loadScenariosWorker handles success", () => {
    const action = scenariosRequested({ fundId: "fund-1" });
    const generator = loadScenariosWorker(action);
    expect(generator.next().value).toEqual(call(fetchWaterfallScenarios, action.payload));
    expect(generator.next([mockScenario]).value).toEqual(
      put(scenariosLoaded({ scenarios: [mockScenario] }))
    );
  });

  it("loadScenariosWorker handles errors", () => {
    const action = scenariosRequested();
    const generator = loadScenariosWorker(action);
    generator.next();
    const error = new Error("Failed to load scenarios");
    expect(generator.throw(error).value).toEqual(
      put(scenariosFailed(normalizeError(error)))
    );
  });

  it("calculateWaterfallWorker handles success", () => {
    const action = calculateWaterfallRequested({ scenarioId: "scenario-1" });
    const generator = calculateWaterfallWorker(action);
    expect(generator.next().value).toEqual(call(performWaterfallCalculation, action.payload));
    expect(generator.next(mockResults).value).toEqual(
      put(calculateWaterfallSucceeded({ results: mockResults }))
    );
  });

  it("calculateWaterfallWorker handles errors", () => {
    const action = calculateWaterfallRequested({ scenarioId: "scenario-1" });
    const generator = calculateWaterfallWorker(action);
    generator.next();
    const error = new Error("Failed to calculate");
    expect(generator.throw(error).value).toEqual(
      put(calculateWaterfallFailed(normalizeError(error)))
    );
  });
});
