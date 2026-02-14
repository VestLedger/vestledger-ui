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
  type BenchmarkComparison,
  type CohortPerformance,
  type ConcentrationMetric,
  type DeploymentPacing,
  type FundMetrics,
  type JCurveDataPoint,
  type ValuationTrend,
} from "@/data/mocks/mock-fund-analytics-data";
import { requestJson } from '@/services/shared/httpClient';

export type {
  BenchmarkComparison,
  CohortPerformance,
  ConcentrationMetric,
  DeploymentPacing,
  FundMetrics,
  JCurveDataPoint,
  ValuationTrend,
};

type ApiFundPerformance = {
  fundName?: string;
  fundStatus?: string;
  vintage?: number;
  remainingLife?: number;
  fundSize?: number;
  deployed?: number;
  reserved?: number;
  deploymentRate?: number;
  numberOfInvestments?: number;
  averageInvestmentSize?: number;
  tvpi?: number;
  dpi?: number;
  rvpi?: number;
  irr?: number;
  moic?: number;
};

type ApiBenchmarkPoint = {
  metric?: string;
  fundValue?: number;
  median?: number;
  industryMedian?: number;
  topQuartile?: number;
  bottomQuartile?: number;
};

type ApiBenchmarkResponse = {
  benchmarks?: ApiBenchmarkPoint[];
  fundMetrics?: {
    tvpi?: number;
    dpi?: number;
    irr?: number;
  };
};

type ApiJCurvePoint = {
  period?: number;
  date?: string;
  year?: number;
  nav?: number;
  tvpi?: number;
  cumulativeCashFlow?: number;
};

type ApiCohortPoint = {
  name?: string;
  companyCount?: number;
  totalInvested?: number;
  totalCurrentValue?: number;
  totalExitValue?: number;
  unrealizedMultiple?: number;
  realizedMultiple?: number;
  avgHealth?: number;
};

type ApiConcentrationEntry = {
  name?: string;
  value?: number;
  percentage?: number;
  count?: number;
};

type ApiConcentrationResponse = {
  byCompany?: ApiConcentrationEntry[];
  bySector?: ApiConcentrationEntry[];
  byStage?: ApiConcentrationEntry[];
};

type ApiDeploymentPacingPoint = {
  year?: number;
  invested?: number;
  deals?: number;
  cumulative?: number;
  cumulativePercentage?: number;
};

type ApiDeploymentResponse = {
  pacing?: ApiDeploymentPacingPoint[];
};

type ApiValuationTrendPoint = {
  date?: string;
  nav?: number;
  tvpi?: number;
};

type ApiValuationTrendsResponse = {
  totalInvested?: number;
  totalCurrentValue?: number;
  totalExitValue?: number;
  trends?: ApiValuationTrendPoint[];
};

type ConcentrationRiskSnapshot = {
  byCompany: ConcentrationMetric[];
  bySector: ConcentrationMetric[];
  byStage: ConcentrationMetric[];
};

export type FundAnalyticsSnapshot = {
  fundMetrics: FundMetrics;
  benchmark: BenchmarkComparison[];
  jCurve: JCurveDataPoint[];
  valuationTrends: ValuationTrend[];
  deploymentPacing: DeploymentPacing[];
  concentration: ConcentrationRiskSnapshot;
  cohortsVintage: CohortPerformance[];
  cohortsSector: CohortPerformance[];
  cohortsStage: CohortPerformance[];
};

let apiFundAnalyticsSnapshotCache = new Map<string, FundAnalyticsSnapshot>();
let latestApiFundAnalyticsSnapshot: FundAnalyticsSnapshot | null = null;

const clone = <T>(value: T): T => structuredClone(value);

function normalizeFundId(fundId?: string | null): string {
  const normalized = fundId?.trim();
  if (!normalized) return 'all';
  return normalized;
}

function isSupportedStatus(
  value: string
): value is FundMetrics['fundStatus'] {
  return (
    value === 'fundraising'
    || value === 'investing'
    || value === 'harvesting'
    || value === 'liquidating'
  );
}

function mapFundStatus(value?: string): FundMetrics['fundStatus'] {
  if (!value) return 'investing';
  if (isSupportedStatus(value)) return value;

  const normalized = value.toLowerCase();
  if (normalized === 'active') return 'investing';
  if (normalized === 'closed') return 'harvesting';
  if (normalized === 'fundraising') return 'fundraising';
  if (normalized === 'liquidating') return 'liquidating';

  return 'investing';
}

function formatQuarterLabel(value?: string, fallback?: string): string {
  if (!value) return fallback ?? 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback ?? value;
  const quarter = Math.floor(parsed.getMonth() / 3) + 1;
  return `Q${quarter} ${parsed.getFullYear()}`;
}

