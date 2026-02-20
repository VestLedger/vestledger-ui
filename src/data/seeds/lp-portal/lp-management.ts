export interface LP {
  id: string;
  name: string;
  type: 'institution' | 'family-office' | 'individual' | 'corporate';
  commitmentAmount: number;
  calledCapital: number;
  distributedCapital: number;
  navValue: number;
  dpi: number;
  tvpi: number;
  irr: number;
  joinDate: string;
  contactPerson: string;
  email: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'monthly' | 'special';
  quarter?: string;
  year: number;
  publishedDate: string;
  status: 'published' | 'draft' | 'scheduled';
  downloadUrl?: string;
  viewCount: number;
}

export interface CapitalCall {
  id: string;
  callNumber: number;
  amount: number;
  dueDate: string;
  purpose: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Distribution {
  id: string;
  distributionNumber: number;
  amount: number;
  paymentDate: string;
  type: 'realized-gains' | 'dividends' | 'return-of-capital';
  status: 'paid' | 'pending' | 'processing';
}

export const mockLPs: LP[] = [
  {
    id: '1',
    name: 'University Endowment Fund',
    type: 'institution',
    commitmentAmount: 50000000,
    calledCapital: 30000000,
    distributedCapital: 12000000,
    navValue: 42000000,
    dpi: 0.4,
    tvpi: 1.8,
    irr: 24.5,
    joinDate: '2021-03-15',
    contactPerson: 'Dr. James Wilson',
    email: 'jwilson@university-endowment.edu',
  },
  {
    id: '2',
    name: 'Smith Family Office',
    type: 'family-office',
    commitmentAmount: 25000000,
    calledCapital: 20000000,
    distributedCapital: 8000000,
    navValue: 28000000,
    dpi: 0.4,
    tvpi: 1.8,
    irr: 22.3,
    joinDate: '2021-06-20',
    contactPerson: 'Sarah Smith',
    email: 'sarah@smithfamilyoffice.com',
  },
  {
    id: '3',
    name: 'Global Pension Fund',
    type: 'institution',
    commitmentAmount: 100000000,
    calledCapital: 75000000,
    distributedCapital: 25000000,
    navValue: 105000000,
    dpi: 0.33,
    tvpi: 1.73,
    irr: 21.8,
    joinDate: '2021-01-10',
    contactPerson: 'Michael Chen',
    email: 'mchen@globalpension.com',
  },
];

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q3 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q3',
    year: 2024,
    publishedDate: '2024-10-15',
    status: 'published',
    viewCount: 45,
  },
  {
    id: '2',
    title: '2023 Annual Report',
    type: 'annual',
    year: 2023,
    publishedDate: '2024-03-31',
    status: 'published',
    viewCount: 152,
  },
  {
    id: '3',
    title: 'Q2 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q2',
    year: 2024,
    publishedDate: '2024-07-15',
    status: 'published',
    viewCount: 89,
  },
  {
    id: '4',
    title: 'Q4 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q4',
    year: 2024,
    publishedDate: '2025-01-15',
    status: 'draft',
    viewCount: 0,
  },
];

export const mockCapitalCalls: CapitalCall[] = [
  {
    id: '1',
    callNumber: 8,
    amount: 15000000,
    dueDate: '2024-12-15',
    purpose: 'Series B investment in CloudScale and NeuroLink',
    status: 'pending',
  },
  {
    id: '2',
    callNumber: 7,
    amount: 12000000,
    dueDate: '2024-09-15',
    purpose: 'Series A follow-on in Quantum AI',
    status: 'paid',
  },
];

export const mockDistributions: Distribution[] = [
  {
    id: '1',
    distributionNumber: 5,
    amount: 8500000,
    paymentDate: '2024-11-30',
    type: 'realized-gains',
    status: 'paid',
  },
  {
    id: '2',
    distributionNumber: 4,
    amount: 3200000,
    paymentDate: '2024-08-31',
    type: 'realized-gains',
    status: 'paid',
  },
];

