export type StatusDomain = 'compliance' | 'tax' | 'fund-admin' | 'general';

export interface StatusColorConfig {
  bg: string;
  text: string;
  border?: string;
}

const STATUS_COLOR_MAP: Record<StatusDomain, Record<string, StatusColorConfig>> = {
  general: {
    'completed': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'in-progress': {
      bg: 'var(--app-warning-bg)',
      text: 'var(--app-warning)',
    },
    'pending': {
      bg: 'var(--app-info-bg)',
      text: 'var(--app-info)',
    },
    'overdue': {
      bg: 'var(--app-danger-bg)',
      text: 'var(--app-danger)',
    },
  },
  compliance: {
    'completed': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'current': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'in-progress': {
      bg: 'var(--app-warning-bg)',
      text: 'var(--app-warning)',
    },
    'upcoming': {
      bg: 'var(--app-info-bg)',
      text: 'var(--app-info)',
    },
    'due-soon': {
      bg: 'var(--app-info-bg)',
      text: 'var(--app-info)',
    },
    'scheduled': {
      bg: 'var(--app-info-bg)',
      text: 'var(--app-info)',
    },
    'overdue': {
      bg: 'var(--app-danger-bg)',
      text: 'var(--app-danger)',
    },
  },
  tax: {
    'sent': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'filed': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'ready': {
      bg: 'var(--app-info-bg)',
      text: 'var(--app-info)',
    },
    'draft': {
      bg: 'var(--app-warning-bg)',
      text: 'var(--app-warning)',
    },
  },
  'fund-admin': {
    'published': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'paid': {
      bg: 'var(--app-success-bg)',
      text: 'var(--app-success)',
    },
    'pending': {
      bg: 'var(--app-warning-bg)',
      text: 'var(--app-warning)',
    },
    'draft': {
      bg: 'var(--app-warning-bg)',
      text: 'var(--app-warning)',
    },
    'overdue': {
      bg: 'var(--app-danger-bg)',
      text: 'var(--app-danger)',
    },
  },
};

/**
 * Get Tailwind classes for status badge
 * @example getStatusColor('completed') => "bg-[var(--app-success-bg)] text-[var(--app-success)]"
 * @example getStatusColor('sent', 'tax') => "bg-[var(--app-success-bg)] text-[var(--app-success)]"
 */
export function getStatusColor(status: string, domain: StatusDomain = 'general'): string {
  const config = STATUS_COLOR_MAP[domain][status.toLowerCase()];
  if (!config) {
    // Fallback to general domain
    const fallback = STATUS_COLOR_MAP.general[status.toLowerCase()];
    if (!fallback) {
      return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
    return `bg-[${fallback.bg}] text-[${fallback.text}]`;
  }

  return `bg-[${config.bg}] text-[${config.text}]`;
}

/**
 * Get CSS variable names for status
 * @example getStatusColorVars('completed') => { bg: 'var(--app-success-bg)', text: 'var(--app-success)' }
 */
export function getStatusColorVars(status: string, domain: StatusDomain = 'general'): StatusColorConfig {
  const config = STATUS_COLOR_MAP[domain][status.toLowerCase()];
  if (!config) {
    const fallback = STATUS_COLOR_MAP.general[status.toLowerCase()];
    return fallback || {
      bg: 'var(--app-surface-hover)',
      text: 'var(--app-text-muted)',
    };
  }
  return config;
}
