import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CitationChip } from "./CitationChip";

describe("CitationChip (P2-005)", () => {
  it("renders as an anchor when href is provided", () => {
    render(<CitationChip source="Doc: Q3 PCAP" href="/documents/q3-pcap" />);
    const chip = screen.getByTestId("citation-chip");
    expect(chip.tagName).toBe("A");
    expect(chip).toHaveAttribute("href", "/documents/q3-pcap");
    expect(chip).toHaveAttribute("data-state", "citation_link");
  });

  it("renders as a button when only onOpen is provided", () => {
    const onOpen = vi.fn();
    render(<CitationChip source="NAV ledger row #4127" onOpen={onOpen} />);
    const chip = screen.getByTestId("citation-chip");
    expect(chip.tagName).toBe("BUTTON");
    fireEvent.click(chip);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders confidence and freshness metadata when supplied", () => {
    render(
      <CitationChip
        source="Crunchbase"
        href="https://crunchbase.com/x"
        confidence="0.84"
        freshness="Updated 2h ago"
      />,
    );
    const chip = screen.getByTestId("citation-chip");
    expect(chip).toHaveTextContent("0.84");
    expect(chip).toHaveTextContent("Updated 2h ago");
  });

  it("renders the not-applicable state when no source applies", () => {
    render(<CitationChip source="Manual entry" notApplicable />);
    const chip = screen.getByTestId("citation-chip");
    expect(chip).toHaveAttribute("data-state", "not_applicable");
    expect(chip).toHaveTextContent("not applicable");
  });

  it("renders as a static span when neither href nor onOpen is given", () => {
    render(<CitationChip source="Memo §3" />);
    const chip = screen.getByTestId("citation-chip");
    expect(chip.tagName).toBe("SPAN");
    expect(chip).toHaveAttribute("data-state", "citation_static");
  });
});
