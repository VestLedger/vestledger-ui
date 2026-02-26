import { isMockMode } from '@/config/data-mode';
import {
  generateMockRejectionLetter,
  mockDealInfo,
  rejectionReasons,
  toneOptions,
  type DealInfo,
  type DecisionWriterTone,
  type RejectionReason,
  type RejectionReasonCategory,
} from '@/data/mocks/ai/decision-writer';

export type { DealInfo, DecisionWriterTone, RejectionReason, RejectionReasonCategory };

export function getDecisionWriterSeedDealInfo(): DealInfo {
  if (isMockMode('ai')) return mockDealInfo;
  return mockDealInfo;
}

export function getDecisionWriterRejectionReasons(): RejectionReason[] {
  if (isMockMode('ai')) return rejectionReasons;
  return rejectionReasons;
}

export function getDecisionWriterToneOptions(): { value: DecisionWriterTone; label: string; description: string }[] {
  if (isMockMode('ai')) return toneOptions;
  return toneOptions;
}

export function generateRejectionLetter(
  dealInfo: DealInfo,
  reasons: RejectionReason[],
  customReason: string,
  tone: DecisionWriterTone
): string {
  if (isMockMode('ai')) return generateMockRejectionLetter(dealInfo, reasons, customReason, tone);
  return generateMockRejectionLetter(dealInfo, reasons, customReason, tone);
}
