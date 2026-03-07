'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Maximize2,
  Mic,
  Minimize2,
  Send,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Button, Input } from '@/ui';
import { AICopilotBubble } from './ai-copilot-bubble';
import { useNavigation } from '@/contexts/navigation-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  copilotSuggestionsSelectors,
  setInputValue,
  setShowSuggestions,
} from '@/store/slices/copilotSlice';
import type { QuickAction, Suggestion } from '@/services/ai/copilotService';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';
import { ROUTE_PATHS } from '@/config/routes';
import { useUIKey } from '@/store/ui';
import { UI_STATE_DEFAULTS, UI_STATE_KEYS } from '@/store/constants/uiStateKeys';
import { DEFAULT_LOCALE } from '@/config/i18n';
import {
  invokeCopilotQuickAction,
  invokeCopilotSuggestion,
  openCopilotWithQuery,
  sendCopilotMessage,
} from '@/hooks/use-copilot-controller';
import { loadCopilotSuggestionsOperation } from '@/store/async/dataOperations';

type UITabState = {
  activeTab?: string;
  selectedTab?: string;
  selected?: string;
  viewMode?: string;
  selectedDetailTab?: string;
};

type AICopilotSidebarMode = 'panel' | 'fullscreen' | 'standalone';

type AICopilotSidebarProps = {
  mode?: AICopilotSidebarMode;
};

type VestaShellState = typeof UI_STATE_DEFAULTS.vestaShell;

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

type SpeechRecognitionResultItem = {
  transcript?: string;
};

type SpeechRecognitionResult = {
  isFinal?: boolean;
  0?: SpeechRecognitionResultItem;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};

type SpeechRecognitionErrorLike = {
  error?: string;
};

function getSpeechRecognitionCtor(): BrowserSpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const candidateWindow = window as unknown as {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
  };
  return candidateWindow.SpeechRecognition ?? candidateWindow.webkitSpeechRecognition ?? null;
}

function normalizeLanguageTag(language: string | undefined): string {
  return (language ?? '').trim().toLowerCase();
}

const HUMAN_VOICE_HINTS = [
  'natural',
  'neural',
  'wavenet',
  'enhanced',
  'premium',
  'siri',
  'aria',
  'jenny',
  'guy',
  'samantha',
  'allison',
  'victoria',
  'serena',
  'alex',
  'daniel',
];

const ROBOTIC_VOICE_HINTS = [
  'espeak',
  'festival',
  'flite',
  'mbrola',
  'compact',
  'classic',
  'legacy',
  'robot',
  'default',
];

function scoreSpeechVoice(voice: SpeechSynthesisVoice, preferredLanguage: string): number {
  const voiceName = voice.name.toLowerCase();
  const voiceLanguage = normalizeLanguageTag(voice.lang);
  const preferred = normalizeLanguageTag(preferredLanguage);
  const preferredBase = preferred.split('-')[0];

  let score = 0;

  if (voiceLanguage === preferred) {
    score += 80;
  } else if (preferredBase && (voiceLanguage === preferredBase || voiceLanguage.startsWith(`${preferredBase}-`))) {
    score += 55;
  } else if (voiceLanguage.startsWith('en')) {
    score += 20;
  } else {
    score -= 35;
  }

  if (voice.default) {
    score += 8;
  }

  // In many browsers, remote/cloud voices tend to sound more natural.
  if (!voice.localService) {
    score += 6;
  }

  for (const hint of HUMAN_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score += 22;
    }
  }

  for (const hint of ROBOTIC_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score -= 26;
    }
  }

  return score;
}

function pickPreferredSpeechVoice(
  voices: SpeechSynthesisVoice[],
  preferredLanguage: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const rankedVoices = voices
    .map((voice) => ({
      voice,
      score: scoreSpeechVoice(voice, preferredLanguage),
    }))
    .sort((left, right) => right.score - left.score);

  return rankedVoices[0]?.voice ?? null;
}

function resolveQuickActionLabel(action: QuickAction & { title?: unknown }, index: number): string {
  if (typeof action.label === 'string' && action.label.trim().length > 0) {
    return action.label;
  }

  if (typeof action.title === 'string' && action.title.trim().length > 0) {
    return action.title;
  }

  if (typeof action.action === 'string' && action.action.trim().length > 0) {
    return action.action;
  }

  return `Action ${index + 1}`;
}

