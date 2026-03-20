import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { PortfolioRevenueRow } from "@/data/mocks/hooks/dashboard-data";
import { HomePortfolioHealthList } from "./home-portfolio-health-list";

const rows: PortfolioRevenueRow[] = [
  {
    id: "critical-company",
    name: "Critical Company",
    arr: 11.2,
    arrGrowthQoq: -18,
    valuation: 62,
    valuationPotential: "watch",
    upsideLabel: "Stabilization required",
    runwayMonths: 6,
    anomalyCount: 3,
    riskFlag: "critical",
    healthScore: 40,
    healthDelta: -10,
    route: "/portfolio",
  },
  {
    id: "watch-company",
    name: "Watch Company",
    arr: 14.8,
    arrGrowthQoq: -4,
    valuation: 90,
    valuationPotential: "medium",
    upsideLabel: "Measured upside",
    runwayMonths: 11,
    anomalyCount: 1,
    riskFlag: "watch",
    healthScore: 66,
    healthDelta: -3,
    route: "/portfolio",
  },
  {
    id: "stable-company",
    name: "Stable Company",
    arr: 21.7,
    arrGrowthQoq: 14,
    valuation: 160,
    valuationPotential: "high",
    upsideLabel: "Measured upside",
    runwayMonths: 20,
    anomalyCount: 0,
    riskFlag: "stable",
    healthScore: 92,
    healthDelta: 5,
    route: "/portfolio",
  },
];

describe("HomePortfolioHealthList", () => {
  it("shows a ranked preview by default and expands to the full list", () => {
    render(
      <HomePortfolioHealthList
        rows={rows}
        onRowClick={() => {}}
        previewRows={2}
      />,
    );

    const previewRows = screen.getAllByTestId("portfolio-health-row");
    expect(previewRows).toHaveLength(2);
    expect(previewRows[0]).toHaveTextContent("Critical Company");
    expect(screen.getByText(/Showing 2 of 3 companies/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("portfolio-health-list-toggle"));

    expect(screen.getAllByTestId("portfolio-health-row")).toHaveLength(3);
    expect(
      screen.getByTestId("portfolio-health-list-content"),
    ).toBeInTheDocument();
  });

  it("routes from the preview rows", () => {
    const onRowClick = vi.fn();
    render(
      <HomePortfolioHealthList
        rows={rows}
        onRowClick={onRowClick}
        previewRows={2}
      />,
    );

    fireEvent.click(screen.getAllByTestId("portfolio-health-row")[0]);
    expect(onRowClick).toHaveBeenCalledWith("Critical Company");
  });

  it("does not emit duplicate key warnings when portfolio ids repeat", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const duplicateIdRows: PortfolioRevenueRow[] = [
      { ...rows[0], id: "duplicate-id", name: "Alpha Company" },
      { ...rows[1], id: "duplicate-id", name: "Beta Company" },
      { ...rows[2], id: "duplicate-id", name: "Gamma Company" },
    ];

    render(
      <HomePortfolioHealthList
        rows={duplicateIdRows}
        onRowClick={() => {}}
        previewRows={2}
      />,
    );

    fireEvent.click(screen.getByTestId("portfolio-health-list-toggle"));

    const duplicateKeyWarningSeen = consoleError.mock.calls
      .flat()
      .some(
        (value) =>
          typeof value === "string" &&
          value.includes("Encountered two children with the same key"),
      );

    expect(duplicateKeyWarningSeen).toBe(false);

    consoleError.mockRestore();
  });
});