function getMockSnapshot(fundId?: string | null): FundAnalyticsSnapshot {
  const key = normalizeFundId(fundId);

  return {
    fundMetrics: clone(fundMetricsData[key] ?? currentFund),
    benchmark: clone(benchmarkData),
    jCurve: clone(jCurveDataByFund[key] ?? jCurveData),
    valuationTrends: clone(valuationTrendsByFund[key] ?? valuationTrends),
    deploymentPacing: clone(deploymentPacingByFund[key] ?? deploymentPacing),
    concentration: {
      byCompany: clone(concentrationByCompanyByFund[key] ?? concentrationByCompany),
      bySector: clone(concentrationBySectorByFund[key] ?? concentrationBySector),
      byStage: clone(concentrationByStageByFund[key] ?? concentrationByStage),
    },
    cohortsVintage: clone(cohortsByVintageByFund[key] ?? cohortsByVintage),
    cohortsSector: clone(cohortsBySectorByFund[key] ?? cohortsBySector),
    cohortsStage: clone(cohortsByStageByFund[key] ?? cohortsByStage),
  };
}

function mapFundMetricsResponse(
  fundId: string,
  response: ApiFundPerformance
): FundMetrics {
  const fallback = fundMetricsData[fundId] ?? currentFund;

  return {
    fundId,
    fundName: response.fundName ?? fallback.fundName,
    vintage: response.vintage ?? fallback.vintage,
    fundSize: response.fundSize ?? fallback.fundSize,
    deployed: response.deployed ?? fallback.deployed,
    reserved: response.reserved ?? fallback.reserved,
    tvpi: response.tvpi ?? fallback.tvpi,
    dpi: response.dpi ?? fallback.dpi,
    rvpi: response.rvpi ?? fallback.rvpi,
    irr: response.irr ?? fallback.irr,
    moic: response.moic ?? fallback.moic,
    numberOfInvestments: response.numberOfInvestments ?? fallback.numberOfInvestments,
    averageInvestmentSize: response.averageInvestmentSize ?? fallback.averageInvestmentSize,
    deploymentRate: response.deploymentRate ?? fallback.deploymentRate,
    fundStatus: mapFundStatus(response.fundStatus ?? fallback.fundStatus),
    remainingLife: response.remainingLife ?? fallback.remainingLife,
  };
}

function metricValueFromFund(
  metricName: string,
  fundMetrics: FundMetrics
): number {
  const key = metricName.toLowerCase();
  if (key === 'tvpi') return fundMetrics.tvpi;
  if (key === 'dpi') return fundMetrics.dpi;
  if (key === 'irr') return fundMetrics.irr;
  if (key === 'moic') return fundMetrics.moic;
  return 0;
}

function mapBenchmarkResponse(
  response: ApiBenchmarkResponse,
  fundMetrics: FundMetrics
): BenchmarkComparison[] {
  if (!response.benchmarks || response.benchmarks.length === 0) {
    return clone(benchmarkData);
  }

  return response.benchmarks.map((benchmark) => {
    const metric = benchmark.metric ?? 'Unknown';
    return {
      metric,
      vestledgerValue:
        benchmark.fundValue
        ?? metricValueFromFund(metric, fundMetrics),
      industryMedian:
        benchmark.median
        ?? benchmark.industryMedian
        ?? 0,
      topQuartile: benchmark.topQuartile ?? 0,
      bottomQuartile: benchmark.bottomQuartile ?? 0,
    };
  });
}

function mapJCurveResponse(points: ApiJCurvePoint[]): JCurveDataPoint[] {
  if (points.length === 0) return clone(jCurveData);

  return points.map((point, index) => {
    const tvpi = point.tvpi ?? 1;
    const period = point.period ?? index;
    const label = point.date
      ? formatQuarterLabel(point.date, `Period ${period + 1}`)
      : `FY ${point.year ?? new Date().getFullYear()}`;

    return {
      quartersSinceInception: period,
      quarter: label,
      cumulativeIRR: Number(((tvpi - 1) * 100).toFixed(1)),
      cumulativeMOIC: Number(tvpi.toFixed(2)),
      netCashFlow: point.cumulativeCashFlow ?? 0,
      cumulativeValue: point.nav ?? 0,
    };
  });
}

