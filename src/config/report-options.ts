export const DEFAULT_REPORT_TEMPLATE_SECTION = 'Overview';

export const REPORT_FORMATS = ['pdf', 'excel', 'csv', 'ppt'] as const;
export const REPORT_TEMPLATE_TYPES = ['quarterly', 'annual', 'custom', 'monthly'] as const;
export const REPORT_JOB_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;
export const REPORT_SCHEDULE_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];
