export interface TaxDocument {
  id: string;
  documentType: string;
  taxYear: number;
  recipientType: 'LP' | 'GP' | 'Portfolio Company';
  recipientName: string;
  status: 'draft' | 'ready' | 'sent' | 'filed';
  generatedDate: string | null;
  sentDate: string | null;
  amount?: number;
}

export interface TaxSummary {
  id: string;
  fundName: string;
  taxYear: number;
  k1sIssued: number;
  k1sTotal: number;
  form1099Issued: number;
  form1099Total: number;
  estimatedTaxesPaid: number;
  totalDistributions: number;
  filingDeadline: string;
}

export interface PortfolioCompanyTax {
  id: string;
  companyName: string;
  ownership: number;
  taxClassification: string;
  k1Required: boolean;
  k1Received: boolean;
  k1ReceivedDate: string | null;
  contactEmail: string;
}

export const mockFilingDeadline = new Date('2025-03-15');

export const mockTaxDocuments: TaxDocument[] = [
  {
    id: '1',
    documentType: 'Schedule K-1 (Form 1065)',
    taxYear: 2024,
    recipientType: 'LP',
    recipientName: 'University Endowment Fund',
    status: 'sent',
    generatedDate: '2024-12-01',
    sentDate: '2024-12-05',
    amount: 2500000,
  },
  {
    id: '2',
    documentType: 'Schedule K-1 (Form 1065)',
    taxYear: 2024,
    recipientType: 'LP',
    recipientName: 'Tech Pension Fund',
    status: 'ready',
    generatedDate: '2024-12-01',
    sentDate: null,
    amount: 1800000,
  },
  {
    id: '3',
    documentType: 'Form 1099-DIV',
    taxYear: 2024,
    recipientType: 'LP',
    recipientName: 'Family Office Partners',
    status: 'sent',
    generatedDate: '2024-11-28',
    sentDate: '2024-12-01',
    amount: 150000,
  },
  {
    id: '4',
    documentType: 'Schedule K-1 (Form 1065)',
    taxYear: 2024,
    recipientType: 'LP',
    recipientName: 'Sovereign Wealth Fund',
    status: 'draft',
    generatedDate: null,
    sentDate: null,
    amount: 5000000,
  },
  {
    id: '5',
    documentType: 'Form 1099-MISC',
    taxYear: 2024,
    recipientType: 'Portfolio Company',
    recipientName: 'CloudScale Inc.',
    status: 'sent',
    generatedDate: '2024-11-20',
    sentDate: '2024-11-25',
    amount: 75000,
  },
];

export const mockTaxSummaries: TaxSummary[] = [
  {
    id: '1',
    fundName: 'Acme Ventures Fund II',
    taxYear: 2024,
    k1sIssued: 8,
    k1sTotal: 12,
    form1099Issued: 5,
    form1099Total: 8,
    estimatedTaxesPaid: 450000,
    totalDistributions: 13700000,
    filingDeadline: '2025-03-15',
  },
  {
    id: '2',
    fundName: 'Acme Ventures Fund III',
    taxYear: 2024,
    k1sIssued: 12,
    k1sTotal: 15,
    form1099Issued: 3,
    form1099Total: 6,
    estimatedTaxesPaid: 320000,
    totalDistributions: 8500000,
    filingDeadline: '2025-03-15',
  },
  {
    id: '3',
    fundName: 'Acme Ventures Fund I',
    taxYear: 2024,
    k1sIssued: 10,
    k1sTotal: 10,
    form1099Issued: 4,
    form1099Total: 4,
    estimatedTaxesPaid: 280000,
    totalDistributions: 6200000,
    filingDeadline: '2025-03-15',
  },
];

export const mockPortfolioTax: PortfolioCompanyTax[] = [
  {
    id: '1',
    companyName: 'CloudScale Inc.',
    ownership: 18.5,
    taxClassification: 'C-Corp',
    k1Required: false,
    k1Received: false,
    k1ReceivedDate: null,
    contactEmail: 'finance@cloudscale.com',
  },
  {
    id: '2',
    companyName: 'DataFlow Systems',
    ownership: 22.3,
    taxClassification: 'C-Corp',
    k1Required: false,
    k1Received: false,
    k1ReceivedDate: null,
    contactEmail: 'accounting@dataflow.com',
  },
  {
    id: '3',
    companyName: 'FinTech Solutions',
    ownership: 15.8,
    taxClassification: 'S-Corp',
    k1Required: true,
    k1Received: true,
    k1ReceivedDate: '2024-11-15',
    contactEmail: 'tax@fintech.com',
  },
  {
    id: '4',
    companyName: 'AI Analytics Co.',
    ownership: 25.0,
    taxClassification: 'LLC (Partnership)',
    k1Required: true,
    k1Received: false,
    k1ReceivedDate: null,
    contactEmail: 'cfo@aianalytics.com',
  },
];
