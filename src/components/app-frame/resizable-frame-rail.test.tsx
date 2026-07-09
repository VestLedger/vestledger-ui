import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CSSProperties } from "react";
import {
  DEFAULT_RAIL_WIDTH,
  LEGACY_RAIL_WIDTH_STORAGE_KEY,
  MAX_RAIL_WIDTH,
  MIN_RAIL_WIDTH,
  RAIL_WIDTH_STORAGE_KEY,
  useResizableFrameRail,
} from "./resizable-frame-rail";

function RailProbe() {
  const { width, isResizing, separatorProps } = useResizableFrameRail();
  return (
    <div
      data-testid="rail-probe"
      data-resizing={isResizing ? "true" : "false"}
      style={{ "--app-frame-rail-width": `${width}px` } as CSSProperties}
    >
      <button {...separatorProps} />
    </div>
  );
}

describe("useResizableFrameRail", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts at the default width with full separator semantics", () => {
    render(<RailProbe />);
    const separator = screen.getByRole("separator", { name: "Resize sidebar" });
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("aria-valuemin", String(MIN_RAIL_WIDTH));
    expect(separator).toHaveAttribute("aria-valuemax", String(MAX_RAIL_WIDTH));
    expect(separator).toHaveAttribute(
      "aria-valuenow",
      String(DEFAULT_RAIL_WIDTH),
    );
    expect(separator).toHaveAttribute(
      "aria-valuetext",
      `${DEFAULT_RAIL_WIDTH} pixels`,
    );
  });

  it("resizes with the keyboard and persists ONLY to the new storage key", () => {
    render(<RailProbe />);
    const separator = screen.getByRole("separator", { name: "Resize sidebar" });
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "527");
    expect(localStorage.getItem(RAIL_WIDTH_STORAGE_KEY)).toBe("527");
    expect(localStorage.getItem(LEGACY_RAIL_WIDTH_STORAGE_KEY)).toBeNull();
  });

  it("supports Home/End keyboard jumps to the clamps", () => {
    render(<RailProbe />);
    const separator = screen.getByRole("separator", { name: "Resize sidebar" });
    fireEvent.keyDown(separator, { key: "Home" });
    expect(separator).toHaveAttribute("aria-valuenow", String(MIN_RAIL_WIDTH));
    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", String(MAX_RAIL_WIDTH));
  });

  it("restores a stored width from the new key", () => {
    localStorage.setItem(RAIL_WIDTH_STORAGE_KEY, "560");
    render(<RailProbe />);
    expect(
      screen.getByRole("separator", { name: "Resize sidebar" }),
    ).toHaveAttribute("aria-valuenow", "560");
  });

  it("falls back to the legacy home key when the new key is absent", () => {
    localStorage.setItem(LEGACY_RAIL_WIDTH_STORAGE_KEY, "540");
    render(<RailProbe />);
    expect(
      screen.getByRole("separator", { name: "Resize sidebar" }),
    ).toHaveAttribute("aria-valuenow", "540");
  });

  it("prefers the new key over the legacy key and clamps stored values", () => {
    localStorage.setItem(RAIL_WIDTH_STORAGE_KEY, "9999");
    localStorage.setItem(LEGACY_RAIL_WIDTH_STORAGE_KEY, "540");
    render(<RailProbe />);
    expect(
      screen.getByRole("separator", { name: "Resize sidebar" }),
    ).toHaveAttribute("aria-valuenow", String(MAX_RAIL_WIDTH));
  });

  it("resizes by pointer drag and stops on pointerup", () => {
    render(<RailProbe />);
    const separator = screen.getByRole("separator", { name: "Resize sidebar" });
    fireEvent(
      separator,
      new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 515 }),
    );
    expect(screen.getByTestId("rail-probe")).toHaveAttribute(
      "data-resizing",
      "true",
    );
    fireEvent(
      window,
      new MouseEvent("pointermove", { bubbles: true, clientX: 575 }),
    );
    fireEvent(window, new MouseEvent("pointerup", { bubbles: true }));
    expect(separator).toHaveAttribute("aria-valuenow", "575");
    expect(screen.getByTestId("rail-probe")).toHaveAttribute(
      "data-resizing",
      "false",
    );
    expect(localStorage.getItem(RAIL_WIDTH_STORAGE_KEY)).toBe("575");
  });
});
