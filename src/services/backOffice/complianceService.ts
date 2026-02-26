import { isMockMode } from '@/config/data-mode';
import {
  mockAuditSchedule,
  mockComplianceItems,
  mockRegulatoryFilings,
  type AuditSchedule,
  type ComplianceItem,
  type RegulatoryFiling,
} from '@/data/mocks/back-office/compliance';
import { requestJson } from '@/services/shared/httpClient';

type ApiListResponse<TItem> =
  | {
      data?: TItem[];
      meta?: unknown;
    }
  | TItem[];

type ApiComplianceItemRecord = {
  id?: string;
  title?: string;
  name?: string;
  type?: string;
  dueDate?: string;
  status?: string;
  assignedTo?: string;
  owner?: string;
  priority?: string;
  description?: string;
  relatedFund?: string;
  fundName?: string;
};

type ApiRegulatoryFilingRecord = {
  id?: string;
  filingType?: string;
  name?: string;
  regulator?: string;
  frequency?: string;
  lastFiled?: string;
  nextDue?: string;
  dueDate?: string;
  status?: string;
  fundName?: string;
};

type ApiAuditScheduleRecord = {
  id?: string;
  auditType?: string;
  type?: string;
  auditor?: string;
  year?: number;
  startDate?: string;
  completionDate?: string | null;
  status?: string;
  fundName?: string;
};

type ComplianceSnapshot = {
  complianceItems: ComplianceItem[];
  regulatoryFilings: RegulatoryFiling[];
  auditSchedule: AuditSchedule[];
};

const clone = <T>(value: T): T => structuredClone(value);
const nowIsoDate = () => new Date().toISOString().slice(0, 10);

let apiComplianceSnapshotCache: ComplianceSnapshot | null = null;

function extractApiList<TItem>(response: ApiListResponse<TItem>): TItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asDateOnly(value?: string | null, fallback = nowIsoDate()): string {
  if (!value) return fallback;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

function normalizeComplianceItemType(rawType?: string): ComplianceItem['type'] {
  const normalized = rawType?.toLowerCase() ?? '';
  if (normalized.includes('report')) return 'report';
  if (normalized.includes('cert')) return 'certification';
  if (normalized.includes('audit')) return 'audit';
  return 'filing';
}

function normalizeComplianceItemStatus(rawStatus?: string): ComplianceItem['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'completed' || normalized === 'complete' || normalized === 'done') {
    return 'completed';
  }
  if (
    normalized === 'in-progress' ||
    normalized === 'in_progress' ||
    normalized === 'pending' ||
    normalized === 'active'
  ) {
    return 'in-progress';
  }
  if (normalized === 'overdue' || normalized === 'late') return 'overdue';
  return 'upcoming';
}

function normalizePriority(rawPriority?: string): ComplianceItem['priority'] {
  const normalized = rawPriority?.toLowerCase() ?? '';
  if (normalized === 'high' || normalized === 'urgent') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
}

function normalizeFilingStatus(rawStatus?: string): RegulatoryFiling['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'overdue' || normalized === 'late') return 'overdue';
  if (
    normalized === 'due-soon' ||
    normalized === 'due_soon' ||
    normalized === 'upcoming' ||
    normalized === 'pending'
  ) {
    return 'due-soon';
  }
  return 'current';
}

function normalizeAuditStatus(rawStatus?: string): AuditSchedule['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'completed' || normalized === 'complete') return 'completed';
  if (
    normalized === 'in-progress' ||
    normalized === 'in_progress' ||
    normalized === 'active'
  ) {
    return 'in-progress';
  }
  return 'scheduled';
}

function mapApiComplianceItem(
  record: ApiComplianceItemRecord,
  index: number
): ComplianceItem {
  return {
    id: record.id ?? `compliance-item-${index + 1}`,
    title: record.title ?? record.name ?? `Compliance Item ${index + 1}`,
    type: normalizeComplianceItemType(record.type),
    dueDate: asDateOnly(record.dueDate),
    status: normalizeComplianceItemStatus(record.status),
    assignedTo: record.assignedTo ?? record.owner ?? 'Compliance Team',
    priority: normalizePriority(record.priority),
    description: record.description ?? 'Compliance task imported from API.',
    relatedFund: record.relatedFund ?? record.fundName ?? 'All Funds',
  };
}

