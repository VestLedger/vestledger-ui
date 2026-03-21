import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type {
  DailyBriefItem,
  FundTrustRow,
  HomeBlocker,
  HomeOpportunity,
  MorningBrief,
  PortfolioRevenueRow,
  PortfolioRevenueTrendPoint,
} from "@/data/mocks/hooks/dashboard-data";
import { HomeExecutiveOverview } from "./home-executive-overview";

const brief: MorningBrief = {
  summary:
    "Two portfolio companies need attention while fund trust remains stable overall.",
  confidence: 0.91,
  asOf: new Date("2026-03-19T06:30:00.000Z"),
  horizonDays: 7,
  itemCount: 2,
  urgentCount: 1,
  importantCount: 2,
};

const dailyBriefItems: DailyBriefItem[] = [
  {
    id: "brief-1",
    type: "warning",
    title: "Bridge funding review",
    description: "Runway compression at a portfolio company.",
    owner: "GP",
    lane: "Portfolio",
    dueDate: new Date("2026-03-20T00:00:00.000Z"),
    urgencyScore: 9,
    importanceScore: 9,
    route: "/portfolio",
    quadrant: "urgent-important",
  },
  {
    id: "brief-2",
    type: "task",
    title: "LP trust follow-up",
    description: "Confirm reporting cadence with watch fund LPs.",
    owner: "IR",
    lane: "LP Relations",
    dueDate: new Date("2026-03-24T00:00:00.000Z"),
    urgencyScore: 4,
    importanceScore: 8,
    route: "/fund-admin",
    quadrant: "non-urgent-important",
  },
];

const fundTrustRows: FundTrustRow[] = [
  {
    id: "fund-stable",
    displayName: "Stable Fund",
    status: "active",
    trustScore: 92,
    trustDelta: 3,
    lpCommitmentRate: 96,
    reportingQuality: 94,
    lpSatisfaction: 95,
    capitalEfficiency: 82,
    deploymentPct: 68,
    availableCapital: 44_000_000,
    irr: 17.4,
    tvpi: 2.3,
    riskFlag: "stable",
  },
  {
    id: "fund-watch",
    displayName: "Watch Fund",
    status: "active",
    trustScore: 74,
    trustDelta: -4,
    lpCommitmentRate: 83,
    reportingQuality: 86,
    lpSatisfaction: 78,
    capitalEfficiency: 71,
    deploymentPct: 27,
    availableCapital: 58_000_000,
    irr: 10.8,
    tvpi: 1.6,
    riskFlag: "watch",
  },
  {
    id: "fund-critical",
    displayName: "Critical Fund",
    status: "active",
    trustScore: 59,
    trustDelta: -8,
    lpCommitmentRate: 71,
    reportingQuality: 75,
    lpSatisfaction: 69,
    capitalEfficiency: 60,
    deploymentPct: 18,
    availableCapital: 79_000_000,
    irr: 7.2,
    tvpi: 1.1,
    riskFlag: "critical",
  },
];

const portfolioRevenueRows: PortfolioRevenueRow[] = [
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
  {
    id: "company-watch",
    name: "Watch Company",
    arr: 17,
    arrGrowthQoq: -5,
    valuation: 98,
    valuationPotential: "medium",
    upsideLabel: "Needs operating discipline",
    runwayMonths: 11,
    anomalyCount: 1,
    riskFlag: "watch",
    healthScore: 67,
    healthDelta: -5,
    route: "/portfolio",
  },
  {
    id: "company-critical",
    name: "Critical Company",
    arr: 12,
    arrGrowthQoq: -19,
    valuation: 64,
    valuationPotential: "watch",
    upsideLabel: "Stabilization required",
    runwayMonths: 8,
    anomalyCount: 2,
    riskFlag: "critical",
    healthScore: 42,
    healthDelta: -12,
    route: "/portfolio",
  },
];

