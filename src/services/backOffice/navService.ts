import {
  mockNAVCalculations,
} from '@/data/mocks/back-office/fund-admin-ops';
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

export async function getNAVCalculations(fundId?: string): Promise<NAVCalculation[]> {
  const values = fundId ? navStore.filter((item) => item.fundId === fundId) : navStore;
  return clone(values);
}

export async function calculateNAV(fundId: string, fundName: string): Promise<NAVCalculation> {
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

export async function markNAVReviewed(
  calculationId: string,
  reviewedBy: string
): Promise<NAVCalculation> {
  const index = findCalculation(calculationId);
  navStore[index] = {
    ...navStore[index],
    status: 'reviewed',
    reviewedBy,
    calculationDate: new Date(),
  };
  return clone(navStore[index]);
}

export async function publishNAV(
  calculationId: string,
  publishedBy: string
): Promise<NAVCalculation> {
  const index = findCalculation(calculationId);
  navStore[index] = {
    ...navStore[index],
    status: 'published',
    publishedBy,
    calculationDate: new Date(),
  };
  return clone(navStore[index]);
}

export async function exportNAV(
  calculationId: string,
  format: 'pdf' | 'excel'
): Promise<{ calculationId: string; format: 'pdf' | 'excel'; exportedAt: string }> {
  findCalculation(calculationId);
  return {
    calculationId,
    format,
    exportedAt: new Date().toISOString(),
  };
}
