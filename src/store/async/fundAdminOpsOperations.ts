import type { FundExpense, LPTransfer, ROFRExercise } from '@/types/fundAdminOps';
import {
  navLoaded,
  navFailed,
  navCalculationUpserted,
  navExportSucceeded,
} from '@/store/slices/navOpsSlice';
import {
  carryLoaded,
  carryFailed,
  carryAccrualUpserted,
  carryExportSucceeded,
} from '@/store/slices/carryOpsSlice';
import {
  expensesLoaded,
  expensesFailed,
  expenseUpserted,
  expenseExportSucceeded,
} from '@/store/slices/expenseOpsSlice';
import {
  secondaryTransfersLoaded,
  secondaryTransfersFailed,
  secondaryTransferUpserted,
  secondaryTransferROFRAdded,
} from '@/store/slices/secondaryTransferOpsSlice';
import {
  calculateNAV,
  exportNAV,
  getNAVCalculations,
  markNAVReviewed,
  publishNAV,
} from '@/services/backOffice/navService';
import {
  approveCarryAccrual,
  calculateCarryAccrual,
  distributeCarryAccrual,
  exportCarryAccrual,
  getCarryAccruals,
  getCarriedInterestTerms,
} from '@/services/backOffice/carryService';
import {
  addFundExpense,
  approveFundExpense,
  exportFundExpenses,
  getFundExpenses,
  markFundExpensePaid,
  rejectFundExpense,
} from '@/services/backOffice/expenseService';
import {
  approveSecondaryTransfer,
  completeSecondaryTransfer,
  exerciseTransferROFR,
  getROFRExercises,
  getSecondaryTransfers,
  initiateSecondaryTransfer,
  rejectSecondaryTransfer,
  reviewSecondaryTransfer,
  uploadTransferDocument,
} from '@/services/backOffice/secondaryTransferService';
import { createLatestOperation } from '@/store/async/createLatestOperation';

export const loadNAVOperation = createLatestOperation<
  { fundId?: string } | undefined,
  { calculations: Awaited<ReturnType<typeof getNAVCalculations>> }
>({
  typePrefix: 'fundAdminOps/nav/load',
  requestType: 'navOps/navRequested',
  run: async ({ arg }) => {
    const calculations = await getNAVCalculations(arg?.fundId);
    return { calculations };
  },
  onSuccess: (result) => navLoaded(result),
  onFailure: (error) => navFailed(error),
});

export const calculateNAVOperation = createLatestOperation<
  { fundId: string; fundName: string },
  Awaited<ReturnType<typeof calculateNAV>>
>({
  typePrefix: 'fundAdminOps/nav/calculate',
  requestType: 'navOps/navCalculateRequested',
  run: async ({ arg }) => calculateNAV(arg.fundId, arg.fundName),
  onSuccess: (result) => navCalculationUpserted(result),
  onFailure: (error) => navFailed(error),
});

export const reviewNAVOperation = createLatestOperation<
  { calculationId: string; reviewedBy: string },
  Awaited<ReturnType<typeof markNAVReviewed>>
>({
  typePrefix: 'fundAdminOps/nav/review',
  requestType: 'navOps/navReviewRequested',
  run: async ({ arg }) => markNAVReviewed(arg.calculationId, arg.reviewedBy),
  onSuccess: (result) => navCalculationUpserted(result),
  onFailure: (error) => navFailed(error),
});

export const publishNAVOperation = createLatestOperation<
  { calculationId: string; publishedBy: string },
  Awaited<ReturnType<typeof publishNAV>>
>({
  typePrefix: 'fundAdminOps/nav/publish',
  requestType: 'navOps/navPublishRequested',
  run: async ({ arg }) => publishNAV(arg.calculationId, arg.publishedBy),
  onSuccess: (result) => navCalculationUpserted(result),
  onFailure: (error) => navFailed(error),
});

export const exportNAVOperation = createLatestOperation<
  { calculationId: string; format: 'pdf' | 'excel' },
  Awaited<ReturnType<typeof exportNAV>>
>({
  typePrefix: 'fundAdminOps/nav/export',
  requestType: 'navOps/navExportRequested',
  run: async ({ arg }) => exportNAV(arg.calculationId, arg.format),
  onSuccess: (result) => navExportSucceeded({ exportedAt: result.exportedAt }),
  onFailure: (error) => navFailed(error),
});

export const loadCarryOperation = createLatestOperation<
  { fundId?: string } | undefined,
  {
    terms: Awaited<ReturnType<typeof getCarriedInterestTerms>>;
    accruals: Awaited<ReturnType<typeof getCarryAccruals>>;
  }
