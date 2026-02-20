export interface InvestorData {
  name: string;
  fundName: string;
  commitmentAmount: number;
  calledCapital: number;
  distributedCapital: number;
  navValue: number;
  dpi: number;
  tvpi: number;
  rvpi: number;
  irr: number;
  moic: number;
  joinDate: string;
  lastUpdate: string;
}

export interface QuarterlyReport {
  id: string;
  quarter: string;
  year: number;
  publishedDate: string;
  downloadUrl: string;
}

export interface Transaction {
  id: string;
  type: 'capital-call' | 'distribution';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending';
}

export type LPStatementStatus = 'available' | 'processing' | 'pending';

export interface LPDistributionStatement {
  id: string;
  distributionName: string;
  statementDate: string;
  amount: number;
  template: 'standard' | 'ilpa-compliant' | 'custom';
  status: LPStatementStatus;
  pdfUrl?: string;
  taxForms: Array<{
    type: 'k1' | '1099';
    url?: string;
    generated: boolean;
  }>;
  lpConfirmed: boolean;
}

export interface LPUpcomingDistribution {
  id: string;
  title: string;
  fundName: string;
  expectedDate: string;
  estimatedAmount: number;
  status: 'scheduled' | 'upcoming' | 'processing' | 'completed';
  notes?: string;
}

export interface LPDistributionConfirmation {
  id: string;
  distributionName: string;
  statementDate: string;
  amount: number;
  requiresConfirmation: boolean;
  confirmedAt?: string;
}

export type LPElectionStatus = 'pending' | 'submitted' | 'overdue';

export interface LPDistributionElection {
  id: string;
  distributionName: string;
  assetName: string;
  dueDate: string;
  estimatedValue: number;
  electionType: 'cash' | 'shares' | 'split';
  status: LPElectionStatus;
  options: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  selectedOptionId?: string;
}

export interface LPBankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  accountType: 'checking' | 'savings';
  currency: 'USD' | 'EUR' | 'GBP';
  country: string;
  lastUpdated: string;
  verified: boolean;
}

export interface LPNotificationPreferences {
  statementReady: boolean;
  distributionReminders: boolean;
  taxDocumentAlerts: boolean;
  marketingUpdates: boolean;
  reminderDaysBefore: number[];
  emailAddress: string;
}

export interface LPEmailPreview {
  subject: string;
  body: string;
  footer: string;
}

export interface LPFAQItem {
  id: string;
  question: string;
  answer: string;
}

export const mockInvestorData: InvestorData = {
  name: 'University Endowment Fund',
  fundName: 'Acme Ventures Fund II',
  commitmentAmount: 50000000,
  calledCapital: 30000000,
  distributedCapital: 12000000,
  navValue: 42000000,
  dpi: 0.4,
  tvpi: 1.8,
  rvpi: 1.4,
  irr: 24.5,
  moic: 1.8,
  joinDate: '2021-03-15',
  lastUpdate: '2024-11-28',
};

export const mockReports: QuarterlyReport[] = [
  {
    id: '1',
    quarter: 'Q3',
    year: 2024,
    publishedDate: '2024-10-15',
    downloadUrl: '#',
  },
  {
    id: '2',
    quarter: 'Q2',
    year: 2024,
    publishedDate: '2024-07-15',
    downloadUrl: '#',
  },
  {
    id: '3',
    quarter: 'Q1',
    year: 2024,
    publishedDate: '2024-04-15',
    downloadUrl: '#',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'distribution',
    amount: 2500000,
    date: '2024-11-30',
    description: 'Q3 2024 Distribution - CloudScale exit proceeds',
    status: 'completed',
  },
  {
    id: '2',
    type: 'capital-call',
    amount: 3000000,
    date: '2024-12-15',
    description: 'Capital Call #8 - Series B investments',
    status: 'pending',
  },
  {
    id: '3',
    type: 'distribution',
    amount: 1800000,
    date: '2024-08-31',
    description: 'Q2 2024 Distribution - Portfolio returns',
    status: 'completed',
  },
  {
    id: '4',
    type: 'capital-call',
    amount: 2500000,
    date: '2024-09-15',
    description: 'Capital Call #7 - Follow-on investments',
    status: 'completed',
  },
];

