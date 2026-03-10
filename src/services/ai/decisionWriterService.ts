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

export type {
  DealInfo,
  DecisionWriterTone,
  RejectionReason,
  RejectionReasonCategory,
};

const EMPTY_DEAL_INFO: DealInfo = {
  companyName: "",
  founderName: "",
  sector: "",
  stage: "",
};

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
): string {
  if (isMockMode("ai"))
    return generateMockRejectionLetter(dealInfo, reasons, customReason, tone);
  return "Decision writer is unavailable in API mode until the backend generation workflow is implemented.";
}
