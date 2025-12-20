import { all, call, delay, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import type { RootState } from '@/store/rootReducer';
import { patchUIState, setUIState } from '@/store/slices/uiSlice';
import {
  clientMounted,
  ddChatSendRequested,
  decisionWriterCopyRequested,
  decisionWriterGenerateRequested,
  eoiSubmitRequested,
  pitchDeckUploadRequested,
  reportExportRequested,
  startupApplicationSubmitRequested,
} from '@/store/slices/uiEffectsSlice';
import { getDDChatAssistantResponse, getInitialDDChatConversation, type Message } from '@/services/ai/ddChatService';
import {
  type DealInfo,
  type DecisionWriterTone,
  type RejectionReason,
  generateRejectionLetter,
  getDecisionWriterRejectionReasons,
  getDecisionWriterSeedDealInfo,
} from '@/services/ai/decisionWriterService';
import { calculateBadges, type BadgeData } from '@/services/ai/aiBadgesService';
import type { ExportJob, ReportTemplate } from '@/services/reports/reportExportService';

type EOIState = { submitted: boolean; loading: boolean };
type StartupApplicationState = { isSubmitting: boolean; isSubmitted: boolean };
type PitchDeckReaderState = { isUploading: boolean };
type DDChatState = { messages: Message[]; inputValue: string; isTyping: boolean };
type ReportExportState = {
  selectedTemplate: ReportTemplate | null;
  exportFormat: 'pdf' | 'excel' | 'csv' | 'ppt';
  exportJobs: ExportJob[];
};
type DecisionWriterState = {
  dealInfo: DealInfo;
  reasons: RejectionReason[];
  customReason: string;
  tone: DecisionWriterTone;
  generatedLetter: string;
  isGenerating: boolean;
  letterCopied: boolean;
};

type SagaGenerator = Generator<unknown, void, any>;

const selectUIKey =
  <T>(key: string) =>
  (state: RootState) =>
    state.ui.byKey[key] as T | undefined;

function* eoiSubmitWorker(): SagaGenerator {
  const key = 'public:eoi';
  const stored = (yield select(selectUIKey<EOIState>(key))) as EOIState | undefined;
  const current: EOIState = stored ?? { submitted: false, loading: false };
  if (current.loading || current.submitted) return;

  yield put(patchUIState({ key, patch: { loading: true } }));
  yield delay(1500);
  yield put(patchUIState({ key, patch: { loading: false, submitted: true } }));
}

function* startupApplicationSubmitWorker(): SagaGenerator {
  const key = 'startup-application-form';
  const stored = (yield select(selectUIKey<StartupApplicationState>(key))) as
    | StartupApplicationState
    | undefined;
  const current: StartupApplicationState = stored ?? { isSubmitting: false, isSubmitted: false };
  if (current.isSubmitting) return;

  yield put(patchUIState({ key, patch: { isSubmitting: true } }));
  yield delay(1500);
  yield put(patchUIState({ key, patch: { isSubmitting: false, isSubmitted: true } }));
}

function* pitchDeckUploadWorker(): SagaGenerator {
  const key = 'pitch-deck-reader';
  const stored = (yield select(selectUIKey<PitchDeckReaderState>(key))) as PitchDeckReaderState | undefined;
  const current: PitchDeckReaderState = stored ?? { isUploading: false };
  if (current.isUploading) return;

  yield put(patchUIState({ key, patch: { isUploading: true } }));
  yield delay(2000);
  yield put(patchUIState({ key, patch: { isUploading: false } }));
}

function* decisionWriterGenerateWorker(): SagaGenerator {
  const key = 'decision-writer';
  const stored = (yield select(selectUIKey<DecisionWriterState>(key))) as DecisionWriterState | undefined;
  const current: DecisionWriterState =
    stored ?? {
      dealInfo: getDecisionWriterSeedDealInfo(),
      reasons: getDecisionWriterRejectionReasons(),
      customReason: '',
      tone: 'warm' as DecisionWriterTone,
      generatedLetter: '',
      isGenerating: false,
      letterCopied: false,
    };

  if (current.isGenerating) return;

  yield put(patchUIState({ key, patch: { isGenerating: true } }));
  yield delay(2000);

  const selectedReasons = current.reasons.filter((reason) => reason.selected);
  const letter = generateRejectionLetter(current.dealInfo, selectedReasons, current.customReason, current.tone);
  yield put(patchUIState({ key, patch: { generatedLetter: letter, isGenerating: false } }));
}

function* decisionWriterCopyWorker(): SagaGenerator {
  const key = 'decision-writer';
  const current = (yield select(selectUIKey<DecisionWriterState>(key))) as DecisionWriterState | undefined;
  const text = current?.generatedLetter?.trim();
  if (!text) return;

  try {
    yield call([navigator.clipboard, navigator.clipboard.writeText], text);
  } catch {
    // ignore clipboard errors for mock flow
  }

  yield put(patchUIState({ key, patch: { letterCopied: true } }));
  yield delay(2000);
  yield put(patchUIState({ key, patch: { letterCopied: false } }));
}

function* ddChatSendWorker(
  action: ReturnType<typeof ddChatSendRequested>
): SagaGenerator {
  const { key, query, dealName } = action.payload;
  const trimmed = query.trim();
  if (!trimmed) return;

  const stored = (yield select(selectUIKey<DDChatState>(key))) as DDChatState | undefined;
  const current: DDChatState =
    stored ?? {
      messages: getInitialDDChatConversation({ dealId: 0 }), // Placeholder params
      inputValue: '',
      isTyping: false,
    };
  if (current.isTyping) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: trimmed,
    timestamp: new Date(),
  };

  const nextMessages = [...current.messages, userMessage];
  yield put(
    patchUIState({
      key,
      patch: { messages: nextMessages, inputValue: '', isTyping: true },
    })
  );

  yield delay(1500);

  const aiResponse = getDDChatAssistantResponse(trimmed, dealName);
  const latest = (yield select(selectUIKey<DDChatState>(key))) as DDChatState | undefined;
  const latestValue = latest ?? current;
  const latestMessages = latestValue.messages ?? nextMessages;
  yield put(
    patchUIState({
      key,
      patch: { messages: [...latestMessages, aiResponse], isTyping: false },
    })
  );
}

