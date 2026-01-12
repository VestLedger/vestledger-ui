import type { LPAllocation } from '@/types/distribution';

const AMOUNT_TOLERANCE = 1;

export function getAllocationIssues(allocation: LPAllocation): string[] {
  const issues: string[] = [];

  if (allocation.grossAmount < 0) {
    issues.push('Gross amount cannot be negative.');
  }

  if (allocation.netAmount < 0) {
    issues.push('Net amount cannot be negative.');
  }

  if (allocation.netAmount > allocation.grossAmount) {
    issues.push('Net amount exceeds gross amount.');
  }

  if (allocation.taxWithholdingRate < 0 || allocation.taxWithholdingRate > 100) {
    issues.push('Tax withholding rate must be between 0 and 100.');
  }

  const expectedNet = Math.max(0, allocation.grossAmount - allocation.taxWithholdingAmount);
  if (Math.abs(expectedNet - allocation.netAmount) > AMOUNT_TOLERANCE) {
    issues.push('Net amount does not match gross minus tax withholding.');
  }

  return issues;
}
