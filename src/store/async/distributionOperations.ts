import type {
  Distribution,
  DistributionCalendarEvent,
  DistributionFilters,
  DistributionSummary,
  FeeTemplate,
  LPProfile,
  ApprovalRule,
  StatementTemplateConfig,
} from "@/types/distribution";
import {
  approvalRulesFailed,
  approvalRulesLoaded,
  approveDistributionFailed,
  approveDistributionSucceeded,
  calendarEventsFailed,
  calendarEventsLoaded,
  createDistributionFailed,
  createDistributionSucceeded,
  deleteDistributionFailed,
  deleteDistributionSucceeded,
  distributionFailed,
  distributionUpdated,
  distributionsFailed,
  distributionsLoaded,
  feeTemplatesFailed,
  feeTemplatesLoaded,
  lpProfilesFailed,
  lpProfilesLoaded,
  rejectDistributionFailed,
  rejectDistributionSucceeded,
  returnForRevisionFailed,
  returnForRevisionSucceeded,
  statementTemplatesFailed,
  statementTemplatesLoaded,
  submitForApprovalFailed,
  submitForApprovalSucceeded,
  summaryFailed,
  summaryLoaded,
  updateDistributionFailed,
  updateDistributionSucceeded,
  type DistributionSaveData,
} from "@/store/slices/distributionSlice";
import {
  approveDistribution,
  createDistribution,
  deleteDistribution,
  fetchApprovalRules,
  fetchDistribution,
  fetchDistributionCalendarEvents,
  fetchDistributionSummary,
  fetchDistributions,
  fetchFeeTemplates,
  fetchLPProfiles,
  fetchStatementTemplates,
  rejectDistribution,
  returnForRevision,
  submitForApproval,
  updateDistribution,
} from "@/services/backOffice/distributionService";
import { createLatestOperation } from "@/store/async/createLatestOperation";

export const loadDistributionsOperation = createLatestOperation<
  DistributionFilters | undefined,
  { distributions: Distribution[] }
>({
  typePrefix: "distribution/loadMany",
  requestType: "distribution/distributionsRequested",
  run: async ({ arg }) => {
    const distributions = await fetchDistributions(arg);
    return { distributions };
  },
  onSuccess: (result) => distributionsLoaded(result),
  onFailure: (error) => distributionsFailed(error),
});

export const loadDistributionOperation = createLatestOperation<
  string,
  Distribution
>({
  typePrefix: "distribution/loadOne",
  requestType: "distribution/distributionRequested",
  run: async ({ arg }) => fetchDistribution(arg),
  onSuccess: (result) => distributionUpdated(result),
  onFailure: (error, id) => distributionFailed({ id, error }),
});

export const createDistributionOperation = createLatestOperation<
  { data: Partial<Distribution>; requestId: string },
  DistributionSaveData
>({
  typePrefix: "distribution/create",
  requestType: "distribution/createDistributionRequested",
  run: async ({ arg }) => {
    const distribution = await createDistribution(arg.data);
    return { distribution, requestId: arg.requestId };
  },
  onSuccess: (result) => createDistributionSucceeded(result),
  onFailure: (error, arg) =>
    createDistributionFailed({ error, requestId: arg.requestId }),
});

export const updateDistributionOperation = createLatestOperation<
  { id: string; data: Partial<Distribution>; requestId: string },
  DistributionSaveData
>({
  typePrefix: "distribution/update",
  requestType: "distribution/updateDistributionRequested",
  run: async ({ arg }) => {
    const distribution = await updateDistribution(arg.id, arg.data);
    return { distribution, requestId: arg.requestId };
  },
  onSuccess: (result) => updateDistributionSucceeded(result),
  onFailure: (error, arg) =>
    updateDistributionFailed({ error, requestId: arg.requestId }),
});

export const deleteDistributionOperation = createLatestOperation<
  string,
  string
>({
  typePrefix: "distribution/delete",
  requestType: "distribution/deleteDistributionRequested",
  run: async ({ arg }) => {
    await deleteDistribution(arg);
    return arg;
  },
  onSuccess: (result) => deleteDistributionSucceeded(result),
  onFailure: (error) => deleteDistributionFailed(error),
});

export const submitForApprovalOperation = createLatestOperation<
  { distributionId: string; comment?: string },
  Distribution
