import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { TopbarSearchResult } from '@/services/topbarSearchService';

export interface SearchData {
  results: TopbarSearchResult[];
  query: string;
}

export interface SearchParams {
  query: string;
}

type SearchState = AsyncState<SearchData>;

const initialState: SearchState = createInitialAsyncState<SearchData>();

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchRequested: (state, action: PayloadAction<SearchParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    searchLoaded: (state, action: PayloadAction<SearchData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    searchFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    searchCleared: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = undefined;
    },
  },
});

export const {
  searchRequested,
  searchLoaded,
  searchFailed,
  searchCleared,
} = searchSlice.actions;

// Centralized selectors
export const searchSelectors = createAsyncSelectors<SearchData>('search');

export const searchReducer = searchSlice.reducer;
