import { useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskVestaComposer } from "./ask-vesta-composer";

// Controlled wrapper so the composer behaves like it does inside the rail.
function ComposerHarness({
  onSubmit,
  isTyping = false,
  voiceCaptureMode = "tap",
  onVoiceCaptureModeChange = vi.fn(),
}: {
  onSubmit: (q: string) => void;
  isTyping?: boolean;
  voiceCaptureMode?: "tap" | "hold";
  onVoiceCaptureModeChange?: (mode: "tap" | "hold") => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <AskVestaComposer
      query={query}
      onQueryChange={setQuery}
      onSubmit={(value) => {
        onSubmit(value);
        setQuery("");
      }}
      isTyping={isTyping}
      voiceCaptureMode={voiceCaptureMode}
      onVoiceCaptureModeChange={onVoiceCaptureModeChange}
    />
  );
}

function makeFile(name: string) {
  return new File(["content"], name, { type: "text/plain" });
}

function getFileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input as HTMLInputElement;
}

const win = window as typeof window & {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

type ResultHandler = ((event: unknown) => void) | null;

class MockRecognition {
  lang = "";
  interimResults = false;
  continuous = false;
  onresult: ResultHandler = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    this.onend?.();
  });
  abort = vi.fn();

  constructor() {
    recognitionInstances.push(this);
  }
}

let recognitionInstances: MockRecognition[] = [];

describe("AskVestaComposer", () => {
  beforeEach(() => {
    recognitionInstances = [];
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  afterEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  it("renders the Ask Vesta textbox and disables send when empty", () => {
    render(<ComposerHarness onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("textbox", { name: "Ask Vesta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Vesta prompt" }),
    ).toBeDisabled();
  });

  it("attaches files as removable chips", () => {
    render(<ComposerHarness onSubmit={vi.fn()} />);

    fireEvent.change(getFileInput(), {
      target: { files: [makeFile("report.pdf"), makeFile("chart.png")] },
    });

    const list = screen.getByRole("list", { name: "Attachments" });
    expect(within(list).getByText("report.pdf")).toBeInTheDocument();
    expect(within(list).getByText("chart.png")).toBeInTheDocument();

    // Send is enabled once an attachment exists, even with empty text.
    expect(
      screen.getByRole("button", { name: "Send Vesta prompt" }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    expect(within(list).queryByText("report.pdf")).not.toBeInTheDocument();
    expect(within(list).getByText("chart.png")).toBeInTheDocument();
  });

  it("submits the query and clears text plus attachments", () => {
    const onSubmit = vi.fn();
    render(<ComposerHarness onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Ask Vesta" }), {
      target: { value: "what needs my attention" },
    });
    fireEvent.change(getFileInput(), {
      target: { files: [makeFile("memo.pdf")] },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send Vesta prompt" }));

    expect(onSubmit).toHaveBeenCalledWith("what needs my attention");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Ask Vesta",
        }) as HTMLTextAreaElement
      ).value,
    ).toBe("");
    expect(screen.queryByText("memo.pdf")).not.toBeInTheDocument();
  });

  it("disables the mic when speech recognition is unsupported", () => {
    render(<ComposerHarness onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Voice input not supported in this browser",
      }),
    ).toBeDisabled();
  });

  it("uses right-sidebar style tap-to-talk: live transcript, listening overlay, and auto-submit on end", () => {
    win.SpeechRecognition = MockRecognition;
    const onSubmit = vi.fn();
    render(<ComposerHarness onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Start voice capture" }),
    );

    expect(recognitionInstances).toHaveLength(1);
    expect(recognitionInstances[0].interimResults).toBe(true);
    expect(screen.getByText("Listening")).toBeInTheDocument();

    act(() => {
      recognitionInstances[0].onresult?.({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: "summarize fund" }], {
            isFinal: false,
          }),
        ],
      });
    });

    expect(screen.getByRole("textbox", { name: "Ask Vesta" })).toHaveValue(
      "summarize fund",
    );

    act(() => {
      recognitionInstances[0].onresult?.({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: "summarize fund updates" }], {
            isFinal: true,
          }),
        ],
      });
      recognitionInstances[0].onend?.();
    });

    expect(onSubmit).toHaveBeenCalledWith("summarize fund updates");
    expect(screen.getByRole("textbox", { name: "Ask Vesta" })).toHaveValue("");
  });

  it("supports the same hold-to-talk start and stop gesture as the sidebar", () => {
    win.SpeechRecognition = MockRecognition;
    render(<ComposerHarness onSubmit={vi.fn()} voiceCaptureMode="hold" />);

    const mic = screen.getByRole("button", { name: "Start voice capture" });
    fireEvent.mouseDown(mic);

    expect(recognitionInstances).toHaveLength(1);
    expect(recognitionInstances[0].start).toHaveBeenCalledTimes(1);

    fireEvent.mouseUp(mic);

    expect(recognitionInstances[0].stop).toHaveBeenCalledTimes(1);
  });

  it("toggles between tap-to-talk and hold-to-talk modes", () => {
    const onVoiceCaptureModeChange = vi.fn();
    render(
      <ComposerHarness
        onSubmit={vi.fn()}
        onVoiceCaptureModeChange={onVoiceCaptureModeChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Voice Mode:/ }));

    expect(onVoiceCaptureModeChange).toHaveBeenCalledWith("hold");
  });
});
