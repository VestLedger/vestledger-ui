"use client";

import { Volume2 } from "lucide-react";
import type { CopilotMessage } from "@/store/slices/copilotSlice";
import { cx } from "./cx";

export type VestaThreadPanelProps = {
  messages: CopilotMessage[];
  isTyping: boolean;
  error: string | null;
  onSpeakMessage: (message: CopilotMessage) => void;
  testId?: string;
};

export function VestaThreadPanel({
  messages,
  isTyping,
  error,
  onSpeakMessage,
  testId = "vesta-thread-panel",
}: VestaThreadPanelProps) {
  return (
    <div
      data-testid={testId}
      className="mb-3 min-h-[220px] flex-1 space-y-2 overflow-y-auto rounded-xl border border-app-border bg-app-surface px-3 py-3 dark:border-app-dark-border dark:bg-app-dark-surface"
      aria-live="polite"
      role="log"
    >
      {messages.map((message) => {
        const isUser = message.type === "user";

        return (
          <div
            key={message.id}
            className={cx("flex", isUser ? "justify-end" : "justify-start")}
          >
            <div
              className={cx(
                "group flex max-w-[88%] items-start gap-1.5 rounded-lg px-3 py-2 text-xs leading-5",
                isUser
                  ? "bg-app-vesta text-app-surface dark:bg-app-dark-vesta dark:text-app-dark-bg"
                  : "bg-app-surface-2 text-app-text dark:bg-app-dark-surface-2 dark:text-app-dark-text",
              )}
            >
              <p>{message.content}</p>
              {!isUser ? (
                <button
                  type="button"
                  aria-label="Play Vesta response"
                  title="Play Vesta response"
                  onClick={() => onSpeakMessage(message)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-app-text-muted opacity-0 transition hover:bg-app-surface-hover hover:text-app-text group-hover:opacity-100 focus-visible:opacity-100 dark:text-app-dark-text-muted dark:hover:bg-app-dark-surface-hover dark:hover:text-app-dark-text"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}

      {isTyping ? (
        <div className="flex justify-start">
          <div className="rounded-lg bg-app-surface-2 px-3 py-2 text-xs text-app-text-muted dark:bg-app-dark-surface-2 dark:text-app-dark-text-muted">
            Vesta is thinking
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-app-danger bg-app-danger-light px-3 py-2 text-xs text-app-danger dark:border-app-dark-danger dark:bg-app-dark-danger-light dark:text-app-dark-danger">
          {error}
        </div>
      ) : null}
    </div>
  );
}
