import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/config/i18n';

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format currency using Intl.NumberFormat
 * @example formatCurrency(1500000) => "$1,500,000"
 * @example formatCurrency(1500.5, { maximumFractionDigits: 2 }) => "$1,500.50"
 */
export function formatCurrency(
  amount: number,
  options?: CurrencyFormatOptions
): string {
  const defaults: CurrencyFormatOptions = {
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  return new Intl.NumberFormat(options?.locale || defaults.locale, {
    style: 'currency',
    currency: options?.currency || defaults.currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? defaults.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits ?? defaults.maximumFractionDigits,
  }).format(amount);
}

/**
 * Format currency in compact form (K/M/B suffixes)
 * @example formatCurrencyCompact(1500000) => "$1.5M"
 * @example formatCurrencyCompact(2300000000) => "$2.3B"
 * @example formatCurrencyCompact(45000) => "$45K"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}
