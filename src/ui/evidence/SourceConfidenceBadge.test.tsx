import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SourceConfidenceBadge } from "./SourceConfidenceBadge";
import { CONFIDENCE_DESCRIPTORS, bucketConfidence } from "./types";

describe("SourceConfidenceBadge (P2-006)", () => {
  it.each(["high", "medium", "low", "none"] as const)(
    "renders canonical label and tone for %s",
    (bucket) => {
      render(<SourceConfidenceBadge confidence={bucket} />);
      const badge = screen.getByTestId("source-confidence-badge");
      const descriptor = CONFIDENCE_DESCRIPTORS[bucket];
      expect(badge).toHaveTextContent(descriptor.label);
      expect(badge).toHaveAttribute("data-confidence", bucket);
      expect(badge).toHaveAttribute("data-tone", descriptor.tone);
      expect(badge).toHaveAttribute("title", descriptor.description);
    },
  );

  it.each([
    [0.95, "high"],
    [0.75, "high"],
    [0.74, "medium"],
    [0.5, "medium"],
    [0.49, "low"],
    [0.1, "low"],
    [0, "none"],
    [-1, "none"],
    [Number.NaN, "none"],
  ])("buckets numeric score %s into the %s band", (score, expectedBucket) => {
    expect(bucketConfidence(score as number)).toBe(expectedBucket);
    render(<SourceConfidenceBadge confidence={score as number} />);
    expect(screen.getByTestId("source-confidence-badge")).toHaveAttribute(
      "data-confidence",
      expectedBucket,
    );
  });

  it("supports an explicit label override", () => {
    render(
      <SourceConfidenceBadge confidence="high" label="0.84 · 3 sources" />,
    );
    expect(screen.getByTestId("source-confidence-badge")).toHaveTextContent(
      "0.84 · 3 sources",
    );
  });

  it("bucketConfidence treats undefined, NaN, and non-finite input as `none`", () => {
    expect(bucketConfidence(undefined)).toBe("none");
    expect(bucketConfidence(Number.NaN)).toBe("none");
    expect(bucketConfidence(Number.POSITIVE_INFINITY)).toBe("none");
    expect(bucketConfidence(Number.NEGATIVE_INFINITY)).toBe("none");
  });
});
