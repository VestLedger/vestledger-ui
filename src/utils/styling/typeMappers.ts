/**
 * Centralized type-to-styling mappers
 * Eliminates 68+ duplicate switch statements across components
 */

// ============================================================================
// DEAL OUTCOME MAPPERS
// ============================================================================

export type DealOutcome = 'won' | 'lost' | 'withdrawn' | 'passed' | 'active';

export const dealOutcomeClasses: Record<DealOutcome, string> = {
  won: 'bg-[var(--app-success-bg)] text-[var(--app-success)] border-[var(--app-success)]',
  lost: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] border-[var(--app-danger)]',
  withdrawn: 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)] border-[var(--app-text-muted)]',
  passed: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)] border-[var(--app-warning)]',
  active: 'bg-[var(--app-info-bg)] text-[var(--app-info)] border-[var(--app-info)]',
};

export const dealOutcomeLabels: Record<DealOutcome, string> = {
  won: 'Won',
  lost: 'Lost',
  withdrawn: 'Withdrawn',
  passed: 'Passed',
  active: 'Active',
};

// ============================================================================
// DOCUMENT STATUS MAPPERS
// ============================================================================

export type DocumentStatus = 'draft' | 'ready' | 'sent' | 'signed' | 'archived';

export const documentStatusClasses: Record<DocumentStatus, string> = {
  draft: 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]',
  ready: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
  sent: 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
  signed: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
  archived: 'bg-[var(--app-text-subtle)]/10 text-[var(--app-text-subtle)]',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  sent: 'Sent',
  signed: 'Signed',
  archived: 'Archived',
};

// ============================================================================
// INTERACTION TYPE MAPPERS
// ============================================================================

export type InteractionType = 'email' | 'call' | 'meeting' | 'note' | 'task';

export const interactionTypeColors: Record<InteractionType, string> = {
  email: 'var(--app-info)',
  call: 'var(--app-success)',
  meeting: 'var(--app-primary)',
  note: 'var(--app-warning)',
  task: 'var(--app-accent)',
};

export const interactionTypeLabels: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
  task: 'Task',
};

// ============================================================================
// ALERT TYPE MAPPERS
// ============================================================================

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export const alertTypeClasses: Record<AlertType, string> = {
  info: 'bg-[var(--app-info-bg)] border-[var(--app-info)] text-[var(--app-info)]',
  success: 'bg-[var(--app-success-bg)] border-[var(--app-success)] text-[var(--app-success)]',
  warning: 'bg-[var(--app-warning-bg)] border-[var(--app-warning)] text-[var(--app-warning)]',
  error: 'bg-[var(--app-danger-bg)] border-[var(--app-danger)] text-[var(--app-danger)]',
};

// ============================================================================
// COMPLIANCE STATUS MAPPERS
// ============================================================================

export type ComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'not-required';

export const complianceStatusClasses: Record<ComplianceStatus, string> = {
  compliant: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
  pending: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
  overdue: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
  'not-required': 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]',
};

export const complianceStatusLabels: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  pending: 'Pending',
  overdue: 'Overdue',
  'not-required': 'Not Required',
};

// ============================================================================
// GENERIC STATUS MAPPERS (for most components)
// ============================================================================

export type GenericStatus = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'in-progress';

export const genericStatusClasses: Record<GenericStatus, string> = {
  active: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
  inactive: 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]',
  pending: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
  completed: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
  failed: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
  'in-progress': 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
};

export const genericStatusLabels: Record<GenericStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  'in-progress': 'In Progress',
};

// ============================================================================
// PRIORITY MAPPERS
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export const priorityClasses: Record<Priority, string> = {
  low: 'bg-[var(--app-text-subtle)]/10 text-[var(--app-text-subtle)]',
  medium: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
  high: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
  critical: 'bg-[var(--app-danger)] text-white',
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generic mapper function to get class from any mapping
 * @example getClassForType(dealOutcomeClasses, 'won')
 */
export function getClassForType<T extends string>(
  mapping: Record<T, string>,
  type: T,
  fallback = ''
): string {
  return mapping[type] ?? fallback;
}

/**
 * Generic mapper function to get label from any mapping
 * @example getLabelForType(dealOutcomeLabels, 'won')
 */
export function getLabelForType<T extends string>(
  mapping: Record<T, string>,
  type: T,
  fallback = 'Unknown'
): string {
  return mapping[type] ?? fallback;
}
