import { isMockMode } from '@/config/data-mode';
import {
  mockInvestorData,
  mockReports,
  mockTransactions,
  mockDistributionStatements,
  mockUpcomingDistributions,
  mockDistributionConfirmations,
  mockBankDetails,
  mockNotificationPreferences,
  mockEmailPreview,
  mockFAQItems,
} from '@/data/mocks/lp-portal/lp-investor-portal';

export function getInvestorSnapshot() {
  if (isMockMode()) {
    return {
      investor: mockInvestorData,
      reports: mockReports,
      transactions: mockTransactions,
      distributionStatements: mockDistributionStatements,
      upcomingDistributions: mockUpcomingDistributions,
      distributionConfirmations: mockDistributionConfirmations,
      bankDetails: mockBankDetails,
      notificationPreferences: mockNotificationPreferences,
      emailPreview: mockEmailPreview,
      faqItems: mockFAQItems,
    };
  }
  throw new Error('LP portal API not implemented yet');
}
