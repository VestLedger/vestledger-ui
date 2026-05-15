import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ConfirmSubmitDialog } from "./ConfirmSubmitDialog";

const baseProps = {
  title: "Send capital call notice",
  consequence: "12 LPs will receive capital call notices.",
};

describe("ConfirmSubmitDialog (P2-011)", () => {
  it("does not render dialog content when closed", () => {
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(
      screen.queryByTestId("confirm-submit-dialog-confirm"),
    ).not.toBeInTheDocument();
  });

  it("renders the consequence statement and details when open", () => {
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        details={["Audit event will fire", "NAV will recalc"]}
      />,
    );
    expect(
      screen.getByTestId("confirm-submit-dialog-consequence"),
    ).toHaveTextContent("12 LPs will receive capital call notices.");
    const details = screen.getByTestId("confirm-submit-dialog-details");
    expect(details).toHaveTextContent("Audit event will fire");
    expect(details).toHaveTextContent("NAV will recalc");
  });

  it("fires onConfirm and closes the modal on Confirm", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-submit-dialog-confirm"));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes without firing onConfirm on Cancel", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-submit-dialog-cancel"));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("invokes onCancel handler when supplied", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-submit-dialog-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("keeps the modal open and reports via onError when onConfirm rejects", async () => {
    const error = new Error("policy denied");
    const onConfirm = vi.fn(() => Promise.reject(error));
    const onOpenChange = vi.fn();
    const onError = vi.fn();
    render(
      <ConfirmSubmitDialog
        {...baseProps}
        isOpen
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        onError={onError}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-submit-dialog-confirm"));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
