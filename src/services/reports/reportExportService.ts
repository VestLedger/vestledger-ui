import { isMockMode } from '@/config/data-mode';
import {
  mockExportJobs,
  reportTemplates,
  type ExportJob,
  type ReportTemplate,
} from '@/data/mocks/reports/report-export';
import { requestJson } from '@/services/shared/httpClient';
import { logger } from '@/lib/logger';

export type { ExportJob, ReportTemplate };

const clone = <T>(value: T): T => structuredClone(value);

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  if (isMockMode('reports')) return clone(reportTemplates);
  try {
    const data = await requestJson<ReportTemplate[]>('/reports/templates', {
      fallbackMessage: 'Failed to load report templates',
    });
    return data ?? clone(reportTemplates);
  } catch {
    return clone(reportTemplates);
  }
}

export async function getInitialExportJobs(): Promise<ExportJob[]> {
  if (isMockMode('reports')) return clone(mockExportJobs);
  try {
    const data = await requestJson<ExportJob[]>('/reports/export-jobs', {
      fallbackMessage: 'Failed to load export jobs',
    });
    return data ?? clone(mockExportJobs);
  } catch {
    return clone(mockExportJobs);
  }
}

export async function createExportJob(templateId: string, format: string): Promise<ExportJob> {
  if (isMockMode('reports')) {
    return {
      id: `mock-${Date.now()}`,
      templateId,
      reportName: reportTemplates.find((t) => t.id === templateId)?.name ?? 'Report',
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
      logger.warn('Empty create export job payload from API; using fallback', {
        component: 'reportExportService',
        templateId,
        format,
      });
    } else {
      return data;
    }
  } catch (error) {
    logger.warn('Falling back to local export job after API error', {
      component: 'reportExportService',
      templateId,
      format,
      error,
    });
  }

  return {
    id: `fallback-${Date.now()}`,
    templateId,
    reportName: reportTemplates.find((t) => t.id === templateId)?.name ?? 'Report',
    format,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
  } as ExportJob;
}
