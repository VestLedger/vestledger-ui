import { isMockMode } from '@/config/data-mode';
import {
  mockExportJobs,
  reportTemplates,
  type ExportJob,
  type ReportTemplate,
} from '@/data/mocks/reports/report-export';

export type { ExportJob, ReportTemplate };

export function getReportTemplates(): ReportTemplate[] {
  if (isMockMode()) return reportTemplates;
  throw new Error('Reports API not implemented yet');
}

export function getInitialExportJobs(): ExportJob[] {
  if (isMockMode()) return mockExportJobs;
  return [];
}