function* reportExportWorker(): SagaGenerator {
  const key = 'report-export';
  const current = (yield select(selectUIKey<ReportExportState>(key))) as ReportExportState | undefined;
  if (!current?.selectedTemplate) return;

  const newJob: ExportJob = {
    id: Date.now().toString(),
    reportName: current.selectedTemplate.name,
    format: current.exportFormat.toUpperCase(),
    status: 'processing',
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  const existingJobs = current.exportJobs ?? [];
  yield put(patchUIState({ key, patch: { exportJobs: [newJob, ...existingJobs] } }));

  let progress = 0;
  while (progress < 100) {
    yield delay(500);
    progress += 20;

    const latest = (yield select(selectUIKey<ReportExportState>(key))) as ReportExportState | undefined;
    const latestJobs = latest?.exportJobs ?? [newJob, ...existingJobs];

    const updatedJobs = latestJobs.map((job) => {
      if (job.id !== newJob.id) return job;
      if (progress >= 100) {
        return { ...job, status: 'completed', progress: 100, downloadUrl: '#' };
      }
      return { ...job, progress };
    });

    yield put(patchUIState({ key, patch: { exportJobs: updatedJobs } }));
  }
}

function* aiBadgesLoop(): SagaGenerator {
  const key = 'ai-badges';
  while (true) {
    const badges: BadgeData = calculateBadges();
    yield put(setUIState({ key, value: badges }));
    yield delay(60000);
  }
}

export function* uiEffectsSaga(): SagaGenerator {
  if (typeof window !== 'undefined') {
    yield take(clientMounted.type);
  }
  yield all([
    call(aiBadgesLoop),
    takeLatest(eoiSubmitRequested.type, eoiSubmitWorker),
    takeLatest(startupApplicationSubmitRequested.type, startupApplicationSubmitWorker),
    takeLatest(pitchDeckUploadRequested.type, pitchDeckUploadWorker),
    takeLatest(decisionWriterGenerateRequested.type, decisionWriterGenerateWorker),
    takeLatest(decisionWriterCopyRequested.type, decisionWriterCopyWorker),
    takeEvery(ddChatSendRequested.type, ddChatSendWorker),
    takeEvery(reportExportRequested.type, reportExportWorker),
  ]);
}
