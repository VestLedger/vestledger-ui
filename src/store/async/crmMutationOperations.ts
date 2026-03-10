import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
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
} from "@/services/crm/contactsService";
import { crmDataLoaded } from "@/store/slices/crmSlice";
import type { NormalizedError } from "@/store/types/AsyncState";
import { normalizeError } from "@/store/utils/normalizeError";

type CRMThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

async function refreshCRMData(dispatch: AppDispatch) {
  const params = {};
  const [contacts, emailAccounts, interactions, timelineInteractions] =
    await Promise.all([
      getCRMContacts(params),
      getCRMEmailAccounts(params),
      getCRMInteractions(params),
      getCRMTimelineInteractions(params),
    ]);

  dispatch(
    crmDataLoaded({
      contacts,
      emailAccounts,
      interactions,
      timelineInteractions,
    }),
  );
}

function createRefreshingCRMOperation<Arg, Result>(
  typePrefix: string,
  action: (arg: Arg) => Promise<Result>,
) {
  return createAsyncThunk<Result, Arg, CRMThunkConfig>(
    typePrefix,
    async (arg, thunkApi) => {
      try {
        const result = await action(arg);
        await refreshCRMData(thunkApi.dispatch);
        return result;
      } catch (error: unknown) {
        return thunkApi.rejectWithValue(normalizeError(error));
      }
    },
  );
}

export const toggleCRMContactStarOperation = createRefreshingCRMOperation(
  "crm/toggleContactStar",
  toggleCRMContactStar,
);

export const createCRMContactOperation = createRefreshingCRMOperation(
  "crm/createContact",
  createCRMContact,
);

export const createCRMInteractionOperation = createRefreshingCRMOperation(
  "crm/createInteraction",
  ({
    contactId,
    params,
  }: {
    contactId: string;
    params: Parameters<typeof createCRMInteraction>[1];
  }) => createCRMInteraction(contactId, params),
);

export const updateCRMInteractionOperation = createRefreshingCRMOperation(
  "crm/updateInteraction",
  updateCRMInteraction,
);

export const deleteCRMInteractionOperation = createRefreshingCRMOperation(
  "crm/deleteInteraction",
  deleteCRMInteraction,
);

export const linkCRMInteractionToDealOperation = createRefreshingCRMOperation(
  "crm/linkInteractionToDeal",
  ({
    interactionId,
    linkedDeal,
  }: {
    interactionId: string;
    linkedDeal: string;
  }) => linkCRMInteractionToDeal(interactionId, linkedDeal),
);

export const connectCRMEmailAccountOperation = createRefreshingCRMOperation(
  "crm/connectEmailAccount",
  connectCRMEmailAccount,
);

export const disconnectCRMEmailAccountOperation = createRefreshingCRMOperation(
  "crm/disconnectEmailAccount",
  disconnectCRMEmailAccount,
);

export const syncCRMEmailAccountOperation = createRefreshingCRMOperation(
  "crm/syncEmailAccount",
  syncCRMEmailAccount,
);

export const toggleCRMEmailAutoCaptureOperation = createRefreshingCRMOperation(
  "crm/toggleEmailAutoCapture",
  ({ accountId, enabled }: { accountId: string; enabled: boolean }) =>
    toggleCRMEmailAutoCapture(accountId, enabled),
);
