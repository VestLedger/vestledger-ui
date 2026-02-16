import { describe, expect, it } from 'vitest';
import { formatCurrencyCompact } from '@/utils/formatting';

describe('formatCurrencyCompact', () => {
  it('formats amounts with K/M/B suffixes', () => {
    expect(formatCurrencyCompact(45_000)).toBe('$45K');
    expect(formatCurrencyCompact(1_500_000)).toBe('$1.5M');
    expect(formatCurrencyCompact(2_300_000_000)).toBe('$2.3B');
    expect(formatCurrencyCompact(999)).toBe('$999');
  });

  it('does not throw on non-finite input values', () => {
    expect(formatCurrencyCompact(NaN)).toBe('$0');
    expect(formatCurrencyCompact(Infinity)).toBe('$0');
    expect(formatCurrencyCompact((-Infinity) as unknown as number)).toBe('$0');
    expect(formatCurrencyCompact(null as unknown as number)).toBe('$0');
    expect(formatCurrencyCompact(undefined as unknown as number)).toBe('$0');
  });
});

