import { describe, expect, it, vi } from "vitest";
import {
  pickPreferredSpeechVoice,
  scoreSpeechVoice,
  waitForSpeechVoices,
} from "@/components/ai-copilot-voice";

function voice(overrides: Partial<SpeechSynthesisVoice>): SpeechSynthesisVoice {
  return {
    default: false,
    lang: "en-US",
    localService: true,
    name: "Test Voice",
    voiceURI: "test-voice",
    ...overrides,
  } as SpeechSynthesisVoice;
}

describe("ai copilot voice selection", () => {
  it("prefers australian english voices when available", () => {
    const usVoice = voice({
      name: "Samantha",
      lang: "en-US",
      default: true,
      localService: false,
    });
    const auVoice = voice({
      name: "Karen",
      lang: "en-AU",
      localService: false,
    });

    expect(pickPreferredSpeechVoice([usVoice, auVoice], "en-US")).toBe(auVoice);
  });

  it("still falls back to the best natural english voice when no australian voice exists", () => {
    const roboticVoice = voice({
      name: "eSpeak Default",
      lang: "en-GB",
    });
    const naturalVoice = voice({
      name: "Samantha",
      lang: "en-US",
      localService: false,
    });

    expect(
      pickPreferredSpeechVoice([roboticVoice, naturalVoice], "en-US"),
    ).toBe(naturalVoice);
  });

  it("gives australian matches a materially higher score than other english voices", () => {
    const auScore = scoreSpeechVoice(
      voice({
        name: "Karen",
        lang: "en-AU",
      }),
      "en-US",
    );
    const usScore = scoreSpeechVoice(
      voice({
        name: "Samantha",
        lang: "en-US",
      }),
      "en-US",
    );

    expect(auScore).toBeGreaterThan(usScore);
  });

  it("returns immediately when voices are already available", async () => {
    const voices = [voice({ name: "Karen", lang: "en-AU" })];
    const synth = {
      getVoices: vi.fn(() => voices),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis;

    await expect(waitForSpeechVoices(synth)).resolves.toBe(voices);
    expect(synth.addEventListener).not.toHaveBeenCalled();
  });

  it("waits briefly for voiceschanged before falling back", async () => {
    vi.useFakeTimers();

    const voices = [voice({ name: "Karen", lang: "en-AU" })];
    let currentVoices: SpeechSynthesisVoice[] = [];
    let handler: (() => void) | null = null;
    const synth = {
      getVoices: vi.fn(() => currentVoices),
      addEventListener: vi.fn((event: string, nextHandler: () => void) => {
        if (event === "voiceschanged") {
          handler = nextHandler;
        }
      }),
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis;

    const pendingVoices = waitForSpeechVoices(synth, 900);

    currentVoices = voices;
    handler?.();

    await expect(pendingVoices).resolves.toBe(voices);
    vi.useRealTimers();
  });
});
