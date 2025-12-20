/**
 * Format percentage with configurable decimals
 * @example formatPercent(45.67, 1) => "45.7%"
 * @example formatPercent(45.67, 0) => "46%"
 * @example formatPercent(45.67) => "45.7%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 * @example formatNumberCompact(1500000) => "1.5M"
 * @example formatNumberCompact(2300000000) => "2.3B"
 * @example formatNumberCompact(45000) => "45K"
 */
export function formatNumberCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}
