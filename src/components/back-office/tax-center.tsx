"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge, Progress, Modal, useToast } from "@/ui";
import {
  Receipt,
  Download,
  Send,
  Calendar,
  DollarSign,
  Mail,
  FileText,
} from "lucide-react";
import { getRouteConfig, ROUTE_PATHS } from "@/config/routes";
import { K1Generator } from "../tax/k1-generator";
import { useUIKey } from "@/store/ui";
import { useAuth } from "@/contexts/auth-context";
import {
  getOperatingRegionLabel,
  getTaxCenterLabel,
} from "@/lib/regulatory-regions";
import {
  DEFAULT_TAX_CENTER_TAB_ID,
  TAX_CENTER_TAB_IDS,
} from "@/config/tax-center-tabs";
import { taxCenterSelectors } from "@/store/slices/backOfficeSlice";
import { AsyncStateRenderer } from "@/ui/async-states";
import { formatCurrency, formatDate } from "@/utils/formatting";
import {
  KeyValueRow,
  StatusBadge,
  MetricsGrid,
  PageScaffold,
  SectionHeader,
} from "@/ui/composites";
import type { MetricsGridItem } from "@/ui/composites";
import { useAsyncData } from "@/hooks/useAsyncData";
import { loadTaxCenterOperation } from "@/store/async/backOfficeOperations";
import {
  getTaxDocument,
  updateTaxDocumentStatus,
} from "@/services/backOffice/taxCenterService";
import type { TaxDocument } from "@/data/mocks/back-office/tax-center";
import { useState } from "react";

