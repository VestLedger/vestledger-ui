import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RECOVERABLE_TOAST_EVENT,
  __resetRecoverableToastStateForTests,
  emitRecoverableErrorToast,
} from '@/utils/errors/recoverableToast';

describe('recoverableToast', () => {
  beforeEach(() => {
    __resetRecoverableToastStateForTests();
  });

  it('deduplicates identical recoverable errors within TTL window', () => {
    const listener = vi.fn();
    window.addEventListener(RECOVERABLE_TOAST_EVENT, listener);

    emitRecoverableErrorToast({ message: 'Failed to load', code: 'HTTP_500' });
    emitRecoverableErrorToast({ message: 'Failed to load', code: 'HTTP_500' });

    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(RECOVERABLE_TOAST_EVENT, listener);
  });

  it('emits separate events for different error keys', () => {
    const listener = vi.fn();
    window.addEventListener(RECOVERABLE_TOAST_EVENT, listener);

    emitRecoverableErrorToast({ message: 'Failed to load', code: 'HTTP_500' });
    emitRecoverableErrorToast({ message: 'Unable to save', code: 'HTTP_400' });

    expect(listener).toHaveBeenCalledTimes(2);

    window.removeEventListener(RECOVERABLE_TOAST_EVENT, listener);
  });
});
