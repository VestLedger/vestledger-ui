/**
 * Format timestamp as relative time (e.g., "2h ago", "3d ago")
 * @example formatTimestamp(new Date(Date.now() - 2 * 60 * 60 * 1000)) => "2h ago"
 * @example formatTimestamp(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) => "3d ago"
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Format a date value using locale-aware formatting.
 * Returns an empty string if the value cannot be parsed.
 */
export function formatDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date/time value using locale-aware formatting.
 * Returns an empty string if the value cannot be parsed.
 */
export function formatDateTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, options);
}
