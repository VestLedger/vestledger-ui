import { describe, expect, it } from "vitest";
import type {
  FundTrustRow,
  PortfolioRevenueRow,
  PortfolioRevenueTrendPoint,
} from "@/data/mocks/hooks/dashboard-data";
import {
  getArrMomentum,
  sortFundTrustRowsByAttention,
  sortPortfolioRevenueRowsByAttention,
} from "./home-dashboard-helpers";

const portfolioRows: PortfolioRevenueRow[] = [
  {
    id: "stable-growth",
    name: "Stable Growth",
    arr: 18.4,
    arrGrowthQoq: 12,
    valuation: 120,
    valuationPotential: "high",
    upsideLabel: "Measured upside",
    runwayMonths: 18,
    anomalyCount: 0,
    riskFlag: "stable",
    healthScore: 90,
    healthDelta: 4,
    route: "/portfolio",
  },
  {
    id: "watch-runway",
    name: "Watch Runway",
    arr: 14.2,
    arrGrowthQoq: -4,
    valuation: 88,
    valuationPotential: "medium",
    upsideLabel: "Measured upside",
    runwayMonths: 11,
    anomalyCount: 1,
    riskFlag: "watch",
    healthScore: 66,
    healthDelta: -6,
    route: "/portfolio",
  },
  {
    id: "critical-burn",
    name: "Critical Burn",
    arr: 9.6,
    arrGrowthQoq: -16,
    valuation: 54,
    valuationPotential: "watch",
    upsideLabel: "Stabilization required",
    runwayMonths: 6,
    anomalyCount: 3,
    riskFlag: "critical",
    healthScore: 38,
    healthDelta: -12,
    route: "/portfolio",
  },
];

const fundRows: FundTrustRow[] = [
  {
    id: "fund-stable",
    displayName: "Stable Fund",
    status: "active",
    trustScore: 92,
    trustDelta: 4,
    lpCommitmentRate: 96,
    reportingQuality: 97,
    lpSatisfaction: 93,
    capitalEfficiency: 84,
    deploymentPct: 62,
    availableCapital: 42_000_000,
    irr: 18.2,
    tvpi: 2.4,
    riskFlag: "stable",
  },
  {
    id: "fund-watch",
    displayName: "Watch Fund",
    status: "active",
    trustScore: 74,
    trustDelta: -4,
    lpCommitmentRate: 82,
    reportingQuality: 88,
    lpSatisfaction: 79,
    capitalEfficiency: 72,
    deploymentPct: 24,
    availableCapital: 61_000_000,
    irr: 11.1,
    tvpi: 1.7,
    riskFlag: "watch",
  },
  {
    id: "fund-critical",
    displayName: "Critical Fund",
    status: "active",
    trustScore: 58,
    trustDelta: -9,
    lpCommitmentRate: 70,
    reportingQuality: 74,
    lpSatisfaction: 68,
    capitalEfficiency: 61,
    deploymentPct: 15,
    availableCapital: 84_000_000,
    irr: 6.8,
    tvpi: 1.2,
    riskFlag: "critical",
  },
];

describe("home dashboard helpers", () => {
  it("sorts portfolio rows by attention using risk, runway, and growth", () => {
    const sorted = sortPortfolioRevenueRowsByAttention(portfolioRows);

    expect(sorted.map((row) => row.id)).toEqual([
      "critical-burn",
      "watch-runway",
      "stable-growth",
    ]);
  });

  it("sorts fund rows by trust and deployment pressure", () => {
    const sorted = sortFundTrustRowsByAttention(fundRows);

    expect(sorted.map((row) => row.id)).toEqual([
      "fund-critical",
      "fund-watch",
      "fund-stable",
    ]);
  });

  it("calculates ARR momentum from the existing trend points", () => {
    const points: PortfolioRevenueTrendPoint[] = [
      { month: "Jan", arr: 220 },
      { month: "Feb", arr: 248 },
      { month: "Mar", arr: 275 },
    ];

    expect(getArrMomentum(points)).toEqual({
      start: 220,
      current: 275,
      deltaPct: 25,
    });
  });
});
