import { isMockMode } from '@/config/data-mode';
import {
  mockHistory,
  mockStrikePrices,
  mockValuations,
  type StrikePrice,
  type Valuation409A,
  type ValuationHistory,
} from '@/data/mocks/back-office/valuation-409a';
import { requestJson } from '@/services/shared/httpClient';

type ApiListResponse<TItem> =
  | {
      data?: TItem[];
      meta?: unknown;
    }
  | TItem[];

type ApiValuationRecord = {
  id?: string;
  company?: string;
  valuationDate?: string;
  expirationDate?: string;
  fairMarketValue?: number;
  commonStock?: number;
  preferredStock?: number;
  status?: string;
  provider?: string;
  reportUrl?: string;
  methodology?: string;
};

type ApiStrikePriceRecord = {
  id?: string;
  grantDate?: string;
  strikePrice?: number;
  sharesGranted?: number;
  recipient?: string;
  vestingSchedule?: string;
  status?: string;
};

type ApiValuationHistoryRecord = {
  id?: string;
  date?: string;
  fmv?: number;
  change?: number;
  trigger?: string;
};

type ValuationSnapshot = {
  valuations: Valuation409A[];
  strikePrices: StrikePrice[];
  history: ValuationHistory[];
};

const clone = <T>(value: T): T => structuredClone(value);
const nowIsoDate = () => new Date().toISOString().slice(0, 10);

let apiValuationSnapshotCache: ValuationSnapshot | null = null;

function extractApiList<TItem>(response: ApiListResponse<TItem>): TItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asDateOnly(value?: string | null, fallback = nowIsoDate()): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

function normalizeValuationStatus(rawStatus?: string): Valuation409A['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'expired') return 'expired';
  if (
    normalized === 'expiring' ||
    normalized === 'expiring-soon' ||
    normalized === 'expiring_soon'
  ) {
    return 'expiring-soon';
  }
  return 'current';
}

function normalizeStrikeStatus(rawStatus?: string): StrikePrice['status'] {
  const normalized = rawStatus?.toLowerCase() ?? '';
  if (normalized === 'exercised') return 'exercised';
  if (normalized === 'expired') return 'expired';
  return 'active';
}

function mapApiValuation(record: ApiValuationRecord, index: number): Valuation409A {
  const fairMarketValue = asNumber(record.fairMarketValue, 0);

  return {
    id: record.id ?? `valuation-${index + 1}`,
    company: record.company ?? `Portfolio Company ${index + 1}`,
    valuationDate: asDateOnly(record.valuationDate),
    expirationDate: asDateOnly(record.expirationDate),
    fairMarketValue,
    commonStock: asNumber(record.commonStock, fairMarketValue),
    preferredStock: asNumber(record.preferredStock, fairMarketValue),
    status: normalizeValuationStatus(record.status),
    provider: record.provider ?? 'Valuation Provider',
    reportUrl: record.reportUrl ?? '#',
    methodology: record.methodology ?? 'OPM',
  };
}

function mapApiStrikePrice(record: ApiStrikePriceRecord, index: number): StrikePrice {
  return {
    id: record.id ?? `strike-${index + 1}`,
    grantDate: asDateOnly(record.grantDate),
    strikePrice: asNumber(record.strikePrice, 0),
    sharesGranted: asNumber(record.sharesGranted, 0),
    recipient: record.recipient ?? `Recipient ${index + 1}`,
    vestingSchedule: record.vestingSchedule ?? '4-year',
    status: normalizeStrikeStatus(record.status),
  };
}

function mapApiValuationHistory(
  record: ApiValuationHistoryRecord,
  index: number
): ValuationHistory {
  return {
    id: record.id ?? `valuation-history-${index + 1}`,
    date: asDateOnly(record.date),
    fmv: asNumber(record.fmv, 0),
    change: asNumber(record.change, 0),
    trigger: record.trigger ?? 'Valuation refresh',
  };
}

function extractNestedRecords<TItem>(source: unknown, key: string): TItem[] {
  if (!source || typeof source !== 'object') return [];
  const container = source as Record<string, unknown>;
  const value = container[key];
  if (!Array.isArray(value)) return [];
  return value as TItem[];
}

async function fetchValuationSnapshotFromApi(): Promise<ValuationSnapshot> {
  const response = await requestJson<ApiListResponse<ApiValuationRecord>>('/valuations', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch 409A valuations',
  });

  const records = extractApiList(response);
  const valuations = records.map(mapApiValuation);

  const strikePriceRecords: ApiStrikePriceRecord[] = [];
  const historyRecords: ApiValuationHistoryRecord[] = [];

  records.forEach((record) => {
    strikePriceRecords.push(...extractNestedRecords<ApiStrikePriceRecord>(record, 'strikePrices'));
    historyRecords.push(
      ...extractNestedRecords<ApiValuationHistoryRecord>(record, 'valuationHistory')
    );
  });

  return {
    valuations,
    strikePrices: strikePriceRecords.map(mapApiStrikePrice),
    history: historyRecords.map(mapApiValuationHistory),
  };
}

function getBaseMockSnapshot(): ValuationSnapshot {
  return {
    valuations: clone(mockValuations),
    strikePrices: clone(mockStrikePrices),
    history: clone(mockHistory),
  };
}

function setCachedSnapshot(snapshot: ValuationSnapshot): void {
  apiValuationSnapshotCache = clone(snapshot);
}

function getCachedOrMockSnapshot(): ValuationSnapshot {
  return clone(apiValuationSnapshotCache ?? getBaseMockSnapshot());
}

async function getValuationSnapshot(): Promise<ValuationSnapshot> {
  if (isMockMode('backOffice')) {
    if (!apiValuationSnapshotCache) {
      setCachedSnapshot(getBaseMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  const previous = getCachedOrMockSnapshot();

  try {
    const current = await fetchValuationSnapshotFromApi();
    const snapshot: ValuationSnapshot = {
      valuations: current.valuations.length > 0 ? current.valuations : previous.valuations,
      strikePrices: current.strikePrices.length > 0 ? current.strikePrices : previous.strikePrices,
      history: current.history.length > 0 ? current.history : previous.history,
    };

    setCachedSnapshot(snapshot);
    return clone(snapshot);
  } catch {
    return previous;
  }
}

export async function getValuations409a(): Promise<Valuation409A[]> {
  const snapshot = await getValuationSnapshot();
  return snapshot.valuations;
}

export async function getStrikePrices(): Promise<StrikePrice[]> {
  const snapshot = await getValuationSnapshot();
  return snapshot.strikePrices;
}

export async function getValuationHistory(): Promise<ValuationHistory[]> {
  const snapshot = await getValuationSnapshot();
  return snapshot.history;
}

export function clearValuationSnapshotCache(): void {
  apiValuationSnapshotCache = null;
}
