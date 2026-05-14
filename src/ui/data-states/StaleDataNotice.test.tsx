import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StaleDataNotice } from "./StaleDataNotice";

describe("StaleDataNotice (P2-005)", () => {
  it("renders the stale state with formatted last-updated stamp", () => {
    render(<StaleDataNotice lastUpdated="2026-05-14T10:00:00.000Z" />);
    const notice = screen.getByTestId("stale-data-notice");
    expect(notice).toHaveAttribute("data-state", "stale");
    expect(notice).toHaveTextContent("Stale data");
    expect(notice).toHaveTextContent("Last updated");
  });

  it("renders an optional explanatory message", () => {
    render(
      <StaleDataNotice
        lastUpdated="2026-05-14T10:00:00.000Z"
        message="NAV refresh delayed by upstream connector"
      />,
    );
    expect(screen.getByTestId("stale-data-notice")).toHaveTextContent(
      "NAV refresh delayed by upstream connector",
    );
  });

  it("renders an action affordance when supplied", () => {
    render(
      <StaleDataNotice
        lastUpdated="2026-05-14T10:00:00.000Z"
        action={<button data-testid="refresh">Refresh now</button>}
      />,
    );
    expect(screen.getByTestId("refresh")).toBeInTheDocument();
  });
});