function mapCohortsResponse(points: ApiCohortPoint[]): CohortPerformance[] {
  return points.map((point) => {
    const totalInvested = Math.max(point.totalInvested ?? 0, 0);
    const currentValue = Math.max(point.totalCurrentValue ?? 0, 0);
    const unrealizedMultiple =
      point.unrealizedMultiple
      ?? (totalInvested > 0 ? currentValue / totalInvested : 0);
    const realizedMultiple = point.realizedMultiple ?? 0;
    const tvpi = unrealizedMultiple + realizedMultiple;
    const estimatedIrr = ((tvpi - 1) * 18) + ((point.avgHealth ?? 70) * 0.15);
    const percentageExited = tvpi > 0 ? (realizedMultiple / tvpi) * 100 : 0;

    return {
      cohort: point.name ?? 'Uncategorized',
      count: point.companyCount ?? 0,
      totalInvested,
      currentValue,
      moic: Number(unrealizedMultiple.toFixed(2)),
      irr: Number(Math.max(-100, Math.min(estimatedIrr, 180)).toFixed(1)),
      tvpi: Number(tvpi.toFixed(2)),
      dpi: Number(realizedMultiple.toFixed(2)),
      percentageExited: Number(Math.max(0, Math.min(percentageExited, 100)).toFixed(1)),
    };
  });
}

function mapConcentrationEntries(
  points: ApiConcentrationEntry[] | undefined,
  dimension: ConcentrationMetric['dimension']
): ConcentrationMetric[] {
  if (!points || points.length === 0) return [];

  return points.map((point) => ({
    category: point.name ?? 'Other',
    dimension,
    value: point.value ?? 0,
    percentage: point.percentage ?? 0,
    count: point.count,
  }));
}

function mapConcentrationResponse(
  response: ApiConcentrationResponse,
  fundId: string
): ConcentrationRiskSnapshot {
  const fallbackByCompany = concentrationByCompanyByFund[fundId] ?? concentrationByCompany;
  const fallbackBySector = concentrationBySectorByFund[fundId] ?? concentrationBySector;
  const fallbackByStage = concentrationByStageByFund[fundId] ?? concentrationByStage;

  const byCompany = mapConcentrationEntries(response.byCompany, 'Company');
  const bySector = mapConcentrationEntries(response.bySector, 'Sector');
  const byStage = mapConcentrationEntries(response.byStage, 'Stage');

  return {
    byCompany: byCompany.length > 0 ? byCompany : clone(fallbackByCompany),
    bySector: bySector.length > 0 ? bySector : clone(fallbackBySector),
    byStage: byStage.length > 0 ? byStage : clone(fallbackByStage),
  };
}

function mapDeploymentResponse(
  response: ApiDeploymentResponse
): DeploymentPacing[] {
  if (!response.pacing || response.pacing.length === 0) {
    return clone(deploymentPacing);
  }

  return response.pacing.map((entry) => {
    const deployed = Math.max(entry.invested ?? 0, 0);
    const deals = Math.max(entry.deals ?? 0, 0);
    const cumulative = Math.max(entry.cumulative ?? deployed, 0);

    return {
      quarter: entry.year ? `FY ${entry.year}` : 'FY N/A',
      deployed,
      numberOfDeals: deals,
      averageDealSize: deals > 0 ? deployed / deals : 0,
      cumulativeDeployed: cumulative,
      percentageOfFund: entry.cumulativePercentage ?? 0,
    };
  });
}

function mapValuationTrendsResponse(
  response: ApiValuationTrendsResponse
): ValuationTrend[] {
  if (!response.trends || response.trends.length === 0) {
    return clone(valuationTrends);
  }

  const realizedTotal = Math.max(response.totalExitValue ?? 0, 0);
  const deployedTotal = Math.max(response.totalInvested ?? 0, 0);
  const lastIndex = Math.max(response.trends.length - 1, 1);

  return response.trends.map((entry, index) => {
    const progress = index / lastIndex;
    const realizedValue = Math.round(realizedTotal * progress);
    const portfolioValue = Math.max(entry.nav ?? 0, 0);

    return {
      date: formatQuarterLabel(entry.date, `Period ${index + 1}`),
      portfolioValue,
      realizedValue,
      unrealizedValue: Math.max(portfolioValue - realizedValue, 0),
      deployedCapital: Math.round(deployedTotal * progress),
      tvpi: Number((entry.tvpi ?? 0).toFixed(2)),
    };
  });
}

function getSnapshotForReads(fundId?: string | null): FundAnalyticsSnapshot {
  const key = normalizeFundId(fundId);
  if (isMockMode('analytics')) {
    return getMockSnapshot(key);
  }

  return clone(
    apiFundAnalyticsSnapshotCache.get(key)
    ?? latestApiFundAnalyticsSnapshot
    ?? getMockSnapshot(key)
  );
}

