import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { abortableThunkRegistryMiddleware } from './abortableThunkRegistry';
import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';

export const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).prepend(abortableThunkRegistryMiddleware).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

if (typeof window !== 'undefined') {
  sagaMiddleware.run(rootSaga);
}

export type AppDispatch = typeof store.dispatch;
