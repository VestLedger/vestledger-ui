"use client";

import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AskVestaComposer } from "@/components/dashboard/ask-vesta-composer";
import type { CopilotMessage } from "@/store/slices/copilotSlice";
import type { VoiceCaptureMode } from "./frame-types";
import { VestaThreadPanel } from "./vesta-thread-panel";

function RailHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-app-vesta dark:text-app-dark-vesta" />
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-app-text dark:text-app-dark-text">
          {title}
        </h2>
        <p className="mt-1 text-xs text-app-text-muted dark:text-app-dark-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

export type VestaCommandRailProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (query: string) => void;
  prompts: string[];
  messages: CopilotMessage[];
  isTyping: boolean;
  error: string | null;
  voiceCaptureMode: VoiceCaptureMode;
  onVoiceCaptureModeChange: (mode: VoiceCaptureMode) => void;
  onSpeakMessage: (message: CopilotMessage) => void;
};

export function VestaCommandRail({
  query,
  onQueryChange,
  onSubmit,
  prompts,
  messages,
  isTyping,
  error,
  voiceCaptureMode,
  onVoiceCaptureModeChange,
  onSpeakMessage,
}: VestaCommandRailProps) {
  return (
    <aside
      aria-label="Vesta command rail"
      className="flex h-full min-w-0 flex-col border-r border-app-border bg-app-sidebar px-5 py-7 dark:border-app-dark-border dark:bg-app-dark-sidebar lg:px-7"
    >
      <div className="flex shrink-0 items-center gap-4">
        <BrandLogo className="h-14 w-14 text-app-vesta dark:text-app-dark-vesta" />
        <div className="text-2xl font-semibold tracking-[0.16em] text-app-text dark:text-app-dark-text">
          VESTLEDGER
        </div>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-app-border pt-5 dark:border-app-dark-border">
        <RailHeading
          icon={Sparkles}
          title="Ask Vesta"
          description="Get instant clarity across your fund."
        />
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <VestaThreadPanel
            messages={messages}
            isTyping={isTyping}
            error={error}
            onSpeakMessage={onSpeakMessage}
          />
          <AskVestaComposer
            query={query}
            onQueryChange={onQueryChange}
            onSubmit={onSubmit}
            isTyping={isTyping}
            voiceCaptureMode={voiceCaptureMode}
            onVoiceCaptureModeChange={onVoiceCaptureModeChange}
          />
        </div>
        <div className="mt-3 grid shrink-0 grid-cols-3 gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSubmit(prompt)}
              className="min-h-10 rounded-lg bg-app-surface-2 px-2 text-[10px] leading-4 text-app-text-muted transition hover:bg-app-surface-hover hover:text-app-text dark:bg-app-dark-surface-2 dark:text-app-dark-text-muted dark:hover:bg-app-dark-surface-hover dark:hover:text-app-dark-text"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
