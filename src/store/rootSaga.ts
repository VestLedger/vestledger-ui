import { all, call } from 'redux-saga/effects';
import { alertsSaga } from './sagas/alertsSaga';

export function* rootSaga() {
  yield all([call(alertsSaga)]);
}
