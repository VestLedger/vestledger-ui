import type { CopilotMessage } from "@/store/slices/copilotSlice";

type ManualSpeechRequestParams = {
  content: string;
  type: CopilotMessage["type"];
  messages: CopilotMessage[];
  ttsEnabled: boolean;
};

type ManualSpeechRequest = {
  playbackContent: string;
  shouldEnableTts: boolean;
  suppressReplayMessageId: string | null;
};

export function getManualSpeechRequest({
  content,
  type,
  messages,
  ttsEnabled,
}: ManualSpeechRequestParams): ManualSpeechRequest | null {
  if (type !== "ai") return null;

  const playbackContent = content.trim();
  if (!playbackContent) return null;

  const latestAiMessage = [...messages]
    .reverse()
    .find((message) => message.type === "ai");

  return {
    playbackContent,
    shouldEnableTts: !ttsEnabled,
    suppressReplayMessageId: !ttsEnabled ? (latestAiMessage?.id ?? null) : null,
  };
}
