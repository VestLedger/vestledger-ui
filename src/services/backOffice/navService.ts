import { isMockMode } from '@/config/data-mode';
import { mockNAVCalculations } from '@/data/mocks/back-office/fund-admin-ops';
import { logger } from '@/lib/logger';
import { requestJson } from '@/services/shared/httpClient';
import type { NAVCalculation } from '@/types/fundAdminOps';

const clone = <T>(value: T): T => structuredClone(value);

let navStore: NAVCalculation[] = clone(mockNAVCalculations);

function findCalculation(id: string) {
  const index = navStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`NAV calculation not found: ${id}`);
  }
  return index;
}

function buildFallbackCalculation(overrides: Partial<NAVCalculation> = {}): NAVCalculation {
  const now = new Date();
  const template = mockNAVCalculations[0];
  const base: NAVCalculation = template
    ? {
        ...clone(template),
        asOfDate: now,
        calculationDate: now,
        components: clone(template.components ?? []),
        adjustments: clone(template.adjustments ?? []),
      }
    : {
        id: `nav-${Date.now()}`,
        fundId: '',
        fundName: 'Unknown fund',
        asOfDate: now,
        calculationDate: now,
        status: 'draft',
        totalAssets: 0,
        totalLiabilities: 0,
        netAssets: 0,
        outstandingShares: 1,
        navPerShare: 0,
        components: [],
        adjustments: [],
      };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id ?? `nav-${Date.now()}`,
    fundId: overrides.fundId ?? base.fundId ?? '',
    fundName: overrides.fundName ?? base.fundName ?? 'Unknown fund',
    asOfDate: overrides.asOfDate ?? base.asOfDate ?? now,
    calculationDate: overrides.calculationDate ?? base.calculationDate ?? now,
    components: overrides.components ?? base.components ?? [],
    adjustments: overrides.adjustments ?? base.adjustments ?? [],
    status: overrides.status ?? base.status ?? 'draft',
  };
}

function upsertCalculation(next: NAVCalculation) {
  const index = navStore.findIndex((item) => item.id === next.id);
  if (index === -1) {
    navStore = [next, ...navStore];
    return;
  }
  navStore[index] = next;
}

export async function getNAVCalculations(fundId?: string): Promise<NAVCalculation[]> {
  if (isMockMode('backOffice')) {
    const values = fundId ? navStore.filter((item) => item.fundId === fundId) : navStore;
    return clone(values);
  }

  if (!fundId) return [];
  const payload = await requestJson<NAVCalculation[]>(`/funds/${fundId}/nav`, {
    fallbackMessage: 'Failed to load NAV calculations',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function calculateNAV(fundId: string, fundName: string): Promise<NAVCalculation> {
  if (isMockMode('backOffice')) {
    const latest = navStore
      .filter((item) => item.fundId === fundId)
      .sort((a, b) => b.calculationDate.getTime() - a.calculationDate.getTime())[0];

    const now = new Date();
    const totalAssets = latest?.totalAssets ?? 100_000_000;
    const totalLiabilities = latest?.totalLiabilities ?? 5_000_000;
    const netAssets = totalAssets - totalLiabilities;
    const outstandingShares = latest?.outstandingShares ?? 5_000_000;
    const navPerShare = Number((netAssets / Math.max(outstandingShares, 1)).toFixed(2));

    const calculation: NAVCalculation = {
      id: `nav-${Date.now()}`,
      fundId,
      fundName,
      asOfDate: now,
      calculationDate: now,
      status: 'calculated',
      totalAssets,
      totalLiabilities,
      netAssets,
      outstandingShares,
      navPerShare,
      previousNAV: latest?.navPerShare,
      changeAmount: latest ? Number((navPerShare - latest.navPerShare).toFixed(2)) : undefined,
      changePercent: latest && latest.navPerShare > 0
        ? Number((((navPerShare - latest.navPerShare) / latest.navPerShare) * 100).toFixed(2))
        : undefined,
      components: latest?.components ?? [],
      adjustments: latest?.adjustments ?? [],
    };

    navStore = [calculation, ...navStore];
    return clone(calculation);
  }

  const payload = await requestJson<NAVCalculation>(`/funds/${fundId}/nav/calculate`, {
    method: 'POST',
    body: { fundName },
    fallbackMessage: 'Failed to calculate NAV',
  });
  if (!payload) {
    logger.warn('Empty calculate NAV payload from API; using fallback', {
      component: 'navService',
      fundId,
      fundName,
    });
    const fallback = buildFallbackCalculation({
      fundId,
      fundName,
      status: 'calculated',
    });
    upsertCalculation(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function markNAVReviewed(
  calculationId: string,
  reviewedBy: string
): Promise<NAVCalculation> {
  if (isMockMode('backOffice')) {
    const index = findCalculation(calculationId);
    navStore[index] = {
      ...navStore[index],
      status: 'reviewed',
      reviewedBy,
      calculationDate: new Date(),
    };
    return clone(navStore[index]);
  }

  const payload = await requestJson<NAVCalculation>(`/nav/${calculationId}/review`, {
    method: 'POST',
    body: { reviewedBy },
    fallbackMessage: 'Failed to mark NAV as reviewed',
  });
  if (!payload) {
    logger.warn('Empty review NAV payload from API; using fallback', {
      component: 'navService',
      calculationId,
      reviewedBy,
    });
    const existing = navStore.find((item) => item.id === calculationId);
    const fallback = buildFallbackCalculation({
      ...(existing ?? {}),
      id: calculationId,
      status: 'reviewed',
      reviewedBy,
      calculationDate: new Date(),
    });
    upsertCalculation(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function publishNAV(
  calculationId: string,
  publishedBy: string
): Promise<NAVCalculation> {
  if (isMockMode('backOffice')) {
    const index = findCalculation(calculationId);
    navStore[index] = {
      ...navStore[index],
      status: 'published',
      publishedBy,
      calculationDate: new Date(),
    };
    return clone(navStore[index]);
  }

  const payload = await requestJson<NAVCalculation>(`/nav/${calculationId}/publish`, {
    method: 'POST',
    body: { publishedBy },
    fallbackMessage: 'Failed to publish NAV',
  });
  if (!payload) {
    logger.warn('Empty publish NAV payload from API; using fallback', {
      component: 'navService',
      calculationId,
      publishedBy,
    });
    const existing = navStore.find((item) => item.id === calculationId);
    const fallback = buildFallbackCalculation({
      ...(existing ?? {}),
      id: calculationId,
      status: 'published',
      publishedBy,
      calculationDate: new Date(),
    });
    upsertCalculation(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function exportNAV(
  calculationId: string,
  format: 'pdf' | 'excel'
): Promise<{ calculationId: string; format: 'pdf' | 'excel'; exportedAt: string }> {
  if (isMockMode('backOffice')) {
    findCalculation(calculationId);
    return { calculationId, format, exportedAt: new Date().toISOString() };
  }

  const payload = await requestJson<{ calculationId: string; format: 'pdf' | 'excel'; exportedAt: string }>(
    `/nav/${calculationId}/export`,
    { method: 'POST', body: { format }, fallbackMessage: 'Failed to export NAV' }
  );
  if (!payload) {
    logger.warn('Empty NAV export payload from API; using fallback metadata', {
      component: 'navService',
      calculationId,
      format,
    });
    return { calculationId, format, exportedAt: new Date().toISOString() };
  }
  return payload;
}
