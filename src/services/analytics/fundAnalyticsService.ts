import { isMockMode } from '@/config/data-mode';
import {
  benchmarkData,
  cohortsBySector,
  cohortsByStage,
  cohortsByVintage,
  concentrationByCompany,
  concentrationBySector,
  concentrationByStage,
  currentFund,
  deploymentPacing,
  jCurveData,
  valuationTrends,
  type CohortPerformance,
  type ConcentrationMetric,
  type FundMetrics,
  type JCurveDataPoint,
} from '@/data/mocks/mock-fund-analytics-data';

export type {
  CohortPerformance,
  ConcentrationMetric,
  FundMetrics,
  JCurveDataPoint,
};

export function getJCurveData(): JCurveDataPoint[] {
  if (isMockMode()) return jCurveData;
  throw new Error('Fund analytics API not implemented yet');
}

export function getValuationTrends() {
  if (isMockMode()) return valuationTrends;
  throw new Error('Fund analytics API not implemented yet');
}

export function getCurrentFundMetrics(): FundMetrics {
  if (isMockMode()) return currentFund;
  throw new Error('Fund analytics API not implemented yet');
}

export function getBenchmarkData() {
  if (isMockMode()) return benchmarkData;
  throw new Error('Fund analytics API not implemented yet');
}

export function getDeploymentPacing() {
  if (isMockMode()) return deploymentPacing;
  throw new Error('Fund analytics API not implemented yet');
}

export function getConcentrationRiskMetrics() {
  if (isMockMode()) {
    return {
      byCompany: concentrationByCompany,
      bySector: concentrationBySector,
      byStage: concentrationByStage,
    };
  }
  throw new Error('Fund analytics API not implemented yet');
}

export function getCohortsByVintage(): CohortPerformance[] {
  if (isMockMode()) return cohortsByVintage;
  throw new Error('Fund analytics API not implemented yet');
}

export function getCohortsBySector(): CohortPerformance[] {
  if (isMockMode()) return cohortsBySector;
  throw new Error('Fund analytics API not implemented yet');
}

export function getCohortsByStage(): CohortPerformance[] {
  if (isMockMode()) return cohortsByStage;
  throw new Error('Fund analytics API not implemented yet');
}
