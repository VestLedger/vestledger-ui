'use client'

import { useState } from 'react';
import { DecisionWriter } from '@/components/ai/decision-writer';
import { DDChatAssistant } from '@/components/ai/dd-chat-assistant';
import { PitchDeckReader } from '@/components/ai/pitch-deck-reader';
import { PageContainer, PageHeader, Breadcrumb } from '@/ui';
import { getBreadcrumbs, getAISuggestion } from '@/config/routes';
import { Sparkles } from 'lucide-react';

export default function AIToolsPage() {
  const [selected, setSelected] = useState<string>('decision-writer');

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
        onTabChange={(tabId) => setSelected(tabId)}
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
