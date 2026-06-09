import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  DailyBriefItem,
  FundTrustRow,
  HomeBlocker,
  HomeOpportunity,
  MorningBrief,
  PortfolioRevenueRow,
  PortfolioRevenueTrendPoint,
  RevenueDistributionSlice,
} from "@/data/mocks/hooks/dashboard-data";
import { HomeARRTrend } from "./home-arr-trend";
import { HomeExecutiveOverview } from "./home-executive-overview";
import { HomeRevenueDistribution } from "./home-revenue-distribution";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  AreaChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  PieChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  Pie: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  Area: ({ fill, stroke }: { fill: string; stroke: string }) => (
    <path data-testid="chart-area" fill={fill} stroke={stroke} />
  ),
  Line: ({
    stroke,
    dot,
    activeDot,
  }: {
    stroke: string;
    dot?: { fill?: string } | boolean;
    activeDot?: { fill?: string } | boolean;
  }) => (
    <path
      data-testid="chart-line"
      stroke={stroke}
      data-dot-fill={typeof dot === "object" ? dot.fill : undefined}
      data-active-dot-fill={
        typeof activeDot === "object" ? activeDot.fill : undefined
      }
    />
  ),
  Cell: ({ fill }: { fill: string }) => (
    <path data-testid="chart-cell" fill={fill} />
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const trend: PortfolioRevenueTrendPoint[] = [
  { month: "Jan", arr: 100 },
  { month: "Feb", arr: 120 },
];

const brief: MorningBrief = {
  summary: "Portfolio reporting is current.",
  confidence: 0.9,
  asOf: new Date("2026-06-04T08:00:00.000Z"),
  horizonDays: 7,
  itemCount: 0,
  urgentCount: 0,
  importantCount: 0,
};

const fundTrustRows: FundTrustRow[] = [
  {
    id: "fund-stable",
    displayName: "Stable Fund",
    status: "active",
    trustScore: 90,
    trustDelta: 2,
    lpCommitmentRate: 94,
    reportingQuality: 92,
    lpSatisfaction: 91,
    capitalEfficiency: 88,
    deploymentPct: 65,
    availableCapital: 40_000_000,
    irr: 18,
    tvpi: 2.1,
    riskFlag: "stable",
  },
];

const revenueRows: PortfolioRevenueRow[] = [
  {
    id: "company-stable",
    name: "Stable Company",
    arr: 28,
    arrGrowthQoq: 16,
    valuation: 180,
    valuationPotential: "high",
    upsideLabel: "Expansion upside",
    runwayMonths: 18,
    anomalyCount: 0,
    riskFlag: "stable",
    healthScore: 91,
    healthDelta: 4,
    route: "/portfolio",
  },
];

describe("dashboard chart series roles", () => {
  it("uses a chart-series role for ARR trend charts", () => {
    const { container, rerender } = render(<HomeARRTrend points={trend} />);

    expect(screen.getByTestId("chart-line")).toHaveAttribute(
      "stroke",
      "var(--app-chart-1)",
    );
    expect(screen.getByTestId("chart-line")).toHaveAttribute(
      "data-dot-fill",
      "var(--app-chart-1)",
    );
    expect(screen.getByTestId("chart-line")).toHaveAttribute(
      "data-active-dot-fill",
      "var(--app-chart-1)",
    );
    expect(
      Array.from(container.querySelectorAll("stop")).map((stop) =>
        stop.getAttribute("stop-color"),
      ),
    ).toEqual(["var(--app-chart-1)", "var(--app-chart-1)"]);

    rerender(
      <HomeExecutiveOverview
        brief={brief}
        dailyBriefItems={[] as DailyBriefItem[]}
        fundTrustRows={fundTrustRows}
        portfolioRevenueRows={revenueRows}
        blockers={[] as HomeBlocker[]}
        opportunities={[] as HomeOpportunity[]}
        portfolioRevenueTrend={trend}
      />,
    );

    const arrMomentum = screen.getByTestId("gp-home-arr-momentum");
    expect(within(arrMomentum).getByTestId("chart-line")).toHaveAttribute(
      "stroke",
      "var(--app-chart-1)",
    );
  });

  it("cycles revenue slices through chart-series roles", () => {
    const slices: RevenueDistributionSlice[] = [
      { id: "one", name: "One", value: 40, color: "#16a34a" },
      { id: "two", name: "Two", value: 30, color: "#f59e0b" },
      { id: "three", name: "Three", value: 20, color: "#ef4444" },
      { id: "four", name: "Four", value: 10, color: "#64748b" },
    ];

    const { container } = render(<HomeRevenueDistribution slices={slices} />);
    const expected = [
      "var(--app-chart-1)",
      "var(--app-chart-2)",
      "var(--app-chart-3)",
      "var(--app-chart-4)",
    ];

    expect(
      screen
        .getAllByTestId("chart-cell")
        .map((cell) => cell.getAttribute("fill")),
    ).toEqual(expected);
    expect(
      Array.from(
        container.querySelectorAll<HTMLSpanElement>(
          'span[data-testid="revenue-series-marker"]',
        ),
      ).map((marker) => marker.style.backgroundColor),
    ).toEqual(expected);
  });

  it("keeps status breakdowns on semantic status roles", () => {
    render(
      <HomeExecutiveOverview
        brief={brief}
        dailyBriefItems={[] as DailyBriefItem[]}
        fundTrustRows={fundTrustRows}
        portfolioRevenueRows={revenueRows}
        blockers={[] as HomeBlocker[]}
        opportunities={[] as HomeOpportunity[]}
        portfolioRevenueTrend={trend}
      />,
    );

    expect(screen.getAllByText("Stable")[0].previousElementSibling).toHaveClass(
      "bg-[var(--app-success)]",
    );
  });
});
