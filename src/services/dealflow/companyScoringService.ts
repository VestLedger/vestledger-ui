import { isMockMode } from '@/config/data-mode';
import { getMockCompanyScoreData, type CompanyScoreData } from '@/data/mocks/dealflow/company-scoring';

export type { CompanyScoreData };

export function getCompanyScoreData(companyId: number, companyName: string): CompanyScoreData {
  if (isMockMode()) return getMockCompanyScoreData(companyId, companyName);
  throw new Error('Company scoring API not implemented yet');
}
