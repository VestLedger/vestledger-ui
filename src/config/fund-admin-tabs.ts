import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  DollarSign,
  Receipt,
  Users,
  BarChart3,
  TrendingUp,
  Scale,
  GitBranch,
} from 'lucide-react';

export type FundAdminTabConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const FUND_ADMIN_TABS: FundAdminTabConfig[] = [
  { id: 'fund-setup', label: 'Fund Setup', icon: Briefcase },
  { id: 'capital-calls', label: 'Capital Calls', icon: DollarSign },
  { id: 'distributions', label: 'Distributions', icon: Receipt },
  { id: 'lp-responses', label: 'LP Responses', icon: Users },
  { id: 'nav-calculator', label: 'NAV Calculator', icon: BarChart3 },
  { id: 'carried-interest', label: 'Carried Interest', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: Scale },
  { id: 'secondary-transfers', label: 'Secondary Transfers', icon: GitBranch },
];

export const DEFAULT_FUND_ADMIN_TAB_ID = FUND_ADMIN_TABS[0]?.id ?? 'fund-setup';

export const FUND_ADMIN_TAB_IDS = new Set(FUND_ADMIN_TABS.map((tab) => tab.id));
