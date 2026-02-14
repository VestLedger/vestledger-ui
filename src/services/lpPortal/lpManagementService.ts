import { isMockMode } from '@/config/data-mode';
import {
  mockCapitalCalls,
  mockDistributions,
  mockLPs,
  mockReports,
} from '@/data/mocks/lp-portal/lp-management';
import { requestJson } from '@/services/shared/httpClient';
import type {
  CapitalCall,
  Distribution,
  LP,
  Report,
} from '@/data/mocks/lp-portal/lp-management';

export type {
  CapitalCall,
  Distribution,
  LP,
  Report,
} from '@/data/mocks/lp-portal/lp-management';

export interface LPManagementSnapshot {
  lps: LP[];
  reports: Report[];
  capitalCalls: CapitalCall[];
  distributions: Distribution[];
}

type ApiListResponse<TItem> =
  | {
      data?: TItem[];
      meta?: unknown;
    }
  | TItem[];

type ApiLPRecord = {
  id: string;
  name: string;
  type?: string;
  email?: string;
  contactName?: string;
  createdAt?: string;
  commitment?: number;
  totalCommitment?: number;
  calledAmount?: number;
  capitalCalled?: number;
  distributedAmount?: number;
  capitalDistributed?: number;
};

type ApiCapitalCallRecord = {
  id: string;
  callNumber?: number;
  amount?: number;
  dueDate?: string;
  purpose?: string;
  status?: string;
};

type ApiDistributionRecord = {
  id: string;
  revisionNumber?: number;
  distributionNumber?: number;
  totalDistributed?: number;
  totalAmount?: number;
  netProceeds?: number;
  grossProceeds?: number;
  paymentDate?: string;
  eventDate?: string;
  eventType?: string;
  status?: string;
};

type ExportLPDataResult = {
  exportedAt: string;
  fileName: string;
  recordCount: number;
};

type BulkSendResult = {
  recipientCount: number;
  sentAt: string;
};

const clone = <T>(value: T): T => structuredClone(value);
const nowIsoDate = () => new Date().toISOString().slice(0, 10);

let apiLPManagementSnapshotCache: LPManagementSnapshot | null = null;

function extractApiList<TItem>(response: ApiListResponse<TItem>): TItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asDate(value?: string): string {
  if (!value) return nowIsoDate();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return nowIsoDate();
  return parsed.toISOString().slice(0, 10);
}

function normalizeLPType(rawType?: string, lpName?: string): LP['type'] {
  const normalizedType = rawType?.toLowerCase() ?? '';
  const normalizedName = lpName?.toLowerCase() ?? '';

  if (normalizedType.includes('family') || normalizedName.includes('family office')) {
    return 'family-office';
  }
  if (normalizedType === 'individual') return 'individual';
  if (normalizedType === 'corporate' || normalizedType === 'strategic' || normalizedType === 'entity') {
    return 'corporate';
  }

  return 'institution';
}

function mapApiLPToLP(record: ApiLPRecord, index: number): LP {
  const commitmentAmount = asNumber(record.totalCommitment ?? record.commitment);
  const calledCapital = asNumber(record.capitalCalled ?? record.calledAmount);
  const distributedCapital = asNumber(record.capitalDistributed ?? record.distributedAmount);
  const navValue = Math.max(commitmentAmount, calledCapital * 1.15, distributedCapital * 1.2, 0);
  const dpi = calledCapital > 0 ? distributedCapital / calledCapital : 0;
  const tvpi = calledCapital > 0 ? (navValue + distributedCapital) / calledCapital : 1;
  const irr = Math.max(0, Math.min(45, Number((tvpi * 12 + dpi * 6).toFixed(1))));

  return {
    id: record.id,
    name: record.name,
    type: normalizeLPType(record.type, record.name),
    commitmentAmount,
    calledCapital,
    distributedCapital,
    navValue,
    dpi: Number(dpi.toFixed(2)),
    tvpi: Number(tvpi.toFixed(2)),
    irr,
    joinDate: asDate(record.createdAt),
    contactPerson: record.contactName ?? 'Investor Relations',
    email: record.email ?? `lp-${index + 1}@example.com`,
  };
}

