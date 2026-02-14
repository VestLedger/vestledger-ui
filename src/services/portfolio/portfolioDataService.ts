import { isMockMode } from '@/config/data-mode';
import {
  assetAllocation,
  performanceData,
  portfolioCompanies,
  portfolioSummary,
  portfolioUpdates,
  type AssetAllocation,
  type PortfolioCompanyMetrics,
  type PortfolioUpdate,
} from '@/data/mocks/mock-portfolio-data';
import { requestJson } from '@/services/shared/httpClient';

export type {
  AssetAllocation,
  PortfolioCompanyMetrics,
  PortfolioUpdate,
} from '@/data/mocks/mock-portfolio-data';

type ApiPortfolioCompany = {
  id: string;
  name: string;
  sector: string;
  stage: string;
  investmentDate: string;
  initialInvestment: number;
  currentValue: number;
  ownership: number;
  health?: number;
  healthChange?: number;
  runway?: number;
  burnRate?: number;
  status?: 'active' | 'exited' | 'written-off';
  createdAt?: string;
  updatedAt?: string;
};

type ApiPortfolioResponse =
  | ApiPortfolioCompany[]
  | {
      data?: ApiPortfolioCompany[];
      meta?: unknown;
    };

type ApiPortfolioHealth = {
  summary?: {
    totalCompanies?: number;
    atRiskCount?: number;
    healthyCount?: number;
  };
};

type PortfolioSummary = typeof portfolioSummary;
type PortfolioPerformancePoint = (typeof performanceData)[number];

export type PortfolioPageMetricsSnapshot = {
  totalCompanies: number;
  atRiskCompanies: number;
  pendingUpdates: number;
};

export type PortfolioSnapshot = {
  companies: PortfolioCompanyMetrics[];
  updates: PortfolioUpdate[];
  summary: PortfolioSummary;
  performance: PortfolioPerformancePoint[];
  allocation: AssetAllocation[];
  pageMetrics: PortfolioPageMetricsSnapshot;
  healthyCompanies: number;
};

let apiPortfolioSnapshotCache: PortfolioSnapshot | null = null;

const clone = <T>(value: T): T => structuredClone(value);

function formatStage(stage: string): string {
  return stage
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function formatDateOnly(value?: string): string {
  if (!value) return new Date().toISOString().slice(0, 10);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);

  return parsed.toISOString().slice(0, 10);
}

function mapApiToPortfolioCompanyMetrics(api: ApiPortfolioCompany): PortfolioCompanyMetrics {
  const initialInvestment = Math.max(api.initialInvestment ?? 0, 0);
  const currentValue = Math.max(api.currentValue ?? 0, 0);
  const ownership = Math.max(api.ownership ?? 0, 0);
  const effectiveValue = (currentValue * ownership) / 100;
  const moic = initialInvestment > 0 ? effectiveValue / initialInvestment : 0;
  const healthScore = Math.round(api.health ?? 72);
  const status =
    api.status === 'written-off'
      ? 'at-risk'
      : api.status === 'exited'
        ? 'exited'
        : healthScore < 62
          ? 'at-risk'
          : 'active';

  const arr = Math.round(effectiveValue * 0.22);
  const arrGrowth = Math.max(8, Math.min(260, Math.round(healthScore * 1.6)));
  const burnRate = Math.max(0, Math.round(api.burnRate ?? arr * 0.35));
  const runway = Math.max(4, Math.round(api.runway ?? (burnRate > 0 ? (effectiveValue * 0.4) / burnRate : 16)));
  const totalRaised = Math.round(currentValue * 0.42);
  const lastRoundAmount = Math.max(initialInvestment, Math.round(totalRaised * 0.45));
  const irr = Math.max(-20, Math.min(120, Math.round((moic - 1) * 34 + (api.healthChange ?? 0) * 0.4)));

  return {
    id: api.id,
    companyName: api.name,
    sector: api.sector,
    stage: formatStage(api.stage),
    investmentDate: formatDateOnly(api.investmentDate),
    initialInvestment,
    currentValuation: currentValue,
    ownership,
    arr,
    arrGrowth,
    burnRate,
    runway,
    headcount: Math.max(8, Math.round(healthScore * 1.6)),
    totalRaised,
    lastRoundDate: formatDateOnly(api.updatedAt ?? api.createdAt ?? api.investmentDate),
    lastRoundAmount,
    lastRoundValuation: currentValue,
    moic: Number(moic.toFixed(2)),
    irr,
    status,
    healthScore,
    lastUpdateDate: formatDateOnly(api.updatedAt ?? api.createdAt),
  };
}

