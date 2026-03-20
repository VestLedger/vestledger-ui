"use client";

import type {
  DailyBriefItem,
  FundTrustRow,
  HomeBlocker,
  HomeOpportunity,
  PortfolioRevenueRow,
  PortfolioRevenueTrendPoint,
} from "@/data/mocks/hooks/dashboard-data";

type RiskFlag = "stable" | "watch" | "critical";

const riskPriority: Record<RiskFlag, number> = {
  critical: 0,
  watch: 1,
  stable: 2,
};

const blockerSeverityPriority: Record<HomeBlocker["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function countByRiskFlag<T extends { riskFlag: RiskFlag }>(rows: T[]) {
  return rows.reduce(
    (acc, row) => {
      acc[row.riskFlag] += 1;
      return acc;
    },
    { stable: 0, watch: 0, critical: 0 },
  );
}

export function getAverageTrustScore(rows: FundTrustRow[]) {
  if (rows.length === 0) return 0;
  return Math.round(
    rows.reduce((sum, row) => sum + row.trustScore, 0) / rows.length,
  );
}

export function getArrMomentum(points: PortfolioRevenueTrendPoint[]) {
  const start = points[0]?.arr ?? 0;
  const current = points[points.length - 1]?.arr ?? 0;
  const deltaPct = start > 0 ? ((current - start) / start) * 100 : 0;

  return {
    start,
    current,
    deltaPct,
  };
}

export function getPortfolioRunwaySummary(rows: PortfolioRevenueRow[]) {
  return rows.reduce(
    (acc, row) => {
      if (row.runwayMonths < 9) acc.underNineMonths += 1;
      if (row.runwayMonths < 12) acc.underTwelveMonths += 1;
      if (row.anomalyCount > 0) acc.withAnomalies += 1;
      return acc;
    },
    {
      underNineMonths: 0,
      underTwelveMonths: 0,
      withAnomalies: 0,
    },
  );
}

export function getUrgentSignalsCount(items: DailyBriefItem[]) {
  return items.filter((item) => item.quadrant.startsWith("urgent")).length;
}

export function getImportantSignalsCount(items: DailyBriefItem[]) {
  return items.filter((item) => item.quadrant.endsWith("important")).length;
}

export function sortPortfolioRevenueRowsByAttention(
  rows: PortfolioRevenueRow[],
) {
  return [...rows].sort((a, b) => {
    const riskDiff = riskPriority[a.riskFlag] - riskPriority[b.riskFlag];
    if (riskDiff !== 0) return riskDiff;

    if (a.runwayMonths !== b.runwayMonths) {
      return a.runwayMonths - b.runwayMonths;
    }

    if (a.arrGrowthQoq !== b.arrGrowthQoq) {
      return a.arrGrowthQoq - b.arrGrowthQoq;
    }

    if (a.anomalyCount !== b.anomalyCount) {
      return b.anomalyCount - a.anomalyCount;
    }

    return a.name.localeCompare(b.name);
  });
}

export function sortFundTrustRowsByAttention(rows: FundTrustRow[]) {
  return [...rows].sort((a, b) => {
    const riskDiff = riskPriority[a.riskFlag] - riskPriority[b.riskFlag];
    if (riskDiff !== 0) return riskDiff;

    if (a.trustScore !== b.trustScore) {
      return a.trustScore - b.trustScore;
    }

    if (a.trustDelta !== b.trustDelta) {
      return a.trustDelta - b.trustDelta;
    }

    if (a.lpCommitmentRate !== b.lpCommitmentRate) {
      return a.lpCommitmentRate - b.lpCommitmentRate;
    }

    if (a.deploymentPct !== b.deploymentPct) {
      return a.deploymentPct - b.deploymentPct;
    }

    return a.displayName.localeCompare(b.displayName);
  });
}

export function getTopBlocker(blockers: HomeBlocker[]) {
  return [...blockers].sort((a, b) => {
    const severityDiff =
      blockerSeverityPriority[a.severity] - blockerSeverityPriority[b.severity];
    if (severityDiff !== 0) return severityDiff;

    if (a.blockedDays !== b.blockedDays) {
      return b.blockedDays - a.blockedDays;
    }

    return a.title.localeCompare(b.title);
  })[0];
}

export function getTopOpportunity(opportunities: HomeOpportunity[]) {
  return [...opportunities].sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }

    return a.title.localeCompare(b.title);
  })[0];
}
