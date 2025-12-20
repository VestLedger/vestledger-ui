import { Users, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export const irDashboardMetrics: DashboardMetric[] = [
  {
    label: 'Active LPs',
    value: '42',
    change: '+3 new',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Pending Requests',
    value: '7',
    change: 'Action Req',
    trend: 'down',
    icon: MessageSquare,
  },
  {
    label: 'Quarterly Reports',
    value: '4',
    change: 'Draft',
    trend: 'up',
    icon: FileText,
  },
  {
    label: 'Fundraising Progress',
    value: '68%',
    change: '+12%',
    trend: 'up',
    icon: TrendingUp,
  },
];

export const irRecentInteractions = [
  { lp: 'Sequoia Capital', type: 'Call', date: 'Today', notes: 'Discussed Fund IV commitment' },
  { lp: 'Tiger Global', type: 'Email', date: 'Yesterday', notes: 'Sent Q3 performance update' },
  { lp: 'Founders Fund', type: 'Meeting', date: '2 days ago', notes: 'Annual LP summit planning' },
];

export const irUpcomingTasks = [
  { task: 'Quarterly LP Newsletter', due: 'Dec 15', priority: 'High' },
  { task: 'Fund IV Pitch Deck', due: 'Dec 20', priority: 'High' },
  { task: 'Annual Meeting Invites', due: 'Dec 22', priority: 'Medium' },
];

