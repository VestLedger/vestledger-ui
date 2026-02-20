import { isMockMode } from '@/config/data-mode';
import {
  mockExportJobs as seedExportJobs,
  reportTemplates as seedReportTemplates,
  type ExportJob,
  type ReportTemplate,
} from '@/data/seeds/reports/report-export';
import { requestJson } from '@/services/shared/httpClient';
import { logger } from '@/lib/logger';

export type { ExportJob, ReportTemplate };

const clone = <T>(value: T): T => structuredClone(value);

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  if (isMockMode('reports')) return clone(seedReportTemplates);
  return requestJson<ReportTemplate[]>('/reports/templates', {
    fallbackMessage: 'Failed to load report templates',
  });
}

export async function getInitialExportJobs(): Promise<ExportJob[]> {
  if (isMockMode('reports')) return clone(seedExportJobs);
  return requestJson<ExportJob[]>('/reports/export-jobs', {
    fallbackMessage: 'Failed to load export jobs',
  });
}

export async function createExportJob(templateId: string, format: string): Promise<ExportJob> {
  if (isMockMode('reports')) {
    return {
      id: `mock-${Date.now()}`,
      templateId,
      reportName: seedReportTemplates.find((t) => t.id === templateId)?.name ?? 'Report',
      format,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    } as ExportJob;
  }

  try {
    const data = await requestJson<ExportJob>('/reports/export-jobs', {
      method: 'POST',
      body: { templateId, format },
      fallbackMessage: 'Failed to create export job',
    });

    if (!data) {
      logger.warn('Empty create export job payload from API', {
        component: 'reportExportService',
        templateId,
        format,
      });
      throw new Error('Empty create export job payload from API');
    }
    return data;
  } catch (error) {
    logger.warn('Create export job failed', {
      component: 'reportExportService',
      templateId,
      format,
      error,
    });
    throw error;
  }
}
