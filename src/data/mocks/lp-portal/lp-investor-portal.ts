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

