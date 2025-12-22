'use client'

import { Card, Button, Badge, Progress } from '@/ui';
import { Download, FileText, File, Table, Image as ImageIcon, Calendar, Filter, Check, Mail, Clock, Repeat , FileDown} from 'lucide-react';
import { getInitialExportJobs, getReportTemplates, type ExportJob, type ReportTemplate } from '@/services/reports/reportExportService';
import { useUIKey } from '@/store/ui';
import { useAppDispatch } from '@/store/hooks';
import { reportExportRequested } from '@/store/slices/uiEffectsSlice';
import { PageScaffold, StatusBadge } from '@/components/ui';

const defaultReportExportState: {
  selectedTemplate: ReportTemplate | null;
  exportFormat: 'pdf' | 'excel' | 'csv' | 'ppt';
  dateRange: { start: string; end: string };
  selectedSections: string[];
  exportJobs: ExportJob[];
  scheduleEnabled: boolean;
} = {
  selectedTemplate: null,
  exportFormat: 'pdf',
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  selectedSections: [],
  exportJobs: getInitialExportJobs(),
  scheduleEnabled: false,
};

export function ReportExport() {
  const dispatch = useAppDispatch();
  const { value: ui, patch: patchUI } = useUIKey('report-export', defaultReportExportState);
  const { selectedTemplate, exportFormat, dateRange, selectedSections, exportJobs, scheduleEnabled } = ui;
  const reportTemplates = getReportTemplates();
  const formatOptions: ReportTemplate['format'][] = ['pdf', 'excel', 'csv', 'ppt'];

  const handleExport = () => {
    if (!selectedTemplate) return;
    dispatch(reportExportRequested());
  };

  const toggleSection = (section: string) => {
    patchUI({
      selectedSections: selectedSections.includes(section)
        ? selectedSections.filter((s) => s !== section)
        : [...selectedSections, section],
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <Table className="w-4 h-4" />;
      case 'csv': return <File className="w-4 h-4" />;
      case 'ppt': return <ImageIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <PageScaffold
      routePath="/reports"
      header={{
        title: 'Reports',
        description: 'Manage and export fund reports',
        icon: FileDown,
        aiSummary: {
          text: `${reportTemplates.length} report templates available. ${exportJobs.filter(j => j.status === 'completed').length} reports completed, ${exportJobs.filter(j => j.status === 'processing').length} currently processing.`,
          confidence: 0.90,
        },
        secondaryActions: [
          {
            label: 'Report Settings',
            onClick: () => {},
          },
        ],
      }}
    >
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Report Templates</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                padding="lg"
                className={`cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-2 border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                    : 'hover:border-[var(--app-primary)]'
                }`}
                onClick={() => {
                  patchUI({
                    selectedTemplate: template,
                    exportFormat: template.format,
                    selectedSections: template.sections,
                  });
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold mb-1">{template.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                        {template.type}
                      </Badge>
                      <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                        {getFormatIcon(template.format)}
                        <span className="ml-1">{template.format.toUpperCase()}</span>
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <Check className="w-5 h-5 text-[var(--app-primary)]" />
                  )}
                </div>

                <p className="text-sm text-[var(--app-text-muted)] mb-3">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                  <span>{template.sections.length} sections</span>
                  {template.estimatedPages && <span>~{template.estimatedPages} pages</span>}
                </div>
              </Card>
            ))}
          </div>

          {/* Export History */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Recent Exports</h3>
            <Card padding="none">
              <div className="divide-y divide-[var(--app-border)]">
                {exportJobs.map((job) => (
                  <div key={job.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--app-surface-hover)]">
                          {getFormatIcon(job.format)}
                        </div>
                        <div>
                          <p className="font-medium">{job.reportName}</p>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} domain="reports" size="sm" showIcon />
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button size="sm" variant="flat" startContent={<Download className="w-3 h-3" />}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    {job.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={job.progress} maxValue={100} className="h-2" aria-label={`Export job progress ${job.progress}%`} />
                        <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                          {job.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="space-y-4">
          <Card padding="lg" className="sticky top-6">
            <h3 className="font-semibold mb-4">Export Configuration</h3>

            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {formatOptions.map((format) => (
                      <button
                        key={format}
                        onClick={() => patchUI({ exportFormat: format })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          exportFormat === format
                            ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                            : 'border-[var(--app-border)] hover:border-[var(--app-primary)]'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {getFormatIcon(format)}
                          <span className="text-xs font-medium uppercase">{format}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[var(--app-text-muted)] mb-1 block">From</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => patchUI({ dateRange: { ...dateRange, start: e.target.value } })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--app-text-muted)] mb-1 block">To</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => patchUI({ dateRange: { ...dateRange, end: e.target.value } })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Include Sections
                  </label>
                  <div className="space-y-2">
                    {selectedTemplate.sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => toggleSection(section)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          selectedSections.includes(section)
                            ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                            : 'border-[var(--app-border)] hover:border-[var(--app-primary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{section}</span>
                          {selectedSections.includes(section) && (
                            <Check className="w-4 h-4 text-[var(--app-primary)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Schedule Report
                    </label>
                    <button
                      onClick={() => patchUI({ scheduleEnabled: !scheduleEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        scheduleEnabled ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        scheduleEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {scheduleEnabled && (
                    <div className="space-y-2">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]">
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                      <div className="p-2 rounded-lg bg-[var(--app-info-bg)] text-xs text-[var(--app-info)]">
                        Report will be automatically generated and emailed
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <div className="space-y-2">
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    startContent={<Download className="w-4 h-4" />}
                    onPress={handleExport}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="flat"
                    className="w-full"
                    startContent={<Mail className="w-4 h-4" />}
                  >
                    Generate & Email
                  </Button>
                </div>

                {/* Info */}
                <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-xs text-[var(--app-text-muted)]">
                  <Clock className="w-4 h-4 mb-1" />
                  Estimated generation time: 2-5 minutes
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-[var(--app-text-subtle)] mb-3" />
                <p className="text-center text-sm text-[var(--app-text-muted)]">
                  Select a report template to configure export options
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}