function mapApiRegulatoryFiling(
  record: ApiRegulatoryFilingRecord,
  index: number
): RegulatoryFiling {
  const nextDueRaw = record.nextDue ?? record.dueDate;

  return {
    id: record.id ?? `regulatory-filing-${index + 1}`,
    filingType: record.filingType ?? record.name ?? 'Regulatory Filing',
    regulator: record.regulator ?? 'Regulator',
    frequency: record.frequency ?? 'Annual',
    lastFiled: asDateOnly(record.lastFiled),
    nextDue: nextDueRaw && nextDueRaw !== 'N/A' ? asDateOnly(nextDueRaw) : 'N/A',
    status: normalizeFilingStatus(record.status),
    fundName: record.fundName ?? 'All Funds',
  };
}

function mapApiAuditSchedule(
  record: ApiAuditScheduleRecord,
  index: number
): AuditSchedule {
  return {
    id: record.id ?? `audit-schedule-${index + 1}`,
    auditType: record.auditType ?? record.type ?? 'Audit',
    auditor: record.auditor ?? 'External Auditor',
    year: typeof record.year === 'number' ? record.year : new Date().getFullYear(),
    startDate: asDateOnly(record.startDate),
    completionDate: record.completionDate ? asDateOnly(record.completionDate) : null,
    status: normalizeAuditStatus(record.status),
    fundName: record.fundName ?? 'All Funds',
  };
}

async function fetchComplianceItemsFromApi(): Promise<ComplianceItem[]> {
  const response = await requestJson<ApiListResponse<ApiComplianceItemRecord>>('/compliance/items', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch compliance items',
  });
  return extractApiList(response).map(mapApiComplianceItem);
}

async function fetchRegulatoryFilingsFromApi(): Promise<RegulatoryFiling[]> {
  const response = await requestJson<ApiListResponse<ApiRegulatoryFilingRecord>>('/compliance/filings', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch regulatory filings',
  });
  return extractApiList(response).map(mapApiRegulatoryFiling);
}

async function fetchAuditScheduleFromApi(): Promise<AuditSchedule[]> {
  const response = await requestJson<ApiListResponse<ApiAuditScheduleRecord>>('/compliance/audits', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch audit schedule',
  });
  return extractApiList(response).map(mapApiAuditSchedule);
}

function getBaseMockSnapshot(): ComplianceSnapshot {
  return {
    complianceItems: clone(mockComplianceItems),
    regulatoryFilings: clone(mockRegulatoryFilings),
    auditSchedule: clone(mockAuditSchedule),
  };
}

function setCachedSnapshot(snapshot: ComplianceSnapshot): void {
  apiComplianceSnapshotCache = clone(snapshot);
}

function getCachedOrMockSnapshot(): ComplianceSnapshot {
  return clone(apiComplianceSnapshotCache ?? getBaseMockSnapshot());
}

async function getComplianceSnapshot(): Promise<ComplianceSnapshot> {
  if (isMockMode('backOffice')) {
    if (!apiComplianceSnapshotCache) {
      setCachedSnapshot(getBaseMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  const previous = getCachedOrMockSnapshot();
  const [itemsResult, filingsResult, auditsResult] = await Promise.allSettled([
    fetchComplianceItemsFromApi(),
    fetchRegulatoryFilingsFromApi(),
    fetchAuditScheduleFromApi(),
  ]);

  const snapshot: ComplianceSnapshot = {
    complianceItems:
      itemsResult.status === 'fulfilled' && itemsResult.value.length > 0
        ? itemsResult.value
        : previous.complianceItems,
    regulatoryFilings:
      filingsResult.status === 'fulfilled' && filingsResult.value.length > 0
        ? filingsResult.value
        : previous.regulatoryFilings,
    auditSchedule:
      auditsResult.status === 'fulfilled' && auditsResult.value.length > 0
        ? auditsResult.value
        : previous.auditSchedule,
  };

  setCachedSnapshot(snapshot);
  return clone(snapshot);
}

export async function getComplianceItems(): Promise<ComplianceItem[]> {
  const snapshot = await getComplianceSnapshot();
  return snapshot.complianceItems;
}

export async function getRegulatoryFilings(): Promise<RegulatoryFiling[]> {
  const snapshot = await getComplianceSnapshot();
  return snapshot.regulatoryFilings;
}

export async function getAuditSchedule(): Promise<AuditSchedule[]> {
  const snapshot = await getComplianceSnapshot();
  return snapshot.auditSchedule;
}

export function clearComplianceSnapshotCache(): void {
  apiComplianceSnapshotCache = null;
}
