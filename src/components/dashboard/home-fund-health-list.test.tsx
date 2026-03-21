import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { FundTrustRow } from "@/data/mocks/hooks/dashboard-data";
import { HomeFundHealthList } from "./home-fund-health-list";

const rows: FundTrustRow[] = [
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
];

describe("HomeFundHealthList", () => {
  it("shows trust overview and a ranked preview by default", () => {
    render(
      <HomeFundHealthList rows={rows} onRowClick={() => {}} previewRows={2} />,
    );

    expect(screen.getByTestId("fund-trust-overview")).toBeInTheDocument();
    const previewRows = screen.getAllByTestId("fund-health-row");
    expect(previewRows).toHaveLength(2);
    expect(previewRows[0]).toHaveTextContent("Critical Fund");
    expect(screen.getByText(/Showing 2 of 3 funds/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("fund-health-list-toggle"));
    expect(screen.getAllByTestId("fund-health-row")).toHaveLength(3);
  });

  it("routes from preview rows", () => {
    const onRowClick = vi.fn();
    render(
      <HomeFundHealthList
        rows={rows}
        onRowClick={onRowClick}
        previewRows={2}
      />,
    );

    fireEvent.click(screen.getAllByTestId("fund-health-row")[0]);
    expect(onRowClick).toHaveBeenCalledWith("fund-critical");
  });
});
