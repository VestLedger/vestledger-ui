'use client';

import { useEffect } from 'react';
import { DecisionWriter } from './decision-writer';
import { DDChatAssistant } from './dd-chat-assistant';
import { PitchDeckReader } from './pitch-deck-reader';
import { PageScaffold } from '@/ui/composites';
import { getBreadcrumbs, getAISuggestion, ROUTE_PATHS } from '@/config/routes';
import { AI_TOOLS_TAB_IDS, DEFAULT_AI_TOOLS_TAB_ID } from '@/config/ai-tools-tabs';
import { Sparkles } from 'lucide-react';
import { useUIKey } from '@/store/ui';

const defaultAIToolsState = {
  selected: DEFAULT_AI_TOOLS_TAB_ID,
};

export function AITools() {
  const { value: ui, patch: patchUI } = useUIKey<{ selected: string }>('ai-tools', defaultAIToolsState);
  const { selected } = ui;

  useEffect(() => {
    if (!AI_TOOLS_TAB_IDS.has(selected)) {
      patchUI({ selected: DEFAULT_AI_TOOLS_TAB_ID });
    }
  }, [patchUI, selected]);

  // Get breadcrumbs and AI suggestions
  const breadcrumbs = getBreadcrumbs(ROUTE_PATHS.aiTools);
  const aiSuggestion = getAISuggestion(ROUTE_PATHS.aiTools);

  return (
    <PageScaffold
      breadcrumbs={breadcrumbs}
      aiSuggestion={aiSuggestion}
      header={{
        title: 'AI Tools',
        description: 'Generate IC-ready briefs, summarize decks, and chat through diligence with AI copilots',
        icon: Sparkles,
        aiSummary: {
          text: '3 AI copilots available to streamline investment decision-making and due diligence processes',
        },
      }}
    >

      {/* Tab Content */}
      <div className="mt-4">
        {selected === 'decision-writer' && <DecisionWriter />}
        {selected === 'pitch-deck-reader' && <PitchDeckReader />}
        {selected === 'dd-assistant' && <DDChatAssistant dealName="Quantum AI" />}
      </div>
    </PageScaffold>
  );
}
