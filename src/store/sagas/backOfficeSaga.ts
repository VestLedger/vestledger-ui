import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  complianceRequested,
  complianceLoaded,
  complianceFailed,
  fundAdminRequested,
  fundAdminLoaded,
  fundAdminFailed,
  taxCenterRequested,
  taxCenterLoaded,
  taxCenterFailed,
  valuation409aRequested,
  valuation409aLoaded,
  valuation409aFailed,
  capitalCallCreateRequested,
  capitalCallCreateSucceeded,
  capitalCallCreateFailed,
  capitalCallUpdateRequested,
  capitalCallUpdateSucceeded,
  capitalCallUpdateFailed,
  capitalCallSendRequested,
  capitalCallReminderRequested,
  lpReminderRequested,
  lpResponseUpdateRequested,
  lpResponseUpdateSucceeded,
  lpResponseUpdateFailed,
  fundAdminExportRequested,
  fundAdminExportSucceeded,
  type ComplianceData,
  type FundAdminData,
  type TaxCenterData,
  type Valuation409aData,
  type CapitalCallCreateInput,
} from '../slices/backOfficeSlice';
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
import type { CapitalCall } from '@/data/mocks/back-office/fund-admin';
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
import { normalizeError } from '@/store/utils/normalizeError';

function* loadComplianceWorker(): SagaIterator {
  try {
    const complianceItems = yield call(getComplianceItems);
    const regulatoryFilings = yield call(getRegulatoryFilings);
    const auditSchedule = yield call(getAuditSchedule);

    const data: ComplianceData = {
      complianceItems,
      regulatoryFilings,
      auditSchedule,
    };

    yield put(complianceLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load compliance data', error);
    yield put(complianceFailed(normalizeError(error)));
  }
}

function* loadFundAdminWorker(
  action: PayloadAction<{ fundId?: string } | undefined>
): SagaIterator {
  try {
    const fundId = action.payload?.fundId;
    const capitalCalls = yield call(getCapitalCalls, fundId);
    const distributions = yield call(getDistributions, fundId);
    const lpResponses = yield call(getLPResponses, fundId);

    const data: FundAdminData = {
      capitalCalls,
      distributions,
      lpResponses,
    };

    yield put(fundAdminLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load fund admin data', error);
    yield put(fundAdminFailed(normalizeError(error)));
  }
}

function* createCapitalCallWorker(
  action: PayloadAction<CapitalCallCreateInput>
): SagaIterator {
  try {
    const capitalCall = yield call(createCapitalCall, action.payload);
    yield put(capitalCallCreateSucceeded(capitalCall));
  } catch (error: unknown) {
    yield put(capitalCallCreateFailed(normalizeError(error)));
  }
}

function* updateCapitalCallWorker(
  action: PayloadAction<{ capitalCallId: string; patch: Partial<CapitalCall> }>
): SagaIterator {
  try {
    const capitalCall = yield call(
      updateCapitalCall,
      action.payload.capitalCallId,
      action.payload.patch
    );
    yield put(capitalCallUpdateSucceeded(capitalCall));
  } catch (error: unknown) {
    yield put(capitalCallUpdateFailed(normalizeError(error)));
  }
}

function* sendCapitalCallWorker(
  action: PayloadAction<{ capitalCallId: string }>
): SagaIterator {
  try {
    const capitalCall = yield call(sendCapitalCallToLPs, action.payload.capitalCallId);
    yield put(capitalCallUpdateSucceeded(capitalCall));
  } catch (error: unknown) {
    yield put(capitalCallUpdateFailed(normalizeError(error)));
  }
}

function* sendCapitalCallReminderWorker(
  action: PayloadAction<{ capitalCallId: string }>
): SagaIterator {
  try {
    const capitalCall = yield call(sendCapitalCallReminder, action.payload.capitalCallId);
    yield put(capitalCallUpdateSucceeded(capitalCall));
  } catch (error: unknown) {
    yield put(capitalCallUpdateFailed(normalizeError(error)));
  }
}

function* sendLPReminderWorker(
  action: PayloadAction<{ lpResponseId: string }>
): SagaIterator {
  try {
    const response = yield call(sendLPReminder, action.payload.lpResponseId);
    yield put(lpResponseUpdateSucceeded(response));
  } catch (error: unknown) {
    yield put(lpResponseUpdateFailed(normalizeError(error)));
  }
}

function* updateLPResponseWorker(
  action: PayloadAction<{ lpResponseId: string; amountPaid: number }>
): SagaIterator {
  try {
    const response = yield call(
      recordLPResponsePayment,
      action.payload.lpResponseId,
      action.payload.amountPaid
    );
    yield put(lpResponseUpdateSucceeded(response));
  } catch (error: unknown) {
    yield put(lpResponseUpdateFailed(normalizeError(error)));
  }
}

function* exportFundAdminActivityWorker(): SagaIterator {
  try {
    const result = yield call(exportFundAdminActivity);
    yield put(fundAdminExportSucceeded({ exportedAt: result.exportedAt }));
  } catch (error: unknown) {
    yield put(fundAdminFailed(normalizeError(error)));
  }
}

function* loadTaxCenterWorker(): SagaIterator {
  try {
    const filingDeadline = yield call(getTaxFilingDeadline);
    const taxDocuments = yield call(getTaxDocuments);
    const taxSummaries = yield call(getTaxSummaries);
    const portfolioTax = yield call(getPortfolioTax);

    const data: TaxCenterData = {
      filingDeadline,
      taxDocuments,
      taxSummaries,
      portfolioTax,
    };

    yield put(taxCenterLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load tax center data', error);
    yield put(taxCenterFailed(normalizeError(error)));
  }
}

function* loadValuation409aWorker(): SagaIterator {
  try {
    const valuations = yield call(getValuations409a);
    const strikePrices = yield call(getStrikePrices);
    const history = yield call(getValuationHistory);

    const data: Valuation409aData = {
      valuations,
      strikePrices,
      history,
    };

    yield put(valuation409aLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load 409A valuation data', error);
    yield put(valuation409aFailed(normalizeError(error)));
  }
}

function* watchCompliance(): SagaIterator {
  yield takeLatest(complianceRequested.type, loadComplianceWorker);
}

function* watchFundAdmin(): SagaIterator {
  yield takeLatest(fundAdminRequested.type, loadFundAdminWorker);
  yield takeLatest(capitalCallCreateRequested.type, createCapitalCallWorker);
  yield takeLatest(capitalCallUpdateRequested.type, updateCapitalCallWorker);
  yield takeLatest(capitalCallSendRequested.type, sendCapitalCallWorker);
  yield takeLatest(capitalCallReminderRequested.type, sendCapitalCallReminderWorker);
  yield takeLatest(lpReminderRequested.type, sendLPReminderWorker);
  yield takeLatest(lpResponseUpdateRequested.type, updateLPResponseWorker);
  yield takeLatest(fundAdminExportRequested.type, exportFundAdminActivityWorker);
}

function* watchTaxCenter(): SagaIterator {
  yield takeLatest(taxCenterRequested.type, loadTaxCenterWorker);
}

function* watchValuation409a(): SagaIterator {
  yield takeLatest(valuation409aRequested.type, loadValuation409aWorker);
}

export function* backOfficeSaga(): SagaIterator {
  yield all([
    call(watchCompliance),
    call(watchFundAdmin),
    call(watchTaxCenter),
    call(watchValuation409a),
  ]);
}
