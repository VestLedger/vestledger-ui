"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button, Badge, Progress, Input, Select, Switch } from "@/ui";
import {
  Download,
  FileText,
  File,
  Table,
  Image as ImageIcon,
  Calendar,
  Filter,
  Check,
  Mail,
  Clock,
  Repeat,
  FileDown,
} from "lucide-react";
import {
  createExportJob,
  getInitialExportJobs,
  getReportTemplates,
  type ExportJob,
  type ReportTemplate,
} from "@/services/reports/reportExportService";
import { isMockMode } from "@/config/data-mode";
import { logger } from "@/lib/logger";
import { useUIKey } from "@/store/ui";
import { PageShell, SectionHeader, StatusBadge } from "@/ui/composites";
import { DataStateBadge, UnavailableState } from "@/ui/data-states";
import { REPORT_SCHEDULE_FREQUENCY_OPTIONS } from "@/config/report-options";
import { formatDateTime } from "@/utils/formatting";

const currentYear = new Date().getFullYear();

const defaultReportExportState: {
  selectedTemplate: ReportTemplate | null;
  exportFormat: "pdf" | "excel" | "csv" | "ppt";
  dateRange: { start: string; end: string };
  selectedSections: string[];
  exportJobs: ExportJob[];
  scheduleEnabled: boolean;
  scheduleFrequency: "weekly" | "monthly" | "quarterly";
} = {
  selectedTemplate: null,
  exportFormat: "pdf",
  dateRange: { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` },
  selectedSections: [],
  exportJobs: [],
  scheduleEnabled: false,
  scheduleFrequency: "weekly",
};

const VALID_EXPORT_FORMATS = ["pdf", "excel", "csv", "ppt"] as const;

function normalizeFormat(
  format: unknown,
): (typeof VALID_EXPORT_FORMATS)[number] {
  if (typeof format !== "string") return "pdf";
  const normalized = format.trim().toLowerCase();
  return (VALID_EXPORT_FORMATS as readonly string[]).includes(normalized)
    ? (normalized as (typeof VALID_EXPORT_FORMATS)[number])
    : "pdf";
}

function formatDisplayLabel(format: unknown): string {
  return normalizeFormat(format).toUpperCase();
}

export function ReportExport() {
  const { value: ui, patch: patchUI } = useUIKey(
    "report-export",
    defaultReportExportState,
  );
  const {
    selectedTemplate,
    exportFormat,
    dateRange,
    selectedSections,
    exportJobs,
    scheduleEnabled,
    scheduleFrequency,
  } = ui;
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const exportJobsRef = useRef(exportJobs);
  const timeoutIdsRef = useRef<number[]>([]);
  const formatOptions: ReportTemplate["format"][] = [
    "pdf",
    "excel",
    "csv",
    "ppt",
  ];
  const safeSelectedSections = Array.isArray(selectedSections)
    ? selectedSections
    : [];
  const selectedTemplateSections = Array.isArray(selectedTemplate?.sections)
    ? selectedTemplate.sections.filter((section) => typeof section === "string")
    : [];

  useEffect(() => {
    exportJobsRef.current = exportJobs;
  }, [exportJobs]);

  useEffect(() => {
    let active = true;
    Promise.all([getReportTemplates(), getInitialExportJobs()]).then(
      ([templates, jobs]) => {
        if (!active) return;
        setReportTemplates(templates);
        if (ui.exportJobs.length === 0) patchUI({ exportJobs: jobs });
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      timeoutIdsRef.current = [];
    };
  }, []);

  const handleExport = async () => {
    if (!selectedTemplate) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticJob: ExportJob = {
      id: optimisticId,
      reportName: selectedTemplate.name,
      format: normalizeFormat(exportFormat).toUpperCase(),
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
      artifactAvailable: false,
    };

    const optimisticList = [optimisticJob, ...exportJobsRef.current];
    exportJobsRef.current = optimisticList;
    patchUI({ exportJobs: optimisticList });

    // In API mode, do not fabricate a "completed" state with a simulated
    // progress bar. Show only the real job returned by the backend (P1-014:
    // the truth state must come from the server).
    if (!isMockMode("reports")) {
      try {
        const persisted = await createExportJob(
          selectedTemplate.id,
          normalizeFormat(exportFormat),
        );
        const replaced = exportJobsRef.current.map((job) =>
          job.id === optimisticId ? persisted : job,
        );
        exportJobsRef.current = replaced;
        patchUI({ exportJobs: replaced });
      } catch (error) {
        logger.warn("Failed to create export job", {
          component: "ReportExport",
          templateId: selectedTemplate.id,
          error,
        });
        const failed = exportJobsRef.current.map((job) =>
          job.id === optimisticId
            ? {
                ...job,
                status: "failed" as const,
                progress: 0,
                artifactAvailable: false,
              }
            : job,
        );
        exportJobsRef.current = failed;
        patchUI({ exportJobs: failed });
      }
      return;
    }

    // Mock-mode only: simulate progress, then settle to `completed_no_artifact`
    // because demo mode does not actually produce a downloadable file. The
    // user sees the real outcome — no fake download button.
    const updateJobProgress = (jobId: string, progress: number) => {
      const nextProgress = progress + 20;
      const timeoutId = window.setTimeout(() => {
        const updatedJobs: ExportJob[] = exportJobsRef.current.map((job) => {
          if (job.id !== jobId) return job;

          if (nextProgress >= 100) {
            return {
              ...job,
              status: "completed_no_artifact" as const,
              progress: 100,
              downloadUrl: undefined,
              artifactAvailable: false,
            };
          }

          return {
            ...job,
            status: "processing" as const,
            progress: nextProgress,
          };
        });

        exportJobsRef.current = updatedJobs;
        patchUI({ exportJobs: updatedJobs });

        if (nextProgress < 100) {
          updateJobProgress(jobId, nextProgress);
        }
      }, 500);

      timeoutIdsRef.current.push(timeoutId);
    };

    updateJobProgress(optimisticId, 0);
  };

  const toggleSection = (section: string) => {
    patchUI({
      selectedSections: safeSelectedSections.includes(section)
        ? safeSelectedSections.filter((s) => s !== section)
        : [...safeSelectedSections, section],
    });
  };

  const getFormatIcon = (format: unknown) => {
    switch (normalizeFormat(format)) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "excel":
        return <Table className="w-4 h-4" />;
      case "csv":
        return <File className="w-4 h-4" />;
      case "ppt":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const readyCount = exportJobs.filter(
    (j) => j.status === "completed" && Boolean(j.downloadUrl),
  ).length;
  const noArtifactCount = exportJobs.filter(
    (j) => j.status === "completed_no_artifact",
  ).length;
  const inProgressCount = exportJobs.filter(
    (j) => j.status === "processing" || j.status === "queued",
  ).length;

  return (
    <PageShell
      title="Reports"
      subtitle="Manage and export fund reports"
      icon={FileDown}
      contextBadges={[
        {
          id: "ready",
          label: `${readyCount} ready`,
          tone: "success",
          testId: "reports-ready-count",
        },
        {
          id: "no-artifact",
          label: `${noArtifactCount} finished, no file`,
          tone: "neutral",
          testId: "reports-no-artifact-count",
        },
        {
          id: "in-progress",
          label: `${inProgressCount} in progress`,
          tone: "info",
          testId: "reports-in-progress-count",
        },
      ]}
      secondaryActions={[
        {
          label: "Report settings",
          onClick: () => {},
          testId: "reports-settings",
        },
      ]}
    >
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Report Templates" />
            <DataStateBadge
              state={isMockMode("reports") ? "demo" : "live"}
              testId="reports-data-mode-badge"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                padding="lg"
                isPressable
                className={`cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? "border-2 border-[var(--app-primary)] bg-[var(--app-primary-bg)]"
                    : "hover:border-[var(--app-primary)]"
                }`}
                onPress={() => {
                  patchUI({
                    selectedTemplate: template,
                    exportFormat: normalizeFormat(template.format),
                    selectedSections: Array.isArray(template.sections)
                      ? template.sections
                      : [],
                  });
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold mb-1">{template.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        size="sm"
                        variant="flat"
                        className="bg-[var(--app-surface-hover)]"
                      >
                        {template.type}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="flat"
                        className="bg-[var(--app-surface-hover)]"
                      >
                        {getFormatIcon(template.format)}
                        <span className="ml-1">
                          {formatDisplayLabel(template.format)}
                        </span>
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
                  {template.estimatedPages && (
                    <span>~{template.estimatedPages} pages</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Export History */}
          <div className="mt-4">
            <SectionHeader title="Recent Exports" className="mb-4" />
            <Card padding="none">
              <div className="divide-y divide-[var(--app-border)]">
                {exportJobs.map((job) => {
                  // P1-014: download affordance is gated on a real downloadUrl
                  // AND the explicit `completed` truth state. `artifactAvailable`
                  // is the authoritative server-derived flag; we also require
                  // `downloadUrl` so an out-of-sync flag cannot fabricate a
                  // download button.
                  const canDownload =
                    job.status === "completed" &&
                    job.artifactAvailable === true &&
                    typeof job.downloadUrl === "string" &&
                    job.downloadUrl.length > 0 &&
                    job.downloadUrl !== "#";
                  return (
                    <div key={job.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--app-surface-hover)]">
                            {getFormatIcon(job.format)}
                          </div>
                          <div>
                            <p className="font-medium">{job.reportName}</p>
                            <p className="text-xs text-[var(--app-text-muted)]">
                              {formatDateTime(job.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={job.status}
                            domain="reports"
                            size="sm"
                            showIcon
                          />
                          {canDownload && (
                            <Button
                              as="a"
                              href={job.downloadUrl}
                              size="sm"
                              variant="flat"
                              startContent={<Download className="w-3 h-3" />}
                              data-testid="report-download"
                            >
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                      {(job.status === "processing" ||
                        job.status === "queued") && (
                        <div className="mt-2">
                          <Progress
                            value={job.progress}
                            maxValue={100}
                            className="h-2"
                            aria-label={`Export job progress ${job.progress}%`}
                          />
                          <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                            {job.status === "queued"
                              ? "Queued — waiting to start"
                              : `${job.progress}% complete`}
                          </p>
                        </div>
                      )}
                      {job.status === "completed_no_artifact" && (
                        <div className="mt-2" data-testid="report-no-artifact">
                          <UnavailableState
                            reason="no_artifact"
                            title="No file produced"
                            message="The job finished but no downloadable artifact was generated. Full artifact generation is not yet implemented."
                            testId={`report-no-artifact-${job.id}`}
                          />
                        </div>
                      )}
                      {job.status === "failed" && (
                        <p className="mt-2 text-xs text-[var(--app-danger)]">
                          Export failed. Try again or contact support.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="space-y-4">
          <Card padding="lg" className="sticky top-6">
            <SectionHeader title="Export Configuration" className="mb-4" />

            {selectedTemplate ? (
              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {formatOptions.map((format) => (
                      <button
                        key={format}
                        onClick={() => patchUI({ exportFormat: format })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          exportFormat === format
                            ? "border-[var(--app-primary)] bg-[var(--app-primary-bg)]"
                            : "border-[var(--app-border)] hover:border-[var(--app-primary)]"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {getFormatIcon(format)}
                          <span className="text-xs font-medium uppercase">
                            {format}
                          </span>
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
                      <label className="text-xs text-[var(--app-text-muted)] mb-1 block">
                        From
                      </label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          patchUI({
                            dateRange: { ...dateRange, start: e.target.value },
                          })
                        }
                        size="sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--app-text-muted)] mb-1 block">
                        To
                      </label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          patchUI({
                            dateRange: { ...dateRange, end: e.target.value },
                          })
                        }
                        size="sm"
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
                    {selectedTemplateSections.map((section) => (
                      <button
                        key={section}
                        onClick={() => toggleSection(section)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          safeSelectedSections.includes(section)
                            ? "border-[var(--app-primary)] bg-[var(--app-primary-bg)]"
                            : "border-[var(--app-border)] hover:border-[var(--app-primary)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{section}</span>
                          {safeSelectedSections.includes(section) && (
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
                    <Switch
                      aria-label="Schedule report"
                      isSelected={scheduleEnabled}
                      onValueChange={(value) =>
                        patchUI({ scheduleEnabled: value })
                      }
                      size="sm"
                    />
                  </div>
                  {scheduleEnabled && (
                    <div className="space-y-2">
                      <Select
                        aria-label="Schedule frequency"
                        options={REPORT_SCHEDULE_FREQUENCY_OPTIONS}
                        selectedKeys={[scheduleFrequency]}
                        onChange={(event) =>
                          patchUI({
                            scheduleFrequency: event.target.value as
                              | "weekly"
                              | "monthly"
                              | "quarterly",
                          })
                        }
                        size="sm"
                      />
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
    </PageShell>
  );
}
