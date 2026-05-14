import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ClaimWithSources } from "./ClaimWithSources";
import { SAMPLE_SCORECARD_CLAIM } from "./fixtures";

/**
 * Acceptance evidence: the P2-006 task acceptance is "A sample scorecard
 * claim renders with citations and source confidence." The first test
 * below pins exactly that — fixture-backed scorecard claim renders the
 * claim text, the canonical confidence band, all three citations inline,
 * and a working drawer affordance.
 */
describe("ClaimWithSources (P2-006)", () => {
  it("renders a sample scorecard claim with citations and source confidence", () => {
    render(
      <ClaimWithSources
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence={SAMPLE_SCORECARD_CLAIM.score}
        citations={SAMPLE_SCORECARD_CLAIM.citations}
      />,
    );

    // Claim text is visible.
    expect(screen.getByTestId("claim-with-sources-claim")).toHaveTextContent(
      "Founder previously built and exited a Series B SaaS company in 2022.",
    );

    // Confidence is bucketed from the numeric score (0.82 → high).
    const confidence = screen.getByTestId("claim-with-sources-confidence");
    expect(confidence).toHaveAttribute("data-confidence", "high");
    expect(confidence).toHaveTextContent("High confidence");

    // Inline citations list has all three fixture citations.
    const inline = screen.getByTestId("claim-with-sources-inline-citations");
    expect(inline).toHaveAttribute("data-count", "3");
    expect(screen.getByTestId("citation-src-crunchbase")).toHaveAttribute(
      "href",
      "https://crunchbase.com/example-acquisition",
    );
    expect(screen.getByTestId("citation-src-linkedin")).toHaveAttribute(
      "href",
      "https://linkedin.com/in/example",
    );
    expect(screen.getByTestId("citation-src-conversation").tagName).toBe(
      "BUTTON",
    );
  });

  it("opens the EvidenceDrawer when the inspect affordance is clicked", () => {
    render(
      <ClaimWithSources
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence={SAMPLE_SCORECARD_CLAIM.score}
        citations={SAMPLE_SCORECARD_CLAIM.citations}
      />,
    );

    // Drawer not rendered initially.
    expect(screen.queryByTestId("claim-with-sources-drawer")).toBeNull();

    fireEvent.click(screen.getByTestId("claim-with-sources-inspect"));

    const drawer = screen.getByTestId("claim-with-sources-drawer");
    expect(drawer).toBeInTheDocument();
    expect(screen.getByTestId("evidence-drawer-confidence")).toHaveAttribute(
      "data-confidence",
      "high",
    );

    fireEvent.click(screen.getByTestId("evidence-drawer-close"));
    expect(screen.queryByTestId("claim-with-sources-drawer")).toBeNull();
  });

  it("supports controlled drawer state", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ClaimWithSources
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence="medium"
        citations={SAMPLE_SCORECARD_CLAIM.citations}
        drawerOpen={false}
        onDrawerOpenChange={onChange}
      />,
    );
    expect(screen.queryByTestId("claim-with-sources-drawer")).toBeNull();

    fireEvent.click(screen.getByTestId("claim-with-sources-inspect"));
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <ClaimWithSources
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence="medium"
        citations={SAMPLE_SCORECARD_CLAIM.citations}
        drawerOpen
        onDrawerOpenChange={onChange}
      />,
    );
    expect(screen.getByTestId("claim-with-sources-drawer")).toBeInTheDocument();
  });

  it("suppresses inline citations when hideInlineCitations is true", () => {
    render(
      <ClaimWithSources
        claim={SAMPLE_SCORECARD_CLAIM.claim}
        confidence="low"
        citations={SAMPLE_SCORECARD_CLAIM.citations}
        hideInlineCitations
      />,
    );
    expect(
      screen.queryByTestId("claim-with-sources-inline-citations"),
    ).toBeNull();
    // Drawer-only path — open and check citations are still inside the drawer.
    fireEvent.click(screen.getByTestId("claim-with-sources-inspect"));
    expect(screen.getByTestId("evidence-drawer-citations")).toHaveAttribute(
      "data-count",
      "3",
    );
  });

  it("falls back to `none` confidence when score is missing", () => {
    render(
      <ClaimWithSources
        claim="Unverified claim"
        confidence={undefined as unknown as number}
        citations={[]}
      />,
    );
    expect(screen.getByTestId("claim-with-sources-confidence")).toHaveAttribute(
      "data-confidence",
      "none",
    );
  });
});
