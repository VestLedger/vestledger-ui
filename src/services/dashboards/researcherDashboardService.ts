import { isMockMode } from '@/config/data-mode';
import {
  researcherDashboardMetrics,
  researcherRecentReports,
  researcherTrendingTopics,
} from '@/data/mocks/dashboards/researcher-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getResearcherDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: researcherDashboardMetrics, recentReports: researcherRecentReports, trendingTopics: researcherTrendingTopics };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/researcher'),
    { fallbackMessage: 'Failed to fetch researcher dashboard' }
  );

  // Map API response to expected UI structure
  const apiData = (result as unknown) as {
    sectorAnalysis: Array<{ sector: string; companies: number; totalValue: number; percentOfPortfolio: number }>;
    stageDistribution: Array<{ stage: string; companies: number; totalInvestment: number }>;
    vintageAnalysis: Array<{ year: number; companies: number; totalInvestment: number; avgHealth: number }>;
    topPerformers: Array<{ id: string; name: string; sector: string; moic: number; healthScore: number }>;
    atRiskCompanies: Array<{ id: string; name: string; sector: string; healthScore: number; runway: number }>;
  };

  return {
    metrics: {
      totalCompaniesAnalyzed: apiData.sectorAnalysis?.reduce((sum, s) => sum + s.companies, 0) ?? 0,
      sectorsTracked: apiData.sectorAnalysis?.length ?? 0,
      trendsIdentified: apiData.topPerformers?.length ?? 0,
      reportsGenerated: 24, // Hardcoded fallback - not in API yet
    },
    recentReports: researcherRecentReports, // Fallback - not in API yet
    trendingTopics: apiData.sectorAnalysis?.map((s) => ({
      id: s.sector,
      topic: s.sector,
      mentions: s.companies,
      trend: 'up' as const,
    })) ?? researcherTrendingTopics,
  };
}

