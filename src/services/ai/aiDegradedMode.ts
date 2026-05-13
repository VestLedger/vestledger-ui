import type {
  DataModeClassification,
  DataModeDataState,
  DataModeUnavailableReason,
  DataModeUnavailableResult,
} from "@/config/data-mode";
import { createNoSilentMockUnavailableResult } from "@/services/shared/noSilentMockGuard";

export type AIServiceName =
  | "ai-badges"
  | "copilot-contextual-response"
  | "copilot-quick-actions"
  | "copilot-suggestions"
  | "decision-writer"
  | "dd-chat"
  | "pitch-deck-reader";

export interface AIAvailableResult<T> {
  ok: true;
  data_state: Extract<DataModeDataState, "demo" | "live">;
  data: T;
}

export type AIServiceResult<T> =
  | AIAvailableResult<T>
  | DataModeUnavailableResult;

export interface CreateAIUnavailableOptions {
  service: AIServiceName;
  message: string;
  classification?: DataModeClassification;
  reason?: DataModeUnavailableReason;
  sourceRef?: string;
  details?: Record<string, unknown>;
}

export function createAIAvailableResult<T>(
  data: T,
  dataState: Extract<DataModeDataState, "demo" | "live">,
): AIAvailableResult<T> {
  return {
    ok: true,
    data_state: dataState,
    data,
  };
}

export function createAIUnavailableResult({
  service,
  message,
  classification = "demo-only",
  reason = "backend_not_implemented",
  sourceRef = `ai/${service}`,
  details,
}: CreateAIUnavailableOptions): DataModeUnavailableResult {
  return createNoSilentMockUnavailableResult({
    feature: "ai",
    classification,
    reason,
    message,
    sourceRef,
    details: {
      service,
      ...details,
    },
  });
}

export function isAIUnavailableResult<T>(
  result: AIServiceResult<T>,
): result is DataModeUnavailableResult {
  return result.ok === false;
}
