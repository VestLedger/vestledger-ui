import { isMockMode } from '@/config/data-mode';
import { mockCarriedInterestTerms, mockCarryAccruals } from '@/data/mocks/back-office/fund-admin-ops';
import { logger } from '@/lib/logger';
import { requestJson } from '@/services/shared/httpClient';
import type { CarryAccrual, CarriedInterestTerm } from '@/types/fundAdminOps';

const clone = <T>(value: T): T => structuredClone(value);

const termsStore: CarriedInterestTerm[] = clone(mockCarriedInterestTerms);
let accrualStore: CarryAccrual[] = clone(mockCarryAccruals);

function findAccrual(id: string) {
  const index = accrualStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Carry accrual not found: ${id}`);
  }
  return index;
}

function buildFallbackAccrual(overrides: Partial<CarryAccrual> = {}): CarryAccrual {
  const now = new Date();
  const template = mockCarryAccruals[0];
  const base: CarryAccrual = template
    ? {
        ...clone(template),
        asOfDate: now,
        calculationDate: now,
        waterfall: clone(template.waterfall ?? []),
      }
    : {
        id: `carry-${Date.now()}`,
        fundId: '',
        asOfDate: now,
        calculationDate: now,
        totalContributions: 0,
        totalDistributions: 0,
        unrealizedValue: 0,
        realizedGains: 0,
        unrealizedGains: 0,
        totalValue: 0,
        lpPreferredReturn: 0,
        lpPreferredReturnPaid: false,
        catchupAmount: 0,
        catchupPaid: 0,
        accruedCarry: 0,
        vestedCarry: 0,
        unvestedCarry: 0,
        distributedCarry: 0,
        remainingCarry: 0,
        irr: 0,
        moic: 1,
        waterfall: [],
        status: 'draft',
      };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id ?? `carry-${Date.now()}`,
    fundId: overrides.fundId ?? base.fundId ?? '',
    asOfDate: overrides.asOfDate ?? base.asOfDate ?? now,
    calculationDate: overrides.calculationDate ?? base.calculationDate ?? now,
    waterfall: overrides.waterfall ?? base.waterfall ?? [],
    status: overrides.status ?? base.status ?? 'draft',
  };
}

function upsertAccrual(next: CarryAccrual) {
  const index = accrualStore.findIndex((item) => item.id === next.id);
  if (index === -1) {
    accrualStore = [next, ...accrualStore];
    return;
  }
  accrualStore[index] = next;
}

export async function getCarriedInterestTerms(fundId?: string): Promise<CarriedInterestTerm[]> {
  if (isMockMode('backOffice')) {
    const values = fundId ? termsStore.filter((item) => item.fundId === fundId) : termsStore;
    return clone(values);
  }

  if (!fundId) return [];
  const payload = await requestJson<CarriedInterestTerm[]>(`/funds/${fundId}/carry/terms`, {
    fallbackMessage: 'Failed to load carry terms',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function getCarryAccruals(fundId?: string): Promise<CarryAccrual[]> {
  if (isMockMode('backOffice')) {
    const values = fundId ? accrualStore.filter((item) => item.fundId === fundId) : accrualStore;
    return clone(values);
  }

  if (!fundId) return [];
  const payload = await requestJson<CarryAccrual[]>(`/funds/${fundId}/carry/accruals`, {
    fallbackMessage: 'Failed to load carry accruals',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function calculateCarryAccrual(
  fundId: string,
  _fundName: string
): Promise<CarryAccrual> {
  if (isMockMode('backOffice')) {
    const latest = accrualStore
      .filter((item) => item.fundId === fundId)
      .sort((a, b) => b.calculationDate.getTime() - a.calculationDate.getTime())[0];

    const next: CarryAccrual = {
      ...(latest ?? {
        id: `carry-${Date.now()}`,
        fundId,
        asOfDate: new Date(),
        calculationDate: new Date(),
        totalContributions: 0,
        totalDistributions: 0,
        unrealizedValue: 0,
        realizedGains: 0,
        unrealizedGains: 0,
        totalValue: 0,
        lpPreferredReturn: 0,
        lpPreferredReturnPaid: false,
        catchupAmount: 0,
        catchupPaid: 0,
        accruedCarry: 0,
        vestedCarry: 0,
        unvestedCarry: 0,
        distributedCarry: 0,
        remainingCarry: 0,
        irr: 0,
        moic: 1,
        waterfall: [],
        status: 'draft' as const,
      }),
      id: `carry-${Date.now()}`,
      asOfDate: new Date(),
      calculationDate: new Date(),
      status: 'calculated',
    };

    accrualStore = [next, ...accrualStore];
    return clone(next);
  }

  const payload = await requestJson<CarryAccrual>(`/funds/${fundId}/carry/accruals/calculate`, {
    method: 'POST',
    body: { fundId },
    fallbackMessage: 'Failed to calculate carry accrual',
  });
  if (!payload) {
    logger.warn('Empty carry accrual payload from API; using fallback', {
      component: 'carryService',
      fundId,
    });
    const fallback = buildFallbackAccrual({ fundId, status: 'calculated' });
    upsertAccrual(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function approveCarryAccrual(id: string): Promise<CarryAccrual> {
  if (isMockMode('backOffice')) {
    const index = findAccrual(id);
    accrualStore[index] = {
      ...accrualStore[index],
      status: 'approved',
      calculationDate: new Date(),
    };
    return clone(accrualStore[index]);
  }

  const payload = await requestJson<CarryAccrual>(`/carry/accruals/${id}/approve`, {
    method: 'POST',
    fallbackMessage: 'Failed to approve carry accrual',
  });
  if (!payload) {
    logger.warn('Empty approve carry payload from API; using fallback', {
      component: 'carryService',
      accrualId: id,
    });
    const existing = accrualStore.find((item) => item.id === id);
    const fallback = buildFallbackAccrual({
      ...(existing ?? {}),
      id,
      status: 'approved',
      calculationDate: new Date(),
    });
    upsertAccrual(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function distributeCarryAccrual(id: string): Promise<CarryAccrual> {
  if (isMockMode('backOffice')) {
    const index = findAccrual(id);
    accrualStore[index] = {
      ...accrualStore[index],
      status: 'distributed',
      distributedCarry: accrualStore[index].accruedCarry,
      remainingCarry: 0,
      calculationDate: new Date(),
    };
    return clone(accrualStore[index]);
  }

  const payload = await requestJson<CarryAccrual>(`/carry/accruals/${id}/distribute`, {
    method: 'POST',
    fallbackMessage: 'Failed to distribute carry accrual',
  });
  if (!payload) {
    logger.warn('Empty distribute carry payload from API; using fallback', {
      component: 'carryService',
      accrualId: id,
    });
    const existing = accrualStore.find((item) => item.id === id);
    const base = existing ?? buildFallbackAccrual({ id });
    const fallback = buildFallbackAccrual({
      ...base,
      id,
      status: 'distributed',
      distributedCarry: base.accruedCarry,
      remainingCarry: 0,
      calculationDate: new Date(),
    });
    upsertAccrual(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function exportCarryAccrual(
  accrualId: string,
  format: 'pdf' | 'excel'
): Promise<{ accrualId: string; format: 'pdf' | 'excel'; exportedAt: string }> {
  if (isMockMode('backOffice')) {
    findAccrual(accrualId);
    return { accrualId, format, exportedAt: new Date().toISOString() };
  }

  const payload = await requestJson<{ accrualId: string; format: 'pdf' | 'excel'; exportedAt: string }>(
    `/carry/accruals/${accrualId}/export`,
    { method: 'POST', body: { format }, fallbackMessage: 'Failed to export carry accrual' }
  );
  if (!payload) {
    logger.warn('Empty carry export payload from API; using fallback metadata', {
      component: 'carryService',
      accrualId,
      format,
    });
    return { accrualId, format, exportedAt: new Date().toISOString() };
  }
  return payload;
}