function mapApiCapitalCallToCapitalCall(record: ApiCapitalCallRecord, index: number): CapitalCall {
  const normalizedStatus = (record.status ?? '').toLowerCase();
  const status: CapitalCall['status'] =
    normalizedStatus === 'complete'
      ? 'paid'
      : normalizedStatus === 'overdue'
        ? 'overdue'
        : 'pending';

  return {
    id: record.id,
    callNumber: asNumber(record.callNumber, index + 1),
    amount: asNumber(record.amount),
    dueDate: asDate(record.dueDate),
    purpose: record.purpose ?? 'General fund operations',
    status,
  };
}

function mapApiDistributionToDistribution(
  record: ApiDistributionRecord,
  index: number
): Distribution {
  const eventType = (record.eventType ?? '').toLowerCase();
  const type: Distribution['type'] =
    eventType === 'dividend'
      ? 'dividends'
      : eventType === 'recapitalization' || eventType === 'refinancing'
        ? 'return-of-capital'
        : 'realized-gains';

  const normalizedStatus = (record.status ?? '').toLowerCase();
  const status: Distribution['status'] =
    normalizedStatus === 'completed'
      ? 'paid'
      : normalizedStatus === 'processing'
        ? 'processing'
        : 'pending';

  return {
    id: record.id,
    distributionNumber: asNumber(
      record.distributionNumber ?? record.revisionNumber,
      index + 1
    ),
    amount: asNumber(
      record.totalDistributed ?? record.totalAmount ?? record.netProceeds ?? record.grossProceeds
    ),
    paymentDate: asDate(record.paymentDate ?? record.eventDate),
    type,
    status,
  };
}

async function fetchLPsFromApi(): Promise<LP[]> {
  const response = await requestJson<ApiListResponse<ApiLPRecord>>('/lps', {
    method: 'GET',
    query: {
      limit: 200,
      offset: 0,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    fallbackMessage: 'Failed to fetch LP records',
  });

  const list = extractApiList(response);
  const detailedRecords = await Promise.all(
    list.map(async (record) => {
      try {
        return await requestJson<ApiLPRecord>(`/lps/${record.id}`, {
          method: 'GET',
          fallbackMessage: 'Failed to fetch LP detail',
        });
      } catch {
        return record;
      }
    })
  );

  return detailedRecords.map(mapApiLPToLP);
}

async function fetchCapitalCallsFromApi(): Promise<CapitalCall[]> {
  const response = await requestJson<ApiListResponse<ApiCapitalCallRecord>>('/capital-calls/active', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch capital calls',
  });

  return extractApiList(response).map(mapApiCapitalCallToCapitalCall);
}

async function fetchDistributionsFromApi(): Promise<Distribution[]> {
  const response = await requestJson<ApiListResponse<ApiDistributionRecord>>('/distributions', {
    method: 'GET',
    query: {
      limit: 100,
      offset: 0,
      sortBy: 'paymentDate',
      sortOrder: 'desc',
    },
    fallbackMessage: 'Failed to fetch distributions',
  });

  return extractApiList(response).map(mapApiDistributionToDistribution);
}

function getBaseMockSnapshot(): LPManagementSnapshot {
  return {
    lps: clone(mockLPs),
    reports: clone(mockReports),
    capitalCalls: clone(mockCapitalCalls),
    distributions: clone(mockDistributions),
  };
}

function setCachedSnapshot(snapshot: LPManagementSnapshot): void {
  apiLPManagementSnapshotCache = clone(snapshot);
}

function getCachedOrMockSnapshot(): LPManagementSnapshot {
  return clone(apiLPManagementSnapshotCache ?? getBaseMockSnapshot());
}

