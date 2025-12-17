import { call, put } from 'redux-saga/effects';
import { normalizeError } from '../utils/normalizeError';
import type { NormalizedError } from '../types/AsyncState';

/**
 * Test harness utilities for "service throws → failed state" saga pattern
 * Ensures all sagas handle API mode errors correctly
 *
 * Usage: Import these utilities when writing saga tests with Jest/Vitest
 */

/**
 * Helper to create expected effects for saga error handling tests
 *
 * @example
 * ```typescript
 * import { getSagaErrorExpectations } from '@/store/__tests__/sagaTestHarness';
 *
 * it('handles service errors', () => {
 *   const action = dealIntelligenceRequested({ fundId: '123' });
 *   const generator = loadDealIntelligenceWorker(action);
 *
 *   const expectations = getSagaErrorExpectations({
 *     service: getDealIntelligenceData,
 *     params: { fundId: '123' },
 *     failedAction: dealIntelligenceFailed,
 *   });
 *
 *   // Test that saga calls service
 *   const callEffect = generator.next().value;
 *   expect(callEffect).toEqual(expectations.expectedCallEffect);
 *
 *   // Simulate service throwing
 *   const putEffect = generator.throw(expectations.testError).value;
 *   expect(putEffect).toEqual(expectations.expectedPutEffect);
 * });
 * ```
 */
export function getSagaErrorExpectations<Params>(config: {
  service: (...args: any[]) => any;
  params: Params;
  failedAction: (error: NormalizedError) => any;
}) {
  const { service, params, failedAction } = config;
  const testError = new Error('API not implemented yet');

  return {
    testError,
    expectedCallEffect: call(service, params),
    expectedPutEffect: put(failedAction(normalizeError(testError))),
  };
}

/**
 * Helper to verify a saga worker follows the standard error handling pattern
 * Returns assertion helpers that can be used with any test framework
 */
export function createSagaErrorTest<Params>(config: {
  sagaWorker: (action: any) => Generator;
  requestedAction: (params: Params) => any;
  failedAction: (error: NormalizedError) => any;
  service: (...args: any[]) => any;
  mockParams: Params;
}) {
  const { sagaWorker, requestedAction, failedAction, service, mockParams } = config;

  const action = requestedAction(mockParams);
  const generator = sagaWorker(action);
  const testError = new Error('API not implemented yet');

  return {
    generator,
    action,
    testError,
    getCallEffect: () => generator.next().value,
    expectedCallEffect: call(service, mockParams),
    getPutEffect: () => generator.throw(testError).value,
    expectedPutEffect: put(failedAction(normalizeError(testError))),
  };
}
