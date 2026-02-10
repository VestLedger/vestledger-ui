import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { FundExpense } from '@/types/fundAdminOps';

export interface ExpenseOpsData {
  expenses: FundExpense[];
}

interface ExpenseOpsState {
  data: AsyncState<ExpenseOpsData>;
  lastExportAt?: string;
}

const initialState: ExpenseOpsState = {
  data: createInitialAsyncState<ExpenseOpsData>(),
};

function upsertExpense(list: FundExpense[], value: FundExpense) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

const expenseOpsSlice = createSlice({
  name: 'expenseOps',
  initialState,
  reducers: {
    expensesRequested: (state, _action: PayloadAction<{ fundId?: string } | undefined>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    expensesLoaded: (state, action: PayloadAction<ExpenseOpsData>) => {
      state.data.data = action.payload;
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },
    expensesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.data.status = 'failed';
      state.data.error = action.payload;
    },

    expenseAddRequested: (state, _action: PayloadAction<{ expense: Omit<FundExpense, 'id'> }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    expenseApproveRequested: (
      state,
      _action: PayloadAction<{ expenseId: string; approver: string }>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    expenseRejectRequested: (state, _action: PayloadAction<{ expenseId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    expenseMarkPaidRequested: (state, _action: PayloadAction<{ expenseId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    expenseExportRequested: (
      state,
      _action: PayloadAction<{ format: 'csv' | 'pdf'; fundId?: string }>
    ) => {
      state.data.error = undefined;
    },

    expenseUpserted: (state, action: PayloadAction<FundExpense>) => {
      if (!state.data.data) {
        state.data.data = { expenses: [] };
      }
      upsertExpense(state.data.data.expenses, action.payload);
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },

    expenseExportSucceeded: (state, action: PayloadAction<{ exportedAt: string }>) => {
      state.lastExportAt = action.payload.exportedAt;
    },
  },
});

export const {
  expensesRequested,
  expensesLoaded,
  expensesFailed,
  expenseAddRequested,
  expenseApproveRequested,
  expenseRejectRequested,
  expenseMarkPaidRequested,
  expenseExportRequested,
  expenseUpserted,
  expenseExportSucceeded,
} = expenseOpsSlice.actions;

export const expenseOpsSelectors = createAsyncSelectors<ExpenseOpsData>((state) => state.expenseOps.data);

export const expenseOpsReducer = expenseOpsSlice.reducer;
