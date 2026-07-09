import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

describe("VestaCommandRail", () => {
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
