import { isMockMode } from '@/config/data-mode';
import {
  mockInvestorData,
  mockReports,
  mockTransactions,
} from '@/data/mocks/lp-portal/lp-investor-portal';

export function getInvestorSnapshot() {
  if (isMockMode()) {
    return { investor: mockInvestorData, reports: mockReports, transactions: mockTransactions };
  }
  throw new Error('LP portal API not implemented yet');
}

