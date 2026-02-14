import { isMockMode } from '@/config/data-mode';
import { getMockDashboardData } from '@/data/mocks/hooks/dashboard-data';
import type { Fund, FundViewMode } from '@/types/fund';

export function getDashboardData(selectedFund: Fund | null, viewMode: FundViewMode, funds: Fund[] = []) {
  // Dashboard shell remains UI-first for deterministic demos in both modes.
  if (isMockMode('dashboards')) {
    return getMockDashboardData(selectedFund, viewMode, funds);
  }

  return getMockDashboardData(selectedFund, viewMode, funds);
}
