import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DataStateBadge } from "./DataStateBadge";
import { DATA_STATE_DESCRIPTORS } from "./types";

describe("DataStateBadge (P2-005)", () => {
  it.each(
    Object.keys(DATA_STATE_DESCRIPTORS) as Array<
      keyof typeof DATA_STATE_DESCRIPTORS
    >,
  )("renders canonical label + tone for state %s", (state) => {
    render(<DataStateBadge state={state} />);
    const badge = screen.getByTestId("data-state-badge");
    const descriptor = DATA_STATE_DESCRIPTORS[state];
    expect(badge).toHaveTextContent(descriptor.label);
    expect(badge).toHaveAttribute("data-state", state);
    expect(badge).toHaveAttribute("data-tone", descriptor.tone);
    expect(badge).toHaveAttribute("title", descriptor.description);
  });

  it("supports an explicit label override (e.g. live + freshness stamp)", () => {
    render(<DataStateBadge state="live" label="Live · 12s ago" />);
    expect(screen.getByTestId("data-state-badge")).toHaveTextContent(
      "Live · 12s ago",
    );
  });

  it("supports an explicit title override for tooltips", () => {
    render(
      <DataStateBadge
        state="unavailable"
        title="Connector not configured — open Integrations to fix."
      />,
    );
    expect(screen.getByTestId("data-state-badge")).toHaveAttribute(
      "title",
      "Connector not configured — open Integrations to fix.",
    );
  });
});
