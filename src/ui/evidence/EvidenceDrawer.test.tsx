import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { EvidenceDrawer } from "./EvidenceDrawer";
import { SAMPLE_SCORECARD_CLAIM } from "./fixtures";

describe("EvidenceDrawer (P2-006)", () => {
  it("does not render when closed", () => {
    render(
      <EvidenceDrawer
        isOpen={false}
        onClose={vi.fn()}
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence={SAMPLE_SCORECARD_CLAIM.score}
        citations={SAMPLE_SCORECARD_CLAIM.citations}
      />,
    );
    expect(screen.queryByTestId("evidence-drawer")).toBeNull();
  });

  it("renders claim, confidence, and citations when open", () => {
    render(
      <EvidenceDrawer
        isOpen
        onClose={vi.fn()}
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence={SAMPLE_SCORECARD_CLAIM.score}
        citations={SAMPLE_SCORECARD_CLAIM.citations}
      />,
    );
    expect(screen.getByTestId("evidence-drawer-claim")).toHaveTextContent(
      "Founder previously built",
    );
    expect(screen.getByTestId("evidence-drawer-confidence")).toHaveAttribute(
      "data-confidence",
      "high",
    );
    const citations = screen.getByTestId("evidence-drawer-citations");
    expect(citations).toHaveAttribute("data-count", "3");
  });

  it("renders the snippets panel when at least one citation has a snippet", () => {
    render(
      <EvidenceDrawer
        isOpen
        onClose={vi.fn()}
        claim="Sample claim"
        confidence="medium"
        citations={[
          {
            id: "x",
            source: "Doc §3",
            snippet: "Quoted passage from the doc.",
          },
          { id: "y", source: "Manual entry", notApplicable: true },
        ]}
      />,
    );
    expect(screen.getByTestId("evidence-drawer-snippets")).toBeInTheDocument();
    expect(screen.getByTestId("evidence-drawer-snippet-x")).toHaveTextContent(
      "Quoted passage",
    );
    expect(screen.queryByTestId("evidence-drawer-snippet-y")).toBeNull();
  });

  it("does not render the snippets panel when no citation carries a snippet", () => {
    render(
      <EvidenceDrawer
        isOpen
        onClose={vi.fn()}
        claim="Sample claim"
        confidence="low"
        citations={[{ id: "x", source: "Doc", href: "/d" }]}
      />,
    );
    expect(screen.queryByTestId("evidence-drawer-snippets")).toBeNull();
  });

  it("close button invokes onClose", () => {
    const onClose = vi.fn();
    render(
      <EvidenceDrawer
        isOpen
        onClose={onClose}
        claim="Sample"
        confidence="high"
        citations={[]}
      />,
    );
    fireEvent.click(screen.getByTestId("evidence-drawer-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ESC key invokes onClose when open", () => {
    const onClose = vi.fn();
    render(
      <EvidenceDrawer
        isOpen
        onClose={onClose}
        claim="Sample"
        confidence="high"
        citations={[]}
      />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders optional notes when supplied", () => {
    render(
      <EvidenceDrawer
        isOpen
        onClose={vi.fn()}
        claim="Sample"
        confidence="medium"
        citations={[]}
        notes={<span data-testid="custom-note">Reviewed by Sam</span>}
      />,
    );
    const notes = screen.getByTestId("evidence-drawer-notes");
    expect(notes).toHaveTextContent("Reviewed by Sam");
  });
});
