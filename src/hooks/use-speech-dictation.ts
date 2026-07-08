import { useCallback, useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal wrapper around the browser SpeechRecognition API for tap-to-toggle
// dictation. Transcribed text is delivered via the `onTranscript` callback so
// the caller decides how to merge it into its input.
// ─────────────────────────────────────────────────────────────────────────────

type SpeechRecognitionAlternativeLike = { transcript: string };

type SpeechRecognitionResultLike =
  ArrayLike<SpeechRecognitionAlternativeLike> & {
    isFinal?: boolean;
  };

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionCtor(): BrowserSpeechRecognitionCtor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const candidate = window as typeof window & {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
  };

  return (
    candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null
  );
}

function joinTranscript(...parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function extractTranscript(event: SpeechRecognitionEventLike) {
  let finalTranscript = "";
  let interimTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    const result = event.results[i];
    const alternative = result?.[0];

    if (alternative?.transcript) {
      if (result?.isFinal === false) {
        interimTranscript += alternative.transcript;
      } else {
        finalTranscript += alternative.transcript;
      }
    }
  }

  return {
    finalTranscript: finalTranscript.trim(),
    interimTranscript: interimTranscript.trim(),
  };
}

export interface UseSpeechDictationResult {
  isSupported: boolean;
  isRecording: boolean;
  start: () => void;
  toggle: () => void;
  stop: () => void;
}

export function useSpeechDictation({
  onTranscript,
  onEnd,
  interimResults = false,
  disabled = false,
}: {
  onTranscript: (text: string) => void;
  onEnd?: (text: string) => void;
  interimResults?: boolean;
  disabled?: boolean;
}): UseSpeechDictationResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef = useRef(onEnd);
  const transcriptBufferRef = useRef("");

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    setIsSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();

    if (!Ctor || disabled) {
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = interimResults;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const { finalTranscript, interimTranscript } = extractTranscript(event);

      transcriptBufferRef.current = joinTranscript(
        transcriptBufferRef.current,
        finalTranscript,
      );
      const transcript = joinTranscript(
        transcriptBufferRef.current,
        interimTranscript,
      );

      if (transcript) {
        onTranscriptRef.current(transcript);
      }
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      const finalTranscript = transcriptBufferRef.current.trim();
      transcriptBufferRef.current = "";
      if (finalTranscript) {
        onEndRef.current?.(finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    transcriptBufferRef.current = "";
    recognition.start();
    setIsRecording(true);
  }, [disabled, interimResults]);

  const toggle = useCallback(() => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  }, [isRecording, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { isSupported, isRecording, start, toggle, stop };
}
