import { DecisionWriter } from '@/components/ai/decision-writer';
import { DDChatAssistant } from '@/components/ai/dd-chat-assistant';
import { PitchDeckReader } from '@/components/ai/pitch-deck-reader';

export default function AIToolsPage() {
  return (
    <div className="space-y-8">
      <DecisionWriter />
      <PitchDeckReader />
      <DDChatAssistant dealName="Quantum AI" />
    </div>
  );
}
