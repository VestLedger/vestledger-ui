import { isMockMode } from '@/config/data-mode';
import { mockScoreData, type CompanyScoreData } from '@/data/mocks/dealflow/company-scoring';

export type { CompanyScoreData };

export function getCompanyScoreData(): CompanyScoreData {
  if (isMockMode()) return mockScoreData;
  throw new Error('Company scoring API not implemented yet');
}

