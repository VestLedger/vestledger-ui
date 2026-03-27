import { describe, expect, it } from "vitest";
import { getManualSpeechRequest } from "@/components/ai-copilot-speech";
import type { CopilotMessage } from "@/store/slices/copilotSlice";

const messages: CopilotMessage[] = [
  {
    id: "m1",
    type: "ai",
    content: "Welcome back.",
    timestamp: new Date("2026-03-26T00:00:00Z"),
  },
  {
    id: "m2",
    type: "user",
    content: "Show me active deals.",
    timestamp: new Date("2026-03-26T00:00:01Z"),
  },
  {
    id: "m3",
    type: "ai",
    content: "Here are your active deals.",
    timestamp: new Date("2026-03-26T00:00:02Z"),
  },
];

describe("getManualSpeechRequest", () => {
  it("enables TTS and suppresses replay when a user clicks an ai bubble while muted", () => {
    expect(
      getManualSpeechRequest({
        content: "  Here are your active deals.  ",
        type: "ai",
        messages,
        ttsEnabled: false,
      }),
    ).toEqual({
      playbackContent: "Here are your active deals.",
      shouldEnableTts: true,
      suppressReplayMessageId: "m3",
    });
  });

  it("speaks immediately without forcing a TTS state change when already enabled", () => {
    expect(
      getManualSpeechRequest({
        content: "Welcome back.",
        type: "ai",
        messages,
        ttsEnabled: true,
      }),
    ).toEqual({
      playbackContent: "Welcome back.",
      shouldEnableTts: false,
      suppressReplayMessageId: null,
    });
  });

  it("ignores non-ai or empty messages", () => {
    expect(
      getManualSpeechRequest({
        content: "Show me active deals.",
        type: "user",
        messages,
        ttsEnabled: false,
      }),
    ).toBeNull();

    expect(
      getManualSpeechRequest({
        content: "   ",
        type: "ai",
        messages,
        ttsEnabled: false,
      }),
    ).toBeNull();
  });
});
