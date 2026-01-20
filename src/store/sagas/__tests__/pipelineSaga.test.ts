import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import { loadPipelineDataWorker } from '../pipelineSaga';
import {
  pipelineDataRequested,
  pipelineDataLoaded,
  pipelineDataFailed,
  type PipelineData,
  type GetPipelineParams,
} from '@/store/slices/pipelineSlice';
import { getPipelineData } from '@/services/pipelineService';
import { normalizeError } from '@/store/utils/normalizeError';

describe('pipelineSaga', () => {
  const mockParams: GetPipelineParams = {};
  const mockPipelineData: PipelineData = {
    stages: ['Sourcing', 'Due Diligence', 'Negotiation', 'Closed'],
    deals: [
      {
        id: 1,
        name: 'TechStartup Inc',
        stage: 'Sourcing',
        amount: '$2M',
        probability: 75,
        founder: 'Jane Doe',
        lastContact: '2 days ago',
        sector: 'SaaS',
        outcome: 'active',
      },
    ],
    copilotSuggestions: [],
  };

  describe('loadPipelineDataWorker', () => {
    it('should call getPipelineData service with params', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      const callEffect = generator.next().value;
      expect(callEffect).toEqual(call(getPipelineData, mockParams));
    });

    it('should dispatch pipelineDataLoaded on success', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      // First yield: call to service
      generator.next();

      // Second yield: put success action (simulate successful response)
      const putEffect = generator.next(mockPipelineData).value;
      expect(putEffect).toEqual(put(pipelineDataLoaded(mockPipelineData)));
    });

    it('should dispatch pipelineDataFailed on error', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      // First yield: call to service
      generator.next();

      // Simulate error thrown
      const error = new Error('Network error');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(pipelineDataFailed(normalizeError(error)))
      );
    });

    it('should handle API not implemented error', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      generator.next();

      const error = new Error('Pipeline API not implemented yet');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(pipelineDataFailed(normalizeError(error)))
      );
    });

    it('should complete after dispatching success', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      generator.next(); // call
      generator.next(mockPipelineData); // put success

      const done = generator.next();
      expect(done.done).toBe(true);
    });

    it('should complete after dispatching failure', () => {
      const action = pipelineDataRequested(mockParams);
      const generator = loadPipelineDataWorker(action);

      generator.next(); // call
      generator.throw(new Error('Error')); // put failure

      const done = generator.next();
      expect(done.done).toBe(true);
    });
  });
});
