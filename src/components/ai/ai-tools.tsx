'use client';

import { DecisionWriter } from './decision-writer';
import { DDChatAssistant } from './dd-chat-assistant';
import { PitchDeckReader } from './pitch-deck-reader';
import { PageContainer, PageHeader, Breadcrumb } from '@/ui';
import { getBreadcrumbs, getAISuggestion } from '@/config/routes';
import { Sparkles } from 'lucide-react';
import { useUIKey } from '@/store/ui';

const defaultAIToolsState = {
  selected: 'decision-writer',
};

export function AITools() {
  const { value: ui, patch: patchUI } = useUIKey<{ selected: string }>('ai-tools', defaultAIToolsState);
  const { selected } = ui;

  // Get breadcrumbs and AI suggestions
  const breadcrumbs = getBreadcrumbs('/ai-tools');
  const aiSuggestion = getAISuggestion('/ai-tools');

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <Breadcrumb items={breadcrumbs} aiSuggestion={aiSuggestion} />
      </div>

      {/* Page Header with AI Summary */}
      <PageHeader
        title="AI Tools"
        description="Generate IC-ready briefs, summarize decks, and chat through diligence with AI copilots"
        icon={Sparkles}
        aiSummary={{
          text: '3 AI copilots available to streamline investment decision-making and due diligence processes',
          confidence: 0.9
        }}
        tabs={[
          {
            id: 'decision-writer',
            label: 'AI Decision Writer'
          },
          {
            id: 'pitch-deck-reader',
            label: 'AI Pitch Deck Reader'
          },
          {
            id: 'dd-assistant',
            label: 'AI Due Diligence Assistant'
          }
        ]}
        activeTab={selected}
        onTabChange={(tabId) => patchUI({ selected: tabId })}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {selected === 'decision-writer' && <DecisionWriter />}
        {selected === 'pitch-deck-reader' && <PitchDeckReader />}
        {selected === 'dd-assistant' && <DDChatAssistant dealName="Quantum AI" />}
      </div>
    </PageContainer>
  );
}