function upsertReport(report: Report): void {
  const snapshot = getCachedOrMockSnapshot();
  const index = snapshot.reports.findIndex((item) => item.id === report.id);

  if (index >= 0) {
    snapshot.reports[index] = report;
  } else {
    snapshot.reports.unshift(report);
  }

  setCachedSnapshot(snapshot);
}

function resolveTargetLPIds(selectedLPIds?: string[]): string[] {
  const snapshot = getCachedOrMockSnapshot();
  const availableIds = new Set(snapshot.lps.map((lp) => lp.id));

  if (!selectedLPIds || selectedLPIds.length === 0) {
    return snapshot.lps.map((lp) => lp.id);
  }

  return selectedLPIds.filter((id) => availableIds.has(id));
}

export async function getLPManagementSnapshot(): Promise<LPManagementSnapshot> {
  if (isMockMode('lpPortal')) {
    if (!apiLPManagementSnapshotCache) {
      setCachedSnapshot(getBaseMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  try {
    const previous = getCachedOrMockSnapshot();
    const [lps, capitalCalls, distributions] = await Promise.all([
      fetchLPsFromApi(),
      fetchCapitalCallsFromApi(),
      fetchDistributionsFromApi(),
    ]);

    const snapshot: LPManagementSnapshot = {
      lps: lps.length > 0 ? lps : previous.lps,
      reports: previous.reports,
      capitalCalls: capitalCalls.length > 0 ? capitalCalls : previous.capitalCalls,
      distributions: distributions.length > 0 ? distributions : previous.distributions,
    };

    setCachedSnapshot(snapshot);
    return clone(snapshot);
  } catch {
    return getCachedOrMockSnapshot();
  }
}

export function getLPs(): LP[] {
  return getCachedOrMockSnapshot().lps;
}

export function getLPReports(): Report[] {
  return getCachedOrMockSnapshot().reports;
}

export function getLPCapitalCalls(): CapitalCall[] {
  return getCachedOrMockSnapshot().capitalCalls;
}

export function getLPDistributions(): Distribution[] {
  return getCachedOrMockSnapshot().distributions;
}

export async function sendReportToLPs(selectedLPIds?: string[]): Promise<BulkSendResult> {
  const recipientCount = resolveTargetLPIds(selectedLPIds).length;
  return {
    recipientCount,
    sentAt: new Date().toISOString(),
  };
}

export async function sendCapitalCallToLPs(selectedLPIds?: string[]): Promise<BulkSendResult> {
  const recipientCount = resolveTargetLPIds(selectedLPIds).length;
  return {
    recipientCount,
    sentAt: new Date().toISOString(),
  };
}

export async function exportLPData(selectedLPIds?: string[]): Promise<ExportLPDataResult> {
  const recordCount = resolveTargetLPIds(selectedLPIds).length;
  const exportedAt = new Date().toISOString();

  return {
    exportedAt,
    fileName: `lp-management-export-${exportedAt.slice(0, 10)}.csv`,
    recordCount,
  };
}

export async function generateLPReport(selectedLPIds?: string[]): Promise<Report> {
  const recipientCount = resolveTargetLPIds(selectedLPIds).length;
  const now = new Date();
  const quarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;

  const report: Report = {
    id: `report-${Date.now()}`,
    title: `${quarter} ${now.getFullYear()} LP Update (${recipientCount} LPs)`,
    type: 'quarterly',
    quarter,
    year: now.getFullYear(),
    publishedDate: nowIsoDate(),
    status: 'draft',
    viewCount: 0,
  };

  upsertReport(report);
  return clone(report);
}

export async function sendLPUpdate(selectedLPIds?: string[]): Promise<BulkSendResult> {
  const recipientCount = resolveTargetLPIds(selectedLPIds).length;
  return {
    recipientCount,
    sentAt: new Date().toISOString(),
  };
}

export function clearLPManagementSnapshotCache(): void {
  apiLPManagementSnapshotCache = null;
}
