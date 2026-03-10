"use client";

import type { NormalizedError } from "@/store/types/AsyncState";
import { emitRecoverableErrorToast } from "@/utils/errors/recoverableToast";
import { logger } from "@/lib/logger";

export type UnavailableActionId = string;

export interface UnavailableActionContext {
  source: string;
  route?: string;
  uiLocation?: string;
  auditRowId?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  details?: Record<string, unknown>;
}

export class UnavailableActionError extends Error {
  readonly code = "UNAVAILABLE_ACTION";
  readonly actionId: UnavailableActionId;
  readonly context: UnavailableActionContext;

  constructor(
    actionId: UnavailableActionId,
    context: UnavailableActionContext,
    message?: string,
  ) {
    super(message ?? "This action is not available yet.");
    this.name = "UnavailableActionError";
    this.actionId = actionId;
    this.context = context;
  }
}

export function isUnavailableActionError(
  error: unknown,
): error is UnavailableActionError {
  return error instanceof UnavailableActionError;
}

function toNormalizedError(error: UnavailableActionError): NormalizedError {
  return {
    message: error.message,
    code: error.code,
    details: {
      actionId: error.actionId,
      ...error.context,
    },
  };
}

export function createUnavailableActionError(
  actionId: UnavailableActionId,
  context: UnavailableActionContext,
  message?: string,
): UnavailableActionError {
  const error = new UnavailableActionError(actionId, context, message);
  logger.warn("Guarded TODO API action invoked", {
    component: "unavailableAction",
    actionId,
    ...context,
  });
  emitRecoverableErrorToast(toNormalizedError(error), {
    title: "Action not available yet",
    fallbackMessage:
      "This workflow is planned but not wired to a backend endpoint yet.",
    context: context.source,
  });
  return error;
}

export function invokeUnavailableAction(
  actionId: UnavailableActionId,
  context: UnavailableActionContext,
  message?: string,
): never {
  throw createUnavailableActionError(actionId, context, message);
}