function derivePortfolioSummary(companies: PortfolioCompanyMetrics[]): PortfolioSummary {
  const totalCompanies = companies.length;
  const totalInvested = companies.reduce((sum, company) => sum + company.initialInvestment, 0);
  const totalCurrentValue = companies.reduce(
    (sum, company) => sum + (company.currentValuation * company.ownership) / 100,
    0
  );
  const averageMOIC =
    totalCompanies > 0
      ? companies.reduce((sum, company) => sum + company.moic, 0) / totalCompanies
      : 0;
  const averageIRR =
    totalCompanies > 0
      ? companies.reduce((sum, company) => sum + company.irr, 0) / totalCompanies
      : 0;
  const averageHealthScore =
    totalCompanies > 0
      ? companies.reduce((sum, company) => sum + company.healthScore, 0) / totalCompanies
      : 0;

  return {
    totalCompanies,
    totalInvested,
    totalCurrentValue,
    averageMOIC,
    averageIRR,
    activeCompanies: companies.filter((company) => company.status === 'active').length,
    averageHealthScore,
  };
}

function derivePortfolioAllocation(companies: PortfolioCompanyMetrics[]): AssetAllocation[] {
  const totals = new Map<string, { amount: number; count: number }>();
  const totalInvested = companies.reduce((sum, company) => sum + company.initialInvestment, 0);

  for (const company of companies) {
    const current = totals.get(company.sector) ?? { amount: 0, count: 0 };
    current.amount += company.initialInvestment;
    current.count += 1;
    totals.set(company.sector, current);
  }

  return Array.from(totals.entries())
    .map(([sector, value]) => ({
      sector,
      amount: value.amount,
      count: value.count,
      percentage: totalInvested > 0 ? (value.amount / totalInvested) * 100 : 0,
    }))
    .sort((left, right) => right.amount - left.amount);
}

function derivePortfolioPerformance(companies: PortfolioCompanyMetrics[]): PortfolioPerformancePoint[] {
  const totalCurrentValue = companies.reduce(
    (sum, company) => sum + (company.currentValuation * company.ownership) / 100,
    0
  );
  const deployed = companies.reduce((sum, company) => sum + company.initialInvestment, 0);
  const points: PortfolioPerformancePoint[] = [];
  const end = new Date();

  for (let monthOffset = 11; monthOffset >= 0; monthOffset -= 1) {
    const date = new Date(end.getFullYear(), end.getMonth() - monthOffset, 1);
    const progress = (11 - monthOffset) / 11;
    points.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      portfolioValue: Math.round(totalCurrentValue * (0.72 + progress * 0.28)),
      deployed: Math.round(deployed * (0.63 + progress * 0.37)),
    });
  }

  return points;
}

function derivePortfolioUpdates(companies: PortfolioCompanyMetrics[]): PortfolioUpdate[] {
  const sorted = [...companies].sort((left, right) =>
    right.lastUpdateDate.localeCompare(left.lastUpdateDate)
  );

  return sorted.slice(0, 10).map((company, index) => {
    let type: PortfolioUpdate['type'] = 'product';
    let title = `${company.companyName} Portfolio Update`;
    let description = `${company.companyName} remains on the active monitoring track.`;

    if (company.status === 'at-risk') {
      type = 'financial';
      title = `${company.companyName}: Performance Attention Needed`;
      description = `Runway at ${company.runway} months with health score ${company.healthScore}.`;
    } else if (company.arrGrowth >= 160) {
      type = 'milestone';
      title = `${company.companyName}: Growth Milestone`;
      description = `ARR growth reached ${company.arrGrowth}% with current MOIC ${company.moic.toFixed(1)}x.`;
    } else if (company.moic >= 2.2) {
      type = 'funding';
      title = `${company.companyName}: Valuation Expansion`;
      description = `Current valuation now ${company.currentValuation.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })}.`;
    } else if (company.headcount >= 80) {
      type = 'team';
      title = `${company.companyName}: Team Scale-Up`;
      description = `Headcount expanded to ${company.headcount} with ${company.sector} execution focus.`;
    }

    return {
      id: `api-update-${company.id}-${index}`,
      companyId: company.id,
      companyName: company.companyName,
      type,
      title,
      description,
      date: company.lastUpdateDate,
      author: 'Portfolio Ops',
    };
  });
}

function buildPortfolioSnapshot(
  companies: PortfolioCompanyMetrics[],
  healthSummary?: ApiPortfolioHealth['summary']
): PortfolioSnapshot {
  const summary = derivePortfolioSummary(companies);
  const updates = derivePortfolioUpdates(companies);
  const atRiskFromData = companies.filter(
    (company) => company.status === 'at-risk' || company.healthScore < 82
  ).length;
  const atRiskCompanies = healthSummary?.atRiskCount ?? atRiskFromData;
  const totalCompanies = healthSummary?.totalCompanies ?? summary.totalCompanies;
  const healthyCompanies = Math.max(
    0,
    healthSummary?.healthyCount ?? totalCompanies - atRiskCompanies
  );

  return {
    companies,
    updates,
    summary,
    performance: derivePortfolioPerformance(companies),
    allocation: derivePortfolioAllocation(companies),
    pageMetrics: {
      totalCompanies,
      atRiskCompanies,
      pendingUpdates: updates.length,
    },
    healthyCompanies,
  };
}