function resolveQuickActionIcon(icon: unknown): LucideIcon {
  if (typeof icon === 'function') {
    return icon as LucideIcon;
  }

  if (icon && typeof icon === 'object') {
    const candidate = icon as { $$typeof?: unknown; render?: unknown; type?: unknown };
    if (
      '$$typeof' in candidate
      || typeof candidate.render === 'function'
      || typeof candidate.type === 'function'
    ) {
      return icon as LucideIcon;
    }
  }

  return Zap;
}

type ListeningVestaIconProps = {
  className?: string;
  containerClassName?: string;
  coreClassName?: string;
};

function ListeningVestaIcon({
  className = 'w-3.5 h-3.5',
  containerClassName = 'h-8 w-8',
  coreClassName = 'h-5 w-5',
}: ListeningVestaIconProps) {
  return (
    <div className={`relative flex items-center justify-center ${containerClassName}`}>
      <motion.span
        className="absolute inset-0 rounded-full border border-[var(--app-primary)]"
        animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border border-[var(--app-primary)]"
        animate={{ scale: [1, 1.25], opacity: [0.45, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity, delay: 0.18 }}
      />
      <motion.div
        className={`relative z-10 flex items-center justify-center rounded-full bg-[var(--app-primary)] ${coreClassName}`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}
      >
        <Bot className={`${className} text-white`} />
      </motion.div>
    </div>
  );
}

export function useAICopilot() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { sidebarState, toggleRightSidebar } = useNavigation();
  const { patch: patchVestaShellUI } = useUIKey(
    UI_STATE_KEYS.VESTA_SHELL,
    UI_STATE_DEFAULTS.vestaShell
  );

  const openWithQuery = useCallback(
    (query: string) => {
      patchVestaShellUI({ vestaViewMode: 'sidebar' });
      if (sidebarState.rightCollapsed) {
        toggleRightSidebar();
      }
      void openCopilotWithQuery(dispatch, pathname, query);
    },
    [dispatch, pathname, patchVestaShellUI, sidebarState.rightCollapsed, toggleRightSidebar]
  );

  return { openWithQuery };
}

