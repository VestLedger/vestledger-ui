"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { ArrowUp, Bot, Mic, Paperclip, X } from "lucide-react";
import { Input, Textarea } from "@/ui";
import { useSpeechDictation } from "@/hooks/use-speech-dictation";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const MIN_ROWS = 1;
const MAX_ROWS = 4;

type VoiceCaptureMode = "tap" | "hold";
type VoiceOverlayPlacement = "composer" | "container";

type AttachedFile = {
  id: string;
  name: string;
  size: number;
};

function ComposerIconButton({
  label,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  type = "button",
  disabled = false,
  active = false,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      disabled={disabled}
      className={cx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-hover hover:text-app-text disabled:cursor-not-allowed disabled:opacity-40 dark:text-app-dark-text-muted dark:hover:bg-app-dark-surface-hover dark:hover:text-app-dark-text",
        active &&
          "bg-app-vesta text-app-surface hover:bg-app-vesta-hover hover:text-app-surface dark:bg-app-dark-vesta dark:text-app-dark-bg dark:hover:bg-app-dark-vesta-hover",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AskVestaComposer({
  query,
  onQueryChange,
  onSubmit,
  onMultilineChange,
  isTyping = false,
  voiceCaptureMode = "tap",
  onVoiceCaptureModeChange,
  voiceOverlayPlacement = "composer",
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (query: string) => void;
  onMultilineChange?: (multiline: boolean) => void;
  isTyping?: boolean;
  voiceCaptureMode?: VoiceCaptureMode;
  onVoiceCaptureModeChange?: (mode: VoiceCaptureMode) => void;
  voiceOverlayPlacement?: VoiceOverlayPlacement;
}) {
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextVoiceSubmitRef = useRef(false);
  const attachmentIdRef = useRef(0);

  const handleTranscript = useCallback(
    (text: string) => {
      onQueryChange(text);
    },
    [onQueryChange],
  );

  const handleVoiceEnd = useCallback(
    (text: string) => {
      if (skipNextVoiceSubmitRef.current) {
        skipNextVoiceSubmitRef.current = false;
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      onSubmit(trimmedText);
      onQueryChange("");
      setAttachments([]);
    },
    [onQueryChange, onSubmit],
  );

  const { isSupported, isRecording, start, stop } = useSpeechDictation({
    onTranscript: handleTranscript,
    onEnd: handleVoiceEnd,
    interimResults: true,
    disabled: isTyping,
  });

  const canSend = query.trim().length > 0 || attachments.length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSend) {
      return;
    }
    if (isRecording) {
      skipNextVoiceSubmitRef.current = true;
    }
    stop();
    onSubmit(query);
    setAttachments([]);
  }, [canSend, isRecording, onSubmit, query, stop]);

  const handleMicClick = useCallback(() => {
    if (voiceCaptureMode !== "tap" || isTyping) return;
    if (isRecording) {
      stop();
      return;
    }
    start();
  }, [isRecording, isTyping, start, stop, voiceCaptureMode]);

  const handleMicPressStart = useCallback(() => {
    if (voiceCaptureMode !== "hold" || isTyping) return;
    start();
  }, [isTyping, start, voiceCaptureMode]);

  const handleMicPressEnd = useCallback(() => {
    if (voiceCaptureMode !== "hold") return;
    stop();
  }, [stop, voiceCaptureMode]);

  const toggleVoiceCaptureMode = useCallback(() => {
    onVoiceCaptureModeChange?.(voiceCaptureMode === "tap" ? "hold" : "tap");
  }, [onVoiceCaptureModeChange, voiceCaptureMode]);

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const next: AttachedFile[] = Array.from(files).map((file) => {
      attachmentIdRef.current += 1;
      return {
        id: `attachment-${attachmentIdRef.current}`,
        name: file.name,
        size: file.size,
      };
    });

    setAttachments((current) => [...current, ...next]);
    // Reset so selecting the same file again still fires onChange.
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((file) => file.id !== id));
  };

  const renderOverlayInsideComposer = voiceOverlayPlacement === "composer";
  const voiceOverlay = isRecording ? (
    <button
      type="button"
      aria-label="Stop voice capture"
      onClick={voiceCaptureMode === "tap" ? stop : undefined}
      className={cx(
        "absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-sm",
        voiceCaptureMode === "tap"
          ? "cursor-pointer"
          : "pointer-events-none cursor-default",
      )}
    >
      <span className="relative mb-3 flex h-24 w-24 items-center justify-center">
        <span className="absolute h-24 w-24 animate-pulse rounded-full bg-app-vesta/25 blur-lg dark:bg-app-dark-vesta/25" />
        <span className="absolute h-20 w-20 animate-ping rounded-full border border-white/35" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-app-vesta text-white shadow-2xl dark:bg-app-dark-vesta">
          <Bot className="h-7 w-7" />
        </span>
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
        Listening
      </span>
      <span className="mt-1 text-xs text-white/70">
        {voiceCaptureMode === "tap" ? "Tap to stop" : "Release to send"}
      </span>
    </button>
  ) : null;

  return (
    <>
      <form
        className={cx(
          "rounded-xl border border-app-border-strong bg-app-surface-2 p-2 dark:border-app-dark-border-strong dark:bg-app-dark-surface-2",
          renderOverlayInsideComposer && "relative overflow-hidden",
        )}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-1 flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={toggleVoiceCaptureMode}
            className="text-xs font-medium text-app-text-muted transition hover:text-app-text dark:text-app-dark-text-muted dark:hover:text-app-dark-text"
          >
            Voice Mode:{" "}
            {voiceCaptureMode === "tap" ? "Tap-to-talk" : "Hold-to-talk"}
          </button>
          {!isSupported ? (
            <span className="text-xs text-app-danger dark:text-app-dark-danger">
              Voice unavailable
            </span>
          ) : null}
        </div>

        {attachments.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-2" aria-label="Attachments">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex max-w-full items-center gap-1.5 rounded-lg border border-app-border bg-app-surface px-2 py-1 text-xs text-app-text dark:border-app-dark-border dark:bg-app-dark-surface dark:text-app-dark-text"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-app-text-muted dark:text-app-dark-text-muted" />
                <span className="max-w-[160px] truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  title={`Remove ${file.name}`}
                  onClick={() => removeAttachment(file.id)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-app-text-muted transition hover:text-app-text dark:text-app-dark-text-muted dark:hover:text-app-dark-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <Textarea
          aria-label="Ask Vesta"
          placeholder="Ask Vesta anything..."
          size="sm"
          minRows={MIN_ROWS}
          maxRows={MAX_ROWS}
          value={query}
          onValueChange={onQueryChange}
          onHeightChange={(height, meta) => {
            const rowHeight = meta?.rowHeight || height;
            const rows = rowHeight > 0 ? Math.round(height / rowHeight) : 1;
            onMultilineChange?.(rows > 1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          className="min-w-0"
          classNames={{
            base: "min-w-0",
            inputWrapper:
              "min-h-9 border-0 bg-transparent px-1 py-1 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
            input:
              "resize-none text-sm leading-5 text-app-text placeholder:text-app-text-muted dark:text-app-dark-text dark:placeholder:text-app-dark-text-muted",
          }}
        />

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ComposerIconButton
              label="Attach files"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </ComposerIconButton>
            <ComposerIconButton
              label={
                !isSupported
                  ? "Voice input not supported in this browser"
                  : isRecording
                    ? "Stop voice capture"
                    : "Start voice capture"
              }
              onClick={handleMicClick}
              onMouseDown={handleMicPressStart}
              onMouseUp={handleMicPressEnd}
              onMouseLeave={handleMicPressEnd}
              onTouchStart={handleMicPressStart}
              onTouchEnd={handleMicPressEnd}
              disabled={!isSupported || isTyping}
              active={isRecording}
            >
              <Mic className={cx("h-4 w-4", isRecording && "animate-pulse")} />
            </ComposerIconButton>
          </div>

          <ComposerIconButton
            label="Send Vesta prompt"
            type="submit"
            disabled={!canSend}
            className="rounded-full bg-app-vesta text-app-surface hover:bg-app-vesta-hover hover:text-app-surface disabled:bg-app-surface-hover disabled:text-app-text-muted dark:bg-app-dark-vesta dark:text-app-dark-bg dark:hover:bg-app-dark-vesta-hover dark:disabled:bg-app-dark-surface-hover dark:disabled:text-app-dark-text-muted"
          >
            <ArrowUp className="h-4 w-4" />
          </ComposerIconButton>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          multiple
          aria-label="Attach files input"
          tabIndex={-1}
          onChange={handleFilesSelected}
          classNames={{ base: "hidden" }}
        />

        {renderOverlayInsideComposer ? voiceOverlay : null}
      </form>
      {renderOverlayInsideComposer ? null : voiceOverlay}
    </>
  );
}
