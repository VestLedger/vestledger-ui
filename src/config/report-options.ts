export const DEFAULT_REPORT_TEMPLATE_SECTION = "Overview";

export const REPORT_FORMATS = ["pdf", "excel", "csv", "ppt"] as const;
export const REPORT_TEMPLATE_TYPES = [
  "quarterly",
  "annual",
  "custom",
  "monthly",
] as const;
/**
 * Report export job truth states (P1-014).
 *
 * `completed` strictly means: job finished AND a real downloadable artifact
 * is available. A job that finished without an artifact is reported as
 * `completed_no_artifact` so the UI does not falsely advertise a download.
 */
export const REPORT_JOB_STATUSES = [
  "queued",
  "processing",
  "completed",
  "completed_no_artifact",
  "failed",
] as const;

export type ReportJobStatus = (typeof REPORT_JOB_STATUSES)[number];
export const REPORT_SCHEDULE_FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];