>({
  typePrefix: "distribution/submitForApproval",
  requestType: "distribution/submitForApprovalRequested",
  run: async ({ arg }) => submitForApproval(arg),
  onSuccess: (result) => submitForApprovalSucceeded(result),
  onFailure: (error) => submitForApprovalFailed(error),
});

export const approveDistributionOperation = createLatestOperation<
  { distributionId: string; approverId: string; comment?: string },
  Distribution
>({
  typePrefix: "distribution/approve",
  requestType: "distribution/approveDistributionRequested",
  run: async ({ arg }) => approveDistribution(arg),
  onSuccess: (result) => approveDistributionSucceeded(result),
  onFailure: (error) => approveDistributionFailed(error),
});

export const rejectDistributionOperation = createLatestOperation<
  { distributionId: string; approverId: string; reason: string },
  Distribution
>({
  typePrefix: "distribution/reject",
  requestType: "distribution/rejectDistributionRequested",
  run: async ({ arg }) => rejectDistribution(arg),
  onSuccess: (result) => rejectDistributionSucceeded(result),
  onFailure: (error) => rejectDistributionFailed(error),
});

export const returnDistributionForRevisionOperation = createLatestOperation<
  { distributionId: string; approverId: string; reason: string },
  Distribution
>({
  typePrefix: "distribution/returnForRevision",
  requestType: "distribution/returnForRevisionRequested",
  run: async ({ arg }) => returnForRevision(arg),
  onSuccess: (result) => returnForRevisionSucceeded(result),
  onFailure: (error) => returnForRevisionFailed(error),
});

export const loadDistributionSummaryOperation = createLatestOperation<
  void,
  { summary: DistributionSummary }
>({
  typePrefix: "distribution/summary/load",
  requestType: "distribution/summaryRequested",
  run: async () => {
    const summary = await fetchDistributionSummary();
    return { summary };
  },
  onSuccess: (result) => summaryLoaded(result),
  onFailure: (error) => summaryFailed(error),
});

export const loadDistributionCalendarEventsOperation = createLatestOperation<
  { startDate?: string; endDate?: string } | undefined,
  { events: DistributionCalendarEvent[] }
>({
  typePrefix: "distribution/calendarEvents/load",
  requestType: "distribution/calendarEventsRequested",
  run: async ({ arg }) => {
    const events = await fetchDistributionCalendarEvents(
      arg?.startDate,
      arg?.endDate,
    );
    return { events };
  },
  onSuccess: (result) => calendarEventsLoaded(result),
  onFailure: (error) => calendarEventsFailed(error),
});

export const loadFeeTemplatesOperation = createLatestOperation<
  string | undefined,
  { templates: FeeTemplate[] }
>({
  typePrefix: "distribution/feeTemplates/load",
  requestType: "distribution/feeTemplatesRequested",
  run: async ({ arg }) => {
    const templates = await fetchFeeTemplates(arg);
    return { templates };
  },
  onSuccess: (result) => feeTemplatesLoaded(result),
  onFailure: (error) => feeTemplatesFailed(error),
});

export const loadStatementTemplatesOperation = createLatestOperation<
  void,
  { templates: StatementTemplateConfig[] }
>({
  typePrefix: "distribution/statementTemplates/load",
  requestType: "distribution/statementTemplatesRequested",
  run: async () => {
    const templates = await fetchStatementTemplates();
    return { templates };
  },
  onSuccess: (result) => statementTemplatesLoaded(result),
  onFailure: (error) => statementTemplatesFailed(error),
});

export const loadLPProfilesOperation = createLatestOperation<
  void,
  { profiles: LPProfile[] }
>({
  typePrefix: "distribution/lpProfiles/load",
  requestType: "distribution/lpProfilesRequested",
  run: async () => {
    const profiles = await fetchLPProfiles();
    return { profiles };
  },
  onSuccess: (result) => lpProfilesLoaded(result),
  onFailure: (error) => lpProfilesFailed(error),
});

export const loadApprovalRulesOperation = createLatestOperation<
  void,
  { rules: ApprovalRule[] }
>({
  typePrefix: "distribution/approvalRules/load",
  requestType: "distribution/approvalRulesRequested",
  run: async () => {
    const rules = await fetchApprovalRules();
    return { rules };
  },
  onSuccess: (result) => approvalRulesLoaded(result),
  onFailure: (error) => approvalRulesFailed(error),
});
