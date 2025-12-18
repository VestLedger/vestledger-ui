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
