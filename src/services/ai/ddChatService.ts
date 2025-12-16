import { isMockMode } from '@/config/data-mode';
import {
  getMockDDChatResponse,
  mockConversations,
  type Message,
} from '@/data/mocks/ai/dd-chat-assistant';

export type { Message };

export function getInitialDDChatConversation(): Message[] {
  if (isMockMode()) return mockConversations;
  return [];
}

export function getDDChatAssistantResponse(query: string, dealName?: string): Message {
  if (isMockMode()) return getMockDDChatResponse(query, dealName);
  throw new Error('DD chat API not implemented yet');
}