export function TaxCenter() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAsyncData(
    loadTaxCenterOperation,
    taxCenterSelectors.selectState,
  );
  const { value: ui, patch: patchUI } = useUIKey("back-office-tax-center", {
    selectedTab: DEFAULT_TAX_CENTER_TAB_ID,
  });
  const { selectedTab } = ui;
  const operatingRegion = user?.operatingRegion ?? null;
  const taxCenterLabel = getTaxCenterLabel(operatingRegion);
  const isNonUsRegion = operatingRegion === "india" || operatingRegion === "eu";
  const [previewState, setPreviewState] = useState<
    | { open: false }
    | { open: true; loading: boolean; document?: TaxDocument; error?: string }
  >({ open: false });
  const [configState, setConfigState] = useState<
    { open: false } | { open: true; fundId: string }
  >({ open: false });

  useEffect(() => {
    if (!TAX_CENTER_TAB_IDS.has(selectedTab)) {
      patchUI({ selectedTab: DEFAULT_TAX_CENTER_TAB_ID });
    }
  }, [patchUI, selectedTab]);

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig(ROUTE_PATHS.taxCenter);

  const taxDocuments = data?.taxDocuments || [];
  const taxSummaries = data?.taxSummaries || [];
  const portfolioTax = data?.portfolioTax || [];
  const filingDeadline = data?.filingDeadline || new Date();

  // Calculate AI insights
  const k1sIssued = taxSummaries.reduce((sum, s) => sum + s.k1sIssued, 0);
  const k1sTotal = taxSummaries.reduce((sum, s) => sum + s.k1sTotal, 0);
  const form1099Issued = taxSummaries.reduce(
    (sum, s) => sum + s.form1099Issued,
    0,
  );
  const form1099Total = taxSummaries.reduce(
    (sum, s) => sum + s.form1099Total,
    0,
  );
  const estimatedTaxesPaid = taxSummaries.reduce(
    (sum, s) => sum + s.estimatedTaxesPaid,
    0,
  );
  const readyDocuments = taxDocuments.filter(
    (d) => d.status === "ready",
  ).length;

  const summaryCards: MetricsGridItem[] = [
    {
      type: "stats",
      props: {
        title: "K-1s Issued",
        value: k1sIssued,
        icon: FileText,
        variant: "success",
        subtitle: `of ${k1sTotal} total`,
      },
    },
    {
      type: "stats",
      props: {
        title: "1099s Issued",
        value: form1099Issued,
        icon: FileText,
        variant: "primary",
        subtitle: `of ${form1099Total} total`,
      },
    },
    {
      type: "stats",
      props: {
        title: "Est. Taxes Paid",
        value: formatCurrency(estimatedTaxesPaid),
        icon: DollarSign,
        variant: "warning",
      },
    },
    {
      type: "stats",
      props: {
        title: "Filing Deadline",
        value: formatDate(filingDeadline, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        icon: Calendar,
        variant: "neutral",
        subtitle: `${Math.ceil((filingDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`,
      },
    },
  ];

  const handleGenerateK1Batch = () => {
    toast.success(
      "K-1 generation batch has been queued for all configured funds.",
      "Generation Started",
    );
  };

  const handleUploadTaxDocuments = () => {
    router.push(ROUTE_PATHS.documents);
  };

  const handleConfigureK1 = (fundId: string) => {
    setConfigState({ open: true, fundId });
  };

  const handleGenerateK1s = (fundId: string, taxYear: number) => {
    toast.success(
      `K-1 generation started for ${fundId} (${taxYear}).`,
      "Generation Started",
    );
  };

  const handlePreviewK1 = async (documentId: string) => {
    setPreviewState({ open: true, loading: true });
    try {
      const document = await getTaxDocument(documentId);
      setPreviewState({ open: true, loading: false, document });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Failed to load K-1.";
      setPreviewState({ open: true, loading: false, error: message });
    }
  };

  const handleApproveK1 = async (documentId: string) => {
    try {
      const updated = await updateTaxDocumentStatus(documentId, "ready");
      toast.success(
        `${updated.documentType} for ${updated.recipientName} marked ready to send.`,
        "Approved",
      );
      await refetch();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Failed to approve K-1.";
      toast.error(message, "Approval Failed");
    }
  };

  const handleSendK1 = async (documentId: string) => {
    try {
      const updated = await updateTaxDocumentStatus(documentId, "sent");
      toast.success(
        `${updated.documentType} dispatched to ${updated.recipientName}.`,
        "Sent",
      );
      await refetch();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Failed to send K-1.";
      toast.error(message, "Send Failed");
    }
  };

  const handleAmendK1 = async (documentId: string) => {
    try {
      const updated = await updateTaxDocumentStatus(documentId, "amended");
      toast.warning(
        `${updated.documentType} for ${updated.recipientName} marked as amended.`,
        "Amendment Recorded",
      );
      await refetch();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Failed to amend K-1.";
      toast.error(message, "Amend Failed");
    }
  };

  const handleExportAllK1 = (
    fundId: string,
    taxYear: number,
    format: "pdf" | "csv",
  ) => {
    toast.success(
      `Export started for ${fundId} (${taxYear}) in ${format.toUpperCase()} format.`,
      "Export Started",
    );
  };

  return (
    <>
      <AsyncStateRenderer
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingMessage="Loading tax center…"
        errorTitle="Failed to load tax center"
        isEmpty={() => false}
      >
        {() =>
          isNonUsRegion ? (
            <PageScaffold
              breadcrumbs={routeConfig?.breadcrumbs}
              aiSuggestion={routeConfig?.aiSuggestion}
              header={{
                title: taxCenterLabel,
                description: `Reporting workflows for ${getOperatingRegionLabel(operatingRegion)} are active for this organization.`,
                icon: Receipt,
                aiSummary: {
                  text: `US-specific K-1 and 1099 workflows are hidden because this organization is configured for ${getOperatingRegionLabel(operatingRegion)}.`,
                },
              }}
            >
              <Card padding="lg">
                <div className="space-y-3">
                  <Badge variant="flat">
                    {getOperatingRegionLabel(operatingRegion)}
                  </Badge>
                  <h3 className="text-lg font-semibold">
                    Region-aware tax and reporting mode
                  </h3>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    This workspace now suppresses the US-only K-1 and 1099
                    workflow. Use the organization region and fund regulatory
                    profile as the source of truth for region-specific
                    reporting, document delivery, and compliance follow-up.
                  </p>
                </div>
              </Card>
            </PageScaffold>
          ) : (
            <PageScaffold
              breadcrumbs={routeConfig?.breadcrumbs}
              aiSuggestion={routeConfig?.aiSuggestion}
              header={{
                title: taxCenterLabel,
                description:
                  "Manage tax documents, K-1s, and reporting for LPs and portfolio companies",
                icon: Receipt,
                aiSummary: {
                  text: `${k1sIssued} K-1s issued out of ${k1sTotal}. ${form1099Issued} 1099s issued. ${readyDocuments} documents ready to send. Filing deadline: ${formatDate(filingDeadline, { month: "long", day: "numeric", year: "numeric" })}. AI recommends prioritizing the ${readyDocuments} ready documents for immediate distribution.`,
                },
                primaryAction: {
                  label: "Generate K-1s",
                  onClick: handleGenerateK1Batch,
                  aiSuggested: readyDocuments > 0,
                },
                secondaryActions: [
                  {
                    label: "Upload Documents",
                    onClick: handleUploadTaxDocuments,
                  },
                ],
              }}
            >
              {/* Summary Cards */}
              <MetricsGrid
                items={summaryCards}
                columns={{ base: 1, md: 2, lg: 4 }}
                className="mt-4"
              />

              {/* Overview Tab - Tax Documents */}
              {selectedTab === "overview" && (
                <div className="mt-4 space-y-3">
                  {taxDocuments.map((doc) => (
                    <Card key={doc.id} padding="lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                            <FileText className="w-6 h-6 text-[var(--app-primary)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {doc.documentType}
                              </h3>
                              <StatusBadge
                                status={doc.status}
                                domain="tax"
                                showIcon
                                size="sm"
                              />
                              <Badge
                                size="sm"
                                className="bg-[var(--app-surface-hover)]"
                              >
                                Tax Year {doc.taxYear}
                              </Badge>
                            </div>

                            <p className="text-sm text-[var(--app-text-muted)] mb-2">
                              {doc.recipientType}: {doc.recipientName}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-[var(--app-text-subtle)]">
                              {doc.amount && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{formatCurrency(doc.amount)}</span>
                                  </div>
                                  <span>•</span>
                                </>
                              )}
                              {doc.generatedDate && (
                                <>
                                  <span>
                                    Generated: {formatDate(doc.generatedDate)}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              {doc.sentDate && (
                                <span>Sent: {formatDate(doc.sentDate)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.status === "draft" && (
                            <Button
                              size="sm"
                              variant="bordered"
                              startContent={<FileText className="w-4 h-4" />}
                            >
                              Generate
                            </Button>
                          )}
                          {doc.status === "ready" && (
                            <Button
                              size="sm"
                              className="bg-[var(--app-primary)] text-white"
                              startContent={<Send className="w-4 h-4" />}
                            >
                              Send
                            </Button>
                          )}
                          {doc.status === "sent" && (
                            <>
                              <Button
                                size="sm"
                                variant="bordered"
                                startContent={<Mail className="w-4 h-4" />}
                              >
                                Resend
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                startContent={<Download className="w-4 h-4" />}
                              >
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* K-1 Generator Tab */}
              {selectedTab === "k1-generator" && (
                <div className="mt-4">
                  <K1Generator
                    configurations={[]}
                    documents={[]}
                    onConfigureK1={handleConfigureK1}
                    onGenerateK1s={handleGenerateK1s}
                    onPreviewK1={handlePreviewK1}
                    onApproveK1={handleApproveK1}
                    onSendK1={handleSendK1}
                    onAmendK1={handleAmendK1}
                    onExportAll={handleExportAllK1}
                  />
                </div>
              )}

              {/* Fund Summary Tab */}
              {selectedTab === "fund-summary" && (
                <div className="mt-4 space-y-3">
                  {taxSummaries.map((summary) => {
                    const k1Progress =
                      (summary.k1sIssued / summary.k1sTotal) * 100;
                    const form1099Progress =
                      (summary.form1099Issued / summary.form1099Total) * 100;

                    return (
                      <Card key={summary.id} padding="lg">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {summary.fundName}
                              </h3>
                              <p className="text-sm text-[var(--app-text-muted)]">
                                Tax Year {summary.taxYear}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[var(--app-text-muted)]">
                                Filing Deadline
                              </p>
                              <p className="font-semibold">
                                {formatDate(summary.filingDeadline)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-[var(--app-text-muted)] mb-1">
                                Total Distributions
                              </p>
                              <p className="text-lg font-bold text-[var(--app-success)]">
                                {formatCurrency(summary.totalDistributions)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--app-text-muted)] mb-1">
                                Estimated Taxes Paid
                              </p>
                              <p className="text-lg font-bold">
                                {formatCurrency(summary.estimatedTaxesPaid)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--app-text-muted)] mb-1">
                                Effective Tax Rate
                              </p>
                              <p className="text-lg font-bold">
                                {(
                                  (summary.estimatedTaxesPaid /
                                    summary.totalDistributions) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <KeyValueRow
                                label="Schedule K-1s"
                                value={`${summary.k1sIssued} of ${summary.k1sTotal} (${k1Progress.toFixed(0)}%)`}
                                className="mb-2"
                                paddingYClassName=""
                                valueClassName="font-semibold"
                              />
                              <Progress
                                value={k1Progress}
                                maxValue={100}
                                className="h-2"
                                aria-label={`Schedule K-1s progress ${k1Progress.toFixed(0)}%`}
                              />
                            </div>

                            <div>
                              <KeyValueRow
                                label="Form 1099s"
                                value={`${summary.form1099Issued} of ${summary.form1099Total} (${form1099Progress.toFixed(0)}%)`}
                                className="mb-2"
                                paddingYClassName=""
                                valueClassName="font-semibold"
                              />
                              <Progress
                                value={form1099Progress}
                                maxValue={100}
                                className="h-2"
                                aria-label={`Form 1099s progress ${form1099Progress.toFixed(0)}%`}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Portfolio Companies Tab */}
              {selectedTab === "portfolio" && (
                <div className="mt-4">
                  <Card padding="lg">
                    <SectionHeader
                      title="K-1 Collection Status"
                      titleClassName="font-semibold"
                      className="mb-4"
                    />
                    <div className="space-y-3">
                      {portfolioTax.map((company) => (
                        <div
                          key={company.id}
                          className="p-4 rounded-lg bg-[var(--app-surface-hover)]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {company.companyName}
                                </h4>
                                {company.k1Required && (
                                  <StatusBadge
                                    status={
                                      company.k1Received
                                        ? "received"
                                        : "pending"
                                    }
                                    domain="tax"
                                    showIcon
                                    size="sm"
                                  />
                                )}
                                {!company.k1Required && (
                                  <Badge
                                    size="sm"
                                    className="bg-[var(--app-surface)]"
                                  >
                                    No K-1 Required
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-[var(--app-text-muted)]">
                                    Ownership
                                  </p>
                                  <p className="font-medium">
                                    {company.ownership}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[var(--app-text-muted)]">
                                    Tax Classification
                                  </p>
                                  <p className="font-medium">
                                    {company.taxClassification}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[var(--app-text-muted)]">
                                    Contact
                                  </p>
                                  <p className="font-medium text-xs">
                                    {company.contactEmail}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[var(--app-text-muted)]">
                                    K-1 Received
                                  </p>
                                  <p className="font-medium">
                                    {company.k1ReceivedDate
                                      ? formatDate(company.k1ReceivedDate)
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {company.k1Required && !company.k1Received && (
                              <Button
                                size="sm"
                                variant="flat"
                                startContent={<Mail className="w-4 h-4" />}
                              >
                                Request K-1
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* LP Communications Tab */}
              {selectedTab === "communications" && (
                <div className="mt-4">
                  <Card padding="lg">
                    <SectionHeader
                      title="Tax Document Distribution"
                      titleClassName="font-semibold"
                      className="mb-4"
                    />

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-[var(--app-info-bg)] border border-[var(--app-info)]/20">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-[var(--app-info)] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--app-info)] mb-2">
                              Ready to Send Tax Documents
                            </p>
                            <p className="text-xs text-[var(--app-text-muted)] mb-3">
                              8 K-1s are ready to be sent to Limited Partners.
                              Documents will be securely delivered via email
                              with access to a password-protected portal.
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-[var(--app-primary)] text-white"
                                startContent={<Send className="w-4 h-4" />}
                              >
                                Send All K-1s
                              </Button>
                              <Button
                                size="sm"
                                variant="bordered"
                                startContent={<FileText className="w-4 h-4" />}
                              >
                                Preview Email
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                          <h4 className="font-semibold mb-3">
                            Email Templates
                          </h4>
                          <div className="space-y-2">
                            <Button
                              variant="bordered"
                              className="w-full justify-start"
                              size="sm"
                            >
                              K-1 Distribution Notice
                            </Button>
                            <Button
                              variant="bordered"
                              className="w-full justify-start"
                              size="sm"
                            >
                              1099 Distribution Notice
                            </Button>
                            <Button
                              variant="bordered"
                              className="w-full justify-start"
                              size="sm"
                            >
                              Estimated Tax Payment Reminder
                            </Button>
                            <Button
                              variant="bordered"
                              className="w-full justify-start"
                              size="sm"
                            >
                              Tax Document Follow-up
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                          <h4 className="font-semibold mb-3">
                            Distribution History
                          </h4>
                          <div className="space-y-3 text-sm">
                            <KeyValueRow
                              label="2024 K-1s Sent"
                              value="Dec 5, 2024"
                              paddingYClassName=""
                              valueClassName="font-semibold"
                            />
                            <KeyValueRow
                              label="2024 Q4 Estimates"
                              value="Jan 10, 2024"
                              paddingYClassName=""
                              valueClassName="font-semibold"
                            />
                            <KeyValueRow
                              label="2023 K-1s Sent"
                              value="Mar 1, 2024"
                              paddingYClassName=""
                              valueClassName="font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Info Card */}
              <Card
                padding="md"
                className="bg-[var(--app-warning-bg)] border-[var(--app-warning)]/20"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[var(--app-warning)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--app-warning)] mb-1">
                      Important Tax Deadlines
                    </p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      • January 31: Form 1099 distribution deadline • March 15:
                      Partnership K-1 distribution deadline (with extension to
                      September 15) • Quarterly estimated tax payments due April
                      15, June 15, September 15, and January 15
                    </p>
                  </div>
                </div>
              </Card>
            </PageScaffold>
          )
        }
      </AsyncStateRenderer>
      <Modal
        title="K-1 Preview"
        size="lg"
        isOpen={previewState.open}
        onOpenChange={(open) => {
          if (!open) setPreviewState({ open: false });
        }}
        footer={
          <Button
            variant="flat"
            onPress={() => setPreviewState({ open: false })}
          >
            Close
          </Button>
        }
      >
        {previewState.open && previewState.loading && <p>Loading…</p>}
        {previewState.open && previewState.error && (
          <p className="text-[var(--app-danger)]">{previewState.error}</p>
        )}
        {previewState.open && previewState.document && (
          <div className="space-y-2 text-sm">
            <div>
              <strong>Document:</strong> {previewState.document.documentType}
            </div>
            <div>
              <strong>Tax Year:</strong> {previewState.document.taxYear}
            </div>
            <div>
              <strong>Recipient:</strong> {previewState.document.recipientName}{" "}
              ({previewState.document.recipientType})
            </div>
            <div>
              <strong>Status:</strong> {previewState.document.status}
            </div>
            {previewState.document.amount !== undefined && (
              <div>
                <strong>Amount:</strong>{" "}
                {formatCurrency(previewState.document.amount)}
              </div>
            )}
            {previewState.document.generatedDate && (
              <div>
                <strong>Generated:</strong>{" "}
                {previewState.document.generatedDate}
              </div>
            )}
            {previewState.document.sentDate && (
              <div>
                <strong>Sent:</strong> {previewState.document.sentDate}
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        title={
          configState.open
            ? `K-1 Configuration · ${configState.fundId}`
            : "K-1 Configuration"
        }
        size="md"
        isOpen={configState.open}
        onOpenChange={(open) => {
          if (!open) setConfigState({ open: false });
        }}
        footer={
          <Button
            variant="flat"
            onPress={() => setConfigState({ open: false })}
          >
            Close
          </Button>
        }
      >
        <p className="text-sm text-[var(--app-text-muted)]">
          Per-fund K-1 configuration (templates, signatories, recipients) will
          live here. The persistence layer ships with Phase 3 of the tax-center
          plan; for now the drawer surfaces the selected fund and confirms the
          editor is reachable.
        </p>
      </Modal>
    </>
  );
}
