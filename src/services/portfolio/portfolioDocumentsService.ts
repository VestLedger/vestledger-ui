import { isMockMode } from '@/config/data-mode';
import {
  portfolioDocumentCategories,
  portfolioDocumentCompanies,
  portfolioDocuments,
  type PortfolioDocument,
  type PortfolioDocumentCategory,
  type PortfolioDocumentCompany,
} from '@/data/mocks/portfolio/documents';
import { fetchPortfolioSnapshot } from '@/services/portfolio/portfolioDataService';
import { requestJson } from '@/services/shared/httpClient';

export type {
  PortfolioDocument,
  PortfolioDocumentCategory,
  PortfolioDocumentCompany,
} from '@/data/mocks/portfolio/documents';

type ApiDocument = {
  id: string;
  name: string;
  category?: string;
  type?: string;
  size?: number;
  uploadedBy?: string;
  uploadedDate?: string;
  lastModifiedBy?: string;
  lastModified?: string;
  createdAt?: string;
  fundId?: string;
  dealName?: string;
  requiresSignature?: boolean;
  signedBy?: string[];
};

type ApiDocumentsResponse =
  | ApiDocument[]
  | {
      documents?: ApiDocument[];
      folders?: unknown[];
    };

type PortfolioDocumentCategoryMeta = (typeof portfolioDocumentCategories)[number];

type DerivedPortfolioDocumentCompany = PortfolioDocumentCompany & { sourceId: string };

type DocumentStatusDetails = {
  status: PortfolioDocument['status'];
  dueDate?: string;
};

export type PortfolioDocumentsSnapshot = {
  companies: PortfolioDocumentCompany[];
  documents: PortfolioDocument[];
  categories: PortfolioDocumentCategoryMeta[];
};

let apiPortfolioDocumentsSnapshotCache: PortfolioDocumentsSnapshot | null = null;

const clone = <T>(value: T): T => structuredClone(value);

const CATEGORY_BY_API_VALUE: Record<string, PortfolioDocumentCategory> = {
  legal: 'board-materials',
  financial: 'financial-reports',
  tax: 'compliance',
  compliance: 'compliance',
  'investor-relations': 'investor-updates',
  'due-diligence': 'pre-investment-dd',
  portfolio: 'board-materials',
  other: 'board-materials',
};

const EXPECTED_CADENCE_DAYS: Partial<Record<PortfolioDocumentCategory, number>> = {
  'board-materials': 90,
  'financial-reports': 35,
  compliance: 365,
  'investor-updates': 95,
};

function shouldUseMockMode(): boolean {
  return isMockMode('portfolio') || isMockMode('documents');
}

function formatDateLabel(value?: string): string | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateOffset(baseDate: Date, offsetDays: number): string {
  const dueDate = new Date(baseDate);
  dueDate.setDate(baseDate.getDate() + offsetDays);
  return dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(sizeInBytes?: number): string | undefined {
  if (!sizeInBytes || sizeInBytes <= 0) return undefined;

  if (sizeInBytes >= 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (sizeInBytes >= 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  }

  return `${sizeInBytes} B`;
}

function daysSince(date: Date): number {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / msPerDay));
}

function mapDocumentCategory(apiDocument: ApiDocument): PortfolioDocumentCategory {
  const normalizedCategory = apiDocument.category?.toLowerCase() ?? '';
  const normalizedName = apiDocument.name.toLowerCase();

  if (
    normalizedName.includes('board')
    || normalizedName.includes('minutes')
    || normalizedName.includes('consent')
  ) {
    return 'board-materials';
  }

  if (
    normalizedName.includes('financial')
    || normalizedName.includes('budget')
    || normalizedName.includes('cash flow')
    || normalizedName.includes('arr')
  ) {
    return 'financial-reports';
  }

  if (
    normalizedName.includes('soc')
    || normalizedName.includes('audit')
    || normalizedName.includes('compliance')
    || normalizedName.includes('insurance')
    || normalizedName.includes('tax')
  ) {
    return 'compliance';
  }

  if (
    normalizedName.includes('investor')
    || normalizedName.includes('lp ')
    || normalizedName.includes('letter')
    || normalizedName.includes('update')
  ) {
    return 'investor-updates';
  }

  if (
    normalizedName.includes('diligence')
    || normalizedName.includes('ic memo')
    || normalizedName.includes('investment committee')
  ) {
    return 'pre-investment-dd';
  }

  return CATEGORY_BY_API_VALUE[normalizedCategory] ?? 'board-materials';
}