export async function fetchFundAnalyticsSnapshot(
  fundId?: string | null
): Promise<FundAnalyticsSnapshot> {
  const key = normalizeFundId(fundId);
  if (isMockMode('analytics')) {
    const snapshot = getMockSnapshot(key);
    apiFundAnalyticsSnapshotCache.set(key, snapshot);
    latestApiFundAnalyticsSnapshot = snapshot;
    return clone(snapshot);
  }

  if (key === 'all') {
    const fallback = apiFundAnalyticsSnapshotCache.get(key) ?? getMockSnapshot(key);
    return clone(fallback);
  }

  try {
    const [
      performance,
      benchmark,
      jCurve,
      cohortsVintage,
      cohortsSector,
      cohortsStage,
      concentration,
      deployment,
      valuationTrendsResponse,
    ] = await Promise.all([
      requestJson<ApiFundPerformance>(`/funds/${key}/analytics/performance`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch fund performance',
      }),
      requestJson<ApiBenchmarkResponse>(`/funds/${key}/analytics/benchmark`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch benchmark data',
      }),
      requestJson<ApiJCurvePoint[]>(`/funds/${key}/analytics/j-curve`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch J-curve data',
      }),
      requestJson<ApiCohortPoint[]>(`/funds/${key}/analytics/cohorts`, {
        method: 'GET',
        query: { groupBy: 'vintage' },
        fallbackMessage: 'Failed to fetch vintage cohorts',
      }),
      requestJson<ApiCohortPoint[]>(`/funds/${key}/analytics/cohorts`, {
        method: 'GET',
        query: { groupBy: 'sector' },
        fallbackMessage: 'Failed to fetch sector cohorts',
      }),
      requestJson<ApiCohortPoint[]>(`/funds/${key}/analytics/cohorts`, {
        method: 'GET',
        query: { groupBy: 'stage' },
        fallbackMessage: 'Failed to fetch stage cohorts',
      }),
      requestJson<ApiConcentrationResponse>(`/funds/${key}/analytics/concentration`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch concentration metrics',
      }),
      requestJson<ApiDeploymentResponse>(`/funds/${key}/analytics/deployment`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch deployment pacing',
      }),
      requestJson<ApiValuationTrendsResponse>(`/funds/${key}/analytics/valuation-trends`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch valuation trends',
      }),
    ]);

    const mappedFundMetrics = mapFundMetricsResponse(key, performance);
    const snapshot: FundAnalyticsSnapshot = {
      fundMetrics: mappedFundMetrics,
      benchmark: mapBenchmarkResponse(benchmark, mappedFundMetrics),
      jCurve: mapJCurveResponse(Array.isArray(jCurve) ? jCurve : []),
      valuationTrends: mapValuationTrendsResponse(valuationTrendsResponse),
      deploymentPacing: mapDeploymentResponse(deployment),
      concentration: mapConcentrationResponse(concentration, key),
      cohortsVintage: mapCohortsResponse(Array.isArray(cohortsVintage) ? cohortsVintage : []),
      cohortsSector: mapCohortsResponse(Array.isArray(cohortsSector) ? cohortsSector : []),
      cohortsStage: mapCohortsResponse(Array.isArray(cohortsStage) ? cohortsStage : []),
    };

    apiFundAnalyticsSnapshotCache.set(key, snapshot);
    latestApiFundAnalyticsSnapshot = snapshot;
    return clone(snapshot);
  } catch {
    const fallback = clone(
      apiFundAnalyticsSnapshotCache.get(key)
      ?? latestApiFundAnalyticsSnapshot
      ?? getMockSnapshot(key)
    );
    return fallback;
  }
}

export function getJCurveData(fundId?: string): JCurveDataPoint[] {
  return clone(getSnapshotForReads(fundId).jCurve);
}

export function getValuationTrends(fundId?: string) {
  return clone(getSnapshotForReads(fundId).valuationTrends);
}

export function getCurrentFundMetrics(fundId?: string): FundMetrics {
  return clone(getSnapshotForReads(fundId).fundMetrics);
}

export function getBenchmarkData(_fundId?: string) {
  return clone(getSnapshotForReads(_fundId).benchmark);
}

export function getDeploymentPacing(fundId?: string) {
  return clone(getSnapshotForReads(fundId).deploymentPacing);
}

export function getConcentrationRiskMetrics(fundId?: string) {
  return clone(getSnapshotForReads(fundId).concentration);
}

export function getCohortsByVintage(fundId?: string): CohortPerformance[] {
  return clone(getSnapshotForReads(fundId).cohortsVintage);
}

export function getCohortsBySector(fundId?: string): CohortPerformance[] {
  return clone(getSnapshotForReads(fundId).cohortsSector);
}

export function getCohortsByStage(fundId?: string): CohortPerformance[] {
  return clone(getSnapshotForReads(fundId).cohortsStage);
}

export function clearFundAnalyticsSnapshotCache(): void {
  apiFundAnalyticsSnapshotCache = new Map<string, FundAnalyticsSnapshot>();
  latestApiFundAnalyticsSnapshot = null;
}
