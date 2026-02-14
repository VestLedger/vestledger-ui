import { isMockMode } from '@/config/data-mode';
import {
  activeDeals,
  mockDocuments,
  documentCategories,
  fundAnalytics,
  dealAnalyticsData,
} from '@/data/mocks/deal-intelligence/deal-intelligence';
import type { GetDealIntelligenceParams } from '@/store/slices/dealIntelligenceSlice';
import type { PipelineApiDeal } from '@/services/shared/pipelineGateway';
import { fetchPipelineDealsFromApi, formatAmountToMillions } from '@/services/shared/pipelineGateway';
import { requestJson } from '@/services/shared/httpClient';

type DealIntelCategoryProgress = {
  category: DocumentCategory;
  completed: number;
  total: number;
  status: 'completed' | 'in-progress' | 'overdue';
};

interface ApiDocument {
  id: string;
  name: string;
  category?: string;
  size?: number;
  uploadedBy?: string;
  uploadedDate?: string;
  dealId?: string;
  dealName?: string;
}

interface ApiDocumentsResponse {
  documents?: ApiDocument[];
}

const clone = <T>(value: T): T => structuredClone(value);

// Re-export types for consumers
export type {
  ActiveDeal,
  Document,
  DealAnalytics,
  FundAnalytics,
  DocumentCategory,
  DocumentStatus,
  ICStatus,
} from '@/data/mocks/deal-intelligence/deal-intelligence';

type ActiveDeal = import('@/data/mocks/deal-intelligence/deal-intelligence').ActiveDeal;
type Document = import('@/data/mocks/deal-intelligence/deal-intelligence').Document;
type DealAnalytics = import('@/data/mocks/deal-intelligence/deal-intelligence').DealAnalytics;
type FundAnalytics = import('@/data/mocks/deal-intelligence/deal-intelligence').FundAnalytics;
type DocumentCategory = import('@/data/mocks/deal-intelligence/deal-intelligence').DocumentCategory;
type DocumentStatus = import('@/data/mocks/deal-intelligence/deal-intelligence').DocumentStatus;
type ICStatus = import('@/data/mocks/deal-intelligence/deal-intelligence').ICStatus;

const categoryTargets: Record<DocumentCategory, number> = {
  financial: 5,
  legal: 4,
  market: 4,
  team: 3,
  technical: 4,
};

