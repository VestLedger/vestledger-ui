import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { AppDispatch } from '@/store/store';
import {
  connectCRMEmailAccount,
  createCRMContact,
  createCRMInteraction,
  deleteCRMInteraction,
  disconnectCRMEmailAccount,
  getCRMContacts,
  getCRMEmailAccounts,
  getCRMInteractions,
  getCRMTimelineInteractions,
  linkCRMInteractionToDeal,
  syncCRMEmailAccount,
  toggleCRMContactStar,
  toggleCRMEmailAutoCapture,
  updateCRMInteraction,
  type CreateCRMInteractionParams,
} from '@/services/crm/contactsService';
import { crmDataLoaded, type CRMData, type GetCRMDataParams } from '@/store/slices/crmSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import { normalizeError } from '@/store/utils/normalizeError';

type CRMThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

async function refreshCRMData(
  dispatch: AppDispatch,
  params: GetCRMDataParams = {}
): Promise<CRMData> {
  const [contacts, emailAccounts, interactions, timelineInteractions] = await Promise.all([
    getCRMContacts(params),
    getCRMEmailAccounts(params),
    getCRMInteractions(params),
    getCRMTimelineInteractions(params),
  ]);

  const data = { contacts, emailAccounts, interactions, timelineInteractions };
  dispatch(crmDataLoaded(data));
  return data;
}

export const toggleCRMContactStarOperation = createAsyncThunk<
  CRMData,
  { contactId: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/toggleContactStar', async ({ contactId, params }, thunkApi) => {
  try {
    await toggleCRMContactStar(contactId);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const createCRMContactOperation = createAsyncThunk<
  CRMData,
  GetCRMDataParams | undefined,
  CRMThunkConfig
>('crm/createContact', async (params, thunkApi) => {
  try {
    await createCRMContact();
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const createCRMInteractionOperation = createAsyncThunk<
  CRMData,
  { contactId: string; input: CreateCRMInteractionParams; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/createInteraction', async ({ contactId, input, params }, thunkApi) => {
  try {
    await createCRMInteraction(contactId, input);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const updateCRMInteractionOperation = createAsyncThunk<
  CRMData,
  { interactionId: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/updateInteraction', async ({ interactionId, params }, thunkApi) => {
  try {
    await updateCRMInteraction(interactionId);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const deleteCRMInteractionOperation = createAsyncThunk<
  CRMData,
  { interactionId: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/deleteInteraction', async ({ interactionId, params }, thunkApi) => {
  try {
    await deleteCRMInteraction(interactionId);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const linkCRMInteractionToDealOperation = createAsyncThunk<
  CRMData,
  { interactionId: string; linkedDeal: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/linkInteractionToDeal', async ({ interactionId, linkedDeal, params }, thunkApi) => {
  try {
    await linkCRMInteractionToDeal(interactionId, linkedDeal);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const connectCRMEmailAccountOperation = createAsyncThunk<
  CRMData,
  { provider: 'gmail' | 'outlook'; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/connectEmailAccount', async ({ provider, params }, thunkApi) => {
  try {
    await connectCRMEmailAccount(provider);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const disconnectCRMEmailAccountOperation = createAsyncThunk<
  CRMData,
  { accountId: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/disconnectEmailAccount', async ({ accountId, params }, thunkApi) => {
  try {
    await disconnectCRMEmailAccount(accountId);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const syncCRMEmailAccountOperation = createAsyncThunk<
  CRMData,
  { accountId: string; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/syncEmailAccount', async ({ accountId, params }, thunkApi) => {
  try {
    await syncCRMEmailAccount(accountId);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const toggleCRMEmailAutoCaptureOperation = createAsyncThunk<
  CRMData,
  { accountId: string; enabled: boolean; params?: GetCRMDataParams },
  CRMThunkConfig
>('crm/toggleEmailAutoCapture', async ({ accountId, enabled, params }, thunkApi) => {
  try {
    await toggleCRMEmailAutoCapture(accountId, enabled);
    return await refreshCRMData(thunkApi.dispatch, params);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
