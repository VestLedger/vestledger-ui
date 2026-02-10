"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Card, type PageHeaderBadge } from "@/ui";
import {
  ListItemCard,
  PageScaffold,
  SectionHeader,
  StatusBadge,
  MetricsGrid,
  Timeline,
  type MetricsGridItem,
  type TimelineItem,
} from '@/ui/composites';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAppDispatch } from "@/store/hooks";
import {
  approveDistributionRequested,
  distributionRequested,
  distributionsSelectors,
  rejectDistributionRequested,
  returnForRevisionRequested,
  setSelectedDistribution,
} from "@/store/slices/distributionSlice";
import type { Distribution, LPAllocation } from "@/types/distribution";
import { formatCurrency, formatCurrencyCompact, formatDate, formatPercent } from "@/utils/formatting";
import { getStatusColor } from "@/utils/styling/statusColors";
import { distributionEventTypeLabels, getLabelForType } from "@/utils/styling/typeMappers";
import { AdvancedTable, type ColumnDef } from "@/components/data-table/advanced-table";
import { ApprovalStepper } from "./approval-stepper";
import { DistributionAdvancedSummary } from "./distribution-advanced-summary";
import { ImpactPreviewPanel } from "./impact-preview-panel";
import { StatementGenerator } from "./statement-generator";
import { getStatementTemplateLabel } from "./statement-template-constants";
import { CalendarDays, Download, Receipt, Users } from "lucide-react";
import { ROUTE_PATHS } from "@/config/routes";

const buildLifecycleEvents = (distribution: Distribution) => [
  { id: "draft", label: "Draft", timestamp: distribution.createdAt },
  { id: "submitted", label: "Submitted for approval", timestamp: distribution.submittedForApprovalAt },
  { id: "approved", label: "Approved", timestamp: distribution.approvedAt },
  { id: "processed", label: "Processing started", timestamp: distribution.processedAt },
  { id: "executed", label: "Executed", timestamp: distribution.completedAt },
];

