import { useEffect, useRef } from 'react';

export interface SessionIdleGuardOptions {
  enabled: boolean;
  idleTimeoutMs: number;
  warningLeadMs: number;
  onWarning?: (remainingMs: number) => void;
  onTimeout: () => void;
}

export function useSessionIdleGuard({
  enabled,
  idleTimeoutMs,
  warningLeadMs,
  onWarning,
  onTimeout,
}: SessionIdleGuardOptions): void {
  const warningTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);
  const warnedRef = useRef(false);
  const timedOutRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const warningAtMs = Math.max(0, idleTimeoutMs - warningLeadMs);

    const clearTimers = () => {
      if (warningTimerRef.current !== null) {
        window.clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (timeoutTimerRef.current !== null) {
        window.clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    };

    const scheduleTimers = () => {
      clearTimers();
      warnedRef.current = false;

      warningTimerRef.current = window.setTimeout(() => {
        if (warnedRef.current || timedOutRef.current) return;
        warnedRef.current = true;
        onWarning?.(warningLeadMs);
      }, warningAtMs);

      timeoutTimerRef.current = window.setTimeout(() => {
        if (timedOutRef.current) return;
        timedOutRef.current = true;
        onTimeout();
      }, idleTimeoutMs);
    };

    const handleActivity = () => {
      if (timedOutRef.current) return;
      scheduleTimers();
    };

    scheduleTimers();

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    for (const eventName of events) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const eventName of events) {
        window.removeEventListener(eventName, handleActivity);
      }
    };
  }, [enabled, idleTimeoutMs, warningLeadMs, onTimeout, onWarning]);
}
