"use client";

import { useEffect, useMemo } from "react";
import { Badge, Button, Card, Progress, WorkflowStepper, type WorkflowStep } from "@/ui";
import { PageScaffold } from "@/components/ui";
import { AsyncStateRenderer } from "@/components/ui/async-states";
import { getRouteConfig } from "@/config/routes";
import { useUIKey } from "@/store/ui";
import { useAppDispatch } from "@/store/hooks";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  distributionsRequested,
  distributionsSelectors,
  feeTemplatesRequested,
  feeTemplatesSelectors,
  statementTemplatesRequested,
  statementTemplatesSelectors,
  lpProfilesRequested,
  lpProfilesSelectors,
  approvalRulesRequested,
  approvalRulesSelectors,
  distributionUpdated,
  setSelectedDistribution,
} from "@/store/slices/distributionSlice";
import {
  scenariosRequested,
  scenariosSelectors,
} from "@/store/slices/waterfallSlice";
import { useFund } from "@/contexts/fund-context";
import type {
  Distribution,
  DistributionWizardState,
  FeeLineItem,
  LPAllocation,
  DistributionImpact,
  StatementTemplate,
  StatementBranding,
  DistributionStatus,
  ApprovalRule,
  ApprovalStep,
} from "@/types/distribution";
import { formatCurrencyCompact, formatDate, formatDateTime } from "@/utils/formatting";
import { getAllocationIssues } from "@/lib/validation/distribution";
import { DistributionStepEvent } from "./distribution-step-event";
import { DistributionStepFees } from "./distribution-step-fees";
import { DistributionStepWaterfall } from "./distribution-step-waterfall";
import { DistributionStepAllocations } from "./distribution-step-allocations";
import { DistributionStepTax } from "./distribution-step-tax";
import { DistributionStepAdvanced } from "./distribution-step-advanced";
import { DistributionStepImpact } from "./distribution-step-impact";
import { DistributionStepPreview } from "./distribution-step-preview";
import { DistributionStepSubmit } from "./distribution-step-submit";
import { createDistribution, updateDistribution } from "@/services/backOffice/distributionService";

const STEP_LABELS = [
  "Event",
  "Fees",
  "Waterfall",
  "Allocations",
  "Tax",
  "Advanced",
  "Impact",
  "Preview",
  "Submit",
];

const DEFAULT_TEMPLATE: StatementTemplate = "standard";

const buildImpact = (totalDistributed: number): DistributionImpact => {
  const navBefore = 320_000_000;
  const navAfter = Math.max(0, navBefore - totalDistributed);
  const dpiBefore = 1.25;
  const dpiAfter = Math.max(0, dpiBefore + totalDistributed / 200_000_000);
  const tvpiBefore = 1.85;
  const tvpiAfter = Math.max(0, tvpiBefore - totalDistributed / 300_000_000);
  const undrawnBefore = 85_000_000;
  const undrawnAfter = Math.max(0, undrawnBefore - totalDistributed * 0.2);

  return {
    navBefore,
    navAfter,
    dpiBefore,
    dpiAfter,
    tvpiBefore,
    tvpiAfter,
    undrawnCapitalBefore: undrawnBefore,
    undrawnCapitalAfter: undrawnAfter,
    navChange: navAfter - navBefore,
    dpiChange: dpiAfter - dpiBefore,
    tvpiChange: tvpiAfter - tvpiBefore,
    undrawnCapitalChange: undrawnAfter - undrawnBefore,
    covenantWarnings: [
      {
        covenantName: "Liquidity Coverage",
        threshold: 1.1,
        currentValue: 1.3,
        projectedValue: 1.05,
        isViolation: false,
        severity: "warning",
      },
    ],
  };
};

const getFeeAmount = (item: FeeLineItem, grossProceeds: number) => {
  if (item.amount > 0) return item.amount;
  if (item.percentage) return (item.percentage / 100) * grossProceeds;
  return 0;
};

const FEE_TYPES = new Set(["management-fee", "admin-fee"]);

