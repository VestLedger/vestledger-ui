import { call, delay, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  addMessage,
  clearInputValue,
  openWithQueryRequested,
  quickActionInvoked,
  sendMessageRequested,
  setIsTyping,
  suggestionInvoked,
  copilotSuggestionsRequested,
  copilotSuggestionsLoaded,
  copilotSuggestionsFailed,
  copilotError,
  type CopilotMessage,
} from '@/store/slices/copilotSlice';
import {
  type QuickAction,
  type Suggestion,
  getCopilotContextualResponse,
  getCopilotSuggestionsAndActions,
} from '@/services/ai/copilotService';
import { normalizeError } from '@/store/utils/normalizeError';
import { errorTracking } from '@/lib/errorTracking';

const randomConfidence = () => Math.random() * 0.2 + 0.75;
const nextId = () => Date.now().toString();

export function* openWithQueryWorker(action: ReturnType<typeof openWithQueryRequested>) {
  const { pathname, query } = action.payload;

  try {
    const userMessage: CopilotMessage = {
      id: nextId(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    yield put(addMessage(userMessage));
    yield put(setIsTyping(true));

    yield delay(1000 + Math.random() * 1000);

    const aiMessage: CopilotMessage = {
      id: nextId(),
      type: 'ai',
      content: getCopilotContextualResponse(pathname, query),
      timestamp: new Date(),
      confidence: randomConfidence(),
    };

    yield put(addMessage(aiMessage));
    yield put(setIsTyping(false));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'openWithQueryWorker', pathname, query },
    });
    yield put(copilotError(normalizeError(error).message));
    yield put(setIsTyping(false));
  }
}

export function* sendMessageWorker(action: ReturnType<typeof sendMessageRequested>) {
  const { pathname, content } = action.payload;
  const trimmed = content.trim();
  if (!trimmed) return;

  try {
    const userMessage: CopilotMessage = {
      id: nextId(),
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    yield put(addMessage(userMessage));
    yield put(clearInputValue());
    yield put(setIsTyping(true));

    yield delay(1000 + Math.random() * 1000);

    const aiMessage: CopilotMessage = {
      id: nextId(),
      type: 'ai',
      content: getCopilotContextualResponse(pathname, trimmed),
      timestamp: new Date(),
      confidence: randomConfidence(),
    };

    yield put(addMessage(aiMessage));
    yield put(setIsTyping(false));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'sendMessageWorker', pathname, content: trimmed },
    });
    yield put(copilotError(normalizeError(error).message));
    yield put(setIsTyping(false));
  }
}

export function* quickActionWorker(action: ReturnType<typeof quickActionInvoked>) {
  const quickAction: QuickAction = action.payload.action;

  try {
    const userMessage: CopilotMessage = {
      id: nextId(),
      type: 'user',
      content: quickAction.label,
      timestamp: new Date(),
    };

    yield put(addMessage(userMessage));
    yield put(setIsTyping(true));

    yield delay(800);

    const actionText =
      quickAction.action || quickAction.description || `Working on "${quickAction.label}"`;
    const aiMessage: CopilotMessage = {
      id: nextId(),
      type: 'ai',
      content: `I'm working on "${actionText}". This will take a moment...`,
      timestamp: new Date(),
      confidence: quickAction.confidence ?? 0.88,
    };

    yield put(addMessage(aiMessage));
    yield put(setIsTyping(false));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'quickActionWorker', actionLabel: quickAction.label },
    });
    yield put(copilotError(normalizeError(error).message));
    yield put(setIsTyping(false));
  }
}

export function* suggestionWorker(action: ReturnType<typeof suggestionInvoked>) {
  const suggestion: Suggestion = action.payload.suggestion;

  try {
    const userMessage: CopilotMessage = {
      id: nextId(),
      type: 'user',
      content: suggestion.text,
      timestamp: new Date(),
    };

    yield put(addMessage(userMessage));
    yield put(setIsTyping(true));

    yield delay(1200);

    const aiMessage: CopilotMessage = {
      id: nextId(),
      type: 'ai',
      content: `Great choice! I'm ${suggestion.reasoning.toLowerCase()}. Let me prepare that for you...`,
      timestamp: new Date(),
      confidence: suggestion.confidence,
    };

    yield put(addMessage(aiMessage));
    yield put(setIsTyping(false));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'suggestionWorker', suggestionText: suggestion.text },
    });
    yield put(copilotError(normalizeError(error).message));
    yield put(setIsTyping(false));
  }
}

/**
 * Worker saga: Load copilot suggestions and quick actions
 */
export function* loadCopilotSuggestionsWorker(
  action: ReturnType<typeof copilotSuggestionsRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const data = yield call(getCopilotSuggestionsAndActions, params);
    yield put(copilotSuggestionsLoaded(data));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'loadCopilotSuggestionsWorker', params: action.payload },
    });
    yield put(copilotSuggestionsFailed(normalizeError(error)));
  }
}

/**
 * Root copilot saga
 */
export function* copilotSaga() {
  yield takeLatest(openWithQueryRequested.type, openWithQueryWorker);
  yield takeLatest(sendMessageRequested.type, sendMessageWorker);
  yield takeLatest(quickActionInvoked.type, quickActionWorker);
  yield takeLatest(suggestionInvoked.type, suggestionWorker);
  yield takeLatest(copilotSuggestionsRequested.type, loadCopilotSuggestionsWorker);
}