export const mockDistributionStatements: LPDistributionStatement[] = [
  {
    id: 'lp-statement-1',
    distributionName: 'Q3 2024 Distribution - CloudScale Exit',
    statementDate: '2024-11-30',
    amount: 2500000,
    template: 'ilpa-compliant',
    status: 'available',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    taxForms: [
      { type: 'k1', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', generated: true },
      { type: '1099', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', generated: true },
    ],
    lpConfirmed: true,
  },
  {
    id: 'lp-statement-2',
    distributionName: 'Q2 2024 Distribution - Portfolio Returns',
    statementDate: '2024-08-31',
    amount: 1800000,
    template: 'standard',
    status: 'available',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    taxForms: [
      { type: 'k1', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', generated: true },
      { type: '1099', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', generated: false },
    ],
    lpConfirmed: false,
  },
  {
    id: 'lp-statement-3',
    distributionName: 'Q4 2024 Distribution - Recapitalization',
    statementDate: '2024-12-20',
    amount: 3200000,
    template: 'custom',
    status: 'processing',
    taxForms: [
      { type: 'k1', generated: false },
      { type: '1099', generated: false },
    ],
    lpConfirmed: false,
  },
];

export const mockUpcomingDistributions: LPUpcomingDistribution[] = [
  {
    id: 'lp-upcoming-1',
    title: 'Q1 2025 Dividend Distribution',
    fundName: 'Acme Ventures Fund II',
    expectedDate: '2025-03-31',
    estimatedAmount: 2100000,
    status: 'scheduled',
    notes: 'Quarterly recurring dividend.',
  },
  {
    id: 'lp-upcoming-2',
    title: 'FinTech Labs Partial Exit',
    fundName: 'Acme Ventures Fund II',
    expectedDate: '2025-02-15',
    estimatedAmount: 1650000,
    status: 'upcoming',
    notes: 'Secondary sale distribution.',
  },
  {
    id: 'lp-upcoming-3',
    title: 'DataCore Follow-on Distribution',
    fundName: 'Acme Ventures Fund II',
    expectedDate: '2025-04-20',
    estimatedAmount: 980000,
    status: 'processing',
  },
];

export const mockDistributionConfirmations: LPDistributionConfirmation[] = [
  {
    id: 'lp-confirm-1',
    distributionName: 'Q2 2024 Distribution - Portfolio Returns',
    statementDate: '2024-08-31',
    amount: 1800000,
    requiresConfirmation: true,
  },
  {
    id: 'lp-confirm-2',
    distributionName: 'Q3 2024 Distribution - CloudScale Exit',
    statementDate: '2024-11-30',
    amount: 2500000,
    requiresConfirmation: false,
    confirmedAt: '2024-12-02',
  },
];

export const mockDistributionElections: LPDistributionElection[] = [
  {
    id: 'lp-election-1',
    distributionName: 'DataCore AI Exit Distribution',
    assetName: 'DataCore AI Common',
    dueDate: '2024-10-05',
    estimatedValue: 1_250_000,
    electionType: 'split',
    status: 'pending',
    options: [
      {
        id: 'cash',
        label: 'All Cash',
        description: 'Receive cash proceeds based on current share value.',
      },
      {
        id: 'shares',
        label: 'All Shares',
        description: 'Receive shares in-kind with fractional cash-in-lieu.',
      },
      {
        id: 'split',
        label: 'Split 60/40',
        description: '60% shares, 40% cash distribution.',
      },
    ],
    selectedOptionId: 'split',
  },
  {
    id: 'lp-election-2',
    distributionName: 'FinTech Labs Partial Exit',
    assetName: 'FinTech Labs Note',
    dueDate: '2024-10-18',
    estimatedValue: 620_000,
    electionType: 'cash',
    status: 'overdue',
    options: [
      {
        id: 'cash',
        label: 'Cash Only',
        description: 'Default cash distribution if no election submitted.',
      },
      {
        id: 'shares',
        label: 'In-Kind Note',
        description: 'Receive the convertible note directly.',
      },
    ],
  },
];

export const mockBankDetails: LPBankDetails = {
  accountName: 'University Endowment Fund',
  bankName: 'First National Bank',
  accountNumber: '**** 4821',
  routingNumber: '110000000',
  swiftCode: 'FNBAUS33',
  iban: '',
  accountType: 'checking',
  currency: 'USD',
  country: 'United States',
  lastUpdated: '2024-10-12',
  verified: true,
};

export const mockNotificationPreferences: LPNotificationPreferences = {
  statementReady: true,
  distributionReminders: true,
  taxDocumentAlerts: true,
  marketingUpdates: false,
  reminderDaysBefore: [7, 1],
  emailAddress: 'lp-investor@example.com',
};

export const mockEmailPreview: LPEmailPreview = {
  subject: 'Your Q3 2024 distribution statement is ready',
  body:
    'Hello,\n\nYour distribution statement is ready for review. Please log in to the LP portal to view details, download tax forms, and confirm receipt.\n\nIf you have questions, reply to this email or contact your fund administrator.',
  footer: 'VestLedger Investor Relations - ir@vestledger.com',
};

export const mockFAQItems: LPFAQItem[] = [
  {
    id: 'lp-faq-1',
    question: 'When will distribution statements be available?',
    answer:
      'Statements are typically published within 5 business days of the distribution payment date.',
  },
  {
    id: 'lp-faq-2',
    question: 'How do I confirm receipt of a distribution?',
    answer:
      'Open the distribution confirmation panel and click Confirm Receipt for the statement.',
  },
  {
    id: 'lp-faq-3',
    question: 'Can I update my wire instructions here?',
    answer:
      'Yes. Use the bank details form to submit updates. Changes are verified before they take effect.',
  },
  {
    id: 'lp-faq-4',
    question: 'Where can I download my tax documents?',
    answer:
      'Tax forms are listed alongside each statement and are available once generated.',
  },
];
