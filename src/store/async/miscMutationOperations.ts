import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { AppDispatch } from '@/store/store';
import {
  addCollaborationMessage,
  createCollaborationTask,
  getCollaborationSnapshot,
  updateCollaborationTaskStatus,
  type CreateCollaborationMessageInput,
  type CreateCollaborationTaskInput,
} from '@/services/collaboration/collaborationService';
import {
  exportLPData,
  generateLPReport,
  getLPManagementSnapshot,
  sendCapitalCallToLPs,
  sendLPUpdate,
  sendReportToLPs,
} from '@/services/lpPortal/lpManagementService';
import { collaborationLoaded, lpManagementLoaded, type CollaborationData, type LPManagementData } from '@/store/slices/miscSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import { normalizeError } from '@/store/utils/normalizeError';

type MiscThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

async function refreshCollaboration(dispatch: AppDispatch): Promise<CollaborationData> {
  const snapshot = await getCollaborationSnapshot();
  dispatch(collaborationLoaded(snapshot));
  return snapshot;
}

async function refreshLPManagement(dispatch: AppDispatch): Promise<LPManagementData> {
  const snapshot = await getLPManagementSnapshot();
  dispatch(lpManagementLoaded(snapshot));
  return snapshot;
}

export const addCollaborationMessageOperation = createAsyncThunk<
  CollaborationData,
  CreateCollaborationMessageInput,
  MiscThunkConfig
>('misc/collaboration/addMessage', async (input, thunkApi) => {
  try {
    await addCollaborationMessage(input);
    return await refreshCollaboration(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const createCollaborationTaskOperation = createAsyncThunk<
  CollaborationData,
  CreateCollaborationTaskInput,
  MiscThunkConfig
>('misc/collaboration/createTask', async (input, thunkApi) => {
  try {
    await createCollaborationTask(input);
    return await refreshCollaboration(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const updateCollaborationTaskStatusOperation = createAsyncThunk<
  CollaborationData,
  { taskId: string; status: Parameters<typeof updateCollaborationTaskStatus>[1] },
  MiscThunkConfig
>('misc/collaboration/updateTaskStatus', async ({ taskId, status }, thunkApi) => {
  try {
    await updateCollaborationTaskStatus(taskId, status);
    return await refreshCollaboration(thunkApi.dispatch);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const generateLPReportOperation = createAsyncThunk<
  Awaited<ReturnType<typeof generateLPReport>>,
  string[] | undefined,
  MiscThunkConfig
>('misc/lpManagement/generateReport', async (selectedLPIds, thunkApi) => {
  try {
    const report = await generateLPReport(selectedLPIds);
    await refreshLPManagement(thunkApi.dispatch);
    return report;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const sendLPReportOperation = createAsyncThunk<
  Awaited<ReturnType<typeof sendReportToLPs>>,
  string[] | undefined,
  MiscThunkConfig
>('misc/lpManagement/sendReport', async (selectedLPIds, thunkApi) => {
  try {
    const result = await sendReportToLPs(selectedLPIds);
    await refreshLPManagement(thunkApi.dispatch);
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const sendLPCapitalCallOperation = createAsyncThunk<
  Awaited<ReturnType<typeof sendCapitalCallToLPs>>,
  string[] | undefined,
  MiscThunkConfig
>('misc/lpManagement/sendCapitalCall', async (selectedLPIds, thunkApi) => {
  try {
    const result = await sendCapitalCallToLPs(selectedLPIds);
    await refreshLPManagement(thunkApi.dispatch);
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const exportLPDataOperation = createAsyncThunk<
  Awaited<ReturnType<typeof exportLPData>>,
  string[] | undefined,
  MiscThunkConfig
>('misc/lpManagement/export', async (selectedLPIds, thunkApi) => {
  try {
    const result = await exportLPData(selectedLPIds);
    await refreshLPManagement(thunkApi.dispatch);
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const sendLPUpdateOperation = createAsyncThunk<
  Awaited<ReturnType<typeof sendLPUpdate>>,
  string[] | undefined,
  MiscThunkConfig
>('misc/lpManagement/sendUpdate', async (selectedLPIds, thunkApi) => {
  try {
    const result = await sendLPUpdate(selectedLPIds);
    await refreshLPManagement(thunkApi.dispatch);
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
