import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { PipelineDeal } from '@/services/pipelineService';
import type { Suggestion } from '@/data/mocks/ai/copilot';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface PipelineData {
  stages: string[];
  deals: PipelineDeal[];
  copilotSuggestions: Suggestion[];
}

export interface GetPipelineParams extends Partial<StandardQueryParams> {
  stageFilter?: string;
}

type PipelineState = AsyncState<PipelineData>;

const initialState: PipelineState = createInitialAsyncState<PipelineData>();

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {
    pipelineDataRequested: (state, _action: PayloadAction<GetPipelineParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    pipelineDataLoaded: (state, action: PayloadAction<PipelineData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    pipelineDataFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    // Update a deal's stage (for kanban drag-and-drop)
    dealStageUpdated: (
      state,
      action: PayloadAction<{ dealId: number | string; newStage: string }>
    ) => {
      if (state.data) {
        const deal = state.data.deals.find((d) => d.id === action.payload.dealId);
        if (deal) {
          deal.stage = action.payload.newStage;
        }
      }
    },
    pipelineDealUpserted: (state, action: PayloadAction<PipelineDeal>) => {
      if (!state.data) {
        state.data = {
          stages: [],
          deals: [],
          copilotSuggestions: [],
        };
      }

      if (!state.data.stages.includes(action.payload.stage)) {
        state.data.stages = [...state.data.stages, action.payload.stage];
      }

      const existingIndex = state.data.deals.findIndex((deal) => deal.id === action.payload.id);
      if (existingIndex === -1) {
        state.data.deals = [action.payload, ...state.data.deals];
      } else {
        state.data.deals[existingIndex] = action.payload;
      }
    },
  },
});

export const {
  pipelineDataLoaded,
  pipelineDataFailed,
  dealStageUpdated,
  pipelineDealUpserted,
} = pipelineSlice.actions;

// Centralized selectors
export const pipelineSelectors = createAsyncSelectors<PipelineData>('pipeline');

export const pipelineReducer = pipelineSlice.reducer;