const blockers: HomeBlocker[] = [
  {
    id: "blocker-critical",
    sourceId: "brief-1",
    title: "Bridge extension decision",
    description: "Critical portfolio runway threshold crossed.",
    blockedDays: 5,
    severity: "critical",
    lane: "Portfolio",
    route: "/portfolio",
  },
  {
    id: "blocker-info",
    sourceId: "brief-2",
    title: "Reporting narrative alignment",
    description: "Narrative review needed before distribution.",
    blockedDays: 2,
    severity: "info",
    lane: "LP Relations",
    route: "/fund-admin",
  },
];

const opportunities: HomeOpportunity[] = [
  {
    id: "opp-top",
    sourceId: "company-stable",
    title: "Cross-sell expansion signal",
    thesis: "Strong usage growth supports an upsell push.",
    impactLabel: "ARR expansion",
    confidence: 0.91,
    lane: "Portfolio",
    route: "/portfolio",
  },
  {
    id: "opp-secondary",
    sourceId: "fund-watch",
    title: "LP trust repair campaign",
    thesis: "Targeted reporting improvements could recover sentiment.",
    impactLabel: "Trust repair",
    confidence: 0.72,
    lane: "LP Relations",
    route: "/fund-admin",
  },
];

const portfolioRevenueTrend: PortfolioRevenueTrendPoint[] = [
  { month: "Jan", arr: 100 },
  { month: "Feb", arr: 110 },
  { month: "Mar", arr: 120 },
];

describe("HomeExecutiveOverview", () => {
  it("renders the merged executive summary cards from dashboard data", () => {
    render(
      <HomeExecutiveOverview
        brief={brief}
        dailyBriefItems={dailyBriefItems}
        fundTrustRows={fundTrustRows}
        portfolioRevenueRows={portfolioRevenueRows}
        blockers={blockers}
        opportunities={opportunities}
        portfolioRevenueTrend={portfolioRevenueTrend}
      />,
    );

    const briefCard = screen.getByTestId("gp-home-ai-brief");
    expect(briefCard).toHaveTextContent(brief.summary);
    expect(briefCard).toHaveTextContent("2 signals in 7d");
    expect(briefCard).toHaveTextContent("2 important");

    const arrCard = screen.getByTestId("gp-home-arr-momentum");
    expect(arrCard).toHaveTextContent("+20.0%");
    expect(arrCard).toHaveTextContent("$120M");
    expect(arrCard).toHaveTextContent("from $100M at the start of the trend");

    const fundCard = screen.getByTestId("gp-home-fund-trust-overview");
    expect(fundCard).toHaveTextContent("Stable");
    expect(fundCard).toHaveTextContent("Watch");
    expect(fundCard).toHaveTextContent("Critical");
    expect(fundCard).toHaveTextContent("Avg trust");
    expect(fundCard).toHaveTextContent("75");
    expect(fundCard).toHaveTextContent("Watch funds");
    expect(fundCard).toHaveTextContent("2");

    const portfolioCard = screen.getByTestId(
      "gp-home-portfolio-health-overview",
    );
    expect(portfolioCard).toHaveTextContent("Portfolio Health");
    expect(portfolioCard).toHaveTextContent("< 9m runway");
    expect(portfolioCard).toHaveTextContent("1");
    expect(portfolioCard).toHaveTextContent("< 12m runway");
    expect(portfolioCard).toHaveTextContent("2");
    expect(portfolioCard).toHaveTextContent("Anomalies");
    expect(portfolioCard).toHaveTextContent("2");

    const attentionCard = screen.getByTestId("gp-home-attention-summary");
    expect(attentionCard).toHaveTextContent("1 urgent");
    expect(attentionCard).toHaveTextContent("Urgent");
    expect(attentionCard).toHaveTextContent("Blockers");
    expect(attentionCard).toHaveTextContent("Opportunities");
    expect(attentionCard).toHaveTextContent("Bridge extension decision");
    expect(attentionCard).toHaveTextContent("Cross-sell expansion signal");

    const alertPanels = within(attentionCard).getAllByText(
      /Top (blocker|opportunity)/,
    );
    expect(alertPanels).toHaveLength(2);
  });
});
