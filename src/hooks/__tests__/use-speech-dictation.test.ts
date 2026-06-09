import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechDictation } from "../use-speech-dictation";

type ResultHandler = ((event: unknown) => void) | null;

class MockRecognition {
  lang = "";
  interimResults = false;
  continuous = false;
  onresult: ResultHandler = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    instances.push(this);
  }
}

let instances: MockRecognition[] = [];

const win = window as typeof window & {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

describe("useSpeechDictation", () => {
  beforeEach(() => {
    instances = [];
    win.SpeechRecognition = MockRecognition;
  });

  afterEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  it("reports support when a recognition constructor exists", () => {
    const { result } = renderHook(() =>
      useSpeechDictation({ onTranscript: vi.fn() }),
    );

    expect(result.current.isSupported).toBe(true);
  });

  it("reports no support when the API is unavailable", () => {
    delete win.SpeechRecognition;

    const { result } = renderHook(() =>
      useSpeechDictation({ onTranscript: vi.fn() }),
    );

    expect(result.current.isSupported).toBe(false);
  });

  it("starts and stops recording on toggle", () => {
    const { result } = renderHook(() =>
      useSpeechDictation({ onTranscript: vi.fn() }),
    );

    act(() => result.current.toggle());
    expect(instances).toHaveLength(1);
    expect(instances[0].start).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(true);

    act(() => result.current.toggle());
    expect(instances[0].stop).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(false);
  });

  it("delivers the recognized transcript via onTranscript", () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechDictation({ onTranscript }));

    act(() => result.current.toggle());
    act(() => {
      instances[0].onresult?.({
        resultIndex: 0,
        results: [[{ transcript: "show me the pipeline" }]],
      });
    });

    expect(onTranscript).toHaveBeenCalledWith("show me the pipeline");
  });

  it("aborts the recognition on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useSpeechDictation({ onTranscript: vi.fn() }),
    );

    act(() => result.current.toggle());
    unmount();

    expect(instances[0].abort).toHaveBeenCalledTimes(1);
  });
});
