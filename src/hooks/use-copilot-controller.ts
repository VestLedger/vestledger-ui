"use client";

import type { AppDispatch } from "@/store/store";
import {
  addMessage,
  clearCopilotError,
  clearInputValue,
  copilotError,
  setIsTyping,
  type CopilotMessage,
} from "@/store/slices/copilotSlice";
import {
  type QuickAction,
  type Suggestion,
  getCopilotContextualResponse,
} from "@/services/ai/copilotService";
import { normalizeError } from "@/store/utils/normalizeError";
import { errorTracking } from "@/lib/errorTracking";

let latestCopilotInteractionId = 0;

function nextMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMessage(
  type: CopilotMessage["type"],
  content: string,
): CopilotMessage {
  return {
    id: nextMessageId(),
    type,
    content,
    timestamp: new Date(),
  };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

type CopilotInteractionConfig = {
  dispatch: AppDispatch;
  userContent: string;
  clearInput?: boolean;
  delayMs: number;
  buildResponse: () => Promise<string>;
  trackingContext: Record<string, unknown>;
};

async function runCopilotInteraction({
  dispatch,
  userContent,
  clearInput = false,
  delayMs,
  buildResponse,
  trackingContext,
}: CopilotInteractionConfig) {
  const trimmed = userContent.trim();
  if (!trimmed) return;

  const interactionId = ++latestCopilotInteractionId;
  dispatch(clearCopilotError());
  dispatch(addMessage(createMessage("user", trimmed)));
  if (clearInput) {
    dispatch(clearInputValue());
  }
  dispatch(setIsTyping(true));

  try {
    await wait(delayMs);
    const response = (await buildResponse()).trim();

    if (interactionId !== latestCopilotInteractionId) {
      return;
    }

    dispatch(
      addMessage(
        createMessage(
          "ai",
          response ||
            "I couldn't generate a response right now. Please try again.",
        ),
      ),
    );
    dispatch(setIsTyping(false));
  } catch (error: unknown) {
    if (interactionId !== latestCopilotInteractionId) {
      return;
    }

    errorTracking.captureException(error as Error, {
      extra: trackingContext,
    });
    dispatch(copilotError(normalizeError(error).message));
    dispatch(setIsTyping(false));
  }
}

export function openCopilotWithQuery(
  dispatch: AppDispatch,
  pathname: string,
  query: string,
) {
  return runCopilotInteraction({
    dispatch,
    userContent: query,
    delayMs: 1000,
    buildResponse: () => getCopilotContextualResponse(pathname, query),
    trackingContext: { context: "openCopilotWithQuery", pathname, query },
  });
}

export function sendCopilotMessage(
  dispatch: AppDispatch,
  pathname: string,
  content: string,
) {
  return runCopilotInteraction({
    dispatch,
    userContent: content,
    clearInput: true,
    delayMs: 1000,
    buildResponse: () => getCopilotContextualResponse(pathname, content),
    trackingContext: { context: "sendCopilotMessage", pathname, content },
  });
}

export function invokeCopilotQuickAction(
  dispatch: AppDispatch,
  pathname: string,
  action: QuickAction,
) {
  const label = action.label || action.action || "Quick action";
  const actionText =
    action.action || action.description || `Working on "${label}"`;

  return runCopilotInteraction({
    dispatch,
    userContent: label,
    delayMs: 800,
    buildResponse: async () =>
      `I'm working on "${actionText}". This will take a moment...`,
    trackingContext: {
      context: "invokeCopilotQuickAction",
      pathname,
      actionLabel: label,
    },
  });
}

export function invokeCopilotSuggestion(
  dispatch: AppDispatch,
  suggestion: Suggestion,
) {
  return runCopilotInteraction({
    dispatch,
    userContent: suggestion.text,
    delayMs: 1200,
    buildResponse: async () =>
      `Great choice! I'm ${suggestion.reasoning.toLowerCase()}. Let me prepare that for you...`,
    trackingContext: {
      context: "invokeCopilotSuggestion",
      suggestionText: suggestion.text,
    },
  });
}