export function DistributionWizard() {
  const routeConfig = getRouteConfig("/fund-admin/distributions/new");
  const dispatch = useAppDispatch();
  const { selectedFund, viewMode } = useFund();
  const today = new Date().toISOString().split("T")[0];

  const defaultEventData = useMemo<Partial<Distribution>>(
    () => ({
      fundId: viewMode === "individual" ? selectedFund?.id ?? "" : "",
      fundName: selectedFund?.displayName ?? "All Funds",
      name: "",
      eventType: "exit",
      eventDate: today,
      paymentDate: today,
      grossProceeds: 0,
      description: "",
      createdBy: "Ops Team",
    }),
    [selectedFund?.displayName, selectedFund?.id, today, viewMode]
  );

  const initialWizardState = useMemo<DistributionWizardState>(
    () => ({
      currentStep: 0,
      totalSteps: STEP_LABELS.length,
      completedSteps: [],
      eventData: defaultEventData,
      feesData: [],
      allocationsData: [],
      advancedData: {},
      impactData: buildImpact(0),
      previewData: { template: DEFAULT_TEMPLATE, emailSubject: "", emailBody: "" },
      validationErrors: [],
      isDraft: true,
      autoSaveEnabled: true,
    }),
    [defaultEventData]
  );

  const { value: wizard, patch: patchWizard } = useUIKey<DistributionWizardState>(
    "distribution-wizard",
    initialWizardState
  );

  const eventData = wizard.eventData ?? defaultEventData;
  const feeLineItems = wizard.feesData ?? [];
  const allocations = wizard.allocationsData ?? [];
  const advancedData = wizard.advancedData ?? {};
  const impact = wizard.impactData ?? buildImpact(0);
  const defaultPreviewData = useMemo(
    () => ({
      template: DEFAULT_TEMPLATE,
      customBranding: undefined,
      emailSubject: "",
      emailBody: "",
    }),
    []
  );
  const previewData = useMemo(
    () => wizard.previewData ?? defaultPreviewData,
    [defaultPreviewData, wizard.previewData]
  );
  const comment = wizard.submitData?.comment ?? "";

  useEffect(() => {
    if (!wizard.eventData) {
      patchWizard({ eventData: defaultEventData });
    }
  }, [defaultEventData, patchWizard, wizard.eventData]);

  useEffect(() => {
    if (wizard.totalSteps !== STEP_LABELS.length) {
      patchWizard({ totalSteps: STEP_LABELS.length });
    }
  }, [patchWizard, wizard.totalSteps]);

  useEffect(() => {
    const distributionName = eventData.name?.trim();
    if (!distributionName) return;
    const subject = previewData.emailSubject?.trim() ?? "";
    const body = previewData.emailBody?.trim() ?? "";
    if (subject && body) return;

    patchWizard({
      previewData: {
        ...previewData,
        emailSubject: subject || `${distributionName} Distribution Notice`,
        emailBody:
          body ||
          `Hello,\n\nYour ${distributionName} statement is ready for review. Please log in to the LP portal to view details and confirm receipt.\n\nThank you,\nVestLedger Operations`,
      },
    });
  }, [eventData.name, patchWizard, previewData, previewData.emailBody, previewData.emailSubject]);

  const grossProceeds = eventData.grossProceeds ?? 0;
  const totalFees = feeLineItems.reduce((sum, item) => {
    if (!FEE_TYPES.has(item.type)) return sum;
    return sum + getFeeAmount(item, grossProceeds);
  }, 0);
  const totalExpenses = feeLineItems.reduce((sum, item) => {
    if (FEE_TYPES.has(item.type)) return sum;
    return sum + getFeeAmount(item, grossProceeds);
  }, 0);
  const netProceeds = Math.max(0, grossProceeds - totalFees - totalExpenses);
  const totalTaxWithholding = allocations.reduce(
    (sum, allocation) => sum + allocation.taxWithholdingAmount,
    0
  );
  const allocatedTotal = allocations.reduce((sum, allocation) => sum + allocation.netAmount, 0);
  const allocatedGrossTotal = allocations.reduce(
    (sum, allocation) => sum + allocation.grossAmount,
    0
  );
  const totalDistributed = allocations.length > 0
    ? allocatedTotal
    : Math.max(0, netProceeds - totalTaxWithholding);

  const { data: feeTemplatesData, isLoading: feeTemplatesLoading, error: feeTemplatesError, refetch: refetchFeeTemplates } =
    useAsyncData(feeTemplatesRequested, feeTemplatesSelectors.selectState, {
      params: eventData.fundId || undefined,
      dependencies: [eventData.fundId],
    });

  const { data: statementTemplatesData } = useAsyncData(
    statementTemplatesRequested,
    statementTemplatesSelectors.selectState
  );

  const { data: lpProfilesData } = useAsyncData(
    lpProfilesRequested,
    lpProfilesSelectors.selectState
  );

  const { data: approvalRulesData } = useAsyncData(
    approvalRulesRequested,
    approvalRulesSelectors.selectState
  );

  const { data: distributionsData } = useAsyncData(
    distributionsRequested,
    distributionsSelectors.selectState,
    {
      params: { fundId: eventData.fundId || undefined },
      dependencies: [eventData.fundId],
    }
  );

  const { data: scenariosData, isLoading: scenariosLoading, error: scenariosError, refetch: refetchScenarios } =
    useAsyncData(scenariosRequested, scenariosSelectors.selectState);

  const feeTemplates = useMemo(
    () => feeTemplatesData?.templates ?? [],
    [feeTemplatesData]
  );
  const statementTemplates = useMemo(
    () => statementTemplatesData?.templates ?? [],
    [statementTemplatesData]
  );
  const lpProfiles = useMemo(
    () => lpProfilesData?.profiles ?? [],
    [lpProfilesData]
  );
  const approvalRules = useMemo(
    () => approvalRulesData?.rules ?? [],
    [approvalRulesData]
  );
  const scenarios = useMemo(
    () => scenariosData?.scenarios ?? [],
    [scenariosData]
  );
  const distributions = useMemo(
    () => distributionsData?.distributions ?? [],
    [distributionsData]
  );

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === wizard.waterfallData?.scenarioId) ?? null,
    [scenarios, wizard.waterfallData?.scenarioId]
  );
  const waterfallResults = wizard.waterfallData?.results ?? selectedScenario?.results ?? null;
  const waterfallCarry = waterfallResults?.gpCarry ?? 0;
  const waterfallExitValue =
    wizard.waterfallData?.previewExitValue ?? selectedScenario?.exitValue ?? 0;

  const previousDistribution = useMemo(() => {
    if (distributions.length === 0) return null;
    const sameFund = eventData.fundId
      ? distributions.filter((distribution) => distribution.fundId === eventData.fundId)
      : distributions;
    const candidates = sameFund.filter((distribution) => distribution.id !== eventData.id);
    const completed = candidates.filter((distribution) => distribution.status === "completed");
    const pool = completed.length > 0
      ? completed
      : candidates.filter((distribution) => distribution.status !== "draft");
    const sorted = [...pool].sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );
    return sorted[0] ?? null;
  }, [distributions, eventData.fundId, eventData.id]);

  const previousAllocationMap = useMemo(() => {
    const map: Record<string, number> = {};
    previousDistribution?.lpAllocations?.forEach((allocation) => {
      map[allocation.lpId] = allocation.netAmount;
    });
    return map;
  }, [previousDistribution]);

  const comparisonLabel =
    previousDistribution && previousDistribution.lpAllocations?.length
      ? `${previousDistribution.name} - ${formatDate(previousDistribution.eventDate)}`
      : undefined;

  const totalOutflows =
    totalFees + totalExpenses + totalTaxWithholding + totalDistributed + waterfallCarry;

  const warnings = useMemo(() => {
    const entries: string[] = [];
    if (grossProceeds > 0 && totalFees + totalExpenses > grossProceeds) {
      entries.push("Fees and expenses exceed gross proceeds.");
    }
    if (allocations.length > 0 && Math.abs(allocatedTotal - (netProceeds - totalTaxWithholding)) > 1) {
      entries.push("Allocated totals do not match net proceeds.");
    }
    if (grossProceeds > 0 && totalOutflows - grossProceeds > 1) {
      entries.push("Gross proceeds do not reconcile with fees, carry, taxes, and distributions.");
    }
    if (wizard.waterfallData?.scenarioId && !selectedScenario) {
      entries.push("Selected waterfall scenario is unavailable.");
    }
    if (selectedScenario && !waterfallResults) {
      entries.push("Selected waterfall scenario has no calculation results.");
    }
    if (waterfallExitValue > 0 && grossProceeds > 0 && Math.abs(waterfallExitValue - grossProceeds) > 1) {
      entries.push("Gross proceeds do not match selected waterfall scenario exit value.");
    }
    if (
      waterfallResults &&
      allocations.length > 0 &&
      Math.abs(allocatedGrossTotal - waterfallResults.lpTotalReturn) > 1
    ) {
      entries.push("LP allocations do not match waterfall LP total return.");
    }
    if (waterfallCarry > 0 && netProceeds > 0 && waterfallCarry > netProceeds) {
      entries.push("GP carry exceeds net proceeds.");
    }
    if (netProceeds <= 0) {
      entries.push("Net proceeds are zero. Review fee inputs.");
    }
    return entries;
  }, [
    allocatedGrossTotal,
    allocatedTotal,
    allocations.length,
    grossProceeds,
    netProceeds,
    selectedScenario,
    totalExpenses,
    totalFees,
    totalOutflows,
    totalTaxWithholding,
    waterfallExitValue,
    waterfallCarry,
    waterfallResults,
    wizard.waterfallData?.scenarioId,
  ]);

  const activeApprovalRule = useMemo<ApprovalRule | null>(() => {
    return (
      approvalRules.find(
        (rule) =>
          rule.isActive &&
          totalDistributed >= rule.minAmount &&
          (rule.maxAmount === undefined || totalDistributed < rule.maxAmount)
      ) ?? null
    );
  }, [approvalRules, totalDistributed]);

  useEffect(() => {
    if (allocations.length > 0 || lpProfiles.length === 0) return;
    const totalCommitment = lpProfiles.reduce((sum, profile) => sum + profile.totalCommitment, 0);
    const now = new Date().toISOString();
    const next = lpProfiles.map((profile) => {
      const ratio = totalCommitment > 0 ? profile.totalCommitment / totalCommitment : 0;
      const grossAmount = netProceeds * ratio;
      const taxWithholdingAmount = (grossAmount * profile.defaultTaxWithholdingRate) / 100;
      return {
        id: `alloc-${profile.id}-${Date.now()}`,
        lpId: profile.id,
        lpName: profile.name,
        investorClassId: "ic-default",
        investorClassName: "Class A LPs",
        commitment: profile.totalCommitment,
        ownershipPercentage: ratio * 100,
        proRataPercentage: ratio * 100,
        grossAmount,
        netAmount: Math.max(0, grossAmount - taxWithholdingAmount),
        taxJurisdiction: profile.taxJurisdiction,
        taxWithholdingRate: profile.defaultTaxWithholdingRate,
        taxWithholdingAmount,
        taxFormType: profile.taxFormType,
        isTaxOverride: false,
        hasSpecialTerms: false,
        isConfirmed: false,
        createdAt: now,
        updatedAt: now,
      };
    });
    patchWizard({ allocationsData: next });
  }, [allocations.length, lpProfiles, netProceeds, patchWizard]);

  const currentStep = wizard.currentStep;
  const isLastStep = currentStep === STEP_LABELS.length - 1;
  const progressValue = (currentStep / (STEP_LABELS.length - 1)) * 100;
  const validationForStep =
    wizard.validationErrors.find((entry) => entry.step === currentStep)?.errors ?? [];
  const workflowSteps = useMemo<WorkflowStep[]>(
    () =>
      STEP_LABELS.map((label, index) => ({
        id: `step-${index}`,
        label,
        status: wizard.completedSteps.includes(index)
          ? "completed"
          : index === currentStep
          ? "current"
          : "upcoming",
      })),
    [currentStep, wizard.completedSteps]
  );

  const updateEventData = (patch: Partial<Distribution>) => {
    patchWizard({ eventData: { ...eventData, ...patch } });
  };

  const updateFees = (items: FeeLineItem[]) => {
    patchWizard({ feesData: items });
  };

  const updateAllocations = (next: LPAllocation[]) => {
    patchWizard({ allocationsData: next });
  };

  const updateAdvancedData = (next: DistributionWizardState["advancedData"]) => {
    patchWizard({ advancedData: next });
  };

  const handleRecalculateAllocations = () => {
    if (lpProfiles.length === 0) return;
    const totalCommitment = lpProfiles.reduce((sum, profile) => sum + profile.totalCommitment, 0);
    const now = new Date().toISOString();
    const next = allocations.map((allocation) => {
      const profile = lpProfiles.find((lp) => lp.id === allocation.lpId);
      if (!profile) return allocation;
      const ratio = totalCommitment > 0 ? profile.totalCommitment / totalCommitment : 0;
      const grossAmount = netProceeds * ratio;
      const taxWithholdingAmount = (grossAmount * allocation.taxWithholdingRate) / 100;
      return {
        ...allocation,
        commitment: profile.totalCommitment,
        ownershipPercentage: ratio * 100,
        proRataPercentage: ratio * 100,
        grossAmount,
        netAmount: Math.max(0, grossAmount - taxWithholdingAmount),
        taxWithholdingAmount,
        updatedAt: now,
      };
    });
    updateAllocations(next);
  };

  const updateImpact = (next: DistributionImpact) => {
    patchWizard({ impactData: next });
  };

  const handleRecalculateImpact = (distributionAmount: number) => {
    updateImpact(buildImpact(distributionAmount));
  };

  const updatePreview = (next: {
    template?: StatementTemplate;
    branding?: StatementBranding;
    emailSubject?: string;
    emailBody?: string;
  }) => {
    patchWizard({
      previewData: {
        template: next.template ?? previewData.template ?? DEFAULT_TEMPLATE,
        customBranding: next.branding ?? previewData.customBranding,
        emailSubject: next.emailSubject ?? previewData.emailSubject,
        emailBody: next.emailBody ?? previewData.emailBody,
      },
    });
  };

  const updateApprovalComment = (nextComment: string) => {
    patchWizard({
      submitData: {
        comment: nextComment,
      },
    });
  };

  const buildApprovalSteps = (rule: ApprovalRule | null): ApprovalStep[] => {
    if (!rule) return [];
    const assignedAt = new Date().toISOString();
    return rule.approvers.map((approver, index) => ({
      id: `approval-${rule.id}-${index}`,
      order: approver.order,
      approverId: `${approver.role.toLowerCase().replace(/\s+/g, "-")}-id`,
      approverName: approver.role,
      approverRole: approver.role,
      approverEmail: `${approver.role.toLowerCase().replace(/\s+/g, ".")}@vestledger.com`,
      status: "pending",
      requiredComment: false,
      assignedAt,
      notificationSent: false,
    }));
  };

  const buildDistributionPayload = (status: DistributionStatus, isDraft: boolean) => {
    const now = new Date().toISOString();
    const comments = wizard.submitData?.comment
      ? [
          {
            id: `comment-${Date.now()}`,
            distributionId: eventData.id ?? "draft",
            userId: "user-1",
            userName: "Operations",
            userRole: "Ops",
            comment: wizard.submitData.comment,
            isInternal: false,
            createdAt: now,
            updatedAt: now,
          },
        ]
      : [];

    return {
      ...eventData,
      status,
      isDraft,
      grossProceeds,
      totalFees,
      totalExpenses,
      netProceeds,
      totalTaxWithholding,
      totalDistributed,
      feeLineItems,
      lpAllocations: allocations,
      waterfallScenarioId: wizard.waterfallData?.scenarioId,
      waterfallScenarioName: scenarios.find((scenario) => scenario.id === wizard.waterfallData?.scenarioId)?.name,
      waterfallResults: waterfallResults ?? undefined,
      impact,
      ...advancedData,
      approvalChainId: activeApprovalRule?.id ?? "",
      approvalSteps: buildApprovalSteps(activeApprovalRule),
      comments,
      statementsGenerated: false,
      statements: [],
      updatedAt: now,
      ...(eventData.createdAt ? {} : { createdAt: now }),
    } satisfies Partial<Distribution>;
  };

  const handlePersistDistribution = async (status: DistributionStatus, isDraft: boolean) => {
    try {
      const payload = buildDistributionPayload(status, isDraft);
      const saved = eventData.id
        ? await updateDistribution(eventData.id, payload)
        : await createDistribution(payload);
      dispatch(distributionUpdated(saved));
      dispatch(setSelectedDistribution(saved.id));
      patchWizard({
        eventData: {
          ...eventData,
          id: saved.id,
          status: saved.status,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        },
        isDraft: saved.isDraft,
        draftSavedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to save distribution", error);
    }
  };

  const validateStep = (step: number): string[] => {
    switch (step) {
      case 0: {
        const errors: string[] = [];
        if (!eventData.name) errors.push("Name is required.");
        if (!eventData.eventType) errors.push("Event type is required.");
        if (!eventData.eventDate) errors.push("Event date is required.");
        if (!eventData.grossProceeds || eventData.grossProceeds <= 0) {
          errors.push("Gross proceeds must be greater than zero.");
        }
        return errors;
      }
      case 1: {
        const errors: string[] = [];
        if (
          feeLineItems.some(
            (item) =>
              item.amount < 0 || (item.percentage !== undefined && item.percentage < 0)
          )
        ) {
          errors.push("Fees and expenses cannot be negative.");
        }
        if (
          feeLineItems.some(
            (item) => item.amount === 0 && (!item.percentage || item.percentage === 0)
          )
        ) {
          errors.push("Each fee line item needs an amount or percentage.");
        }
        return errors;
      }
      case 2:
        if (!wizard.waterfallData?.scenarioId) return ["Select a waterfall scenario."];
        return [];
      case 3:
        {
          const errors: string[] = [];
          if (allocations.length === 0) {
            errors.push("At least one allocation is required.");
          }
          const allocationIssues = allocations.filter(
            (allocation) => getAllocationIssues(allocation).length > 0
          );
          if (allocationIssues.length > 0) {
            errors.push(
              `Resolve ${allocationIssues.length} allocation issue${allocationIssues.length === 1 ? "" : "s"} before continuing.`
            );
          }
          const proRataTotal = allocations.reduce(
            (sum, allocation) => sum + allocation.proRataPercentage,
            0
          );
          if (allocations.length > 0 && Math.abs(proRataTotal - 100) > 0.5) {
            errors.push("Pro-rata percentages should total 100%.");
          }
          return errors;
        }
      case 4: {
        const errors: string[] = [];
        if (
          allocations.some(
            (allocation) =>
              allocation.taxWithholdingRate < 0 || allocation.taxWithholdingRate > 100
          )
        ) {
          errors.push("Tax withholding rates must be between 0 and 100.");
        }
        return errors;
      }
      case 5:
        return [];
      case 6: {
        const errors: string[] = [];
        if (!impact) {
          errors.push("Impact preview is required.");
          return errors;
        }
        if (impact.navAfter < 0) errors.push("Projected NAV cannot be negative.");
        if (impact.dpiAfter < 0) errors.push("Projected DPI cannot be negative.");
        if (impact.tvpiAfter < 0) errors.push("Projected TVPI cannot be negative.");
        return errors;
      }
      case 7:
        {
          const errors: string[] = [];
          if (!previewData.template) errors.push("Select a statement template.");
          if (!previewData.emailSubject?.trim()) {
            errors.push("Email subject is required.");
          }
          if (!previewData.emailBody?.trim()) {
            errors.push("Email body is required.");
          }
          return errors;
        }
      case 8:
        if (!activeApprovalRule) return ["No approval rule matched this distribution total."];
        return [];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const errors = validateStep(currentStep);
    const nextErrors = wizard.validationErrors.filter((entry) => entry.step !== currentStep);
    if (errors.length > 0) {
      patchWizard({ validationErrors: [...nextErrors, { step: currentStep, errors }] });
      return;
    }

    if (isLastStep) {
      await handlePersistDistribution("pending-approval", false);
      patchWizard({ validationErrors: nextErrors });
      return;
    }

    const nextCompleted = wizard.completedSteps.includes(currentStep)
      ? wizard.completedSteps
      : [...wizard.completedSteps, currentStep];

    patchWizard({
      currentStep: Math.min(currentStep + 1, STEP_LABELS.length - 1),
      completedSteps: nextCompleted,
      validationErrors: nextErrors,
    });
  };

  const handleBack = () => {
    patchWizard({ currentStep: Math.max(currentStep - 1, 0) });
  };

  const handleSaveDraft = async () => {
    await handlePersistDistribution("draft", true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DistributionStepEvent
            eventData={eventData}
            onChange={updateEventData}
          />
        );
      case 1:
        return (
          <DistributionStepFees
            items={feeLineItems}
            templates={feeTemplates}
            grossProceeds={grossProceeds}
            isLoading={feeTemplatesLoading}
            error={feeTemplatesError}
            onRetry={refetchFeeTemplates}
            onChange={updateFees}
          />
        );
      case 2:
        return (
          <AsyncStateRenderer
            data={scenariosData}
            isLoading={scenariosLoading}
            error={scenariosError}
            onRetry={refetchScenarios}
            emptyTitle="No scenarios available"
            emptyMessage="Create a waterfall scenario to enable allocations."
            isEmpty={(value) => !value?.scenarios?.length}
          >
            {() => (
              <DistributionStepWaterfall
                scenarios={scenarios}
                selectedScenarioId={wizard.waterfallData?.scenarioId}
                grossProceeds={grossProceeds}
                previewResults={wizard.waterfallData?.results ?? null}
                onChange={(scenarioId) =>
                  patchWizard({
                    waterfallData: scenarioId
                      ? {
                          scenarioId,
                          results: undefined,
                          previewExitValue: undefined,
                          previewTotalInvested: undefined,
                          previewManagementFees: undefined,
                        }
                      : undefined,
                  })
                }
                onPreview={(payload) =>
                  patchWizard({
                    waterfallData: {
                      scenarioId: wizard.waterfallData?.scenarioId,
                      results: payload.results,
                      previewExitValue: payload.previewExitValue,
                      previewTotalInvested: payload.previewTotalInvested,
                      previewManagementFees: payload.previewManagementFees,
                    },
                  })
                }
              />
            )}
          </AsyncStateRenderer>
        );
      case 3:
        return (
          <DistributionStepAllocations
            allocations={allocations}
            totalDistributed={totalDistributed}
            onChange={updateAllocations}
            onRecalculate={handleRecalculateAllocations}
            comparisonMap={previousAllocationMap}
            comparisonLabel={comparisonLabel}
          />
        );
      case 4:
        return (
          <DistributionStepTax
            allocations={allocations}
            lpProfiles={lpProfiles}
            onChange={updateAllocations}
          />
        );
      case 5:
        return (
          <DistributionStepAdvanced
            data={advancedData}
            eventType={eventData.eventType}
            onChange={updateAdvancedData}
          />
        );
      case 6:
        return (
          <DistributionStepImpact
            impact={impact}
            totalDistributed={totalDistributed}
            onChange={updateImpact}
            onRecalculate={handleRecalculateImpact}
          />
        );
      case 7:
        return (
          <DistributionStepPreview
            templates={statementTemplates}
            template={previewData.template ?? DEFAULT_TEMPLATE}
            branding={previewData.customBranding}
            distributionName={eventData.name || "New Distribution"}
            lpProfiles={lpProfiles}
            emailSubject={previewData.emailSubject}
            emailBody={previewData.emailBody}
            onChange={(next) =>
              updatePreview({
                template: next.template,
                branding: next.branding,
                emailSubject: next.emailSubject,
                emailBody: next.emailBody,
              })
            }
          />
        );
      case 8:
        return (
          <DistributionStepSubmit
            approvalRules={approvalRules}
            totalDistributed={totalDistributed}
            comment={comment}
            onCommentChange={updateApprovalComment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      containerProps={{ className: "space-y-6" }}
      header={{
        title: "Create Distribution",
        description: "Build a new distribution with fees, allocations, and approvals.",
      }}
    >
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-[var(--app-text-muted)]">
              Step {currentStep + 1} of {STEP_LABELS.length}
            </div>
            <div className="text-lg font-semibold">{STEP_LABELS[currentStep]}</div>
          </div>
          <Badge size="sm" variant="flat">
            {formatCurrencyCompact(totalDistributed)} distributed
          </Badge>
        </div>
        <Progress value={progressValue} maxValue={100} />
        <WorkflowStepper steps={workflowSteps} showPredictions={false} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {validationForStep.length > 0 && (
            <div className="rounded-lg border border-[var(--app-danger)] bg-[var(--app-danger-bg)] px-3 py-2 text-sm text-[var(--app-danger)]">
              {validationForStep.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          )}
          {renderStep()}
        </div>

        <div className="space-y-4">
          <Card padding="lg" className="space-y-3">
            <div className="text-sm font-semibold">Running Totals</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Gross Proceeds</span>
                <span className="font-semibold">{formatCurrencyCompact(grossProceeds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Fees</span>
                <span className="font-semibold">{formatCurrencyCompact(totalFees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Expenses</span>
                <span className="font-semibold">{formatCurrencyCompact(totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">GP Carry</span>
                <span className="font-semibold">{formatCurrencyCompact(waterfallCarry)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Net Proceeds</span>
                <span className="font-semibold">{formatCurrencyCompact(netProceeds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Tax Withholding</span>
                <span className="font-semibold">{formatCurrencyCompact(totalTaxWithholding)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--app-text-muted)]">Total Distributed</span>
                <span className="font-semibold">{formatCurrencyCompact(totalDistributed)}</span>
              </div>
            </div>
          </Card>

          {warnings.length > 0 && (
            <Card padding="lg" className="space-y-2">
              <div className="text-sm font-semibold text-[var(--app-danger)]">
                Warnings
              </div>
              <div className="space-y-1 text-xs text-[var(--app-text-muted)]">
                {warnings.map((warning) => (
                  <div key={warning}>{warning}</div>
                ))}
              </div>
            </Card>
          )}

          <Card padding="lg" className="space-y-2">
            <div className="text-sm font-semibold">Draft Status</div>
            <div className="text-xs text-[var(--app-text-muted)]">
              {wizard.draftSavedAt
                ? `Last saved ${formatDateTime(wizard.draftSavedAt)}`
                : "No draft saved yet."}
            </div>
            <div className="text-xs text-[var(--app-text-subtle)]">
              Drafts are stored locally until backend wiring.
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="light"
          isDisabled={currentStep === 0}
          onPress={handleBack}
        >
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="bordered" onPress={handleSaveDraft}>
            Save Draft
          </Button>
          <Button color="primary" onPress={handleNext}>
            {isLastStep ? "Submit for Approval" : "Save & Continue"}
          </Button>
        </div>
      </div>
    </PageScaffold>
  );
}
