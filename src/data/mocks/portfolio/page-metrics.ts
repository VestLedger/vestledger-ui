import { portfolioCompanies, portfolioUpdates } from '@/data/mocks/mock-portfolio-data';

const isCompanyAtRisk = (healthScore: number) => healthScore < 82;

export const portfolioPageMetrics = {
  totalCompanies: portfolioCompanies.length,
  atRiskCompanies: portfolioCompanies.filter((c) => c.status === 'at-risk' || isCompanyAtRisk(c.healthScore)).length,
  pendingUpdates: portfolioUpdates.length,
};

export const portfolioPageHealthyCompanies =
  portfolioPageMetrics.totalCompanies - portfolioPageMetrics.atRiskCompanies;

