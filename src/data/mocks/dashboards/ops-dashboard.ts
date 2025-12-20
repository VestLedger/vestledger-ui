import { DollarSign, Shield, FileText, CheckSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export const opsDashboardMetrics: DashboardMetric[] = [
  {
    label: 'Pending Approvals',
    value: '7',
    change: 'Action Req',
    trend: 'down',
    icon: CheckSquare,
  },
  {
    label: 'Compliance Status',
    value: '98%',
    change: 'Good',
    trend: 'up',
    icon: Shield,
  },
  {
    label: 'Upcoming Capital Calls',
    value: '$12.5M',
    change: 'Due in 5 days',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Open Tax Forms',
    value: '24',
    change: 'Q4 Processing',
    trend: 'up',
    icon: FileText,
  },
];

export const opsComplianceAlerts = [
  { title: 'KYC Update Required', fund: 'Fund III', description: '3 LPs have expired documents', severity: 'High' },
  { title: 'Quarterly Valuation Review', fund: 'Fund II', description: 'Pending implementation', severity: 'Medium' },
  { title: 'Form ADV Filing', fund: 'General', description: 'Due in 30 days', severity: 'Low' },
];

export const opsUpcomingDistributions = [
  { event: 'Fund II Net Dist', date: 'Dec 15', amount: '$4.2M', status: 'Approved' },
  { event: 'Fund I Tax Dist', date: 'Dec 20', amount: '$1.1M', status: 'Pending' },
];

