import { isMockMode } from '@/config/data-mode';
import { getMockDashboardData } from '@/data/mocks/hooks/dashboard-data';
import type { Fund, FundViewMode } from '@/types/fund';

export function getDashboardData(selectedFund: Fund | null, viewMode: FundViewMode, funds: Fund[] = []) {
  if (isMockMode()) return getMockDashboardData(selectedFund, viewMode, funds);
  throw new Error('Dashboard data API not implemented yet');
}
