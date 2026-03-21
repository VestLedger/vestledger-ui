import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
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
} from "@/services/integrationsService";
import { integrationsLoaded } from "@/store/slices/miscSlice";
import type { NormalizedError } from "@/store/types/AsyncState";
import { normalizeError } from "@/store/utils/normalizeError";

type IntegrationsThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

async function refreshIntegrationsSnapshot(dispatch: AppDispatch) {
  dispatch(integrationsLoaded(await getIntegrationsSnapshot()));
}

function createRefreshingIntegrationOperation<Arg, Result>(
  typePrefix: string,
  action: (arg: Arg) => Promise<Result>,
) {
  return createAsyncThunk<Result, Arg, IntegrationsThunkConfig>(
    typePrefix,
    async (arg, thunkApi) => {
      try {
        const result = await action(arg);
        await refreshIntegrationsSnapshot(thunkApi.dispatch);
        return result;
      } catch (error: unknown) {
        return thunkApi.rejectWithValue(normalizeError(error));
      }
    },
  );
}

export const connectIntegrationOperation = createRefreshingIntegrationOperation(
  "integrations/connectIntegration",
  connectIntegration,
);

export const disconnectIntegrationOperation =
  createRefreshingIntegrationOperation(
    "integrations/disconnectIntegration",
    disconnectIntegration,
  );

export const connectCalendarOperation = createRefreshingIntegrationOperation(
  "integrations/connectCalendar",
  connectCalendar,
);

export const disconnectCalendarOperation = createRefreshingIntegrationOperation(
  "integrations/disconnectCalendar",
  disconnectCalendar,
);

export const syncCalendarOperation = createRefreshingIntegrationOperation(
  "integrations/syncCalendar",
  syncCalendar,
);

export const configureCalendarRulesOperation =
  createRefreshingIntegrationOperation(
    "integrations/configureCalendarRules",
    configureCalendarRules,
  );

export const toggleCalendarAutoCaptureOperation =
  createRefreshingIntegrationOperation(
    "integrations/toggleCalendarAutoCapture",
    toggleCalendarAutoCapture,
  );

export const captureCalendarEventOperation =
  createRefreshingIntegrationOperation(
    "integrations/captureCalendarEvent",
    captureCalendarEvent,
  );

export const ignoreCalendarEventOperation =
  createRefreshingIntegrationOperation(
    "integrations/ignoreCalendarEvent",
    ignoreCalendarEvent,
  );

export const editCalendarEventOperation = createRefreshingIntegrationOperation(
  "integrations/editCalendarEvent",
  editCalendarEvent,
);

export const createCalendarEventOperation =
  createRefreshingIntegrationOperation(
    "integrations/createCalendarEvent",
    createCalendarEvent,
  );

export const exportCalendarEventsOperation = createAsyncThunk<
  string,
  "csv" | "ical",
  IntegrationsThunkConfig
>("integrations/exportCalendarEvents", async (format, thunkApi) => {
  try {
    return await exportCalendarEvents(format);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
