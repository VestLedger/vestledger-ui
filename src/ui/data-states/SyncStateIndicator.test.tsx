import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SyncStateIndicator } from "./SyncStateIndicator";

describe("SyncStateIndicator (P2-005)", () => {
  it.each(["live", "syncing", "stale", "error", "idle"] as const)(
    "renders state %s with the matching data attribute",
    (state) => {
      render(<SyncStateIndicator state={state} />);
      const indicator = screen.getByTestId("sync-state-indicator");
      expect(indicator).toHaveAttribute("data-state", state);
    },
  );

  it("supports a custom label override", () => {
    render(<SyncStateIndicator state="live" label="Live · 3s" />);
    expect(screen.getByTestId("sync-state-indicator")).toHaveTextContent(
      "Live · 3s",
    );
  });
});
