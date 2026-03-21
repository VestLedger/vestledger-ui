import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AsyncState, NormalizedError } from "@/store/types/AsyncState";
import { createInitialAsyncState } from "@/store/types/AsyncState";
import { createAsyncSelectors } from "@/store/utils/createAsyncSelectors";
import type { StandardQueryParams } from "@/types/serviceParams";
import type { Contact, Interaction } from "@/data/mocks/crm/contacts";
import type { EmailAccount } from "@/components/crm/email-integration";
import type { TimelineInteraction } from "@/components/crm/interaction-timeline";

export interface CRMData {
  contacts: Contact[];
  emailAccounts: EmailAccount[];
  interactions: Interaction[];
  timelineInteractions: TimelineInteraction[];
}

export interface GetCRMDataParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
  contactType?: string;
}

type CRMState = AsyncState<CRMData>;

const initialState: CRMState = createInitialAsyncState<CRMData>();

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    crmDataRequested: (state, _action: PayloadAction<GetCRMDataParams>) => {
      state.status = "loading";
      state.error = undefined;
    },
    crmDataLoaded: (state, action: PayloadAction<CRMData>) => {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = undefined;
    },
    crmDataFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { crmDataLoaded, crmDataFailed } = crmSlice.actions;

// Centralized selectors
export const crmSelectors = createAsyncSelectors<CRMData>("crm");

export const crmReducer = crmSlice.reducer;
