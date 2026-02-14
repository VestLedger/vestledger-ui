import { isMockMode } from '@/config/data-mode';
import { mockAuditEvents, type AuditEvent } from '@/data/mocks/blockchain/audit-trail';
import { requestJson } from '@/services/shared/httpClient';

export type { AuditEvent };

type ApiAuditTrailResponse =
  | {
      data?: ApiAuditEventRecord[];
      meta?: unknown;
    }
  | ApiAuditEventRecord[];

type ApiAuditEventRecord = {
  id?: string;
  txHash?: string;
  transactionHash?: string;
  blockNumber?: number;
  timestamp?: string;
  eventType?: string;
  type?: string;
  description?: string;
  parties?: string[] | string;
  amount?: number;
  verificationStatus?: string;
  proofHash?: string;
};

const clone = <T>(value: T): T => structuredClone(value);

let apiAuditEventsCache: AuditEvent[] | null = null;

function extractApiList(response: ApiAuditTrailResponse): ApiAuditEventRecord[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asDate(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function normalizeEventType(rawType?: string): AuditEvent['eventType'] {
  const normalized = rawType?.toLowerCase() ?? '';
  switch (normalized) {
    case 'ownership_transfer':
    case 'ownership-transfer':
      return 'ownership_transfer';
    case 'capital_call':
    case 'capital-call':
      return 'capital_call';
    case 'distribution':
      return 'distribution';
    case 'valuation_update':
    case 'valuation-update':
      return 'valuation_update';
    case 'document_hash':
    case 'document-hash':
      return 'document_hash';
    case 'compliance_attestation':
    case 'compliance-attestation':
      return 'compliance_attestation';
    default:
      return 'document_hash';
  }
}

function normalizeVerificationStatus(rawStatus?: string): AuditEvent['verificationStatus'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'pending') return 'pending';
  if (normalized === 'failed' || normalized === 'invalid') return 'failed';
  return 'verified';
}

function normalizeParties(rawParties?: string[] | string): string[] {
  if (Array.isArray(rawParties)) {
    return rawParties.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  if (typeof rawParties === 'string' && rawParties.trim().length > 0) {
    return rawParties
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

function mapApiEvent(record: ApiAuditEventRecord, index: number): AuditEvent {
  return {
    id: record.id ?? `audit-event-${index + 1}`,
    txHash:
      record.txHash ??
      record.transactionHash ??
      `0xmocktx${(index + 1).toString().padStart(4, '0')}`,
    blockNumber:
      typeof record.blockNumber === 'number' && Number.isFinite(record.blockNumber)
        ? record.blockNumber
        : 0,
    timestamp: asDate(record.timestamp),
    eventType: normalizeEventType(record.eventType ?? record.type),
    description: record.description ?? 'Audit event imported from API.',
    parties: normalizeParties(record.parties),
    ...(typeof record.amount === 'number' ? { amount: record.amount } : {}),
    verificationStatus: normalizeVerificationStatus(record.verificationStatus),
    proofHash: record.proofHash ?? `0xproof${(index + 1).toString().padStart(6, '0')}`,
  };
}

async function fetchAuditEventsFromApi(): Promise<AuditEvent[]> {
  const response = await requestJson<ApiAuditTrailResponse>('/audit-trail/events', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch audit trail events',
  });

  return extractApiList(response).map(mapApiEvent);
}

function setCache(events: AuditEvent[]): void {
  apiAuditEventsCache = clone(events);
}

function getCachedOrMockEvents(): AuditEvent[] {
  return clone(apiAuditEventsCache ?? mockAuditEvents);
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  if (isMockMode('auditTrail')) {
    if (!apiAuditEventsCache) {
      setCache(mockAuditEvents);
    }
    return getCachedOrMockEvents();
  }

  try {
    const previous = getCachedOrMockEvents();
    const events = await fetchAuditEventsFromApi();
    const resolved = events.length > 0 ? events : previous;
    setCache(resolved);
    return clone(resolved);
  } catch {
    return getCachedOrMockEvents();
  }
}

export function clearAuditTrailCache(): void {
  apiAuditEventsCache = null;
}
