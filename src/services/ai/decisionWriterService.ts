import { isMockMode } from "@/config/data-mode";
import {
  generateMockRejectionLetter,
  mockDealInfo,
  type DealInfo,
  type DecisionWriterTone,
  type RejectionReason,
  type RejectionReasonCategory,
} from "@/data/mocks/ai/decision-writer";
import {
  DECISION_WRITER_REJECTION_REASONS,
  DECISION_WRITER_TONE_OPTIONS,
} from "@/config/decision-writer-options";
import {
  createAIAvailableResult,
  createAIUnavailableResult,
  type AIServiceResult,
} from "@/services/ai/aiDegradedMode";
import type { DataModeUnavailableResult } from "@/config/data-mode";

export type {
  DealInfo,
  DecisionWriterTone,
  RejectionReason,
  RejectionReasonCategory,
};

export type DecisionWriterGenerationResult = AIServiceResult<string>;

const EMPTY_DEAL_INFO: DealInfo = {
  companyName: "",
  founderName: "",
  sector: "",
  stage: "",
};

const DECISION_WRITER_UNAVAILABLE_MESSAGE =
  "Decision writer is unavailable in API mode until the backend generation workflow, audit trail, and approval controls are implemented.";

export function getDecisionWriterUnavailableState(): DataModeUnavailableResult | null {
  if (isMockMode("ai")) return null;

  return createAIUnavailableResult({
    service: "decision-writer",
    message: DECISION_WRITER_UNAVAILABLE_MESSAGE,
    sourceRef: "ai/decision-writer",
  });
}

export function getDecisionWriterSeedDealInfo(): DealInfo {
  if (isMockMode("ai")) return mockDealInfo;
  return EMPTY_DEAL_INFO;
}

export function getDecisionWriterRejectionReasons(): RejectionReason[] {
  return DECISION_WRITER_REJECTION_REASONS;
}

export function getDecisionWriterToneOptions(): {
  value: DecisionWriterTone;
  label: string;
  description: string;
}[] {
  return DECISION_WRITER_TONE_OPTIONS;
}

export function generateRejectionLetter(
  dealInfo: DealInfo,
  reasons: RejectionReason[],
  customReason: string,
  tone: DecisionWriterTone,
): DecisionWriterGenerationResult {
  if (isMockMode("ai"))
    return createAIAvailableResult(
      generateMockRejectionLetter(dealInfo, reasons, customReason, tone),
      "demo",
    );

  return createAIUnavailableResult({
    service: "decision-writer",
    message: DECISION_WRITER_UNAVAILABLE_MESSAGE,
    sourceRef: "ai/decision-writer",
    details: {
      hasCompanyName: Boolean(dealInfo.companyName.trim()),
      selectedReasonCount: reasons.length,
      hasCustomReason: Boolean(customReason.trim()),
      tone,
    },
  });
}