function mapFrequency(
  category: PortfolioDocumentCategory
): PortfolioDocument['frequency'] | undefined {
  if (category === 'financial-reports') return 'monthly';
  if (category === 'board-materials' || category === 'investor-updates') return 'quarterly';
  if (category === 'compliance') return 'annual';
  if (category === 'pre-investment-dd') return 'one-time';
  return undefined;
}

function deriveDocumentStatus(
  apiDocument: ApiDocument,
  category: PortfolioDocumentCategory
): DocumentStatusDetails {
  const uploadedDate =
    apiDocument.uploadedDate
    ?? apiDocument.lastModified
    ?? apiDocument.createdAt;

  if (!uploadedDate) {
    return {
      status: 'awaiting-upload',
      dueDate: formatDateOffset(new Date(), 14),
    };
  }

  const parsedUploadDate = new Date(uploadedDate);
  if (Number.isNaN(parsedUploadDate.getTime())) {
    return { status: 'current' };
  }

  if (apiDocument.requiresSignature && (apiDocument.signedBy?.length ?? 0) === 0) {
    return { status: 'pending-review' };
  }

  const ageDays = daysSince(parsedUploadDate);
  if (category === 'pre-investment-dd') {
    return ageDays > 730 ? { status: 'optional' } : { status: 'current' };
  }

  const cadenceDays = EXPECTED_CADENCE_DAYS[category];
  if (!cadenceDays) return { status: 'current' };

  if (ageDays > cadenceDays + 30) {
    return {
      status: 'overdue',
      dueDate: formatDateOffset(parsedUploadDate, cadenceDays),
    };
  }

  if (ageDays > cadenceDays) {
    return {
      status: 'due-soon',
      dueDate: formatDateOffset(parsedUploadDate, cadenceDays),
    };
  }

  return { status: 'current' };
}

function stringHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildFallbackCompanies(): DerivedPortfolioDocumentCompany[] {
  return clone(portfolioDocumentCompanies).map((company) => ({
    ...company,
    sourceId: `mock-company-${company.id}`,
  }));
}

async function buildCompaniesFromPortfolio(
  fundId: string
): Promise<DerivedPortfolioDocumentCompany[]> {
  const portfolioSnapshot = await fetchPortfolioSnapshot(fundId);
  if (portfolioSnapshot.companies.length === 0) {
    return buildFallbackCompanies();
  }

  return portfolioSnapshot.companies.map((company, index) => ({
    id: index + 1,
    sourceId: company.id,
    name: company.companyName,
    sector: company.sector,
    stage: company.stage,
    overdueCount: 0,
    pendingCount: 0,
  }));
}

function pickCompanyForDocument(
  apiDocument: ApiDocument,
  companies: DerivedPortfolioDocumentCompany[]
): DerivedPortfolioDocumentCompany {
  if (companies.length === 0) {
    return buildFallbackCompanies()[0];
  }

  const nameCandidates = normalizeText(
    `${apiDocument.name} ${apiDocument.dealName ?? ''}`
  );
  const directMatch = companies.find((company) =>
    nameCandidates.includes(normalizeText(company.name))
  );
  if (directMatch) return directMatch;

  const hashInput = `${apiDocument.id}-${apiDocument.name}`;
  const index = stringHash(hashInput) % companies.length;
  return companies[index];
}