function normalizeName(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function mapDocumentCategory(category?: string): DocumentCategory {
  const normalized = (category ?? '').trim().toLowerCase();

  if (normalized === 'financial' || normalized === 'tax') return 'financial';
  if (normalized === 'legal' || normalized === 'compliance') return 'legal';
  if (normalized === 'market' || normalized === 'investor-relations') return 'market';
  if (normalized === 'team') return 'team';
  return 'technical';
}

function mapDocumentStatus(uploadedDate: string | undefined, index: number): DocumentStatus {
  if (!uploadedDate) {
    const fallbackStatuses: DocumentStatus[] = ['pending', 'in-progress', 'completed'];
    return fallbackStatuses[index % fallbackStatuses.length];
  }

  const uploadedAt = new Date(uploadedDate);
  if (Number.isNaN(uploadedAt.getTime())) return 'pending';

  const ageInDays = Math.floor((Date.now() - uploadedAt.getTime()) / (24 * 60 * 60 * 1000));
  if (ageInDays > 45) return 'overdue';
  if (ageInDays > 21) return 'in-progress';
  return 'completed';
}

function formatUploadedDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDocumentSize(size?: number): string | undefined {
  if (!Number.isFinite(size) || (size ?? 0) <= 0) return undefined;
  const safeSize = size as number;

  if (safeSize >= 1_000_000) {
    return `${(safeSize / 1_000_000).toFixed(1)} MB`;
  }

  return `${Math.round(safeSize / 1_000)} KB`;
}

function deriveICStatus(progress: number, overdueDocs: number): ICStatus {
  if (progress >= 80 && overdueDocs === 0) return 'ready-for-ic';
  if (overdueDocs > 0) return 'docs-overdue';
  if (progress < 40) return 'blocked';
  return 'dd-in-progress';
}

function buildCategoryProgress(documents: Document[]): DealIntelCategoryProgress[] {
  const byCategory = documents.reduce(
    (acc, document) => {
      acc[document.category] = (acc[document.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<DocumentCategory, number>
  );

  return (Object.keys(categoryTargets) as DocumentCategory[]).map((category) => {
    const completed = documents.filter(
      (document) => document.category === category && document.status === 'completed'
    ).length;
    const total = Math.max(categoryTargets[category], byCategory[category] ?? 0);
    const hasOverdue = documents.some(
      (document) => document.category === category && document.status === 'overdue'
    );

    return {
      category,
      completed,
      total,
      status: completed >= total ? 'completed' : hasOverdue ? 'overdue' : 'in-progress',
    };
  });
}

function buildActiveDeal(
  apiDeal: PipelineApiDeal,
  dealId: number,
  documentsForDeal: Document[]
): ActiveDeal {
  const probability = Number.isFinite(apiDeal.probability) ? apiDeal.probability : 0;
  const progress = Math.max(5, Math.min(100, Math.round(probability)));
  const overdueDocs = documentsForDeal.filter((document) => document.status === 'overdue').length;

  return {
    id: dealId,
    name: apiDeal.name,
    stage: apiDeal.stage,
    sector: apiDeal.sector,
    amount: formatAmountToMillions(apiDeal.amount),
    founder: apiDeal.founder,
    progress,
    docsCount: documentsForDeal.length,
    icStatus: deriveICStatus(progress, overdueDocs),
    categoryProgress: buildCategoryProgress(documentsForDeal),
  };
}

function buildDealAnalyticsFromDeal(apiDeal: PipelineApiDeal, dealId: number): DealAnalytics {
  const amount = Math.max(apiDeal.amount, 500_000);
  const probability = Number.isFinite(apiDeal.probability) ? Math.max(5, apiDeal.probability) : 50;
  const arr = Math.round(amount * 0.38);
  const mrr = Math.round(arr / 12);
  const growthRateYoY = Math.max(35, Math.round(probability * 2.1));
  const growthRateMoM = Math.max(4, Math.round(growthRateYoY / 12));
  const burnRate = Math.round(amount * 0.06);
  const runway = Math.max(9, Math.round((amount * 0.8) / Math.max(burnRate, 1)));
  const cac = Math.max(300, Math.round((100 - probability + 20) * 20));
  const ltv = Math.round(cac * (2.5 + probability / 100));
  const totalCustomers = Math.max(40, Math.round(probability * 10));
  const nrr = Math.max(90, Math.min(140, Math.round(95 + probability * 0.35)));

  return {
    dealId,
    financial: {
      revenue: {
        arr,
        mrr,
        growthRateMoM,
        growthRateYoY,
      },
      efficiency: {
        burnRate,
        runway,
        cac,
        ltv,
        ltvCacRatio: Number((ltv / cac).toFixed(1)),
      },
      unitEconomics: {
        grossMargin: Math.max(45, Math.min(88, Math.round(55 + probability * 0.25))),
        contributionMargin: Math.max(30, Math.min(75, Math.round(45 + probability * 0.2))),
        paybackPeriod: Math.max(5, Math.round(18 - probability / 10)),
      },
    },
    market: {
      marketSize: {
        tam: Number((Math.max(2, amount / 350_000_000)).toFixed(1)),
        sam: Number((Math.max(1, amount / 1_000_000_000)).toFixed(1)),
        som: Math.round(Math.max(15, amount / 7_500_000)),
      },
      customers: {
        totalCustomers,
        nps: Math.max(20, Math.min(80, Math.round(probability * 0.75))),
        churnRate: Number((Math.max(1.5, (110 - probability) / 12)).toFixed(1)),
        nrr,
      },
    },
    team: {
      size: Math.max(8, Math.round(probability / 2)),
      founderExperienceScore: Math.max(4, Math.min(10, Math.round(probability / 12))),
    },
  };
}

function buildFundAnalytics(
  apiDeals: PipelineApiDeal[],
  deals: ActiveDeal[]
): FundAnalytics {
  if (deals.length === 0) {
    return {
      dealFlowMetrics: {
        activeDeals: 0,
        avgTimeInDD: 0,
        ddToICConversionRate: 0,
        readyForIC: 0,
      },
      dealDistribution: {
        byStage: [],
        bySector: [],
        bySize: [],
      },
      ddProgress: {
        avgCompletion: 0,
        onTrack: 0,
        atRisk: 0,
        blocked: 0,
      },
    };
  }

  const stageDays: Record<string, number> = {
    Sourced: 7,
    'First Meeting': 14,
    'Due Diligence': 26,
    'Term Sheet': 38,
    Closed: 50,
  };

  const avgTimeInDD = Math.round(
    deals.reduce((sum, deal) => sum + (stageDays[deal.stage] ?? 20), 0) / deals.length
  );

  const readyForIC = deals.filter((deal) => deal.icStatus === 'ready-for-ic').length;
  const onTrack = deals.filter((deal) => deal.progress >= 70).length;
  const atRisk = deals.filter((deal) => deal.progress >= 40 && deal.progress < 70).length;
  const blocked = deals.filter((deal) => deal.progress < 40).length;

  const byStageMap = new Map<string, number>();
  const bySectorMap = new Map<string, number>();
  const bySizeMap = new Map<string, number>();

  for (const deal of apiDeals) {
    byStageMap.set(deal.stage, (byStageMap.get(deal.stage) ?? 0) + 1);
    bySectorMap.set(deal.sector, (bySectorMap.get(deal.sector) ?? 0) + 1);

    const range =
      deal.amount < 2_000_000
        ? '<$2M'
        : deal.amount <= 4_000_000
          ? '$2-4M'
          : '>$4M';
    bySizeMap.set(range, (bySizeMap.get(range) ?? 0) + 1);
  }

  return {
    dealFlowMetrics: {
      activeDeals: deals.length,
      avgTimeInDD,
      ddToICConversionRate: Math.round((readyForIC / deals.length) * 100),
      readyForIC,
    },
    dealDistribution: {
      byStage: Array.from(byStageMap.entries()).map(([stage, count]) => ({ stage, count })),
      bySector: Array.from(bySectorMap.entries()).map(([sector, count]) => ({ sector, count })),
      bySize: Array.from(bySizeMap.entries()).map(([range, count]) => ({ range, count })),
    },
    ddProgress: {
      avgCompletion: Math.round(
        deals.reduce((sum, deal) => sum + deal.progress, 0) / deals.length
      ),
      onTrack,
      atRisk,
      blocked,
    },
  };
}

async function fetchDocumentsForApiMode(): Promise<ApiDocument[]> {
  try {
    const response = await requestJson<ApiDocumentsResponse>('/documents', {
      method: 'GET',
      query: {
        limit: 300,
        sortBy: 'uploadedDate',
        sortOrder: 'desc',
      },
      fallbackMessage: 'Failed to load documents',
    });

    return response.documents ?? [];
  } catch {
    // Deal intelligence can still render without documents while backend document ops are in flight.
    return [];
  }
}

function mapDocumentsToDeals(
  apiDocuments: ApiDocument[],
  dealIdLookup: Map<string, number>,
  dealNameLookup: Map<string, number>,
  dealNameByNumericId: Map<number, string>
): Document[] {
  const mapped: Document[] = [];

  for (let index = 0; index < apiDocuments.length; index += 1) {
    const apiDocument = apiDocuments[index];
    const mappedDealId =
      (apiDocument.dealId ? dealIdLookup.get(apiDocument.dealId) : undefined) ??
      dealNameLookup.get(normalizeName(apiDocument.dealName));

    if (!mappedDealId) continue;

    mapped.push({
      id: index + 1,
      name: apiDocument.name,
      category: mapDocumentCategory(apiDocument.category),
      status: mapDocumentStatus(apiDocument.uploadedDate, index),
      dealId: mappedDealId,
      dealName: dealNameByNumericId.get(mappedDealId) ?? apiDocument.dealName ?? 'Unknown Deal',
      uploadedBy: apiDocument.uploadedBy,
      uploadedDate: formatUploadedDate(apiDocument.uploadedDate),
      size: formatDocumentSize(apiDocument.size),
    });
  }

  return mapped;
}

export async function getDealIntelligenceData(
  params: GetDealIntelligenceParams
): Promise<{
  activeDeals: ActiveDeal[];
  dealAnalyticsData: DealAnalytics[];
  documentCategories: typeof documentCategories;
  fundAnalytics: FundAnalytics;
  documents: Document[];
}> {
  if (isMockMode('dealIntelligence')) {
    // Mock mode: Accept params but return static data
    // Future: Apply pagination/sorting
    return {
      activeDeals: clone(activeDeals),
      dealAnalyticsData: clone(dealAnalyticsData),
      documentCategories: clone(documentCategories),
      fundAnalytics: clone(fundAnalytics),
      documents: clone(mockDocuments),
    };
  }

  const apiDeals = (await fetchPipelineDealsFromApi({
    fundId: params.fundId,
    search: params.search,
    limit: params.limit,
    offset: params.offset,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })).filter((deal) => (deal.outcome ?? 'active') === 'active');

  const dealIdLookup = new Map<string, number>();
  const dealNameLookup = new Map<string, number>();
  const dealNameByNumericId = new Map<number, string>();

  apiDeals.forEach((deal, index) => {
    const numericId = index + 1;
    dealIdLookup.set(deal.id, numericId);
    dealNameLookup.set(normalizeName(deal.name), numericId);
    dealNameByNumericId.set(numericId, deal.name);
  });

  const apiDocuments = await fetchDocumentsForApiMode();
  const mappedDocuments = mapDocumentsToDeals(
    apiDocuments,
    dealIdLookup,
    dealNameLookup,
    dealNameByNumericId
  );

  const activeDealsFromApi = apiDeals.map((deal, index) =>
    buildActiveDeal(
      deal,
      index + 1,
      mappedDocuments.filter((document) => document.dealId === index + 1)
    )
  );

  const analyticsFromApi = apiDeals.map((deal, index) =>
    buildDealAnalyticsFromDeal(deal, index + 1)
  );

  return {
    activeDeals: activeDealsFromApi,
    dealAnalyticsData: analyticsFromApi,
    documentCategories: clone(documentCategories),
    fundAnalytics: buildFundAnalytics(apiDeals, activeDealsFromApi),
    documents: mappedDocuments,
  };
}
