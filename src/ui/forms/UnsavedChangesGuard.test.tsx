import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { UnsavedChangesGuard } from "./UnsavedChangesGuard";

describe("UnsavedChangesGuard (P2-011)", () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("registers a beforeunload listener when when=true", () => {
    render(<UnsavedChangesGuard when isOpen={false} />);
    expect(addSpy.mock.calls.some(([event]) => event === "beforeunload")).toBe(
      true,
    );
  });

  it("does not register a beforeunload listener when when=false", () => {
    render(<UnsavedChangesGuard when={false} isOpen={false} />);
    expect(addSpy.mock.calls.some(([event]) => event === "beforeunload")).toBe(
      false,
    );
  });

  it("removes the listener on unmount", () => {
    const { unmount } = render(<UnsavedChangesGuard when isOpen={false} />);
    unmount();
    expect(
      removeSpy.mock.calls.some(([event]) => event === "beforeunload"),
    ).toBe(true);
  });

  it("renders the modal message and actions when open", () => {
    render(
      <UnsavedChangesGuard
        when
        isOpen
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(
      screen.getByTestId("unsaved-changes-guard-message"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("unsaved-changes-guard-keep"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("unsaved-changes-guard-discard"),
    ).toBeInTheDocument();
  });

  it("fires onConfirm and closes when discarding", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <UnsavedChangesGuard
        when
        isOpen
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId("unsaved-changes-guard-discard"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not fire onConfirm when keeping edits", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <UnsavedChangesGuard
        when
        isOpen
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId("unsaved-changes-guard-keep"));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("invokes onCancel handler when supplied for keep", () => {
    const onCancel = vi.fn();
    render(
      <UnsavedChangesGuard
        when
        isOpen
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByTestId("unsaved-changes-guard-keep"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