export function AICopilotSidebar({ mode = 'panel' }: AICopilotSidebarProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { sidebarState, toggleRightSidebar } = useNavigation();
  const density = useDashboardDensity();
  const isPanelMode = mode === 'panel';
  const isCollapsed = isPanelMode ? sidebarState.rightCollapsed : false;

  const { value: vestaShellUI, patch: patchVestaShellUI } = useUIKey(
    UI_STATE_KEYS.VESTA_SHELL,
    UI_STATE_DEFAULTS.vestaShell
  );
  const resolvedVestaShellUI = useMemo(() => {
    const current = (vestaShellUI ?? {}) as Partial<VestaShellState>;
    return {
      ...UI_STATE_DEFAULTS.vestaShell,
      ...current,
      activeThreadContext: {
        ...UI_STATE_DEFAULTS.vestaShell.activeThreadContext,
        ...(current.activeThreadContext ?? {}),
      },
    };
  }, [vestaShellUI]);

  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messages = useAppSelector((state) => state.copilot.messages);
  const inputValue = useAppSelector((state) => state.copilot.inputValue);
  const isTyping = useAppSelector((state) => state.copilot.isTyping);
  const showSuggestions = useAppSelector((state) => state.copilot.showSuggestions);
  const quickActionsOverride = useAppSelector((state) => state.copilot.quickActionsOverride);
  const suggestionsOverride = useAppSelector((state) => state.copilot.suggestionsOverride);

  const suggestionsData = useAppSelector(copilotSuggestionsSelectors.selectData);

  const suggestions = useMemo(() => {
    return suggestionsOverride && suggestionsOverride.length > 0
      ? suggestionsOverride
      : (suggestionsData?.suggestions || []);
  }, [suggestionsData, suggestionsOverride]);

  const quickActions = useMemo(() => {
    return quickActionsOverride && quickActionsOverride.length > 0
      ? quickActionsOverride
      : (suggestionsData?.quickActions || []);
  }, [quickActionsOverride, suggestionsData]);

  const normalizedQuickActions = useMemo(() => {
    return quickActions.map((rawAction, index) => {
      const action = rawAction as QuickAction & { title?: unknown; icon?: unknown };
      return {
        ...action,
        label: resolveQuickActionLabel(action, index),
        icon: resolveQuickActionIcon(action.icon),
      };
    });
  }, [quickActions]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptBufferRef = useRef('');
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const lastVoiceCaptureRequestRef = useRef(0);
  const ttsPrimedRef = useRef(false);

  const primeSpeechSynthesis = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (ttsPrimedRef.current) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

    try {
      const synth = window.speechSynthesis;
      const primer = new SpeechSynthesisUtterance(' ');
      primer.volume = 0;
      synth.speak(primer);
      synth.cancel();
      ttsPrimedRef.current = true;
    } catch {
      // noop
    }
  }, []);

  const speakAssistantReply = useCallback((content: string) => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
    primeSpeechSynthesis();

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.volume = 1;
    const preferredLanguage = normalizeLanguageTag(navigator.language) || 'en-us';
    let speechStarted = false;
    utterance.onstart = () => {
      speechStarted = true;
    };

    const applyPreferredVoice = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return false;
      const preferredVoice = pickPreferredSpeechVoice(voices, preferredLanguage);
      utterance.voice = preferredVoice ?? voices[0];
      utterance.lang = utterance.voice?.lang || preferredLanguage;
      return true;
    };

    const play = () => {
      try {
        synth.cancel();
        synth.resume();
        synth.speak(utterance);

        // Some desktop environments occasionally drop the first utterance.
        // Retry once with a plain fallback voice if speech never begins.
        window.setTimeout(() => {
          if (speechStarted || synth.speaking || synth.pending) return;
          try {
            const fallbackUtterance = new SpeechSynthesisUtterance(content);
            fallbackUtterance.rate = 1;
            fallbackUtterance.pitch = 1;
            fallbackUtterance.volume = 1;
            fallbackUtterance.lang = preferredLanguage;
            synth.cancel();
            synth.resume();
            synth.speak(fallbackUtterance);
          } catch {
            // noop
          }
        }, 350);
      } catch {
        // noop
      }
    };

    const hasPreferredVoice = applyPreferredVoice();
    play();

    // Keep voice selection warm for subsequent speaks without delaying
    // the current utterance (important for click-to-speak user gestures).
    if (!hasPreferredVoice) {
      const onVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        applyPreferredVoice();
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      window.setTimeout(() => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      }, 1000);
    }
  }, [primeSpeechSynthesis]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePrime = () => primeSpeechSynthesis();

    window.addEventListener('pointerdown', handlePrime, { passive: true });
    window.addEventListener('keydown', handlePrime);

    return () => {
      window.removeEventListener('pointerdown', handlePrime);
      window.removeEventListener('keydown', handlePrime);
    };
  }, [primeSpeechSynthesis]);

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      try {
        speechRef.current?.stop();
      } catch {
        // noop
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!resolvedVestaShellUI.ttsEnabled || typeof window === 'undefined') return;
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.type !== 'ai') return;
    if (latestMessage.id === lastSpokenMessageIdRef.current) return;
    lastSpokenMessageIdRef.current = latestMessage.id;
    speakAssistantReply(latestMessage.content);
  }, [messages, resolvedVestaShellUI.ttsEnabled, speakAssistantReply]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (resolvedVestaShellUI.ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // noop
    }
  }, [resolvedVestaShellUI.ttsEnabled]);

  const uiState = useAppSelector((state) => state.ui.byKey);
  const getCurrentTab = useCallback(() => {
    const getTabValue = (key: string, field: keyof UITabState) => {
      const state = uiState[key] as UITabState | undefined;
      return state?.[field] ?? null;
    };

    if (pathname === ROUTE_PATHS.contacts) {
      return getTabValue('crm-contacts', 'activeTab');
    }
    if (pathname === ROUTE_PATHS.lpPortal) {
      return getTabValue('lp-investor-portal', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.lpManagement) {
      return getTabValue('lp-management', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.dealIntelligence) {
      const viewMode = getTabValue('deal-intelligence', 'viewMode');
      if (viewMode === 'per-deal') {
        return getTabValue('deal-intelligence', 'selectedDetailTab');
      }
      return 'fund-level';
    }
    if (pathname === ROUTE_PATHS.fundAdmin) {
      return getTabValue('back-office-fund-admin', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.compliance) {
      return getTabValue('back-office-compliance', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.taxCenter) {
      return getTabValue('back-office-tax-center', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.valuations409a) {
      return getTabValue('back-office-valuation-409a', 'selectedTab');
    }
    if (pathname === ROUTE_PATHS.analytics) {
      return getTabValue('analytics', 'selected');
    }
    if (pathname === ROUTE_PATHS.portfolio) {
      return getTabValue('portfolio', 'selected');
    }
    if (pathname === ROUTE_PATHS.aiTools) {
      return getTabValue('ai-tools', 'selected');
    }
    return null;
  }, [pathname, uiState]);

  const currentTab = getCurrentTab();

  useEffect(() => {
    const contextId = currentTab ? `${pathname}:${currentTab}` : pathname;
    patchVestaShellUI({
      activeThreadContext: {
        contextType: currentTab ? 'route-tab' : 'route',
        contextId,
      },
    });
  }, [currentTab, patchVestaShellUI, pathname]);

  useEffect(() => {
    dispatch(loadCopilotSuggestionsOperation({ pathname, tab: currentTab }));
    dispatch(setShowSuggestions(true));
  }, [dispatch, pathname, currentTab]);

  const handleSendMessage = useCallback(() => {
    primeSpeechSynthesis();
    void sendCopilotMessage(dispatch, pathname, inputValue);
  }, [dispatch, inputValue, pathname, primeSpeechSynthesis]);

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      primeSpeechSynthesis();
      action.onClick?.();
      void invokeCopilotQuickAction(dispatch, pathname, action);
    },
    [dispatch, pathname, primeSpeechSynthesis]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      primeSpeechSynthesis();
      void invokeCopilotSuggestion(dispatch, suggestion);
    },
    [dispatch, primeSpeechSynthesis]
  );

  const handleToggleTts = useCallback(() => {
    const nextEnabled = !resolvedVestaShellUI.ttsEnabled;

    if (typeof window !== 'undefined' && !nextEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // noop
      }
    }

    if (nextEnabled) {
      // Do not replay older assistant responses when unmuting.
      const latestAiMessage = [...messages].reverse().find((message) => message.type === 'ai');
      if (latestAiMessage) {
        lastSpokenMessageIdRef.current = latestAiMessage.id;
      }
      primeSpeechSynthesis();
    }

    patchVestaShellUI({ ttsEnabled: nextEnabled });
  }, [
    messages,
    patchVestaShellUI,
    primeSpeechSynthesis,
    resolvedVestaShellUI.ttsEnabled,
  ]);

  const handleMessageSpeech = useCallback(
    (content: string, type: 'user' | 'ai') => {
      if (type !== 'ai') return;
      const trimmed = content.trim();
      if (!trimmed) return;
      primeSpeechSynthesis();
      speakAssistantReply(trimmed);
    },
    [primeSpeechSynthesis, speakAssistantReply]
  );

  const startVoiceCapture = useCallback(() => {
    if (!speechSupported || isTyping) return;
    if (isRecording) return;

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    if (!speechRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = DEFAULT_LOCALE;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i]?.[0]?.transcript ?? '';
          if (event.results[i]?.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        transcriptBufferRef.current = `${transcriptBufferRef.current} ${finalTranscript}`.trim();
        const combinedTranscript = `${transcriptBufferRef.current} ${interimTranscript}`.trim();
        dispatch(setInputValue(combinedTranscript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        const transcript = transcriptBufferRef.current.trim();
        transcriptBufferRef.current = '';
        if (!transcript) return;
        void sendCopilotMessage(dispatch, pathname, transcript);
      };

      speechRef.current = recognition;
    }

    transcriptBufferRef.current = '';
    setIsRecording(true);
    try {
      speechRef.current.start();
    } catch {
      setIsRecording(false);
    }
  }, [dispatch, isRecording, isTyping, pathname, speechSupported]);

  const stopVoiceCapture = useCallback(() => {
    if (!isRecording) return;
    try {
      speechRef.current?.stop();
    } catch {
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleMicClick = useCallback(() => {
    if (resolvedVestaShellUI.voiceCaptureMode !== 'tap') return;
    if (isRecording) {
      stopVoiceCapture();
      return;
    }
    startVoiceCapture();
  }, [isRecording, resolvedVestaShellUI.voiceCaptureMode, startVoiceCapture, stopVoiceCapture]);

  const handleMicPressStart = useCallback(() => {
    if (resolvedVestaShellUI.voiceCaptureMode !== 'hold') return;
    startVoiceCapture();
  }, [resolvedVestaShellUI.voiceCaptureMode, startVoiceCapture]);

  const handleMicPressEnd = useCallback(() => {
    if (resolvedVestaShellUI.voiceCaptureMode !== 'hold') return;
    stopVoiceCapture();
  }, [resolvedVestaShellUI.voiceCaptureMode, stopVoiceCapture]);

  const handleListeningOverlayClick = useCallback(() => {
    if (resolvedVestaShellUI.voiceCaptureMode !== 'tap') return;
    stopVoiceCapture();
  }, [resolvedVestaShellUI.voiceCaptureMode, stopVoiceCapture]);

  useEffect(() => {
    const requestNonce =
      typeof resolvedVestaShellUI.voiceCaptureRequestNonce === 'number'
        ? resolvedVestaShellUI.voiceCaptureRequestNonce
        : 0;

    if (requestNonce <= 0) return;
    if (requestNonce === lastVoiceCaptureRequestRef.current) return;

    lastVoiceCaptureRequestRef.current = requestNonce;
    startVoiceCapture();
    patchVestaShellUI({ voiceCaptureRequestNonce: 0 });
  }, [patchVestaShellUI, resolvedVestaShellUI.voiceCaptureRequestNonce, startVoiceCapture]);

  const handleOpenFromBubble = useCallback(() => {
    patchVestaShellUI({ vestaViewMode: 'sidebar' });
    toggleRightSidebar();
  }, [patchVestaShellUI, toggleRightSidebar]);

  const handleMinimize = useCallback(() => {
    patchVestaShellUI({ vestaViewMode: 'collapsed' });
    toggleRightSidebar();
  }, [patchVestaShellUI, toggleRightSidebar]);

  const handleEnterFullscreen = useCallback(() => {
    if (sidebarState.rightCollapsed) {
      toggleRightSidebar();
    }
    patchVestaShellUI({ vestaViewMode: 'fullscreen' });
  }, [patchVestaShellUI, sidebarState.rightCollapsed, toggleRightSidebar]);

  const handleExitFullscreen = useCallback(() => {
    patchVestaShellUI({ vestaViewMode: 'sidebar' });
  }, [patchVestaShellUI]);

  const copilotHeaderPaddingClass = density.mode === 'compact' ? 'px-3' : 'px-4';
  const canShowMinimize = mode === 'panel';
  const canShowFullscreenToggle = mode !== 'standalone';

  if (isCollapsed) {
    return <AICopilotBubble onClick={handleOpenFromBubble} />;
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div
        className={`flex items-center justify-between gap-2 ${copilotHeaderPaddingClass} border-b border-[var(--app-border)] bg-gradient-to-r from-[var(--app-primary-bg)] to-transparent`}
        style={{ height: `${density.shell.topBarHeightPx}px` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-transparent flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Vesta</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleTts}
            className="p-1.5 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
            aria-label={resolvedVestaShellUI.ttsEnabled ? 'Disable spoken replies' : 'Enable spoken replies'}
            title={resolvedVestaShellUI.ttsEnabled ? 'Disable spoken replies' : 'Enable spoken replies'}
            type="button"
          >
            {resolvedVestaShellUI.ttsEnabled ? (
              <Volume2 className="w-4 h-4 text-[var(--app-text-muted)]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[var(--app-text-muted)]" />
            )}
          </button>
          {canShowFullscreenToggle && (
            <button
              onClick={mode === 'fullscreen' ? handleExitFullscreen : handleEnterFullscreen}
              className="p-1.5 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
              aria-label={mode === 'fullscreen' ? 'Exit full width Vesta mode' : 'Expand Vesta to full width'}
              title={mode === 'fullscreen' ? 'Exit full width' : 'Expand to full width'}
            >
              {mode === 'fullscreen' ? (
                <Minimize2 className="w-4 h-4 text-[var(--app-text-muted)]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[var(--app-text-muted)]" />
              )}
            </button>
          )}
          {canShowMinimize && (
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
              aria-label="Minimize Vesta"
            >
              <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className={`${density.shell.copilotSectionPaddingClass} border-b border-[var(--app-border)] space-y-2`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--app-warning)]" />
              <span className="text-xs font-semibold text-[var(--app-text-muted)]">SUGGESTIONS</span>
            </div>
            <button
              onClick={() => dispatch(setShowSuggestions(!showSuggestions))}
              className="p-1 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
              aria-label="Toggle suggestions visibility"
            >
              <ChevronDown
                className={`w-4 h-4 text-[var(--app-text-muted)] transition-transform ${showSuggestions ? '' : '-rotate-90'}`}
              />
            </button>
          </div>
          {showSuggestions &&
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-border)] transition-colors"
              >
                <p className="text-sm text-[var(--app-text)] mb-1">{suggestion.text}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--app-text-subtle)]">{suggestion.reasoning}</p>
                </div>
              </button>
            ))}
        </div>
      )}

      <div className={`${density.shell.copilotSectionPaddingClass} border-b border-[var(--app-border)]`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[var(--app-primary)]" />
          <span className="text-xs font-semibold text-[var(--app-text-muted)]">QUICK ACTIONS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalizedQuickActions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant="flat"
              onPress={() => handleQuickAction(action)}
              title={action.description || action.action}
              className={`text-xs ${action.aiSuggested ? 'bg-[var(--app-primary-bg)]' : ''}`}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${density.shell.copilotSectionPaddingClass} space-y-4`}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' ? (
              <button
                type="button"
                onClick={() => handleMessageSpeech(message.content, message.type)}
                title="Tap to hear this response"
                className="max-w-[85%] rounded-lg bg-[var(--app-surface-hover)] px-3 py-2 text-left text-[var(--app-text)] transition-colors hover:bg-[var(--app-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
              >
                <p className="text-sm">{message.content}</p>
              </button>
            ) : (
              <div className="max-w-[85%] rounded-lg bg-[var(--app-primary)] px-3 py-2 text-white">
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[var(--app-surface-hover)] px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={density.shell.copilotInputPaddingClass}>
        <div className="flex items-center justify-between mb-2">
          <button
            className="text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            onClick={() =>
              patchVestaShellUI({
                voiceCaptureMode: resolvedVestaShellUI.voiceCaptureMode === 'tap' ? 'hold' : 'tap',
              })
            }
            type="button"
          >
            Voice Mode: {resolvedVestaShellUI.voiceCaptureMode === 'tap' ? 'Tap-to-talk' : 'Hold-to-talk'}
          </button>
          {!speechSupported && (
            <span className="text-xs text-[var(--app-danger)]">Voice unavailable</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => dispatch(setInputValue(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            size="sm"
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            size="sm"
            onPress={handleMicClick}
            onMouseDown={handleMicPressStart}
            onMouseUp={handleMicPressEnd}
            onMouseLeave={handleMicPressEnd}
            onTouchStart={handleMicPressStart}
            onTouchEnd={handleMicPressEnd}
            disabled={!speechSupported || isTyping}
            aria-label={isRecording ? 'Stop voice capture' : 'Start voice capture'}
            className={`px-3 ${isRecording ? 'bg-[var(--app-primary)] text-white' : ''}`}
            type="button"
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
          <Button
            size="sm"
            onPress={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isRecording && (
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleListeningOverlayClick}
          aria-label={resolvedVestaShellUI.voiceCaptureMode === 'tap' ? 'Stop voice capture' : undefined}
          className={`absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm ${
            resolvedVestaShellUI.voiceCaptureMode === 'tap' ? 'cursor-pointer' : 'pointer-events-none cursor-default'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.20) 0%, rgba(15, 23, 42, 0.62) 72%)',
          }}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.95, 1.08, 0.95] }}
                transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                style={{ backgroundColor: 'var(--app-primary)' }}
              />
              <ListeningVestaIcon
                containerClassName="h-40 w-40"
                coreClassName="h-20 w-20"
                className="h-10 w-10"
              />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">Listening</p>
          </div>
        </motion.button>
      )}
    </div>
  );
}
