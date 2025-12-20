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
export function getInitialDDChatConversation(params: GetDDChatConversationParams): Message[] {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Fetch conversation for specific dealId
    return mockConversations;
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_DD_CHAT_CONVERSATION, variables: params })
  throw new Error('DD chat conversation API not implemented yet');
}

/**
 * Get DD chat assistant response for a query
 */
export function getDDChatAssistantResponse(query: string, dealName?: string): Message {
  if (isMockMode()) return getMockDDChatResponse(query, dealName);
  throw new Error('DD chat API not implemented yet');
}
