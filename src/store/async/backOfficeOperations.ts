import type { CapitalCall } from '@/data/mocks/back-office/fund-admin';
import {
  complianceFailed,
  complianceLoaded,
  fundAdminFailed,
  fundAdminLoaded,
  capitalCallCreateFailed,
  capitalCallCreateSucceeded,
  capitalCallUpdateFailed,
  capitalCallUpdateSucceeded,
  lpResponseUpdateFailed,
  lpResponseUpdateSucceeded,
  fundAdminExportSucceeded,
  taxCenterFailed,
  taxCenterLoaded,
  valuation409aFailed,
  valuation409aLoaded,
  type ComplianceData,
  type FundAdminData,
  type TaxCenterData,
  type Valuation409aData,
  type CapitalCallCreateInput,
} from '@/store/slices/backOfficeSlice';
import {
  getComplianceItems,
  getRegulatoryFilings,
  getAuditSchedule,
} from '@/services/backOffice/complianceService';
import {
  createCapitalCall,
  exportFundAdminActivity,
  getCapitalCalls,
  getDistributions,
  getLPResponses,
  recordLPResponsePayment,
  sendCapitalCallReminder,
  sendCapitalCallToLPs,
  sendLPReminder,
  updateCapitalCall,
} from '@/services/backOffice/fundAdminService';
import {
  getTaxFilingDeadline,
  getTaxDocuments,
  getTaxSummaries,
  getPortfolioTax,
} from '@/services/backOffice/taxCenterService';
import {
  getValuations409a,
  getStrikePrices,
  getValuationHistory,
} from '@/services/backOffice/valuation409aService';
import { createLatestOperation } from '@/store/async/createLatestOperation';

export const loadComplianceOperation = createLatestOperation<void, ComplianceData>({
  typePrefix: 'backOffice/compliance/load',
  requestType: 'backOffice/complianceRequested',
  run: async () => {
    const [complianceItems, regulatoryFilings, auditSchedule] = await Promise.all([
      getComplianceItems(),
      getRegulatoryFilings(),
      getAuditSchedule(),
    ]);

    return { complianceItems, regulatoryFilings, auditSchedule };
  },
  onSuccess: (result) => complianceLoaded(result),
  onFailure: (error) => complianceFailed(error),
});

export const loadFundAdminOperation = createLatestOperation<
  { fundId?: string } | undefined,
  FundAdminData
>({
  typePrefix: 'backOffice/fundAdmin/load',
  requestType: 'backOffice/fundAdminRequested',
  run: async ({ arg }) => {
    const fundId = arg?.fundId;
    const [capitalCalls, distributions, lpResponses] = await Promise.all([
      getCapitalCalls(fundId),
      getDistributions(fundId),
      getLPResponses(fundId),
    ]);

    return { capitalCalls, distributions, lpResponses };
  },
  onSuccess: (result) => fundAdminLoaded(result),
  onFailure: (error) => fundAdminFailed(error),
});

export const createCapitalCallOperation = createLatestOperation<CapitalCallCreateInput, CapitalCall>({
  typePrefix: 'backOffice/fundAdmin/capitalCalls/create',
  requestType: 'backOffice/capitalCallCreateRequested',
  run: async ({ arg }) => createCapitalCall(arg),
  onSuccess: (result) => capitalCallCreateSucceeded(result),
  onFailure: (error) => capitalCallCreateFailed(error),
});

export const updateCapitalCallOperation = createLatestOperation<
  { capitalCallId: string; patch: Partial<CapitalCall> },
  CapitalCall
>({
  typePrefix: 'backOffice/fundAdmin/capitalCalls/update',
  requestType: 'backOffice/capitalCallUpdateRequested',
  run: async ({ arg }) => updateCapitalCall(arg.capitalCallId, arg.patch),
  onSuccess: (result) => capitalCallUpdateSucceeded(result),
  onFailure: (error) => capitalCallUpdateFailed(error),
});

export const sendCapitalCallOperation = createLatestOperation<{ capitalCallId: string }, CapitalCall>({
  typePrefix: 'backOffice/fundAdmin/capitalCalls/send',
  requestType: 'backOffice/capitalCallSendRequested',
  run: async ({ arg }) => sendCapitalCallToLPs(arg.capitalCallId),
  onSuccess: (result) => capitalCallUpdateSucceeded(result),
  onFailure: (error) => capitalCallUpdateFailed(error),
});

export const sendCapitalCallReminderOperation = createLatestOperation<
  { capitalCallId: string },
  CapitalCall
>({
  typePrefix: 'backOffice/fundAdmin/capitalCalls/remind',
  requestType: 'backOffice/capitalCallReminderRequested',
  run: async ({ arg }) => sendCapitalCallReminder(arg.capitalCallId),
  onSuccess: (result) => capitalCallUpdateSucceeded(result),
  onFailure: (error) => capitalCallUpdateFailed(error),
});

export const sendLPReminderOperation = createLatestOperation<{ lpResponseId: string }, Awaited<ReturnType<typeof sendLPReminder>>>({
  typePrefix: 'backOffice/fundAdmin/lpResponses/remind',
  requestType: 'backOffice/lpReminderRequested',
  run: async ({ arg }) => sendLPReminder(arg.lpResponseId),
  onSuccess: (result) => lpResponseUpdateSucceeded(result),
  onFailure: (error) => lpResponseUpdateFailed(error),
});

export const updateLPResponseOperation = createLatestOperation<
  { lpResponseId: string; amountPaid: number },
  Awaited<ReturnType<typeof recordLPResponsePayment>>
>({
  typePrefix: 'backOffice/fundAdmin/lpResponses/update',
  requestType: 'backOffice/lpResponseUpdateRequested',
  run: async ({ arg }) => recordLPResponsePayment(arg.lpResponseId, arg.amountPaid),
  onSuccess: (result) => lpResponseUpdateSucceeded(result),
  onFailure: (error) => lpResponseUpdateFailed(error),
});

export const exportFundAdminActivityOperation = createLatestOperation<void, { exportedAt: string }>({
  typePrefix: 'backOffice/fundAdmin/export',
  requestType: 'backOffice/fundAdminExportRequested',
  run: async () => exportFundAdminActivity(),
  onSuccess: (result) => fundAdminExportSucceeded(result),
  onFailure: (error) => fundAdminFailed(error),
});

export const loadTaxCenterOperation = createLatestOperation<void, TaxCenterData>({
  typePrefix: 'backOffice/taxCenter/load',
  requestType: 'backOffice/taxCenterRequested',
  run: async () => {
    const [filingDeadline, taxDocuments, taxSummaries, portfolioTax] = await Promise.all([
      getTaxFilingDeadline(),
      getTaxDocuments(),
      getTaxSummaries(),
      getPortfolioTax(),
    ]);

    return { filingDeadline, taxDocuments, taxSummaries, portfolioTax };
  },
  onSuccess: (result) => taxCenterLoaded(result),
  onFailure: (error) => taxCenterFailed(error),
});

export const loadValuation409aOperation = createLatestOperation<void, Valuation409aData>({
  typePrefix: 'backOffice/valuation409a/load',
  requestType: 'backOffice/valuation409aRequested',
  run: async () => {
    const [valuations, strikePrices, history] = await Promise.all([
      getValuations409a(),
      getStrikePrices(),
      getValuationHistory(),
    ]);

    return { valuations, strikePrices, history };
  },
  onSuccess: (result) => valuation409aLoaded(result),
  onFailure: (error) => valuation409aFailed(error),
});
