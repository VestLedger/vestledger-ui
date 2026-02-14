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

async function fetchValuationsFromApi(): Promise<Valuation409A[]> {
  const response = await requestJson<ApiListResponse<ApiValuationRecord>>('/valuations/409a', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch 409A valuations',
  });
  return extractApiList(response).map(mapApiValuation);
}

async function fetchStrikePricesFromApi(): Promise<StrikePrice[]> {
  const response = await requestJson<ApiListResponse<ApiStrikePriceRecord>>('/valuations/409a/strike-prices', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch strike prices',
  });
  return extractApiList(response).map(mapApiStrikePrice);
}

async function fetchValuationHistoryFromApi(): Promise<ValuationHistory[]> {
  const response = await requestJson<ApiListResponse<ApiValuationHistoryRecord>>('/valuations/409a/history', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch valuation history',
  });
  return extractApiList(response).map(mapApiValuationHistory);
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
  const [valuationsResult, strikePricesResult, historyResult] = await Promise.allSettled([
    fetchValuationsFromApi(),
    fetchStrikePricesFromApi(),
    fetchValuationHistoryFromApi(),
  ]);

  const snapshot: ValuationSnapshot = {
    valuations:
      valuationsResult.status === 'fulfilled' && valuationsResult.value.length > 0
        ? valuationsResult.value
        : previous.valuations,
    strikePrices:
      strikePricesResult.status === 'fulfilled' && strikePricesResult.value.length > 0
        ? strikePricesResult.value
        : previous.strikePrices,
    history:
      historyResult.status === 'fulfilled' && historyResult.value.length > 0
        ? historyResult.value
        : previous.history,
  };

  setCachedSnapshot(snapshot);
  return clone(snapshot);
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
