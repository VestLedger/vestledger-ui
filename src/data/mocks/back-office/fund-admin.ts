export interface CapitalCall {
  id: string;
  callNumber: number;
  fundName: string;
  callDate: string;
  dueDate: string;
  totalAmount: number;
  amountReceived: number;
  lpCount: number;
  lpsResponded: number;
  status: 'draft' | 'sent' | 'in-progress' | 'completed';
  purpose: string;
}

export interface Distribution {
  id: string;
  distributionNumber: number;
  fundName: string;
  distributionDate: string;
  totalAmount: number;
  lpCount: number;
  status: 'draft' | 'processing' | 'completed';
  source: string;
  type: 'return-of-capital' | 'capital-gain' | 'dividend';
}

export interface LPResponse {
  id: string;
  lpName: string;
  commitment: number;
  callAmount: number;
  amountPaid: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paymentMethod: string;
}

export const mockCapitalCalls: CapitalCall[] = [
  {
    id: '1',
    callNumber: 8,
    fundName: 'Acme Ventures Fund II',
    callDate: '2024-12-01',
    dueDate: '2024-12-15',
    totalAmount: 15000000,
    amountReceived: 12000000,
    lpCount: 12,
    lpsResponded: 9,
    status: 'in-progress',
    purpose: 'Series B investments - CloudScale, DataFlow',
  },
  {
    id: '2',
    callNumber: 7,
    fundName: 'Acme Ventures Fund II',
    callDate: '2024-09-15',
    dueDate: '2024-09-30',
    totalAmount: 12500000,
    amountReceived: 12500000,
    lpCount: 12,
    lpsResponded: 12,
    status: 'completed',
    purpose: 'Follow-on investments and operating reserves',
  },
  {
    id: '3',
    callNumber: 9,
    fundName: 'Acme Ventures Fund III',
    callDate: '2024-12-10',
    dueDate: '2024-12-25',
    totalAmount: 20000000,
    amountReceived: 0,
    lpCount: 15,
    lpsResponded: 0,
    status: 'draft',
    purpose: 'Initial deployment - Seed and Series A investments',
  },
];

export const mockDistributions: Distribution[] = [
  {
    id: '1',
    distributionNumber: 5,
    fundName: 'Acme Ventures Fund II',
    distributionDate: '2024-11-30',
    totalAmount: 8500000,
    lpCount: 12,
    status: 'completed',
    source: 'CloudScale exit proceeds',
    type: 'capital-gain',
  },
  {
    id: '2',
    distributionNumber: 4,
    fundName: 'Acme Ventures Fund II',
    distributionDate: '2024-08-31',
    totalAmount: 5200000,
    lpCount: 12,
    status: 'completed',
    source: 'Portfolio company dividends',
    type: 'dividend',
  },
  {
    id: '3',
    distributionNumber: 6,
    fundName: 'Acme Ventures Fund I',
    distributionDate: '2024-12-20',
    totalAmount: 12000000,
    lpCount: 10,
    status: 'processing',
    source: 'FinTech Solutions IPO proceeds',
    type: 'capital-gain',
  },
];

export const mockLPResponses: LPResponse[] = [
  {
    id: '1',
    lpName: 'University Endowment Fund',
    commitment: 50000000,
    callAmount: 5000000,
    amountPaid: 5000000,
    dueDate: '2024-12-15',
    status: 'paid',
    paymentMethod: 'Wire Transfer',
  },
  {
    id: '2',
    lpName: 'Tech Pension Fund',
    commitment: 30000000,
    callAmount: 3000000,
    amountPaid: 3000000,
    dueDate: '2024-12-15',
    status: 'paid',
    paymentMethod: 'ACH',
  },
  {
    id: '3',
    lpName: 'Family Office Partners',
    commitment: 25000000,
    callAmount: 2500000,
    amountPaid: 1500000,
    dueDate: '2024-12-15',
    status: 'partial',
    paymentMethod: 'Wire Transfer',
  },
  {
    id: '4',
    lpName: 'Sovereign Wealth Fund',
    commitment: 75000000,
    callAmount: 7500000,
    amountPaid: 0,
    dueDate: '2024-12-15',
    status: 'pending',
    paymentMethod: 'Wire Transfer',
  },
];

