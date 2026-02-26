import { FileDown, FileText, MessageSquare } from 'lucide-react';
import type { ContextualTabConfig } from './contextual-tabs';

export const AI_TOOLS_TABS: ContextualTabConfig[] = [
  { id: 'decision-writer', label: 'AI Decision Writer', icon: FileText },
  { id: 'pitch-deck-reader', label: 'AI Pitch Deck Reader', icon: FileDown },
  { id: 'dd-assistant', label: 'AI Due Diligence Assistant', icon: MessageSquare },
];

export const DEFAULT_AI_TOOLS_TAB_ID = AI_TOOLS_TABS[0]?.id ?? 'decision-writer';

export const AI_TOOLS_TAB_IDS = new Set(AI_TOOLS_TABS.map((tab) => tab.id));

