import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskVestaComposer } from "./ask-vesta-composer";

// Controlled wrapper so the composer behaves like it does inside the rail.
function ComposerHarness({ onSubmit }: { onSubmit: (q: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <AskVestaComposer
      query={query}
      onQueryChange={setQuery}
      onSubmit={(value) => {
        onSubmit(value);
        setQuery("");
      }}
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

describe("AskVestaComposer", () => {
  beforeEach(() => {
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
});