function mapApiDocument(
  apiDocument: ApiDocument,
  index: number,
  companies: DerivedPortfolioDocumentCompany[]
): PortfolioDocument {
  const category = mapDocumentCategory(apiDocument);
  const statusDetails = deriveDocumentStatus(apiDocument, category);
  const assignedCompany = pickCompanyForDocument(apiDocument, companies);

  return {
    id: index + 1,
    name: apiDocument.name,
    category,
    status: statusDetails.status,
    companyId: assignedCompany.id,
    companyName: assignedCompany.name,
    uploadedBy: apiDocument.uploadedBy ?? apiDocument.lastModifiedBy,
    uploadedDate: formatDateLabel(
      apiDocument.uploadedDate ?? apiDocument.lastModified ?? apiDocument.createdAt
    ),
    dueDate: statusDetails.dueDate,
    size: formatFileSize(apiDocument.size),
    frequency: mapFrequency(category),
  };
}

function applyCompanyStatusCounts(
  companies: DerivedPortfolioDocumentCompany[],
  documents: PortfolioDocument[]
): PortfolioDocumentCompany[] {
  const counts = new Map<number, { overdue: number; pending: number }>();

  for (const document of documents) {
    const current = counts.get(document.companyId) ?? { overdue: 0, pending: 0 };
    if (document.status === 'overdue') current.overdue += 1;
    if (document.status === 'pending-review') current.pending += 1;
    counts.set(document.companyId, current);
  }

  return companies.map((company) => {
    const count = counts.get(company.id) ?? { overdue: 0, pending: 0 };
    return {
      id: company.id,
      name: company.name,
      sector: company.sector,
      stage: company.stage,
      overdueCount: count.overdue,
      pendingCount: count.pending,
    };
  });
}

async function fetchApiDocuments(fundId: string): Promise<ApiDocument[]> {
  const response = await requestJson<ApiDocumentsResponse>('/documents', {
    method: 'GET',
    query: {
      fundId,
      limit: 200,
      sortBy: 'uploadedDate',
      sortOrder: 'desc',
    },
    fallbackMessage: 'Failed to fetch portfolio documents',
  });

  if (Array.isArray(response)) return response;
  return response.documents ?? [];
}

function getMockPortfolioDocumentsSnapshot(): PortfolioDocumentsSnapshot {
  return {
    companies: clone(portfolioDocumentCompanies),
    documents: clone(portfolioDocuments),
    categories: clone(portfolioDocumentCategories),
  };
}

export async function fetchPortfolioDocumentsSnapshot(
  fundId?: string | null
): Promise<PortfolioDocumentsSnapshot> {
  if (shouldUseMockMode()) {
    const snapshot = getMockPortfolioDocumentsSnapshot();
    apiPortfolioDocumentsSnapshotCache = snapshot;
    return clone(snapshot);
  }

  const normalizedFundId = fundId?.trim();
  if (!normalizedFundId) {
    const fallback = apiPortfolioDocumentsSnapshotCache ?? getMockPortfolioDocumentsSnapshot();
    return clone(fallback);
  }

  try {
    const [companies, apiDocuments] = await Promise.all([
      buildCompaniesFromPortfolio(normalizedFundId),
      fetchApiDocuments(normalizedFundId),
    ]);

    if (apiDocuments.length === 0) {
      const fallback = apiPortfolioDocumentsSnapshotCache ?? getMockPortfolioDocumentsSnapshot();
      return clone(fallback);
    }

    const mappedDocuments = apiDocuments.map((document, index) =>
      mapApiDocument(document, index, companies)
    );
    const snapshot: PortfolioDocumentsSnapshot = {
      companies: applyCompanyStatusCounts(companies, mappedDocuments),
      documents: mappedDocuments,
      categories: clone(portfolioDocumentCategories),
    };

    apiPortfolioDocumentsSnapshotCache = snapshot;
    return clone(snapshot);
  } catch {
    const fallback = apiPortfolioDocumentsSnapshotCache ?? getMockPortfolioDocumentsSnapshot();
    return clone(fallback);
  }
}

export function getPortfolioDocumentsSnapshot(): PortfolioDocumentsSnapshot {
  if (shouldUseMockMode()) return getMockPortfolioDocumentsSnapshot();
  return clone(apiPortfolioDocumentsSnapshotCache ?? getMockPortfolioDocumentsSnapshot());
}

export function clearPortfolioDocumentsSnapshotCache(): void {
  apiPortfolioDocumentsSnapshotCache = null;
}
