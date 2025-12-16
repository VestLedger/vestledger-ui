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
  if (isMockMode()) return mockDealInfo;
  throw new Error('Decision writer API not implemented yet');
}

export function getDecisionWriterRejectionReasons(): RejectionReason[] {
  if (isMockMode()) return rejectionReasons;
  return [];
}

export function getDecisionWriterToneOptions(): { value: DecisionWriterTone; label: string; description: string }[] {
  if (isMockMode()) return toneOptions;
  return [];
}

export function generateRejectionLetter(
  dealInfo: DealInfo,
  reasons: RejectionReason[],
  customReason: string,
  tone: DecisionWriterTone
): string {
  if (isMockMode()) return generateMockRejectionLetter(dealInfo, reasons, customReason, tone);
  throw new Error('Decision writer API not implemented yet');
}
