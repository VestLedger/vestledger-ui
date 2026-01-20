import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierTimeline } from "@/components/waterfall/tier-timeline";
import type { WaterfallScenario } from "@/types/waterfall";

const scenarioWithTimeline: WaterfallScenario = {
  id: "scenario-1",
  name: "Timeline Scenario",
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
    tierBreakdown: [],
    tierTimeline: [
      {
        tierId: "tier-1",
        tierName: "Return of Capital",
        reachedAt: "2024-06-01",
        exitValue: 50_000_000,
        cumulativeDistributed: 50_000_000,
      },
    ],
  },
};

describe("TierTimeline", () => {
  it("renders timeline entries when data is present", () => {
    render(<TierTimeline scenario={scenarioWithTimeline} />);
    expect(screen.getByText("Tier Timeline")).toBeInTheDocument();
    expect(screen.getByText(/Return of Capital/i)).toBeInTheDocument();
  });
});
