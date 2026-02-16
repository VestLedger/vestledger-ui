import { BarChart3, Briefcase, FileDown, FileText, Mail } from 'lucide-react';
import type { ContextualTabConfig } from './contextual-tabs';

export const TAX_CENTER_TABS: ContextualTabConfig[] = [
  { id: 'overview', label: 'Tax Documents', icon: FileText },
  { id: 'k1-generator', label: 'K-1 Generator', icon: FileDown },
  { id: 'fund-summary', label: 'Fund Summary', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio Companies', icon: Briefcase },
  { id: 'communications', label: 'LP Communications', icon: Mail },
];

export const DEFAULT_TAX_CENTER_TAB_ID = TAX_CENTER_TABS[0]?.id ?? 'overview';

export const TAX_CENTER_TAB_IDS = new Set(TAX_CENTER_TABS.map((tab) => tab.id));

