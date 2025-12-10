import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlertType = 'deal' | 'report' | 'alert' | 'system';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface AlertsState {
  items: Alert[];
  loading: boolean;
  error?: string;
}

const initialState: AlertsState = {
  items: [],
  loading: false,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    fetchAlerts: (state) => {
      state.loading = true;
      state.error = undefined;
    },
    fetchAlertsSuccess: (state, action: PayloadAction<Alert[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    fetchAlertsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    markAlertRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.map((alert) =>
        alert.id === id ? { ...alert, unread: false } : alert
      );
    },
  },
});

export const {
  fetchAlerts,
  fetchAlertsSuccess,
  fetchAlertsFailure,
  markAlertRead,
} = alertsSlice.actions;

export const alertsReducer = alertsSlice.reducer;
