import { isMockMode } from '@/config/data-mode';
import {
  mockFilingDeadline,
  mockPortfolioTax,
  mockTaxDocuments,
  mockTaxSummaries,
  type PortfolioCompanyTax,
  type TaxDocument,
  type TaxSummary,
} from '@/data/mocks/back-office/tax-center';
import { requestJson } from '@/services/shared/httpClient';

type ApiListResponse<TItem> =
  | {
      data?: TItem[];
      meta?: unknown;
    }
  | TItem[];

type ApiTaxDeadlineResponse =
  | {
      filingDeadline?: string;
      deadline?: string;
      taxDeadline?: string;
      dueDate?: string;
    }
  | string;

type ApiTaxDocumentRecord = {
  id?: string;
  documentType?: string;
  type?: string;
  taxYear?: number;
  recipientType?: string;
  recipientName?: string;
  status?: string;
  generatedDate?: string | null;
  sentDate?: string | null;
  amount?: number;
};

type ApiTaxSummaryRecord = {
  id?: string;
  fundName?: string;
  taxYear?: number;
  k1sIssued?: number;
  k1Issued?: number;
  k1sTotal?: number;
  k1Total?: number;
  form1099Issued?: number;
  form1099Total?: number;
  estimatedTaxesPaid?: number;
  totalDistributions?: number;
  filingDeadline?: string;
  deadline?: string;
};

type ApiPortfolioTaxRecord = {
  id?: string;
  companyName?: string;
  ownership?: number;
  taxClassification?: string;
  k1Required?: boolean;
  requiresK1?: boolean;
  k1Received?: boolean;
  receivedK1?: boolean;
  k1ReceivedDate?: string | null;
  receivedDate?: string | null;
  contactEmail?: string;
};

type TaxCenterSnapshot = {
  filingDeadline: Date;
  taxDocuments: TaxDocument[];
  taxSummaries: TaxSummary[];
  portfolioTax: PortfolioCompanyTax[];
};

const clone = <T>(value: T): T => structuredClone(value);
const nowIsoDate = () => new Date().toISOString().slice(0, 10);

let apiTaxCenterSnapshotCache: TaxCenterSnapshot | null = null;

function extractApiList<TItem>(response: ApiListResponse<TItem>): TItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === 'yes' || normalized === '1') return true;
    if (normalized === 'false' || normalized === 'no' || normalized === '0') return false;
  }
  return fallback;
}

function asDateOnly(value?: string | null, fallback = nowIsoDate()): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

function asOptionalDateOnly(value?: string | null): string | null {
  if (!value) return null;
  return asDateOnly(value);
}

function asDateValue(value?: string | null, fallback = mockFilingDeadline): Date {
  if (!value) return new Date(fallback);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date(fallback);
  return parsed;
}

function normalizeTaxDocumentStatus(rawStatus?: string): TaxDocument['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'sent' || normalized === 'delivered') return 'sent';
  if (normalized === 'filed' || normalized === 'submitted') return 'filed';
  if (normalized === 'ready' || normalized === 'generated') return 'ready';
  return 'draft';
}

function normalizeRecipientType(rawType?: string): TaxDocument['recipientType'] {
  const normalized = rawType?.toLowerCase() ?? '';
  if (normalized.includes('portfolio')) return 'Portfolio Company';
  if (normalized === 'gp' || normalized.includes('general')) return 'GP';
  return 'LP';
}

function mapApiTaxDocument(record: ApiTaxDocumentRecord, index: number): TaxDocument {
  return {
    id: record.id ?? `tax-document-${index + 1}`,
    documentType: record.documentType ?? record.type ?? 'Tax Document',
    taxYear: asNumber(record.taxYear, new Date().getFullYear() - 1),
    recipientType: normalizeRecipientType(record.recipientType),
    recipientName: record.recipientName ?? 'Recipient',
    status: normalizeTaxDocumentStatus(record.status),
    generatedDate: asOptionalDateOnly(record.generatedDate),
    sentDate: asOptionalDateOnly(record.sentDate),
    amount: record.amount,
  };
}

function mapApiTaxSummary(record: ApiTaxSummaryRecord, index: number): TaxSummary {
  const k1sIssued = asNumber(record.k1sIssued ?? record.k1Issued, 0);
  const k1sTotal = Math.max(k1sIssued, asNumber(record.k1sTotal ?? record.k1Total, k1sIssued));
  const form1099Issued = asNumber(record.form1099Issued, 0);
  const form1099Total = Math.max(form1099Issued, asNumber(record.form1099Total, form1099Issued));

  return {
    id: record.id ?? `tax-summary-${index + 1}`,
    fundName: record.fundName ?? `Fund ${index + 1}`,
    taxYear: asNumber(record.taxYear, new Date().getFullYear() - 1),
    k1sIssued,
    k1sTotal,
    form1099Issued,
    form1099Total,
    estimatedTaxesPaid: asNumber(record.estimatedTaxesPaid, 0),
    totalDistributions: asNumber(record.totalDistributions, 0),
    filingDeadline: asDateOnly(record.filingDeadline ?? record.deadline),
  };
}

