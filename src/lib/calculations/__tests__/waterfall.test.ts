import { describe, it, expect } from "vitest";
import type { WaterfallScenario, WaterfallTier } from "@/types/waterfall";
import {
  calculateAmericanWaterfall,
  calculateBlendedWaterfall,
  calculateEuropeanWaterfall,
  calculateWaterfall,
} from "@/lib/calculations/waterfall";

const BASE_TIERS: WaterfallTier[] = [
  { id: "tier-1", name: "Return of Capital", type: "roc", order: 1 },
  { id: "tier-2", name: "Preferred Return", type: "preferred-return", order: 2, hurdleRate: 8 },
  { id: "tier-3", name: "Catch Up", type: "catch-up", order: 3, gpCarryPercentage: 20 },
  { id: "tier-4", name: "Carry Split", type: "carry", order: 4, gpCarryPercentage: 20, lpPercentage: 80 },
];

const BASE_INVESTOR_CLASSES = [
  {
    id: "lp-1",
    name: "LPs",
    type: "lp" as const,
    ownershipPercentage: 100,
    commitment: 100_000_000,
    capitalCalled: 100_000_000,
    capitalReturned: 0,
    order: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "gp-1",
    name: "GP",
    type: "gp" as const,
    ownershipPercentage: 100,
    commitment: 0,
    capitalCalled: 0,
    capitalReturned: 0,
    order: 2,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const buildScenario = (overrides?: Partial<WaterfallScenario>): WaterfallScenario => ({
  id: "scenario-1",
  name: "Base Case",
  description: "Base case scenario",
  model: "european",
  exitValue: 150_000_000,
  totalInvested: 100_000_000,
  managementFees: 0,
  isFavorite: false,
  isTemplate: false,
  version: 1,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  createdBy: "Ops Team",
  clawbackProvision: {
    enabled: true,
    hurdleRate: 8,
    clawbackRate: 100,
    distributionLifeYears: 4,
  },
  lookbackProvision: {
    enabled: true,
    lookbackYears: 3,
    lossCarryForward: 10_000_000,
    carryAtRiskRate: 50,
  },
  ...overrides,
  investorClasses: overrides?.investorClasses ?? BASE_INVESTOR_CLASSES,
  tiers: overrides?.tiers ?? BASE_TIERS,
});

describe("waterfall calculations", () => {
  it("calculates european waterfall totals and enhancements", () => {
    const scenario = buildScenario();
    const results = calculateEuropeanWaterfall(scenario);

    expect(results.totalExitValue).toBe(150_000_000);
    expect(results.gpCarry).toBe(26_000_000);
    expect(results.lpTotalReturn).toBe(124_000_000);
    expect(results.tierBreakdown).toHaveLength(3);

    expect(results.tierTimeline).toHaveLength(3);
    expect(results.clawback?.status).toBe("triggered");
    expect(results.clawback?.clawbackDue).toBe(8_000_000);
    expect(results.lookback?.status).toBe("at-risk");
    expect(results.lookback?.carryAtRisk).toBe(13_000_000);
  });

  it("calculates blended waterfall as weighted average", () => {
    const blendedScenario = buildScenario({
      model: "blended",
      blendedConfig: { europeanWeight: 70, americanWeight: 30 },
    });

    const european = calculateEuropeanWaterfall({ ...blendedScenario, model: "european" });
    const american = calculateAmericanWaterfall({ ...blendedScenario, model: "american" });
    const blended = calculateBlendedWaterfall(blendedScenario);

    const expectedCarry = european.gpCarry * 0.7 + american.gpCarry * 0.3;
    expect(blended.gpCarry).toBeCloseTo(expectedCarry, 2);
    expect(blended.blendedBreakdown?.europeanWeight).toBe(70);
  });

  it("routes calculateWaterfall by model", () => {
    const blendedScenario = buildScenario({
      model: "blended",
      blendedConfig: { europeanWeight: 60, americanWeight: 40 },
    });
    const results = calculateWaterfall(blendedScenario);
    expect(results.blendedBreakdown?.americanWeight).toBe(40);
  });
});
