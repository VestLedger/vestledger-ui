import {
  mockCarriedInterestTerms,
  mockCarryAccruals,
} from '@/data/mocks/back-office/fund-admin-ops';
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

export async function getCarriedInterestTerms(fundId?: string): Promise<CarriedInterestTerm[]> {
  const values = fundId ? termsStore.filter((item) => item.fundId === fundId) : termsStore;
  return clone(values);
}

export async function getCarryAccruals(fundId?: string): Promise<CarryAccrual[]> {
  const values = fundId ? accrualStore.filter((item) => item.fundId === fundId) : accrualStore;
  return clone(values);
}

export async function calculateCarryAccrual(
  fundId: string,
  _fundName: string
): Promise<CarryAccrual> {
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

export async function approveCarryAccrual(id: string): Promise<CarryAccrual> {
  const index = findAccrual(id);
  accrualStore[index] = {
    ...accrualStore[index],
    status: 'approved',
    calculationDate: new Date(),
  };
  return clone(accrualStore[index]);
}

export async function distributeCarryAccrual(id: string): Promise<CarryAccrual> {
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

export async function exportCarryAccrual(
  accrualId: string,
  format: 'pdf' | 'excel'
): Promise<{ accrualId: string; format: 'pdf' | 'excel'; exportedAt: string }> {
  findAccrual(accrualId);
  return {
    accrualId,
    format,
    exportedAt: new Date().toISOString(),
  };
}
