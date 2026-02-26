import { BarChart3, TrendingUp, Database, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export const researcherDashboardMetrics: DashboardMetric[] = [
  {
    label: 'Reports Generated',
    value: '24',
    change: '+5 this week',
    trend: 'up',
    icon: FileText,
  },
  {
    label: 'Data Sources',
    value: '12',
    change: 'Active',
    trend: 'up',
    icon: Database,
  },
  {
    label: 'Market Trends',
    value: '8',
    change: 'New signals',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    label: 'Benchmark Score',
    value: '92',
    change: 'Top Quartile',
    trend: 'up',
    icon: BarChart3,
  },
];

export const researcherRecentReports = [
  { name: 'Q3 Market Analysis', type: 'Market', date: 'Today', status: 'Published' },
  { name: 'AI Sector Deep Dive', type: 'Sector', date: 'Yesterday', status: 'Draft' },
  { name: 'Fund III Benchmark', type: 'Internal', date: '3 days ago', status: 'Published' },
];

export const researcherTrendingTopics = [
  { topic: 'Generative AI Valuations', sentiment: 'Hot', change: '+45%' },
  { topic: 'Climate Tech Funding', sentiment: 'Rising', change: '+22%' },
  { topic: 'Crypto VC Activity', sentiment: 'Mixed', change: '-8%' },
  { topic: 'Healthcare SaaS', sentiment: 'Stable', change: '+5%' },
];

