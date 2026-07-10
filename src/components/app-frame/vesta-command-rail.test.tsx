import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CopilotMessage } from "@/store/slices/copilotSlice";
import { VestaCommandRail } from "./vesta-command-rail";

const welcome: CopilotMessage = {
  id: "welcome",
  type: "ai",
  content: "Hi! I'm Vesta.",
  timestamp: new Date("2026-01-01T00:00:00.000Z"),
} as CopilotMessage;

function renderRail(
  overrides: Partial<Parameters<typeof VestaCommandRail>[0]> = {},
) {
  const props = {
    query: "",
    onQueryChange: vi.fn(),
    onSubmit: vi.fn(),
    prompts: [
      "How is Fund I performing?",
      "Summarize recent updates",
      "What needs my attention?",
    ],
    messages: [welcome],
    isTyping: false,
    error: null,
    voiceCaptureMode: "tap" as const,
    onVoiceCaptureModeChange: vi.fn(),
    onSpeakMessage: vi.fn(),
    ...overrides,
  };
  render(<VestaCommandRail {...props} />);
  return props;
}

const win = window as typeof window & {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

class MockRecognition {
  lang = "";
  interimResults = false;
  continuous = false;
  onresult: ((event: unknown) => void) | null = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

describe("VestaCommandRail", () => {
  beforeEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  afterEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  it("renders brand identity, Ask Vesta heading, thread, and composer in a labelled landmark", () => {
    renderRail();
    expect(screen.getByText("VESTLEDGER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ask Vesta" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("vesta-thread-panel")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Ask Vesta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Vesta command rail" }),
    ).toBeInTheDocument();
  });

  it("uses the brand primary color for the VestLedger mark, not the Vesta accent", () => {
    renderRail();
    const logo = screen.getByLabelText("VestLedger Logo");
    expect(logo).toHaveClass("text-app-primary");
    expect(logo).not.toHaveClass("text-app-vesta");
  });

  it("lets tap-to-talk cover the whole command rail instead of clipping to the composer", () => {
    win.SpeechRecognition = MockRecognition;
    renderRail();

    const rail = screen.getByRole("complementary", {
      name: "Vesta command rail",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Start voice capture" }),
    );

    const overlay = screen.getByText("Listening").closest("button");
    const composer = screen
      .getByRole("textbox", { name: "Ask Vesta" })
      .closest("form");

    expect(rail).toHaveClass("relative");
    expect(rail).toHaveClass("overflow-hidden");
    expect(overlay).toHaveClass("absolute", "inset-0");
    expect(composer).not.toContainElement(overlay);
    expect(rail).toContainElement(overlay);
  });

  it("submits prompt chips through onSubmit", () => {
    const props = renderRail();
    fireEvent.click(
      screen.getByRole("button", { name: "Summarize recent updates" }),
    );
    expect(props.onSubmit).toHaveBeenCalledWith("Summarize recent updates");
  });

  it("does not render the removed Smart Actions or Vesta Suggests sections", () => {
    renderRail();
    expect(
      screen.queryByRole("button", { name: /Smart Actions/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Vesta Suggests")).not.toBeInTheDocument();
  });
});