>({
  typePrefix: 'fundAdminOps/carry/load',
  requestType: 'carryOps/carryRequested',
  run: async ({ arg }) => {
    const [terms, accruals] = await Promise.all([
      getCarriedInterestTerms(arg?.fundId),
      getCarryAccruals(arg?.fundId),
    ]);

    return { terms, accruals };
  },
  onSuccess: (result) => carryLoaded(result),
  onFailure: (error) => carryFailed(error),
});

export const calculateCarryOperation = createLatestOperation<
  { fundId: string; fundName: string },
  Awaited<ReturnType<typeof calculateCarryAccrual>>
>({
  typePrefix: 'fundAdminOps/carry/calculate',
  requestType: 'carryOps/carryCalculateRequested',
  run: async ({ arg }) => calculateCarryAccrual(arg.fundId, arg.fundName),
  onSuccess: (result) => carryAccrualUpserted(result),
  onFailure: (error) => carryFailed(error),
});

export const approveCarryOperation = createLatestOperation<
  { accrualId: string },
  Awaited<ReturnType<typeof approveCarryAccrual>>
>({
  typePrefix: 'fundAdminOps/carry/approve',
  requestType: 'carryOps/carryApproveRequested',
  run: async ({ arg }) => approveCarryAccrual(arg.accrualId),
  onSuccess: (result) => carryAccrualUpserted(result),
  onFailure: (error) => carryFailed(error),
});

export const distributeCarryOperation = createLatestOperation<
  { accrualId: string },
  Awaited<ReturnType<typeof distributeCarryAccrual>>
>({
  typePrefix: 'fundAdminOps/carry/distribute',
  requestType: 'carryOps/carryDistributeRequested',
  run: async ({ arg }) => distributeCarryAccrual(arg.accrualId),
  onSuccess: (result) => carryAccrualUpserted(result),
  onFailure: (error) => carryFailed(error),
});

export const exportCarryOperation = createLatestOperation<
  { accrualId: string; format: 'pdf' | 'excel' },
  Awaited<ReturnType<typeof exportCarryAccrual>>
>({
  typePrefix: 'fundAdminOps/carry/export',
  requestType: 'carryOps/carryExportRequested',
  run: async ({ arg }) => exportCarryAccrual(arg.accrualId, arg.format),
  onSuccess: (result) => carryExportSucceeded({ exportedAt: result.exportedAt }),
  onFailure: (error) => carryFailed(error),
});

export const loadExpensesOperation = createLatestOperation<
  { fundId?: string } | undefined,
  { expenses: Awaited<ReturnType<typeof getFundExpenses>> }
>({
  typePrefix: 'fundAdminOps/expenses/load',
  requestType: 'expenseOps/expensesRequested',
  run: async ({ arg }) => {
    const expenses = await getFundExpenses(arg?.fundId);
    return { expenses };
  },
  onSuccess: (result) => expensesLoaded(result),
  onFailure: (error) => expensesFailed(error),
});

export const addExpenseOperation = createLatestOperation<
  { expense: Omit<FundExpense, 'id'> },
  Awaited<ReturnType<typeof addFundExpense>>
>({
  typePrefix: 'fundAdminOps/expenses/add',
  requestType: 'expenseOps/expenseAddRequested',
  run: async ({ arg }) => addFundExpense(arg.expense),
  onSuccess: (result) => expenseUpserted(result),
  onFailure: (error) => expensesFailed(error),
});

export const approveExpenseOperation = createLatestOperation<
  { expenseId: string; approver: string },
  Awaited<ReturnType<typeof approveFundExpense>>
>({
  typePrefix: 'fundAdminOps/expenses/approve',
  requestType: 'expenseOps/expenseApproveRequested',
  run: async ({ arg }) => approveFundExpense(arg.expenseId, arg.approver),
  onSuccess: (result) => expenseUpserted(result),
  onFailure: (error) => expensesFailed(error),
});

export const rejectExpenseOperation = createLatestOperation<
  { expenseId: string },
  Awaited<ReturnType<typeof rejectFundExpense>>
>({
  typePrefix: 'fundAdminOps/expenses/reject',
  requestType: 'expenseOps/expenseRejectRequested',
  run: async ({ arg }) => rejectFundExpense(arg.expenseId),
  onSuccess: (result) => expenseUpserted(result),
  onFailure: (error) => expensesFailed(error),
});

