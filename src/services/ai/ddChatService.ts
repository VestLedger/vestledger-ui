import { isMockMode } from '@/config/data-mode';
import {
  getMockDDChatResponse,
  mockConversations,
  type Message,
} from '@/data/mocks/ai/dd-chat-assistant';
import type { GetDDChatConversationParams } from '@/store/slices/aiSlice';

export type { Message };

/**
 * Get initial DD chat conversation for a deal
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getInitialDDChatConversation(_params: GetDDChatConversationParams): Message[] {
  if (isMockMode('ai')) {
    // Mock mode: Accept params but return static data
    // Future: Fetch conversation for specific dealId
    return mockConversations;
  }

  return mockConversations;
}

/**
 * Get DD chat assistant response for a query
 */
export function getDDChatAssistantResponse(query: string, dealName?: string): Message {
  if (isMockMode('ai')) return getMockDDChatResponse(query, dealName);
  return getMockDDChatResponse(query, dealName);
}
