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
const DEFAULT_TEMPLATE_SECTION = 'Overview';
const REPORT_FORMATS = ['pdf', 'excel', 'csv', 'ppt'] as const;
const TEMPLATE_TYPES = ['quarterly', 'annual', 'custom', 'monthly'] as const;
const JOB_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeReportFormat(value: unknown): ReportTemplate['format'] {
  if (typeof value !== 'string') return 'pdf';
  const normalized = value.trim().toLowerCase();
  return (REPORT_FORMATS as readonly string[]).includes(normalized)
    ? (normalized as ReportTemplate['format'])
    : 'pdf';
}

function normalizeTemplateType(value: unknown): ReportTemplate['type'] {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if ((TEMPLATE_TYPES as readonly string[]).includes(normalized)) {
      return normalized as ReportTemplate['type'];
    }
  }
  return 'custom';
}

function normalizeTemplateSections(value: unknown): string[] {
  if (!Array.isArray(value)) return [DEFAULT_TEMPLATE_SECTION];
  const sections = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return sections.length > 0 ? sections : [DEFAULT_TEMPLATE_SECTION];
}

function normalizeTemplate(raw: unknown, index: number): ReportTemplate {
  if (!isRecord(raw)) {
    return {
      id: `template-${index + 1}`,
      name: `Report Template ${index + 1}`,
      type: 'custom',
      description: '',
      format: 'pdf',
      sections: [DEFAULT_TEMPLATE_SECTION],
    };
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : `template-${index + 1}`,
    name: typeof raw.name === 'string' ? raw.name : `Report Template ${index + 1}`,
    type: normalizeTemplateType(raw.type ?? raw.category),
    description: typeof raw.description === 'string' ? raw.description : '',
    format: normalizeReportFormat(raw.format),
    sections: normalizeTemplateSections(raw.sections),
    estimatedPages:
      typeof raw.estimatedPages === 'number' && Number.isFinite(raw.estimatedPages)
        ? raw.estimatedPages
        : undefined,
  };
}

function normalizeJobStatus(value: unknown): ExportJob['status'] {
  if (typeof value !== 'string') return 'queued';
  const normalized = value.trim().toLowerCase();
  return (JOB_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as ExportJob['status'])
    : 'queued';
}

function normalizeExportJob(raw: unknown, index: number): ExportJob {
  if (!isRecord(raw)) {
    return {
      id: `export-job-${index + 1}`,
      reportName: 'Report Export',
      format: 'PDF',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  const progress =
    typeof raw.progress === 'number' && Number.isFinite(raw.progress)
      ? Math.min(100, Math.max(0, raw.progress))
      : 0;
  const normalizedFormat = normalizeReportFormat(raw.format).toUpperCase();

  return {
    id: typeof raw.id === 'string' ? raw.id : `export-job-${index + 1}`,
    reportName:
      typeof raw.reportName === 'string'
        ? raw.reportName
        : typeof raw.templateId === 'string'
          ? raw.templateId
          : 'Report Export',
    format: normalizedFormat,
    status: normalizeJobStatus(raw.status),
    progress,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    downloadUrl: typeof raw.downloadUrl === 'string' ? raw.downloadUrl : undefined,
  };
}

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  if (isMockMode('reports')) return clone(seedReportTemplates);
  const payload = await requestJson<unknown>('/reports/templates', {
    fallbackMessage: 'Failed to load report templates',
  });
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeTemplate);
}

export async function getInitialExportJobs(): Promise<ExportJob[]> {
  if (isMockMode('reports')) return clone(seedExportJobs);
  const payload = await requestJson<unknown>('/reports/export-jobs', {
    fallbackMessage: 'Failed to load export jobs',
  });
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeExportJob);
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
    const data = await requestJson<unknown>('/reports/export-jobs', {
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
    return normalizeExportJob(data, 0);
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
