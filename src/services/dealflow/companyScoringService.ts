import { isMockMode } from '@/config/data-mode';
import { getMockCompanyScoreData, type CompanyScoreData } from '@/data/mocks/dealflow/company-scoring';

export type { CompanyScoreData };

export function getCompanyScoreData(companyId: number, companyName: string): CompanyScoreData {
  if (isMockMode('dealflow')) return getMockCompanyScoreData(companyId, companyName);

  return getMockCompanyScoreData(companyId, companyName);
}
