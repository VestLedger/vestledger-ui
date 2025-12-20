import { all, call } from 'redux-saga/effects';
import { alertsSaga } from './sagas/alertsSaga';
import { authSaga } from './sagas/authSaga';
import { fundSaga } from './sagas/fundSaga';
import { navigationSaga } from './sagas/navigationSaga';
import { copilotSaga } from './sagas/copilotSaga';
import { uiEffectsSaga } from './sagas/uiEffectsSaga';
import { documentsSaga } from './sagas/documentsSaga';
import { portfolioSaga } from './sagas/portfolioSaga';
import { pipelineSaga } from './sagas/pipelineSaga';
import { dashboardsSaga } from './sagas/dashboardsSaga';
import { dealflowSaga } from './sagas/dealflowSaga';
import { backOfficeSaga } from './sagas/backOfficeSaga';
import { aiSaga } from './sagas/aiSaga';
import { dealIntelligenceSaga } from './sagas/dealIntelligenceSaga';
import { crmSaga } from './sagas/crmSaga';
import { miscSaga } from './sagas/miscSaga';
import { searchSaga } from './sagas/searchSaga';

export function* rootSaga() {
  yield all([
    call(alertsSaga),
    call(authSaga),
    call(fundSaga),
    call(navigationSaga),
    call(copilotSaga),
    call(uiEffectsSaga),
    call(documentsSaga),
    call(portfolioSaga),
    call(pipelineSaga),
    call(dashboardsSaga),
    call(dealflowSaga),
    call(backOfficeSaga),
    call(aiSaga),
    call(dealIntelligenceSaga),
    call(crmSaga),
    call(miscSaga),
    call(searchSaga),
  ]);
}
