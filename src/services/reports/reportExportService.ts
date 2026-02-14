import { isMockMode } from '@/config/data-mode';
import {
  mockExportJobs,
  reportTemplates,
  type ExportJob,
  type ReportTemplate,
} from '@/data/mocks/reports/report-export';

export type { ExportJob, ReportTemplate };

const clone = <T>(value: T): T => structuredClone(value);

let apiReportTemplatesCache: ReportTemplate[] | null = null;
let apiExportJobsCache: ExportJob[] | null = null;

export function getReportTemplates(): ReportTemplate[] {
  if (isMockMode('reports')) return clone(reportTemplates);

  // Reports API endpoints are not available yet; keep API mode demo-ready with centralized mocks.
  if (!apiReportTemplatesCache) {
    apiReportTemplatesCache = clone(reportTemplates);
  }

  return clone(apiReportTemplatesCache);
}

export function getInitialExportJobs(): ExportJob[] {
  if (isMockMode('reports')) return clone(mockExportJobs);

  // Preserve an API-mode working baseline until report-export APIs are added.
  if (!apiExportJobsCache) {
    apiExportJobsCache = clone(mockExportJobs);
  }

  return clone(apiExportJobsCache);
}
