import { Activity, FileText, PieChart, Receipt, User } from 'lucide-react';
import type { ContextualTabConfig } from './contextual-tabs';

export const LP_PORTAL_TABS: ContextualTabConfig[] = [
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'distributions', label: 'Distributions', icon: Receipt },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'account', label: 'Account', icon: User },
];

export const DEFAULT_LP_PORTAL_TAB_ID = 'distributions';

export const LP_PORTAL_TAB_IDS = new Set(LP_PORTAL_TABS.map((tab) => tab.id));
