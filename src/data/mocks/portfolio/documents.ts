export type PortfolioDocumentStatus =
  | 'overdue'
  | 'due-soon'
  | 'pending-review'
  | 'current'
  | 'awaiting-upload'
  | 'optional';

export type PortfolioDocumentCategory =
  | 'board-materials'
  | 'financial-reports'
  | 'compliance'
  | 'investor-updates'
  | 'pre-investment-dd';

export interface PortfolioDocumentCompany {
  id: number;
  name: string;
  sector: string;
  stage: string;
  overdueCount: number;
  pendingCount: number;
}

export interface PortfolioDocument {
  id: number;
  name: string;
  category: PortfolioDocumentCategory;
  status: PortfolioDocumentStatus;
  companyId: number;
  companyName: string;
  uploadedBy?: string;
  uploadedDate?: string;
  dueDate?: string;
  size?: string;
  frequency?: 'monthly' | 'quarterly' | 'annual' | 'one-time';
}

export const portfolioDocumentCompanies: PortfolioDocumentCompany[] = [
  { id: 1, name: 'Quantum AI', sector: 'AI/ML', stage: 'Series B', overdueCount: 1, pendingCount: 2 },
  { id: 2, name: 'BioTech Labs', sector: 'Healthcare', stage: 'Series A', overdueCount: 0, pendingCount: 1 },
  { id: 3, name: 'CloudScale', sector: 'SaaS', stage: 'Series B', overdueCount: 2, pendingCount: 0 },
  { id: 4, name: 'FinFlow', sector: 'FinTech', stage: 'Series A', overdueCount: 0, pendingCount: 3 },
  { id: 5, name: 'DataStream', sector: 'Analytics', stage: 'Seed', overdueCount: 1, pendingCount: 1 },
  { id: 6, name: 'EcoEnergy', sector: 'CleanTech', stage: 'Series B', overdueCount: 0, pendingCount: 2 },
];

export const portfolioDocuments: PortfolioDocument[] = [
  // Board Materials
  { id: 1, name: 'Q4 2024 Board Deck', category: 'board-materials', status: 'awaiting-upload', companyId: 1, companyName: 'Quantum AI', dueDate: 'Dec 15, 2024', frequency: 'quarterly' },
  { id: 2, name: 'Board Meeting Minutes - November', category: 'board-materials', status: 'pending-review', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Sarah Chen', uploadedDate: 'Nov 28, 2024', size: '245 KB' },
  { id: 3, name: 'Board Consent - New Hire', category: 'board-materials', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Dr. James Wilson', uploadedDate: 'Nov 20, 2024', size: '156 KB' },

  // Financial Reports
  { id: 4, name: 'Monthly Financial Report - November', category: 'financial-reports', status: 'overdue', companyId: 1, companyName: 'Quantum AI', dueDate: 'Dec 5, 2024', frequency: 'monthly' },
  { id: 5, name: 'Q3 2024 Financial Package', category: 'financial-reports', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Finance Team', uploadedDate: 'Oct 15, 2024', size: '1.8 MB', frequency: 'quarterly' },
  { id: 6, name: 'Cash Flow Projection - Q1 2025', category: 'financial-reports', status: 'pending-review', companyId: 3, companyName: 'CloudScale', uploadedBy: 'Maria Rodriguez', uploadedDate: 'Nov 30, 2024', size: '892 KB' },
  { id: 7, name: 'Monthly Financial Report - October', category: 'financial-reports', status: 'overdue', companyId: 3, companyName: 'CloudScale', dueDate: 'Nov 5, 2024', frequency: 'monthly' },
  { id: 8, name: 'Annual Budget 2025', category: 'financial-reports', status: 'due-soon', companyId: 4, companyName: 'FinFlow', dueDate: 'Dec 10, 2024', frequency: 'annual' },

  // Compliance Documents
  { id: 9, name: 'SOC 2 Type II Report', category: 'compliance', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Security Team', uploadedDate: 'Nov 1, 2024', size: '3.2 MB', frequency: 'annual' },
  { id: 10, name: 'Annual Audit Package 2024', category: 'compliance', status: 'overdue', companyId: 3, companyName: 'CloudScale', dueDate: 'Nov 30, 2024', frequency: 'annual' },
  { id: 11, name: 'Insurance Renewal Documents', category: 'compliance', status: 'pending-review', companyId: 5, companyName: 'DataStream', uploadedBy: 'Operations', uploadedDate: 'Dec 1, 2024', size: '678 KB' },

  // Investor Updates
  { id: 12, name: 'Monthly Investor Update - November', category: 'investor-updates', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Sarah Chen', uploadedDate: 'Nov 25, 2024', size: '445 KB', frequency: 'monthly' },
  { id: 13, name: 'Q4 2024 Investor Letter', category: 'investor-updates', status: 'awaiting-upload', companyId: 4, companyName: 'FinFlow', dueDate: 'Dec 20, 2024', frequency: 'quarterly' },
  { id: 14, name: 'Product Milestone Update', category: 'investor-updates', status: 'current', companyId: 6, companyName: 'EcoEnergy', uploadedBy: 'John Park', uploadedDate: 'Nov 18, 2024', size: '1.1 MB' },

  // Pre-Investment DD (historical reference)
  { id: 15, name: 'Investment Committee Memo', category: 'pre-investment-dd', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Investment Team', uploadedDate: 'Jan 10, 2022', size: '2.4 MB', frequency: 'one-time' },
  { id: 16, name: 'Due Diligence Report', category: 'pre-investment-dd', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Investment Team', uploadedDate: 'Mar 5, 2022', size: '4.8 MB', frequency: 'one-time' },
];

export const portfolioDocumentCategories: Array<{
  id: PortfolioDocumentCategory;
  name: string;
  description: string;
}> = [
  { id: 'board-materials', name: 'Board Materials', description: 'Decks, minutes, consents' },
  { id: 'financial-reports', name: 'Financial Reports', description: 'Monthly/quarterly/annual reports' },
  { id: 'compliance', name: 'Compliance Docs', description: 'Audits, SOC2, legal' },
  { id: 'investor-updates', name: 'Investor Updates', description: 'LP communications' },
  { id: 'pre-investment-dd', name: 'Pre-Investment DD', description: 'Historical reference' },
];

