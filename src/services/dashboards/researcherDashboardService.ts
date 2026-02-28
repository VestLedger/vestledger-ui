import { isMockMode } from '@/config/data-mode';
import {
  researcherDashboardMetrics,
  researcherRecentReports,
  researcherTrendingTopics,
} from '@/data/seeds/dashboards/researcher-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeTrendSentiment(value: unknown): 'Hot' | 'Rising' | 'Mixed' | 'Stable' {
  const normalized = readString(value).toLowerCase();
  if (normalized === 'hot') return 'Hot';
  if (normalized === 'rising' || normalized === 'up') return 'Rising';
  if (normalized === 'mixed') return 'Mixed';
  return 'Stable';
}

export async function getResearcherDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: researcherDashboardMetrics, recentReports: researcherRecentReports, trendingTopics: researcherTrendingTopics };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/researcher'),
    { fallbackMessage: 'Failed to fetch researcher dashboard' }
  );

  const apiData: Record<string, unknown> = isRecord(result) ? result : {};
  const metricsSource = isRecord(apiData.metrics) ? apiData.metrics : {};
  const sectorAnalysis = Array.isArray(apiData.sectorAnalysis)
    ? apiData.sectorAnalysis.filter(isRecord)
    : [];
  const topPerformers = Array.isArray(apiData.topPerformers)
    ? apiData.topPerformers.filter(isRecord)
    : [];
  const recentReportsApi = Array.isArray(apiData.recentReports)
    ? apiData.recentReports.filter(isRecord)
    : [];
  const trendingTopicsApi = Array.isArray(apiData.trendingTopics)
    ? apiData.trendingTopics.filter(isRecord)
    : [];

  const totalCompaniesAnalyzed = readNumber(
    metricsSource.totalCompaniesAnalyzed,
    sectorAnalysis.reduce((sum, item) => sum + readNumber(item.companies), 0),
  );
  const sectorsTracked = readNumber(metricsSource.sectorsTracked, sectorAnalysis.length);
  const trendsIdentified = readNumber(metricsSource.trendsIdentified, topPerformers.length || trendingTopicsApi.length);
  const reportsGenerated = readNumber(metricsSource.reportsGenerated, recentReportsApi.length || 24);

  const metrics = researcherDashboardMetrics.map((metric) => ({ ...metric }));
  if (metrics[0]) metrics[0].value = String(reportsGenerated);
  if (metrics[1]) metrics[1].value = String(sectorsTracked);
  if (metrics[2]) metrics[2].value = String(trendsIdentified);
  if (metrics[3]) metrics[3].value = String(Math.max(0, Math.round((totalCompaniesAnalyzed / Math.max(sectorsTracked, 1)) * 10)));

  const normalizedRecentReports = recentReportsApi
    .map((report) => ({
      name: readString(report.name, readString(report.title, 'Research report')),
      type: readString(report.type, 'Market'),
      date: readString(report.date, 'Recently'),
      status: readString(report.status, 'Published'),
    }))
    .filter((report) => report.name.length > 0);

  const normalizedTrendingTopics = (trendingTopicsApi.length > 0 ? trendingTopicsApi : sectorAnalysis)
    .map((topic) => {
      const mentions = readNumber(topic.mentions, readNumber(topic.companies, 0));
      const trend = readString(topic.trend, mentions > 10 ? 'up' : 'stable');
      const growth = readNumber(topic.change, mentions);
      const sign = growth > 0 ? '+' : '';

      return {
        topic: readString(topic.topic, readString(topic.sector, 'Topic')),
        sentiment: normalizeTrendSentiment(topic.sentiment ?? trend),
        change: readString(topic.change, `${sign}${Math.round(growth)}%`),
      };
    })
    .filter((topic) => topic.topic.length > 0);

  return {
    metrics,
    recentReports: normalizedRecentReports.length > 0 ? normalizedRecentReports : researcherRecentReports,
    trendingTopics: normalizedTrendingTopics.length > 0 ? normalizedTrendingTopics : researcherTrendingTopics,
  };
}
