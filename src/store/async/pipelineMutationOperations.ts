import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { AppDispatch } from '@/store/store';
import {
  createPipelineDeal,
  updatePipelineDealStage,
  type CreatePipelineDealParams,
  type PipelineDeal,
} from '@/services/pipelineService';
import {
  dealStageUpdated,
  pipelineDealUpserted,
} from '@/store/slices/pipelineSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import { normalizeError } from '@/store/utils/normalizeError';
import { loadPipelineDataOperation } from '@/store/async/dataOperations';

type PipelineThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

export const createPipelineDealOperation = createAsyncThunk<
  PipelineDeal,
  CreatePipelineDealParams,
  PipelineThunkConfig
>('pipeline/createDeal', async (params, thunkApi) => {
  try {
    const createdDeal = await createPipelineDeal(params);
    thunkApi.dispatch(pipelineDealUpserted(createdDeal));
    return createdDeal;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const updatePipelineDealStageOperation = createAsyncThunk<
  PipelineDeal,
  { dealId: number | string; newStage: string },
  PipelineThunkConfig
>('pipeline/updateDealStage', async ({ dealId, newStage }, thunkApi) => {
  const previousDeal =
    thunkApi.getState().pipeline.data?.deals.find((deal) => deal.id === dealId) ?? null;

  thunkApi.dispatch(dealStageUpdated({ dealId, newStage }));

  try {
    const updatedDeal = await updatePipelineDealStage(dealId, newStage);
    thunkApi.dispatch(pipelineDealUpserted(updatedDeal));
    return updatedDeal;
  } catch (error: unknown) {
    if (previousDeal) {
      thunkApi.dispatch(pipelineDealUpserted(previousDeal));
    } else {
      thunkApi.dispatch(loadPipelineDataOperation({}));
    }

    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
