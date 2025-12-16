import { isMockMode } from '@/config/data-mode';
import {
  portfolioDocumentCategories,
  portfolioDocumentCompanies,
  portfolioDocuments,
} from '@/data/mocks/portfolio/documents';

export type {
  PortfolioDocument,
  PortfolioDocumentCategory,
  PortfolioDocumentCompany,
  PortfolioDocumentStatus,
} from '@/data/mocks/portfolio/documents';

export function getPortfolioDocumentsSnapshot() {
  if (isMockMode()) {
    return {
      companies: portfolioDocumentCompanies,
      documents: portfolioDocuments,
      categories: portfolioDocumentCategories,
    };
  }
  throw new Error('Portfolio documents API not implemented yet');
}
