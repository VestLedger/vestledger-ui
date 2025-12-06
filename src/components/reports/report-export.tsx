'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress, Select, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import { Download, FileText, File, Table, Image, Calendar, Filter, Check, Settings, Mail, Clock, Repeat } from 'lucide-react';
import { getRouteConfig } from '@/config/routes';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'quarterly' | 'annual' | 'custom' | 'monthly';
  description: string;
  format: 'pdf' | 'excel' | 'csv' | 'ppt';
  sections: string[];
  estimatedPages?: number;
}

interface ExportJob {
  id: string;
  reportName: string;
  format: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  downloadUrl?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Quarterly LP Report',
    type: 'quarterly',
    description: 'Comprehensive quarterly report for Limited Partners with fund performance, portfolio updates, and financial statements',
    format: 'pdf',
    sections: ['Executive Summary', 'Fund Performance', 'Portfolio Companies', 'Financials', 'Pipeline'],
    estimatedPages: 25
  },
  {
    id: '2',
    name: 'Annual Fund Report',
    type: 'annual',
    description: 'Complete annual overview including full year performance, all portfolio activity, and detailed analytics',
    format: 'pdf',
    sections: ['Year in Review', 'Performance Metrics', 'Portfolio Deep Dive', 'Market Analysis', 'Looking Ahead'],
    estimatedPages: 50
  },
  {
    id: '3',
    name: 'Portfolio Dashboard Export',
    type: 'custom',
    description: 'Export current portfolio data including metrics, valuations, and company details',
    format: 'excel',
    sections: ['Company List', 'Metrics', 'Valuations', 'Ownership', 'Returns']
  },
  {
    id: '4',
    name: 'Deal Pipeline Report',
    type: 'custom',
    description: 'Current dealflow pipeline with company details, stages, and scoring',
    format: 'excel',
    sections: ['Active Deals', 'Sourcing', 'Due Diligence', 'Scoring']
  },
  {
    id: '5',
    name: 'Fund Performance Deck',
    type: 'quarterly',
    description: 'Presentation-ready performance deck for board meetings and LP updates',
    format: 'ppt',
    sections: ['Key Metrics', 'Portfolio Highlights', 'Recent Activity', 'Market Insights'],
    estimatedPages: 15
  },
  {
    id: '6',
    name: 'Cap Table Export',
    type: 'custom',
    description: 'Detailed capitalization table with all shareholders, share classes, and ownership percentages',
    format: 'excel',
    sections: ['Shareholders', 'Share Classes', 'Vesting', 'Dilution Analysis']
  }
];

const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    reportName: 'Q3 2024 LP Report',
    format: 'PDF',
    status: 'completed',
    progress: 100,
    createdAt: '2024-11-28T14:30:00',
    downloadUrl: '#'
  },
  {
    id: '2',
    reportName: 'Portfolio Dashboard',
    format: 'Excel',
    status: 'completed',
    progress: 100,
    createdAt: '2024-11-27T10:15:00',
    downloadUrl: '#'
  },
  {
    id: '3',
    reportName: 'Deal Pipeline Report',
    format: 'Excel',
    status: 'processing',
    progress: 65,
    createdAt: '2024-11-28T16:45:00'
  }
];

export function ReportExport() {
  const routeConfig = getRouteConfig('/reports');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | 'ppt'>('pdf');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(mockExportJobs);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const handleExport = () => {
    if (!selectedTemplate) return;

    const newJob: ExportJob = {
      id: Date.now().toString(),
      reportName: selectedTemplate.name,
      format: exportFormat.toUpperCase(),
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setExportJobs([newJob, ...exportJobs]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setExportJobs(prev => prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'completed', progress: 100, downloadUrl: '#' }
            : job
        ));
      } else {
        setExportJobs(prev => prev.map(job =>
          job.id === newJob.id ? { ...job, progress } : job
        ));
      }
    }, 500);
  };

  const toggleSection = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <Table className="w-4 h-4" />;
      case 'csv': return <File className="w-4 h-4" />;
      case 'ppt': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'processing': return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'queued': return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'failed': return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {routeConfig && (
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        )}

        {/* Page Header */}
        {routeConfig && (
          <PageHeader
            title={routeConfig.label}
            description={routeConfig.description}
            icon={routeConfig.icon}
            aiSummary={{
              text: `${reportTemplates.length} report templates available. ${exportJobs.filter(j => j.status === 'completed').length} reports completed, ${exportJobs.filter(j => j.status === 'processing').length} currently processing.`,
              confidence: 0.90
            }}
            secondaryActions={[
              {
                label: 'Report Settings',
                onClick: () => {},
              },
            ]}
          />
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  setSelectedTemplate(template);
                  setExportFormat(template.format);
                  setSelectedSections(template.sections);
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
                        <Badge size="sm" className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button size="sm" variant="flat" startContent={<Download className="w-3 h-3" />}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    {job.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={job.progress} maxValue={100} className="h-2" />
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
                    {['pdf', 'excel', 'csv', 'ppt'].map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format as any)}
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
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--app-text-muted)] mb-1 block">To</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
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
                      onClick={() => setScheduleEnabled(!scheduleEnabled)}
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
      </div>
    </PageContainer>
  );
}
