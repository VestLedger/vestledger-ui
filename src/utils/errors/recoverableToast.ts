"use client";

import type { NormalizedError } from "@/store/types/AsyncState";
import { logger } from "@/lib/logger";

export const RECOVERABLE_TOAST_EVENT = "vestledger:recoverable-error-toast";
const RECOVERABLE_TOAST_TTL_MS = 8_000;

type RecoverableToastEventPayload = {
  title: string;
  message: string;
  code?: string;
};

const lastShownByKey = new Map<string, number>();

function getPathname(): string {
  if (typeof window === "undefined") {
    return "server";
  }
  return window.location.pathname || "/";
}

function buildToastKey(message: string, code?: string): string {
  return `${getPathname()}|${code ?? "UNKNOWN"}|${message}`;
}

function shouldEmitToast(key: string, now: number): boolean {
  const lastShownAt = lastShownByKey.get(key);
  if (!lastShownAt) {
    lastShownByKey.set(key, now);
    return true;
  }

  if (now - lastShownAt < RECOVERABLE_TOAST_TTL_MS) {
    return false;
  }

  lastShownByKey.set(key, now);
  return true;
}

function emitToastEvent(payload: RecoverableToastEventPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<RecoverableToastEventPayload>(RECOVERABLE_TOAST_EVENT, {
      detail: payload,
    }),
  );
}

export function emitRecoverableErrorToast(
  error: NormalizedError,
  options?: { title?: string; fallbackMessage?: string; context?: string },
): boolean {
  const message =
    error.message?.trim() ||
    options?.fallbackMessage ||
    "Unable to load the latest data.";
  const key = buildToastKey(message, error.code);
  const now = Date.now();

  logger.warn("Recoverable error encountered", {
    component: "recoverableToast",
    context: options?.context,
    code: error.code,
    message,
    details: error.details,
    route: getPathname(),
  });

  if (!shouldEmitToast(key, now)) {
    return false;
  }

  emitToastEvent({
    title: options?.title ?? "Temporary issue",
    message,
    code: error.code,
  });
  return true;
}

export function __resetRecoverableToastStateForTests(): void {
  lastShownByKey.clear();
}
