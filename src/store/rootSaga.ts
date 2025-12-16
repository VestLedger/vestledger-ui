import { all, call } from 'redux-saga/effects';
import { alertsSaga } from './sagas/alertsSaga';
import { authSaga } from './sagas/authSaga';
import { fundSaga } from './sagas/fundSaga';
import { navigationSaga } from './sagas/navigationSaga';
import { copilotSaga } from './sagas/copilotSaga';
import { uiEffectsSaga } from './sagas/uiEffectsSaga';
import { documentsSaga } from './sagas/documentsSaga';

export function* rootSaga() {
  yield all([
    call(alertsSaga),
    call(authSaga),
    call(fundSaga),
    call(navigationSaga),
    call(copilotSaga),
    call(uiEffectsSaga),
    call(documentsSaga),
  ]);
}
