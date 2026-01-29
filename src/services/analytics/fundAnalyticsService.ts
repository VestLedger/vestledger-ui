import { isMockMode } from '@/config/data-mode';
import {
  benchmarkData,
  cohortsBySector,
  cohortsByStage,
  cohortsByVintage,
  cohortsBySectorByFund,
  cohortsByStageByFund,
  cohortsByVintageByFund,
  concentrationByCompany,
  concentrationBySector,
  concentrationByStage,
  concentrationByCompanyByFund,
  concentrationBySectorByFund,
  concentrationByStageByFund,
  currentFund,
  fundMetricsData,
  deploymentPacing,
  deploymentPacingByFund,
  jCurveData,
  jCurveDataByFund,
  valuationTrends,
  valuationTrendsByFund,
  type CohortPerformance,
  type ConcentrationMetric,
  type FundMetrics,
  type JCurveDataPoint,
} from "@/data/mocks/mock-fund-analytics-data";

export type {
  CohortPerformance,
  ConcentrationMetric,
  FundMetrics,
  JCurveDataPoint,
};

export function getJCurveData(fundId?: string): JCurveDataPoint[] {
  if (isMockMode()) {
    const key = fundId || "all";
    if (jCurveDataByFund[key]) {
      return jCurveDataByFund[key];
    }
    return jCurveData;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getValuationTrends(fundId?: string) {
  if (isMockMode()) {
    const key = fundId || "all";
    if (valuationTrendsByFund[key]) {
      return valuationTrendsByFund[key];
    }
    return valuationTrends;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getCurrentFundMetrics(fundId?: string): FundMetrics {
  if (isMockMode()) {
    const key = fundId || "all";
    if (fundMetricsData[key]) {
      return fundMetricsData[key];
    }
    return currentFund;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getBenchmarkData(_fundId?: string) {
  if (isMockMode()) return benchmarkData;
  throw new Error("Fund analytics API not implemented yet");
}

export function getDeploymentPacing(fundId?: string) {
  if (isMockMode()) {
    const key = fundId || "all";
    if (deploymentPacingByFund[key]) {
      return deploymentPacingByFund[key];
    }
    return deploymentPacing;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getConcentrationRiskMetrics(fundId?: string) {
  if (isMockMode()) {
    const key = fundId || "all";
    return {
      byCompany:
        concentrationByCompanyByFund[key] || concentrationByCompany,
      bySector: concentrationBySectorByFund[key] || concentrationBySector,
      byStage: concentrationByStageByFund[key] || concentrationByStage,
    };
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getCohortsByVintage(fundId?: string): CohortPerformance[] {
  if (isMockMode()) {
    const key = fundId || "all";
    if (cohortsByVintageByFund[key]) {
      return cohortsByVintageByFund[key];
    }
    return cohortsByVintage;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getCohortsBySector(fundId?: string): CohortPerformance[] {
  if (isMockMode()) {
    const key = fundId || "all";
    if (cohortsBySectorByFund[key]) {
      return cohortsBySectorByFund[key];
    }
    return cohortsBySector;
  }
  throw new Error("Fund analytics API not implemented yet");
}

export function getCohortsByStage(fundId?: string): CohortPerformance[] {
  if (isMockMode()) {
    const key = fundId || "all";
    if (cohortsByStageByFund[key]) {
      return cohortsByStageByFund[key];
    }
    return cohortsByStage;
  }
  throw new Error("Fund analytics API not implemented yet");
}
