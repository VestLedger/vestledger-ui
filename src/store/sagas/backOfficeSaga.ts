import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
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
  type ComplianceData,
  type FundAdminData,
  type TaxCenterData,
  type Valuation409aData,
} from '../slices/backOfficeSlice';
import {
  getComplianceItems,
  getRegulatoryFilings,
  getAuditSchedule,
} from '@/services/backOffice/complianceService';
import {
  getCapitalCalls,
  getDistributions,
  getLPResponses,
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
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load compliance data
 */
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

/**
 * Worker saga: Load fund admin data
 */
function* loadFundAdminWorker(): SagaIterator {
  try {
    const capitalCalls = yield call(getCapitalCalls);
    const distributions = yield call(getDistributions);
    const lpResponses = yield call(getLPResponses);

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

/**
 * Worker saga: Load tax center data
 */
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

/**
 * Worker saga: Load 409A valuation data
 */
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

/**
 * Watcher sagas
 */
function* watchCompliance(): SagaIterator {
  yield takeLatest(complianceRequested.type, loadComplianceWorker);
}

function* watchFundAdmin(): SagaIterator {
  yield takeLatest(fundAdminRequested.type, loadFundAdminWorker);
}

function* watchTaxCenter(): SagaIterator {
  yield takeLatest(taxCenterRequested.type, loadTaxCenterWorker);
}

function* watchValuation409a(): SagaIterator {
  yield takeLatest(valuation409aRequested.type, loadValuation409aWorker);
}

/**
 * Root back-office saga
 */
export function* backOfficeSaga(): SagaIterator {
  yield all([
    call(watchCompliance),
    call(watchFundAdmin),
    call(watchTaxCenter),
    call(watchValuation409a),
  ]);
}
