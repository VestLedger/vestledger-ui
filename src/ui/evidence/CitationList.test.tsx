import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

import { CitationList } from "./CitationList";
import type { EvidenceCitation } from "./types";

describe("CitationList (P2-006)", () => {
  it("renders one CitationChip per citation", () => {
    const citations: EvidenceCitation[] = [
      { id: "a", source: "Source A", href: "/a" },
      { id: "b", source: "Source B", onOpen: vi.fn() },
      { id: "c", source: "Manual entry", notApplicable: true },
    ];
    render(<CitationList citations={citations} />);
    const list = screen.getByTestId("citation-list");
    expect(list).toHaveAttribute("data-count", "3");
    expect(within(list).getByTestId("citation-a")).toHaveAttribute(
      "href",
      "/a",
    );
    expect(within(list).getByTestId("citation-b").tagName).toBe("BUTTON");
    expect(within(list).getByTestId("citation-c")).toHaveAttribute(
      "data-state",
      "not_applicable",
    );
  });

  it("renders an empty notice when no citations are attached", () => {
    render(<CitationList citations={[]} />);
    const list = screen.getByTestId("citation-list");
    expect(list).toHaveAttribute("data-state", "empty");
    expect(list).toHaveTextContent("No sources attached");
  });

  it("supports a custom empty message", () => {
    render(
      <CitationList
        citations={[]}
        emptyMessage="No first-party source available."
      />,
    );
    expect(screen.getByTestId("citation-list")).toHaveTextContent(
      "No first-party source available.",
    );
  });

  it("propagates click handlers from citation onOpen", () => {
    const handler = vi.fn();
    render(
      <CitationList
        citations={[{ id: "x", source: "Memo §3", onOpen: handler }]}
      />,
    );
    fireEvent.click(screen.getByTestId("citation-x"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
