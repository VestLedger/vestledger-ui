import { isMockMode } from '@/config/data-mode';
import {
  industries,
  mockCompanies,
  stages,
} from '@/data/mocks/deal-intelligence/company-search';

export function getCompanySearchIndustries() {
  if (isMockMode()) return industries;
  throw new Error('Company search API not implemented yet');
}

export function getCompanySearchStages() {
  if (isMockMode()) return stages;
  throw new Error('Company search API not implemented yet');
}

export function getCompanySearchCompanies() {
  if (isMockMode()) return mockCompanies;
  throw new Error('Company search API not implemented yet');
}

