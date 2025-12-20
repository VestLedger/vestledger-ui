import { Search, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export const analystDashboardMetrics: DashboardMetric[] = [
  {
    label: 'Deals in Pipeline',
    value: '45',
    change: '+5',
    trend: 'up',
    icon: Search,
  },
  {
    label: 'Due Diligence Active',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: FileText,
  },
  {
    label: 'Market Signals',
    value: '12',
    change: 'High',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    label: 'Pending Reviews',
    value: '3',
    change: 'Urgent',
    trend: 'down',
    icon: AlertCircle,
  },
];

export const analystRecentDeals = [
  { name: 'Nebula AI', stage: 'Due Diligence', score: 92, sector: 'Generative AI' },
  { name: 'Quantum Leap', stage: 'Screening', score: 85, sector: 'Quantum Computing' },
  { name: 'GreenEnergy Co', stage: 'Term Sheet', score: 88, sector: 'Clean Tech' },
];

export const analystUrgentTasks = [
  { task: 'Review Q3 Market Report', due: 'Today', priority: 'High' },
  { task: 'Update Nebula AI Financials', due: 'Tomorrow', priority: 'Medium' },
  { task: 'Prep IC Memo for GreenEnergy', due: 'In 2 days', priority: 'High' },
];

