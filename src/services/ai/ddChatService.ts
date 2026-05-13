import { isMockMode } from "@/config/data-mode";
import {
  getMockDDChatResponse,
  mockConversations,
  type Message as MockDDChatMessage,
} from "@/data/mocks/ai/dd-chat-assistant";
import {
  createAIAvailableResult,
  createAIUnavailableResult,
  type AIServiceResult,
} from "@/services/ai/aiDegradedMode";
import type { DataModeUnavailableResult } from "@/config/data-mode";
import type { GetDDChatConversationParams } from "@/store/slices/aiSlice";

export interface Message extends MockDDChatMessage {
  unavailable?: DataModeUnavailableResult;
}

export type DDChatConversationResult = AIServiceResult<Message[]>;

const DD_CHAT_UNAVAILABLE_MESSAGE =
  "AI due diligence chat is unavailable in API mode until backend retrieval, permissions, and source citations are implemented.";

function createDDChatUnavailableResult(
  details?: Record<string, unknown>,
): DataModeUnavailableResult {
  return createAIUnavailableResult({
    service: "dd-chat",
    message: DD_CHAT_UNAVAILABLE_MESSAGE,
    sourceRef: "ai/dd-chat",
    details,
  });
}

export function createDDChatUnavailableMessage(
  unavailable: DataModeUnavailableResult = createDDChatUnavailableResult(),
): Message {
  return {
    id: `unavailable-${unavailable.state_reason}`,
    role: "assistant",
    content: unavailable.message,
    timestamp: new Date(),
    unavailable,
  };
}

/**
 * Get initial DD chat conversation for a deal
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getInitialDDChatConversation(
  params: GetDDChatConversationParams,
): DDChatConversationResult {
  if (isMockMode("ai")) {
    // Mock mode: Accept params but return static data
    // Future: Fetch conversation for specific dealId
    return createAIAvailableResult<Message[]>(mockConversations, "demo");
  }

  return createDDChatUnavailableResult({ dealId: params.dealId });
}

/**
 * Get DD chat assistant response for a query
 */
export function getDDChatAssistantResponse(
  query: string,
  dealName?: string,
): Message {
  if (isMockMode("ai")) return getMockDDChatResponse(query, dealName);
  return createDDChatUnavailableMessage(
    createDDChatUnavailableResult({ query, dealName }),
  );
}
