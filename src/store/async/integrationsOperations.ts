import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { AppDispatch } from '@/store/store';
import {
  captureCalendarEvent,
  configureCalendarRules,
  connectCalendar,
  connectIntegration,
  createCalendarEvent,
  disconnectCalendar,
  disconnectIntegration,
  editCalendarEvent,
  exportCalendarEvents,
  getIntegrationsSnapshot,
  ignoreCalendarEvent,
  syncCalendar,
  toggleCalendarAutoCapture,
} from '@/services/integrationsService';
import { integrationsLoaded } from '@/store/slices/miscSlice';
import type { CalendarProvider } from '@/components/integrations/calendar-integration';
import type { IntegrationsSnapshot } from '@/services/integrationsService';
import type { NormalizedError } from '@/store/types/AsyncState';
import { normalizeError } from '@/store/utils/normalizeError';

type IntegrationsThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

async function refreshIntegrationsSnapshot(dispatch: AppDispatch): Promise<IntegrationsSnapshot> {
  const snapshot = await getIntegrationsSnapshot();
  dispatch(integrationsLoaded(snapshot));
  return snapshot;
}

export const connectIntegrationOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/connect', async (integrationId, thunkApi) => {
  try {
    await connectIntegration(integrationId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const disconnectIntegrationOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/disconnect', async (integrationId, thunkApi) => {
  try {
    await disconnectIntegration(integrationId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const connectCalendarOperation = createAsyncThunk<
  IntegrationsSnapshot,
  CalendarProvider,
  IntegrationsThunkConfig
>('integrations/calendar/connect', async (provider, thunkApi) => {
  try {
    await connectCalendar(provider);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const disconnectCalendarOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/disconnect', async (accountId, thunkApi) => {
  try {
    await disconnectCalendar(accountId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const syncCalendarOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/sync', async (accountId, thunkApi) => {
  try {
    await syncCalendar(accountId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const configureCalendarRulesOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/configureRules', async (accountId, thunkApi) => {
  try {
    await configureCalendarRules(accountId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const toggleCalendarAutoCaptureOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/toggleAutoCapture', async (accountId, thunkApi) => {
  try {
    await toggleCalendarAutoCapture(accountId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const captureCalendarEventOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/captureEvent', async (eventId, thunkApi) => {
  try {
    await captureCalendarEvent(eventId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const ignoreCalendarEventOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/ignoreEvent', async (eventId, thunkApi) => {
  try {
    await ignoreCalendarEvent(eventId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const editCalendarEventOperation = createAsyncThunk<
  IntegrationsSnapshot,
  string,
  IntegrationsThunkConfig
>('integrations/calendar/editEvent', async (eventId, thunkApi) => {
  try {
    await editCalendarEvent(eventId);
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const createCalendarEventOperation = createAsyncThunk<
  IntegrationsSnapshot,
  void,
  IntegrationsThunkConfig
>('integrations/calendar/createEvent', async (_, thunkApi) => {
  try {
    await createCalendarEvent();
    return await refreshIntegrationsSnapshot(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const exportCalendarEventsOperation = createAsyncThunk<
  string,
  'csv' | 'ical',
  IntegrationsThunkConfig
>('integrations/calendar/export', async (format, thunkApi) => {
  try {
    return await exportCalendarEvents(format);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