export const markExpensePaidOperation = createLatestOperation<
  { expenseId: string },
  Awaited<ReturnType<typeof markFundExpensePaid>>
>({
  typePrefix: 'fundAdminOps/expenses/pay',
  requestType: 'expenseOps/expenseMarkPaidRequested',
  run: async ({ arg }) => markFundExpensePaid(arg.expenseId),
  onSuccess: (result) => expenseUpserted(result),
  onFailure: (error) => expensesFailed(error),
});

export const exportExpenseOperation = createLatestOperation<
  { format: 'csv' | 'pdf'; fundId?: string },
  Awaited<ReturnType<typeof exportFundExpenses>>
>({
  typePrefix: 'fundAdminOps/expenses/export',
  requestType: 'expenseOps/expenseExportRequested',
  run: async ({ arg }) => exportFundExpenses(arg.format, arg.fundId),
  onSuccess: (result) => expenseExportSucceeded({ exportedAt: result.exportedAt }),
  onFailure: (error) => expensesFailed(error),
});

export const loadSecondaryTransfersOperation = createLatestOperation<
  { fundId?: string } | undefined,
  {
    transfers: Awaited<ReturnType<typeof getSecondaryTransfers>>;
    rofrExercises: Awaited<ReturnType<typeof getROFRExercises>>;
  }
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/load',
  requestType: 'secondaryTransferOps/secondaryTransfersRequested',
  run: async ({ arg }) => {
    const [transfers, rofrExercises] = await Promise.all([
      getSecondaryTransfers(arg?.fundId),
      getROFRExercises(arg?.fundId),
    ]);

    return { transfers, rofrExercises };
  },
  onSuccess: (result) => secondaryTransfersLoaded(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const initiateSecondaryTransferOperation = createLatestOperation<
  {
    transfer: Omit<
      LPTransfer,
      'id' | 'transferNumber' | 'requestedDate' | 'documents' | 'status'
    >;
  },
  Awaited<ReturnType<typeof initiateSecondaryTransfer>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/initiate',
  requestType: 'secondaryTransferOps/secondaryTransferInitiateRequested',
  run: async ({ arg }) => initiateSecondaryTransfer(arg.transfer),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const reviewSecondaryTransferOperation = createLatestOperation<
  { transferId: string },
  Awaited<ReturnType<typeof reviewSecondaryTransfer>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/review',
  requestType: 'secondaryTransferOps/secondaryTransferReviewRequested',
  run: async ({ arg }) => reviewSecondaryTransfer(arg.transferId),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const approveSecondaryTransferOperation = createLatestOperation<
  { transferId: string },
  Awaited<ReturnType<typeof approveSecondaryTransfer>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/approve',
  requestType: 'secondaryTransferOps/secondaryTransferApproveRequested',
  run: async ({ arg }) => approveSecondaryTransfer(arg.transferId),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const rejectSecondaryTransferOperation = createLatestOperation<
  { transferId: string; reason: string },
  Awaited<ReturnType<typeof rejectSecondaryTransfer>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/reject',
  requestType: 'secondaryTransferOps/secondaryTransferRejectRequested',
  run: async ({ arg }) => rejectSecondaryTransfer(arg.transferId, arg.reason),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const completeSecondaryTransferOperation = createLatestOperation<
  { transferId: string },
  Awaited<ReturnType<typeof completeSecondaryTransfer>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/complete',
  requestType: 'secondaryTransferOps/secondaryTransferCompleteRequested',
  run: async ({ arg }) => completeSecondaryTransfer(arg.transferId),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const uploadSecondaryTransferDocumentOperation = createLatestOperation<
  { transferId: string; docName: string },
  Awaited<ReturnType<typeof uploadTransferDocument>>
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/uploadDocument',
  requestType: 'secondaryTransferOps/secondaryTransferUploadDocumentRequested',
  run: async ({ arg }) => uploadTransferDocument(arg.transferId, arg.docName),
  onSuccess: (result) => secondaryTransferUpserted(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});

export const exerciseSecondaryTransferROFROperation = createLatestOperation<
  { transferId: string; exercisedByName?: string },
  ROFRExercise
>({
  typePrefix: 'fundAdminOps/secondaryTransfers/exerciseRofr',
  requestType: 'secondaryTransferOps/secondaryTransferExerciseROFRRequested',
  run: async ({ arg }) => exerciseTransferROFR(arg.transferId, arg.exercisedByName),
  onSuccess: (result) => secondaryTransferROFRAdded(result),
  onFailure: (error) => secondaryTransfersFailed(error),
});
