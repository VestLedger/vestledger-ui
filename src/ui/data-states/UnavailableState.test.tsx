import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { UnavailableState } from "./UnavailableState";
import { UNAVAILABLE_REASON_MESSAGE } from "./types";

describe("UnavailableState (P2-005)", () => {
  it.each(
    Object.keys(UNAVAILABLE_REASON_MESSAGE) as Array<
      keyof typeof UNAVAILABLE_REASON_MESSAGE
    >,
  )("maps reason %s to its canonical friendly message", (reason) => {
    render(<UnavailableState reason={reason} />);
    const block = screen.getByTestId("unavailable-state");
    expect(block).toHaveAttribute("data-reason", reason);
    expect(block).toHaveTextContent(UNAVAILABLE_REASON_MESSAGE[reason]);
  });

  it("renders a custom message override", () => {
    render(
      <UnavailableState
        reason="backend_not_implemented"
        message="Diligence assistant lands in Q3."
      />,
    );
    expect(screen.getByTestId("unavailable-state")).toHaveTextContent(
      "Diligence assistant lands in Q3.",
    );
  });

  it("renders an action node when supplied", () => {
    render(
      <UnavailableState
        reason="connector_missing"
        action={<button data-testid="connect">Connect data source</button>}
      />,
    );
    expect(screen.getByTestId("connect")).toBeInTheDocument();
  });

  it("surfaces a correlation id for support tickets (P1-015)", () => {
    render(
      <UnavailableState
        reason="source_unavailable"
        correlationId="abc-123-cid"
      />,
    );
    const block = screen.getByTestId("unavailable-state");
    expect(block).toHaveTextContent("abc-123-cid");
    expect(block).toHaveTextContent("Correlation ID");
  });

  it("renders with status role for screen readers", () => {
    render(<UnavailableState reason="no_artifact" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
