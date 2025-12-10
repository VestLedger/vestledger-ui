import { combineReducers } from '@reduxjs/toolkit';
import { alertsReducer } from './slices/alertsSlice';

export const rootReducer = combineReducers({
  alerts: alertsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