export function DistributionDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const distributionId = useMemo(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) return raw[0];
    return raw;
  }, [params?.id]);

  const { data, isLoading, error, refetch } = useAsyncData(
    distributionRequested,
    distributionsSelectors.selectState,
    {
      params: distributionId ?? "",
      fetchOnMount: Boolean(distributionId),
      dependencies: [distributionId],
    }
  );

  const distribution = useMemo(
    () => data?.distributions.find((item) => item.id === distributionId) ?? null,
    [data?.distributions, distributionId]
  );

  useEffect(() => {
    if (distributionId) {
      dispatch(setSelectedDistribution(distributionId));
    }
  }, [dispatch, distributionId]);

  const allocationColumns = useMemo<ColumnDef<LPAllocation>[]>(() => [
    {
      key: "lpName",
      label: "LP",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.lpName}</div>
          <div className="text-xs text-[var(--app-text-muted)]">{item.investorClassName}</div>
        </div>
      ),
    },
    {
      key: "proRataPercentage",
      label: "Pro-Rata",
      sortable: true,
      render: (item) => formatPercent(item.proRataPercentage, 2),
    },
    {
      key: "grossAmount",
      label: "Gross",
      align: "right",
      sortable: true,
      render: (item) => formatCurrencyCompact(item.grossAmount),
    },
    {
      key: "taxWithholdingAmount",
      label: "Tax Withheld",
      align: "right",
      sortable: true,
      render: (item) => formatCurrencyCompact(item.taxWithholdingAmount),
    },
    {
      key: "netAmount",
      label: "Net",
      align: "right",
      sortable: true,
      render: (item) => formatCurrencyCompact(item.netAmount),
    },
    {
      key: "isConfirmed",
      label: "Status",
      render: (item) => (
        <StatusBadge
          status={item.isConfirmed ? "confirmed" : "pending"}
          domain="fund-admin"
          size="sm"
        />
      ),
    },
  ], []);

  const headerBadges: PageHeaderBadge[] | undefined = distribution
    ? (() => {
        const badges: PageHeaderBadge[] = [
          {
            label: distribution.status
              .split("-")
              .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
              .join(" "),
            size: "md",
            variant: "flat",
            className: getStatusColor(distribution.status, "fund-admin"),
          },
          {
            label: formatDate(distribution.eventDate),
            size: "md",
            variant: "bordered",
            className: "text-[var(--app-text-muted)] border-[var(--app-border)]",
          },
        ];

        if (distribution.isRecurring) {
          badges.push({
            label: "Recurring",
            size: "md",
            variant: "flat",
            className: "bg-[var(--app-primary-bg)] text-[var(--app-primary)]",
          });
        }

        return badges;
      })()
    : undefined;

  return (
    <PageScaffold
      routePath={ROUTE_PATHS.fundAdminDistributionDetail}
      header={{
        title: distribution?.name ?? "Distribution Detail",
        description: distribution
          ? `${distribution.fundName} - ${getLabelForType(distributionEventTypeLabels, distribution.eventType)}`
          : "Review distribution approvals, allocations, and statements.",
        icon: Receipt,
        badges: headerBadges,
        secondaryActions: [
          {
            label: "Back to Fund Admin",
            onClick: () => router.push(ROUTE_PATHS.fundAdmin),
          },
          {
            label: "Calendar",
            onClick: () => router.push(ROUTE_PATHS.fundAdminDistributionsCalendar),
          },
        ],
      }}
      containerProps={{ className: "space-y-4" }}
    >
      <AsyncStateRenderer
        data={distribution}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Distribution not found"
        emptyMessage="Choose a distribution from the list to review approvals and statements."
        emptyAction={{ label: "Back to Distributions", onClick: () => router.push(ROUTE_PATHS.fundAdmin) }}
      >
        {(record) => {
          const lifecycleEvents = buildLifecycleEvents(record);
          const lifecycleItems: TimelineItem[] = lifecycleEvents.map((event) => ({
            id: event.id,
            title: event.label,
            subtitle: event.timestamp ? formatDate(event.timestamp) : "Pending",
            dotColor: event.timestamp ? "var(--app-success)" : "var(--app-border)",
          }));
          const allocations = record.lpAllocations ?? [];
          const statements = record.statements ?? [];
          const currentApprover = record.approvalSteps.find(
            (step) => step.order === record.currentApprovalStep
          );

          const summaryCards: MetricsGridItem[] = [
            {
              type: "stats",
              props: {
                title: "Gross Proceeds",
                value: formatCurrency(record.grossProceeds),
                icon: Receipt,
                variant: "primary",
              },
            },
            {
              type: "stats",
              props: {
                title: "Net Proceeds",
                value: formatCurrency(record.netProceeds),
                icon: Receipt,
                variant: "success",
              },
            },
            {
              type: "stats",
              props: {
                title: "Distributed",
                value: formatCurrency(record.totalDistributed),
                icon: Users,
                variant: "warning",
              },
            },
            {
              type: "stats",
              props: {
                title: "Tax Withheld",
                value: formatCurrency(record.totalTaxWithholding),
                icon: CalendarDays,
                variant: "neutral",
              },
            },
          ];

          return (
            <>
              <MetricsGrid items={summaryCards} columns={{ base: 1, md: 2, lg: 4 }} />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <Card padding="lg">
                    <SectionHeader
                      title="Distribution Overview"
                      description="Key milestones and allocation context for this distribution."
                      action={<StatusBadge status={record.status} domain="fund-admin" showIcon size="sm" />}
                    />

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Fund</p>
                        <p className="text-sm font-medium">{record.fundName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Event Type</p>
                        <p className="text-sm font-medium">
                          {getLabelForType(distributionEventTypeLabels, record.eventType)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Event Date</p>
                        <p className="text-sm font-medium">{formatDate(record.eventDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Payment Date</p>
                        <p className="text-sm font-medium">{formatDate(record.paymentDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Waterfall Scenario</p>
                        <p className="text-sm font-medium">
                          {record.waterfallScenarioName || "Not linked"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Current Approver</p>
                        <p className="text-sm font-medium">
                          {currentApprover
                            ? `${currentApprover.approverName} (${currentApprover.approverRole})`
                            : "Approval complete"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <ApprovalStepper
                    distribution={record}
                    onApprove={(params) => dispatch(approveDistributionRequested(params))}
                    onReject={(params) => dispatch(rejectDistributionRequested(params))}
                    onReturnForRevision={(params) => dispatch(returnForRevisionRequested(params))}
                    isSubmitting={isLoading}
                  />

                  <Card padding="lg">
                    <SectionHeader
                      title="LP Allocation Breakdown"
                      description="View gross, tax, and net allocations across investors."
                      action={(
                        <Badge size="sm" variant="flat">
                          {allocations.length} allocations
                        </Badge>
                      )}
                    />

                    <div className="mt-4">
                      <AdvancedTable
                        stateKey={`distribution-allocations-${record.id}`}
                        data={allocations}
                        columns={allocationColumns}
                        searchable
                        searchPlaceholder="Search LPs..."
                        searchKeys={["lpName", "investorClassName", "taxJurisdiction"]}
                        exportable={false}
                        pageSize={6}
                      />
                    </div>
                  </Card>

                  {record.impact ? (
                    <ImpactPreviewPanel impact={record.impact} />
                  ) : (
                    <Card padding="lg">
                      <SectionHeader
                        title="Impact Preview"
                        description="Impact analysis will appear once the distribution model is finalized."
                      />
                    </Card>
                  )}

                  <DistributionAdvancedSummary distribution={record} />
                </div>

                <div className="space-y-4">
                  <Card padding="lg">
                    <SectionHeader title="Lifecycle Timeline" className="mb-4" />
                    <Timeline items={lifecycleItems} />
                  </Card>

                  <StatementGenerator distribution={record} />

                  <Card padding="lg">
                    <SectionHeader
                      title="Statements & Documents"
                      description="Download LP statements once generated by the backend."
                      action={(
                        <Badge size="sm" variant="flat">
                          {statements.length} statements
                        </Badge>
                      )}
                    />

                    <div className="mt-4 space-y-3">
                      {statements.length === 0 ? (
                        <div className="text-sm text-[var(--app-text-muted)]">
                          Statements have not been generated yet.
                        </div>
                      ) : (
                        statements.map((statement) => (
                          <ListItemCard
                            key={statement.id}
                            title={statement.lpName}
                            description={`Template: ${getStatementTemplateLabel(statement.template)}`}
                            padding="sm"
                            actions={(
                              <Button
                                size="sm"
                                variant="flat"
                                startContent={<Download className="h-3 w-3" />}
                                isDisabled={!statement.pdfUrl}
                              >
                                Download PDF
                              </Button>
                            )}
                          />
                        ))
                      )}
                    </div>
                  </Card>

                  <Card padding="lg">
                    <SectionHeader title="Internal Notes" />
                    <div className="mt-3 space-y-2">
                      {record.comments.length === 0 ? (
                        <p className="text-sm text-[var(--app-text-muted)]">
                          No internal notes have been captured yet.
                        </p>
                      ) : (
                        record.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-hover)] px-3 py-2 text-sm"
                          >
                            <div className="text-xs text-[var(--app-text-muted)]">
                              {comment.userName} - {formatDate(comment.createdAt)}
                            </div>
                            <div className="mt-1">{comment.comment}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          );
        }}
      </AsyncStateRenderer>
    </PageScaffold>
  );
}
