"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { CopilotMessage } from "@/store/slices/copilotSlice";
import { openCopilotWithQuery } from "@/hooks/use-copilot-controller";
import { useUIKey } from "@/store/ui";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import type { VoiceCaptureMode } from "./frame-types";
import { RedesignedAppFrame } from "./redesigned-app-frame";
import { RedesignedTopbar } from "./redesigned-topbar";
import { VestaCommandRail } from "./vesta-command-rail";

type RedesignedFrameVestaContextValue = {
  submitVestaQuery: (query: string) => void;
};

const RedesignedFrameVestaContext =
  createContext<RedesignedFrameVestaContextValue | null>(null);

export function useRedesignedFrameVesta(): RedesignedFrameVestaContextValue {
  const context = useContext(RedesignedFrameVestaContext);
  if (!context) {
    throw new Error(
      "useRedesignedFrameVesta must be used inside RedesignedFrameShell",
    );
  }
  return context;
}

export type RedesignedFrameShellProps = {
  title: string;
  prompts: string[];
  rightRail?: ReactNode;
  children: ReactNode;
};

export function RedesignedFrameShell({
  title,
  prompts,
  rightRail,
  children,
}: RedesignedFrameShellProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const vestaMessages = useAppSelector((state) => state.copilot.messages);
  const vestaIsTyping = useAppSelector((state) => state.copilot.isTyping);
  const vestaError = useAppSelector((state) => state.copilot.error);
  const { value: vestaShellUI, patch: patchVestaShellUI } = useUIKey(
    UI_STATE_KEYS.VESTA_SHELL,
    UI_STATE_DEFAULTS.vestaShell,
  );
  const [vestaQuery, setVestaQuery] = useState("");

  const submitVestaQuery = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return;
      }
      void openCopilotWithQuery(dispatch, pathname, trimmedQuery);
      setVestaQuery("");
    },
    [dispatch, pathname],
  );

  const speakVestaMessage = useCallback((message: CopilotMessage) => {
    if (
      message.type !== "ai" ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }
    const text = message.content.trim();
    if (!text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }, []);

  const setVestaVoiceCaptureMode = useCallback(
    (mode: VoiceCaptureMode) => {
      patchVestaShellUI({ voiceCaptureMode: mode });
    },
    [patchVestaShellUI],
  );

  const vestaContextValue = useMemo(
    () => ({ submitVestaQuery }),
    [submitVestaQuery],
  );

  return (
    <RedesignedFrameVestaContext.Provider value={vestaContextValue}>
      <RedesignedAppFrame
        rail={
          <VestaCommandRail
            query={vestaQuery}
            onQueryChange={setVestaQuery}
            onSubmit={submitVestaQuery}
            prompts={prompts}
            messages={vestaMessages}
            isTyping={vestaIsTyping}
            error={vestaError}
            voiceCaptureMode={vestaShellUI.voiceCaptureMode}
            onVoiceCaptureModeChange={setVestaVoiceCaptureMode}
            onSpeakMessage={speakVestaMessage}
          />
        }
        topbar={<RedesignedTopbar title={title} />}
        rightRail={rightRail}
      >
        {children}
      </RedesignedAppFrame>
    </RedesignedFrameVestaContext.Provider>
  );
}
