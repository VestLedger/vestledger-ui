export type StatusDomain =
  | 'compliance'
  | 'tax'
  | 'fund-admin'
  | 'crm'
  | 'integrations'
  | 'portfolio'
  | 'documents'
  | 'reports'
  | 'deal-intel'
  | 'aml-kyc'
  | 'general';

export interface StatusColorConfig {
  bg: string;
  text: string;
  border?: string;
}

// Tailwind class presets for status colors (light/dark mode compatible)
const STATUS_PRESETS = {
  success: { bg: 'bg-app-success/10 dark:bg-app-dark-success/15', text: 'text-app-success dark:text-app-dark-success' },
  warning: { bg: 'bg-app-warning/10 dark:bg-app-dark-warning/15', text: 'text-app-warning dark:text-app-dark-warning' },
  info: { bg: 'bg-app-info/10 dark:bg-app-dark-info/15', text: 'text-app-info dark:text-app-dark-info' },
  danger: { bg: 'bg-app-danger/10 dark:bg-app-dark-danger/15', text: 'text-app-danger dark:text-app-dark-danger' },
  muted: { bg: 'bg-app-surface-hover dark:bg-app-dark-surface-hover', text: 'text-app-text-muted dark:text-app-dark-text-muted' },
  primary: { bg: 'bg-app-primary/10 dark:bg-app-dark-primary/15', text: 'text-app-primary dark:text-app-dark-primary' },
} as const;

const STATUS_COLOR_MAP: Record<StatusDomain, Record<string, StatusColorConfig>> = {
  general: {
    'completed': STATUS_PRESETS.success,
    'confirmed': STATUS_PRESETS.success,
    'current': STATUS_PRESETS.success,
    'active': STATUS_PRESETS.success,
    'paid': STATUS_PRESETS.success,
    'approved': STATUS_PRESETS.success,
    'published': STATUS_PRESETS.success,
    'sent': STATUS_PRESETS.success,
    'filed': STATUS_PRESETS.success,
    'received': STATUS_PRESETS.success,
    'connected': STATUS_PRESETS.success,
    'in-progress': STATUS_PRESETS.warning,
    'pending': STATUS_PRESETS.info,
    'pending-review': STATUS_PRESETS.info,
    'pending-approval': STATUS_PRESETS.warning,
    'queued': STATUS_PRESETS.info,
    'processing': STATUS_PRESETS.warning,
    'submitted': STATUS_PRESETS.info,
    'settled': STATUS_PRESETS.success,
    'applied': STATUS_PRESETS.success,
    'running': STATUS_PRESETS.warning,
    'syncing': STATUS_PRESETS.warning,
    'review': STATUS_PRESETS.warning,
    'draft': STATUS_PRESETS.warning,
    'due-soon': STATUS_PRESETS.warning,
    'expiring-soon': STATUS_PRESETS.warning,
    'upcoming': STATUS_PRESETS.info,
    'scheduled': STATUS_PRESETS.info,
    'awaiting-upload': STATUS_PRESETS.warning,
    'partial': STATUS_PRESETS.warning,
    'on-hold': STATUS_PRESETS.warning,
    'held': STATUS_PRESETS.warning,
    'released': STATUS_PRESETS.success,
    'overdue': STATUS_PRESETS.danger,
    'failed': STATUS_PRESETS.danger,
    'error': STATUS_PRESETS.danger,
    'rejected': STATUS_PRESETS.danger,
    'returned': STATUS_PRESETS.warning,
    'blocked': STATUS_PRESETS.danger,
    'expired': STATUS_PRESETS.danger,
    'cancelled': STATUS_PRESETS.muted,
    'disconnected': STATUS_PRESETS.muted,
    'available': STATUS_PRESETS.primary,
    'coming-soon': STATUS_PRESETS.muted,
    'optional': STATUS_PRESETS.muted,
    'under-review': STATUS_PRESETS.warning,
    'at-risk': STATUS_PRESETS.danger,
    'exited': STATUS_PRESETS.muted,
    'exercised': STATUS_PRESETS.success,
    'calculated': STATUS_PRESETS.info,
    'reviewed': STATUS_PRESETS.info,
    'distributed': STATUS_PRESETS.success,
    'amended': STATUS_PRESETS.warning,
  },
  compliance: {
    'completed': STATUS_PRESETS.success,
    'current': STATUS_PRESETS.success,
    'in-progress': STATUS_PRESETS.warning,
    'upcoming': STATUS_PRESETS.info,
    'due-soon': STATUS_PRESETS.warning,
    'scheduled': STATUS_PRESETS.info,
    'overdue': STATUS_PRESETS.danger,
  },
  tax: {
    'sent': STATUS_PRESETS.success,
    'filed': STATUS_PRESETS.success,
    'approved': STATUS_PRESETS.success,
    'ready': STATUS_PRESETS.info,
    'review': STATUS_PRESETS.warning,
    'draft': STATUS_PRESETS.warning,
    'amended': STATUS_PRESETS.warning,
    'active': STATUS_PRESETS.success,
    'inactive': STATUS_PRESETS.muted,
  },
  'fund-admin': {
    'published': STATUS_PRESETS.success,
    'paid': STATUS_PRESETS.success,
    'completed': STATUS_PRESETS.success,
    'confirmed': STATUS_PRESETS.success,
    'approved': STATUS_PRESETS.info,
    'distributed': STATUS_PRESETS.success,
    'pending': STATUS_PRESETS.warning,
    'pending-approval': STATUS_PRESETS.warning,
    'partial': STATUS_PRESETS.warning,
    'processing': STATUS_PRESETS.warning,
    'in-progress': STATUS_PRESETS.warning,
    'sent': STATUS_PRESETS.info,
    'draft': STATUS_PRESETS.warning,
    'calculated': STATUS_PRESETS.info,
    'reviewed': STATUS_PRESETS.info,
    'rejected': STATUS_PRESETS.danger,
    'returned': STATUS_PRESETS.warning,
    'overdue': STATUS_PRESETS.danger,
    'cancelled': STATUS_PRESETS.muted,
    'pending-gp-approval': STATUS_PRESETS.warning,
    'pending-legal-review': STATUS_PRESETS.warning,
    'pending-buyer-funding': STATUS_PRESETS.warning,
  },
  crm: {
    'connected': STATUS_PRESETS.success,
    'disconnected': STATUS_PRESETS.muted,
    'syncing': STATUS_PRESETS.warning,
    'error': STATUS_PRESETS.danger,
  },
  integrations: {
    'connected': STATUS_PRESETS.success,
    'available': STATUS_PRESETS.primary,
    'coming-soon': STATUS_PRESETS.muted,
    'disconnected': STATUS_PRESETS.muted,
    'syncing': STATUS_PRESETS.warning,
    'running': STATUS_PRESETS.warning,
    'completed': STATUS_PRESETS.success,
    'failed': STATUS_PRESETS.danger,
    'error': STATUS_PRESETS.danger,
  },
  portfolio: {
    'active': STATUS_PRESETS.success,
    'at-risk': STATUS_PRESETS.danger,
    'under-review': STATUS_PRESETS.warning,
    'exited': STATUS_PRESETS.muted,
  },
  documents: {
    'current': STATUS_PRESETS.success,
    'completed': STATUS_PRESETS.success,
    'pending-review': STATUS_PRESETS.warning,
    'pending': STATUS_PRESETS.info,
    'in-progress': STATUS_PRESETS.warning,
    'awaiting-upload': STATUS_PRESETS.warning,
    'due-soon': STATUS_PRESETS.warning,
    'overdue': STATUS_PRESETS.danger,
    'optional': STATUS_PRESETS.muted,
  },
  reports: {
    'queued': STATUS_PRESETS.info,
    'processing': STATUS_PRESETS.warning,
    'completed': STATUS_PRESETS.success,
    'failed': STATUS_PRESETS.danger,
    'published': STATUS_PRESETS.success,
    'draft': STATUS_PRESETS.warning,
  },
  'deal-intel': {
    'completed': STATUS_PRESETS.success,
    'in-progress': STATUS_PRESETS.warning,
    'pending': STATUS_PRESETS.info,
    'overdue': STATUS_PRESETS.danger,
    'ready-for-ic': STATUS_PRESETS.success,
    'dd-in-progress': STATUS_PRESETS.warning,
    'docs-overdue': STATUS_PRESETS.danger,
    'blocked': STATUS_PRESETS.danger,
  },
  'aml-kyc': {
    'not-started': STATUS_PRESETS.muted,
    'information-gathering': STATUS_PRESETS.info,
    'document-collection': STATUS_PRESETS.info,
    'verification-in-progress': STATUS_PRESETS.warning,
    'review-required': STATUS_PRESETS.warning,
    'approved': STATUS_PRESETS.success,
    'rejected': STATUS_PRESETS.danger,
    'expired': STATUS_PRESETS.danger,
  },
};

