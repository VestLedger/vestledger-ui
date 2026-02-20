import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

export interface PendingCapitalCall {
  id: string;
  fundName: string;
  callNumber: number;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'overdue' | 'partial';
  paidAmount: number;
}

export interface PendingSignature {
  id: string;
  documentName: string;
  documentType: string;
  requestedDate: Date;
  urgency: 'high' | 'medium' | 'low';
}

const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z').getTime();

export const pendingCalls: PendingCapitalCall[] = [
  {
    id: '1',
    fundName: 'Quantum Ventures Fund III',
    callNumber: 3,
    amount: 750000,
    dueDate: new Date(MOCK_NOW + 7 * 24 * 60 * 60 * 1000),
    status: 'pending',
    paidAmount: 0,
  },
];

export const pendingSignatures: PendingSignature[] = [
  {
    id: '1',
    documentName: 'Side Letter Amendment',
    documentType: 'Legal Amendment',
    requestedDate: new Date(MOCK_NOW - 2 * 24 * 60 * 60 * 1000),
    urgency: 'high',
  },
  {
    id: '2',
    documentName: 'Q4 Consent Form',
    documentType: 'Consent',
    requestedDate: new Date(MOCK_NOW - 5 * 24 * 60 * 60 * 1000),
    urgency: 'medium',
  },
];

export const lpDashboardMetrics = [
  {
    label: 'Capital Account',
    value: '$4.2M',
    change: '+12.4%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    label: 'Total Distributions',
    value: '$1.8M',
    change: 'YTD',
    trend: 'up' as const,
    icon: TrendingUp,
  },
  {
    label: 'NAV',
    value: '$5.6M',
    change: 'Q3 2024',
    trend: 'up' as const,
    icon: BarChart3,
  },
  {
    label: 'IRR',
    value: '24.3%',
    change: 'Net',
    trend: 'up' as const,
    icon: TrendingUp,
  },
];

export const lpDashboardDocuments = [
  { name: 'Q3 2024 LP Report', type: 'Report', date: 'Oct 15, 2024' },
  { name: 'Capital Call Notice #12', type: 'Notice', date: 'Sep 30, 2024' },
  { name: 'Distribution Notice #8', type: 'Notice', date: 'Aug 15, 2024' },
  { name: 'Fund III LPA Amendment', type: 'Legal', date: 'Jul 01, 2024' },
];

export const lpDashboardCapitalActivity = [
  { type: 'Capital Call', amount: '$500K', date: 'Oct 01, 2024', status: 'Paid' },
  { type: 'Distribution', amount: '$125K', date: 'Sep 15, 2024', status: 'Received' },
  { type: 'Capital Call', amount: '$500K', date: 'Jul 01, 2024', status: 'Paid' },
];

export const lpDashboardCommitment = {
  totalCommitment: 10_000_000,
  calledAmount: 6_500_000,
};