function mapApiPortfolioTax(
  record: ApiPortfolioTaxRecord,
  index: number
): PortfolioCompanyTax {
  const k1Required = asBoolean(record.k1Required ?? record.requiresK1, false);
  const k1Received = asBoolean(record.k1Received ?? record.receivedK1, false);

  return {
    id: record.id ?? `portfolio-tax-${index + 1}`,
    companyName: record.companyName ?? `Portfolio Company ${index + 1}`,
    ownership: asNumber(record.ownership, 0),
    taxClassification: record.taxClassification ?? 'C-Corp',
    k1Required,
    k1Received,
    k1ReceivedDate: k1Received
      ? asOptionalDateOnly(record.k1ReceivedDate ?? record.receivedDate)
      : null,
    contactEmail: record.contactEmail ?? `tax-contact-${index + 1}@example.com`,
  };
}

async function fetchTaxDeadlineFromApi(): Promise<Date> {
  const response = await requestJson<ApiTaxDeadlineResponse>('/tax/deadline', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch tax filing deadline',
  });

  const raw =
    typeof response === 'string'
      ? response
      : response.filingDeadline ?? response.deadline ?? response.taxDeadline ?? response.dueDate;

  return asDateValue(raw);
}

async function fetchTaxDocumentsFromApi(): Promise<TaxDocument[]> {
  const response = await requestJson<ApiListResponse<ApiTaxDocumentRecord>>('/tax/documents', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch tax documents',
  });

  return extractApiList(response).map(mapApiTaxDocument);
}

async function fetchTaxSummariesFromApi(): Promise<TaxSummary[]> {
  const response = await requestJson<ApiListResponse<ApiTaxSummaryRecord>>('/tax/summaries', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch tax summaries',
  });

  return extractApiList(response).map(mapApiTaxSummary);
}

async function fetchPortfolioTaxFromApi(): Promise<PortfolioCompanyTax[]> {
  const response = await requestJson<ApiListResponse<ApiPortfolioTaxRecord>>('/tax/portfolio', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch portfolio tax details',
  });

  return extractApiList(response).map(mapApiPortfolioTax);
}

function getBaseMockSnapshot(): TaxCenterSnapshot {
  return {
    filingDeadline: new Date(mockFilingDeadline),
    taxDocuments: clone(mockTaxDocuments),
    taxSummaries: clone(mockTaxSummaries),
    portfolioTax: clone(mockPortfolioTax),
  };
}

function setCachedSnapshot(snapshot: TaxCenterSnapshot): void {
  apiTaxCenterSnapshotCache = clone(snapshot);
}

function getCachedOrMockSnapshot(): TaxCenterSnapshot {
  return clone(apiTaxCenterSnapshotCache ?? getBaseMockSnapshot());
}

async function getTaxCenterSnapshot(): Promise<TaxCenterSnapshot> {
  if (isMockMode('backOffice')) {
    if (!apiTaxCenterSnapshotCache) {
      setCachedSnapshot(getBaseMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  const previous = getCachedOrMockSnapshot();
  const [deadlineResult, documentsResult, summariesResult, portfolioResult] = await Promise.allSettled([
    fetchTaxDeadlineFromApi(),
    fetchTaxDocumentsFromApi(),
    fetchTaxSummariesFromApi(),
    fetchPortfolioTaxFromApi(),
  ]);

  const snapshot: TaxCenterSnapshot = {
    filingDeadline:
      deadlineResult.status === 'fulfilled'
        ? deadlineResult.value
        : previous.filingDeadline,
    taxDocuments:
      documentsResult.status === 'fulfilled' && documentsResult.value.length > 0
        ? documentsResult.value
        : previous.taxDocuments,
    taxSummaries:
      summariesResult.status === 'fulfilled' && summariesResult.value.length > 0
        ? summariesResult.value
        : previous.taxSummaries,
    portfolioTax:
      portfolioResult.status === 'fulfilled' && portfolioResult.value.length > 0
        ? portfolioResult.value
        : previous.portfolioTax,
  };

  setCachedSnapshot(snapshot);
  return clone(snapshot);
}

export async function getTaxFilingDeadline(): Promise<Date> {
  const snapshot = await getTaxCenterSnapshot();
  return snapshot.filingDeadline;
}

export async function getTaxDocuments(): Promise<TaxDocument[]> {
  const snapshot = await getTaxCenterSnapshot();
  return snapshot.taxDocuments;
}

export async function getTaxSummaries(): Promise<TaxSummary[]> {
  const snapshot = await getTaxCenterSnapshot();
  return snapshot.taxSummaries;
}

export async function getPortfolioTax(): Promise<PortfolioCompanyTax[]> {
  const snapshot = await getTaxCenterSnapshot();
  return snapshot.portfolioTax;
}

export function clearTaxCenterSnapshotCache(): void {
  apiTaxCenterSnapshotCache = null;
}
