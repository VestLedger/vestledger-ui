import { Shield, FileCheck, AlertTriangle, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export const auditorDashboardMetrics: DashboardMetric[] = [
  {
    label: 'Audit Items',
    value: '156',
    change: 'Reviewed',
    trend: 'up',
    icon: FileCheck,
  },
  {
    label: 'Open Issues',
    value: '3',
    change: 'Pending',
    trend: 'down',
    icon: AlertTriangle,
  },
  {
    label: 'Compliance Score',
    value: '98%',
    change: 'Excellent',
    trend: 'up',
    icon: Shield,
  },
  {
    label: 'Last Audit',
    value: '14d',
    change: 'Ago',
    trend: 'up',
    icon: Clock,
  },
];

export const auditorAuditTrail = [
  { action: 'Capital Call Executed', fund: 'Fund III', date: 'Today 10:42 AM', hash: '0x7a3b...9c2f' },
  { action: 'Distribution Processed', fund: 'Fund II', date: 'Yesterday', hash: '0x4d2e...8b1a' },
  { action: 'NAV Updated', fund: 'Fund III', date: '2 days ago', hash: '0x9f1c...3e4d' },
  { action: 'LP Transfer Approved', fund: 'Fund I', date: '3 days ago', hash: '0x2b5a...7c8e' },
];

export const auditorComplianceItems = [
  { item: 'Accreditation Verification', status: 'Passed', lastCheck: 'Oct 01' },
  { item: 'AML/KYC Compliance', status: 'Passed', lastCheck: 'Sep 28' },
  { item: 'Transfer Restrictions', status: 'Passed', lastCheck: 'Sep 25' },
  { item: 'Regulatory Filing', status: 'Pending', lastCheck: 'Due Oct 30' },
];