/**
 * Get Tailwind classes for status badge
 * @example getStatusColor('completed') => "bg-app-success/10 dark:bg-app-dark-success/15 text-app-success dark:text-app-dark-success"
 * @example getStatusColor('sent', 'tax') => "bg-app-success/10 dark:bg-app-dark-success/15 text-app-success dark:text-app-dark-success"
 */
export function getStatusColor(status: string, domain: StatusDomain = 'general'): string {
  const config = STATUS_COLOR_MAP[domain][status.toLowerCase()];
  if (!config) {
    // Fallback to general domain
    const fallback = STATUS_COLOR_MAP.general[status.toLowerCase()];
    if (!fallback) {
      return 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text-muted dark:text-app-dark-text-muted';
    }
    return `${fallback.bg} ${fallback.text}`;
  }

  return `${config.bg} ${config.text}`;
}

/**
 * Get Tailwind class names for status (separate bg and text)
 * @example getStatusColorVars('completed') => { bg: 'bg-app-success/10 dark:bg-app-dark-success/15', text: 'text-app-success dark:text-app-dark-success' }
 */
export function getStatusColorVars(status: string, domain: StatusDomain = 'general'): StatusColorConfig {
  const config = STATUS_COLOR_MAP[domain][status.toLowerCase()];
  if (!config) {
    const fallback = STATUS_COLOR_MAP.general[status.toLowerCase()];
    return fallback || {
      bg: 'bg-app-surface-hover dark:bg-app-dark-surface-hover',
      text: 'text-app-text-muted dark:text-app-dark-text-muted',
    };
  }
  return config;
}
