'use client';

import { useEffect } from 'react';
import { useToast } from '@/ui';
import { RECOVERABLE_TOAST_EVENT } from '@/utils/errors/recoverableToast';

type RecoverableToastEventPayload = {
  title: string;
  message: string;
  code?: string;
};

export function RecoverableToastBridge() {
  const toast = useToast();

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<RecoverableToastEventPayload>;
      const payload = customEvent.detail;
      if (!payload?.message) {
        return;
      }

      toast.warning(payload.message, payload.title || 'Temporary issue');
    };

    window.addEventListener(RECOVERABLE_TOAST_EVENT, handleEvent);
    return () => window.removeEventListener(RECOVERABLE_TOAST_EVENT, handleEvent);
  }, [toast]);

  return null;
}

export default RecoverableToastBridge;