function getMockPortfolioSnapshot(): PortfolioSnapshot {
  const atRiskCompanies = portfolioCompanies.filter(
    (company) => company.status === 'at-risk' || company.healthScore < 82
  ).length;
  const totalCompanies = portfolioCompanies.length;

  return {
    companies: clone(portfolioCompanies),
    updates: clone(portfolioUpdates),
    summary: clone(portfolioSummary),
    performance: clone(performanceData),
    allocation: clone(assetAllocation),
    pageMetrics: {
      totalCompanies,
      atRiskCompanies,
      pendingUpdates: portfolioUpdates.length,
    },
    healthyCompanies: totalCompanies - atRiskCompanies,
  };
}

async function fetchApiPortfolioCompanies(fundId: string): Promise<ApiPortfolioCompany[]> {
  const response = await requestJson<ApiPortfolioResponse>(`/funds/${fundId}/portfolio`, {
    method: 'GET',
    query: {
      limit: 200,
      sortBy: 'currentValue',
      sortOrder: 'desc',
    },
    fallbackMessage: 'Failed to fetch portfolio companies',
  });

  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

async function fetchApiPortfolioHealth(fundId: string): Promise<ApiPortfolioHealth | null> {
  try {
    return await requestJson<ApiPortfolioHealth>(`/funds/${fundId}/portfolio/health`, {
      method: 'GET',
      fallbackMessage: 'Failed to fetch portfolio health summary',
    });
  } catch {
    return null;
  }
}

export async function fetchPortfolioSnapshot(fundId?: string | null): Promise<PortfolioSnapshot> {
  if (isMockMode('portfolio')) {
    const snapshot = getMockPortfolioSnapshot();
    apiPortfolioSnapshotCache = snapshot;
    return clone(snapshot);
  }

  const normalizedFundId = fundId?.trim();
  if (!normalizedFundId) {
    const fallback = apiPortfolioSnapshotCache ?? getMockPortfolioSnapshot();
    return clone(fallback);
  }

  try {
    const [apiCompanies, health] = await Promise.all([
      fetchApiPortfolioCompanies(normalizedFundId),
      fetchApiPortfolioHealth(normalizedFundId),
    ]);

    const companies = apiCompanies.map(mapApiToPortfolioCompanyMetrics);
    const snapshot = buildPortfolioSnapshot(companies, health?.summary);
    apiPortfolioSnapshotCache = snapshot;
    return clone(snapshot);
  } catch {
    const fallback = apiPortfolioSnapshotCache ?? getMockPortfolioSnapshot();
    return clone(fallback);
  }
}

export async function fetchPortfolioCompanies(
  fundId?: string | null
): Promise<PortfolioCompanyMetrics[]> {
  const snapshot = await fetchPortfolioSnapshot(fundId);
  return snapshot.companies;
}

export function getPortfolioCompanies(): PortfolioCompanyMetrics[] {
  if (isMockMode('portfolio')) return clone(portfolioCompanies);
  return clone(apiPortfolioSnapshotCache?.companies ?? portfolioCompanies);
}

export function getPortfolioUpdates(): PortfolioUpdate[] {
  if (isMockMode('portfolio')) return clone(portfolioUpdates);
  return clone(apiPortfolioSnapshotCache?.updates ?? portfolioUpdates);
}

export function getPortfolioSummary(): PortfolioSummary {
  if (isMockMode('portfolio')) return clone(portfolioSummary);
  return clone(apiPortfolioSnapshotCache?.summary ?? portfolioSummary);
}

export function getPortfolioPerformanceData(): PortfolioPerformancePoint[] {
  if (isMockMode('portfolio')) return clone(performanceData);
  return clone(apiPortfolioSnapshotCache?.performance ?? performanceData);
}

export function getPortfolioAssetAllocation(): AssetAllocation[] {
  if (isMockMode('portfolio')) return clone(assetAllocation);
  return clone(apiPortfolioSnapshotCache?.allocation ?? assetAllocation);
}

export function getPortfolioPageMetricsSnapshot(): PortfolioPageMetricsSnapshot {
  if (isMockMode('portfolio')) return getMockPortfolioSnapshot().pageMetrics;
  return clone(apiPortfolioSnapshotCache?.pageMetrics ?? getMockPortfolioSnapshot().pageMetrics);
}

export function getPortfolioHealthyCompaniesCount(): number {
  if (isMockMode('portfolio')) return getMockPortfolioSnapshot().healthyCompanies;
  return apiPortfolioSnapshotCache?.healthyCompanies ?? getMockPortfolioSnapshot().healthyCompanies;
}

export function clearPortfolioSnapshotCache(): void {
  apiPortfolioSnapshotCache = null;
}
