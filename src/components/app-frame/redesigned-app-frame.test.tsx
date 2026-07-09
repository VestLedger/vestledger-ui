import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { RedesignedAppFrame } from "./redesigned-app-frame";

function renderFrame(rightRail?: ReactNode) {
  return render(
    <RedesignedAppFrame
      rail={<div data-testid="rail-slot" />}
      topbar={<div data-testid="topbar-slot" />}
      rightRail={rightRail}
    >
      <div data-testid="content-slot" />
    </RedesignedAppFrame>,
  );
}

describe("RedesignedAppFrame", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders rail, topbar, and content slots with stable testids", () => {
    renderFrame();
    expect(screen.getByTestId("redesigned-app-frame")).toBeInTheDocument();
    expect(screen.getByTestId("app-frame-content-shell")).toBeInTheDocument();
    expect(screen.getByTestId("app-frame-body")).toBeInTheDocument();
    expect(screen.getByTestId("rail-slot")).toBeInTheDocument();
    expect(screen.getByTestId("topbar-slot")).toBeInTheDocument();
    expect(screen.getByTestId("content-slot")).toBeInTheDocument();
  });

  it("owns the main landmark and a skip link targeting it", () => {
    renderFrame();
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "app-frame-main");
    expect(main).toContainElement(screen.getByTestId("content-slot"));
    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toHaveAttribute("href", "#app-frame-main");
  });

  it("uses the two-column body grid only when a right rail is provided", () => {
    renderFrame(<aside data-testid="right-rail-slot" />);
    expect(screen.getByTestId("right-rail-slot")).toBeInTheDocument();
    expect(screen.getByTestId("app-frame-body").className).toContain("1.6fr");
  });

  it("renders a single-column body without a right rail", () => {
    renderFrame();
    expect(screen.getByTestId("app-frame-body").className).not.toContain(
      "1.6fr",
    );
  });

  it("resizes via the separator and reflects the width in the frame CSS variable", () => {
    renderFrame();
    const frame = screen.getByTestId("redesigned-app-frame");
    const separator = screen.getByRole("separator", { name: "Resize sidebar" });
    expect(frame.style.getPropertyValue("--app-frame-rail-width")).toBe(
      "515px",
    );
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(frame.style.getPropertyValue("--app-frame-rail-width")).toBe(
      "527px",
    );
  });
});
