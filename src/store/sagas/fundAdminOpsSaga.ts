import { all, call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  navRequested,
  navLoaded,
  navFailed,
  navCalculateRequested,
  navReviewRequested,
  navPublishRequested,
  navExportRequested,
  navCalculationUpserted,
  navExportSucceeded,
} from '@/store/slices/navOpsSlice';
import {
  carryRequested,
  carryLoaded,
  carryFailed,
  carryCalculateRequested,
  carryApproveRequested,
  carryDistributeRequested,
  carryExportRequested,
  carryAccrualUpserted,
  carryExportSucceeded,
} from '@/store/slices/carryOpsSlice';
import {
  expensesRequested,
  expensesLoaded,
  expensesFailed,
  expenseAddRequested,
  expenseApproveRequested,
  expenseRejectRequested,
  expenseMarkPaidRequested,
  expenseExportRequested,
  expenseUpserted,
  expenseExportSucceeded,
} from '@/store/slices/expenseOpsSlice';
import {
  secondaryTransfersRequested,
  secondaryTransfersLoaded,
  secondaryTransfersFailed,
  secondaryTransferInitiateRequested,
  secondaryTransferReviewRequested,
  secondaryTransferApproveRequested,
  secondaryTransferRejectRequested,
  secondaryTransferCompleteRequested,
  secondaryTransferUploadDocumentRequested,
  secondaryTransferExerciseROFRRequested,
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
import { normalizeError } from '@/store/utils/normalizeError';

function* loadNAVWorker(
  action: PayloadAction<{ fundId?: string } | undefined>
): SagaIterator {
  try {
    const calculations = yield call(getNAVCalculations, action.payload?.fundId);
    yield put(navLoaded({ calculations }));
  } catch (error: unknown) {
    yield put(navFailed(normalizeError(error)));
  }
}

function* calculateNAVWorker(
  action: PayloadAction<{ fundId: string; fundName: string }>
): SagaIterator {
  try {
    const calculation = yield call(calculateNAV, action.payload.fundId, action.payload.fundName);
    yield put(navCalculationUpserted(calculation));
  } catch (error: unknown) {
    yield put(navFailed(normalizeError(error)));
  }
}

function* reviewNAVWorker(
  action: PayloadAction<{ calculationId: string; reviewedBy: string }>
): SagaIterator {
  try {
    const calculation = yield call(markNAVReviewed, action.payload.calculationId, action.payload.reviewedBy);
    yield put(navCalculationUpserted(calculation));
  } catch (error: unknown) {
    yield put(navFailed(normalizeError(error)));
  }
}

function* publishNAVWorker(
  action: PayloadAction<{ calculationId: string; publishedBy: string }>
): SagaIterator {
  try {
    const calculation = yield call(publishNAV, action.payload.calculationId, action.payload.publishedBy);
    yield put(navCalculationUpserted(calculation));
  } catch (error: unknown) {
    yield put(navFailed(normalizeError(error)));
  }
}

function* exportNAVWorker(
  action: PayloadAction<{ calculationId: string; format: 'pdf' | 'excel' }>
): SagaIterator {
  try {
    const result = yield call(exportNAV, action.payload.calculationId, action.payload.format);
    yield put(navExportSucceeded({ exportedAt: result.exportedAt }));
  } catch (error: unknown) {
    yield put(navFailed(normalizeError(error)));
  }
}

function* loadCarryWorker(
  action: PayloadAction<{ fundId?: string } | undefined>
): SagaIterator {
  try {
    const [terms, accruals] = yield all([
      call(getCarriedInterestTerms, action.payload?.fundId),
      call(getCarryAccruals, action.payload?.fundId),
    ]);
    yield put(carryLoaded({ terms, accruals }));
  } catch (error: unknown) {
    yield put(carryFailed(normalizeError(error)));
  }
}

function* calculateCarryWorker(
  action: PayloadAction<{ fundId: string; fundName: string }>
): SagaIterator {
  try {
    const accrual = yield call(calculateCarryAccrual, action.payload.fundId, action.payload.fundName);
    yield put(carryAccrualUpserted(accrual));
  } catch (error: unknown) {
    yield put(carryFailed(normalizeError(error)));
  }
}

function* approveCarryWorker(
  action: PayloadAction<{ accrualId: string }>
): SagaIterator {
  try {
    const accrual = yield call(approveCarryAccrual, action.payload.accrualId);
    yield put(carryAccrualUpserted(accrual));
  } catch (error: unknown) {
    yield put(carryFailed(normalizeError(error)));
  }
}

function* distributeCarryWorker(
  action: PayloadAction<{ accrualId: string }>
): SagaIterator {
  try {
    const accrual = yield call(distributeCarryAccrual, action.payload.accrualId);
    yield put(carryAccrualUpserted(accrual));
  } catch (error: unknown) {
    yield put(carryFailed(normalizeError(error)));
  }
}

function* exportCarryWorker(
  action: PayloadAction<{ accrualId: string; format: 'pdf' | 'excel' }>
): SagaIterator {
  try {
    const result = yield call(exportCarryAccrual, action.payload.accrualId, action.payload.format);
    yield put(carryExportSucceeded({ exportedAt: result.exportedAt }));
  } catch (error: unknown) {
    yield put(carryFailed(normalizeError(error)));
  }
}

function* loadExpensesWorker(
  action: PayloadAction<{ fundId?: string } | undefined>
): SagaIterator {
  try {
    const expenses = yield call(getFundExpenses, action.payload?.fundId);
    yield put(expensesLoaded({ expenses }));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* addExpenseWorker(
  action: PayloadAction<{ expense: Omit<import('@/types/fundAdminOps').FundExpense, 'id'> }>
): SagaIterator {
  try {
    const expense = yield call(addFundExpense, action.payload.expense);
    yield put(expenseUpserted(expense));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* approveExpenseWorker(
  action: PayloadAction<{ expenseId: string; approver: string }>
): SagaIterator {
  try {
    const expense = yield call(approveFundExpense, action.payload.expenseId, action.payload.approver);
    yield put(expenseUpserted(expense));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* rejectExpenseWorker(
  action: PayloadAction<{ expenseId: string }>
): SagaIterator {
  try {
    const expense = yield call(rejectFundExpense, action.payload.expenseId);
    yield put(expenseUpserted(expense));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* markExpensePaidWorker(
  action: PayloadAction<{ expenseId: string }>
): SagaIterator {
  try {
    const expense = yield call(markFundExpensePaid, action.payload.expenseId);
    yield put(expenseUpserted(expense));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* exportExpenseWorker(
  action: PayloadAction<{ format: 'csv' | 'pdf'; fundId?: string }>
): SagaIterator {
  try {
    const result = yield call(exportFundExpenses, action.payload.format, action.payload.fundId);
    yield put(expenseExportSucceeded({ exportedAt: result.exportedAt }));
  } catch (error: unknown) {
    yield put(expensesFailed(normalizeError(error)));
  }
}

function* loadSecondaryTransferWorker(
  action: PayloadAction<{ fundId?: string } | undefined>
): SagaIterator {
  try {
    const [transfers, rofrExercises] = yield all([
      call(getSecondaryTransfers, action.payload?.fundId),
      call(getROFRExercises, action.payload?.fundId),
    ]);
    yield put(secondaryTransfersLoaded({ transfers, rofrExercises }));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* initiateSecondaryTransferWorker(
  action: PayloadAction<{
    transfer: Omit<
      import('@/types/fundAdminOps').LPTransfer,
      'id' | 'transferNumber' | 'requestedDate' | 'documents' | 'status'
    >;
  }>
): SagaIterator {
  try {
    const transfer = yield call(initiateSecondaryTransfer, action.payload.transfer);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* reviewSecondaryTransferWorker(
  action: PayloadAction<{ transferId: string }>
): SagaIterator {
  try {
    const transfer = yield call(reviewSecondaryTransfer, action.payload.transferId);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* approveSecondaryTransferWorker(
  action: PayloadAction<{ transferId: string }>
): SagaIterator {
  try {
    const transfer = yield call(approveSecondaryTransfer, action.payload.transferId);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* rejectSecondaryTransferWorker(
  action: PayloadAction<{ transferId: string; reason: string }>
): SagaIterator {
  try {
    const transfer = yield call(rejectSecondaryTransfer, action.payload.transferId, action.payload.reason);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* completeSecondaryTransferWorker(
  action: PayloadAction<{ transferId: string }>
): SagaIterator {
  try {
    const transfer = yield call(completeSecondaryTransfer, action.payload.transferId);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* uploadSecondaryTransferDocumentWorker(
  action: PayloadAction<{ transferId: string; docName: string }>
): SagaIterator {
  try {
    const transfer = yield call(uploadTransferDocument, action.payload.transferId, action.payload.docName);
    yield put(secondaryTransferUpserted(transfer));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

function* exerciseSecondaryTransferROFRWorker(
  action: PayloadAction<{ transferId: string; exercisedByName?: string }>
): SagaIterator {
  try {
    const rofr = yield call(
      exerciseTransferROFR,
      action.payload.transferId,
      action.payload.exercisedByName
    );
    yield put(secondaryTransferROFRAdded(rofr));
  } catch (error: unknown) {
    yield put(secondaryTransfersFailed(normalizeError(error)));
  }
}

export function* fundAdminOpsSaga(): SagaIterator {
  yield all([
    takeLatest(navRequested.type, loadNAVWorker),
    takeLatest(navCalculateRequested.type, calculateNAVWorker),
    takeLatest(navReviewRequested.type, reviewNAVWorker),
    takeLatest(navPublishRequested.type, publishNAVWorker),
    takeLatest(navExportRequested.type, exportNAVWorker),

    takeLatest(carryRequested.type, loadCarryWorker),
    takeLatest(carryCalculateRequested.type, calculateCarryWorker),
    takeLatest(carryApproveRequested.type, approveCarryWorker),
    takeLatest(carryDistributeRequested.type, distributeCarryWorker),
    takeLatest(carryExportRequested.type, exportCarryWorker),

    takeLatest(expensesRequested.type, loadExpensesWorker),
    takeLatest(expenseAddRequested.type, addExpenseWorker),
    takeLatest(expenseApproveRequested.type, approveExpenseWorker),
    takeLatest(expenseRejectRequested.type, rejectExpenseWorker),
    takeLatest(expenseMarkPaidRequested.type, markExpensePaidWorker),
    takeLatest(expenseExportRequested.type, exportExpenseWorker),

    takeLatest(secondaryTransfersRequested.type, loadSecondaryTransferWorker),
    takeLatest(secondaryTransferInitiateRequested.type, initiateSecondaryTransferWorker),
    takeLatest(secondaryTransferReviewRequested.type, reviewSecondaryTransferWorker),
    takeLatest(secondaryTransferApproveRequested.type, approveSecondaryTransferWorker),
    takeLatest(secondaryTransferRejectRequested.type, rejectSecondaryTransferWorker),
    takeLatest(secondaryTransferCompleteRequested.type, completeSecondaryTransferWorker),
    takeLatest(
      secondaryTransferUploadDocumentRequested.type,
      uploadSecondaryTransferDocumentWorker
    ),
    takeLatest(
      secondaryTransferExerciseROFRRequested.type,
      exerciseSecondaryTransferROFRWorker
    ),
  ]);
}
