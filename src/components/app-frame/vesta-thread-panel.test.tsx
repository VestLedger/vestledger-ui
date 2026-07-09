import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CopilotMessage } from "@/store/slices/copilotSlice";
import { VestaThreadPanel } from "./vesta-thread-panel";

const aiMessage: CopilotMessage = {
  id: "ai-1",
  type: "ai",
  content: "Three portfolio companies submitted updates overnight.",
  timestamp: new Date("2026-01-01T00:00:00.000Z"),
} as CopilotMessage;

const userMessage: CopilotMessage = {
  id: "user-1",
  type: "user",
  content: "Summarize the funding updates",
  timestamp: new Date("2026-01-01T00:01:00.000Z"),
} as CopilotMessage;

describe("VestaThreadPanel", () => {
  it("renders messages inside an aria-live log region", () => {
    render(
      <VestaThreadPanel
        messages={[aiMessage, userMessage]}
        isTyping={false}
        error={null}
        onSpeakMessage={vi.fn()}
      />,
    );
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toBe(screen.getByTestId("vesta-thread-panel"));
    expect(log).toHaveClass("flex-1");
    expect(
      screen.getByText(
        "Three portfolio companies submitted updates overnight.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Summarize the funding updates"),
    ).toBeInTheDocument();
  });

  it("shows the typing indicator and error state", () => {
    render(
      <VestaThreadPanel
        messages={[]}
        isTyping={true}
        error="Vesta is unavailable"
        onSpeakMessage={vi.fn()}
      />,
    );
    expect(screen.getByText("Vesta is thinking")).toBeInTheDocument();
    expect(screen.getByText("Vesta is unavailable")).toBeInTheDocument();
  });

  it("offers a play affordance only on Vesta responses", () => {
    const onSpeakMessage = vi.fn();
    render(
      <VestaThreadPanel
        messages={[aiMessage, userMessage]}
        isTyping={false}
        error={null}
        onSpeakMessage={onSpeakMessage}
      />,
    );
    const playButtons = screen.getAllByRole("button", {
      name: "Play Vesta response",
    });
    expect(playButtons).toHaveLength(1);
    fireEvent.click(playButtons[0]);
    expect(onSpeakMessage).toHaveBeenCalledWith(aiMessage);
  });
});
