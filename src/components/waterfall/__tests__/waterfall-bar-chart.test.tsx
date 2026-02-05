import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { WaterfallBarChart } from "@/components/waterfall/charts/waterfall-bar-chart";
import type { WaterfallScenario } from "@/types/waterfall";

const scenarioWithResults: WaterfallScenario = {
  id: "scenario-1",
  name: "Test Scenario",
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
  results: {
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
    tierBreakdown: [
      {
        tierId: "tier-1",
        tierName: "Return of Capital",
        tierType: "roc",
        totalAmount: 100_000_000,
        gpAmount: 0,
        lpAmount: 100_000_000,
        percentage: 100,
        cumulativeAmount: 100_000_000,
        allocations: [],
      },
    ],
  },
};

describe("WaterfallBarChart", () => {
  it("renders empty state when scenario is missing", () => {
    render(<WaterfallBarChart scenario={null} />);
    expect(screen.getByText(/run a scenario/i)).toBeInTheDocument();
  });

  it("renders accessible table when results exist", () => {
    render(<WaterfallBarChart scenario={scenarioWithResults} />);
    const table = screen.getByRole("table", { name: /waterfall tier breakdown/i });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText("Return of Capital")).toBeInTheDocument();
  });
});
