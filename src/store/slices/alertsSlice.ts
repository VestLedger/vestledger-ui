import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { StandardQueryParams } from '@/types/serviceParams';

export type AlertType = 'deal' | 'report' | 'alert' | 'system';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface AlertsData {
  items: Alert[];
}

export interface GetAlertsParams extends Partial<StandardQueryParams> {
  unreadOnly?: boolean;
}

type AlertsState = AsyncState<AlertsData>;

const initialState: AlertsState = createInitialAsyncState<AlertsData>();

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    alertsRequested: (state, action: PayloadAction<GetAlertsParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    alertsLoaded: (state, action: PayloadAction<AlertsData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    alertsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    markAlertRead: (state, action: PayloadAction<string>) => {
      if (state.data) {
        const id = action.payload;
        state.data.items = state.data.items.map((alert) =>
          alert.id === id ? { ...alert, unread: false } : alert
        );
      }
    },
  },
});

export const {
  alertsRequested,
  alertsLoaded,
  alertsFailed,
  markAlertRead,
} = alertsSlice.actions;

// Centralized selectors
export const alertsSelectors = createAsyncSelectors<AlertsData>('alerts');

export const alertsReducer = alertsSlice.reducer;
