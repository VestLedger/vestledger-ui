import { isMockMode } from '@/config/data-mode';
import { getMockDashboardData } from '@/data/mocks/hooks/dashboard-data';
import type { Fund, FundViewMode } from '@/types/fund';

export function getDashboardData(selectedFund: Fund | null, viewMode: FundViewMode) {
  if (isMockMode()) return getMockDashboardData(selectedFund, viewMode);
  throw new Error('Dashboard data API not implemented yet');
}

