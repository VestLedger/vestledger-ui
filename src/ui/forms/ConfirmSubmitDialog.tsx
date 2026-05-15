"use client";

import { useState, type ReactNode } from "react";

import { Modal } from "@/ui/feedback/Modal";
import { Button } from "@/ui/components/Button";

/**
 * ConfirmSubmitDialog — mandatory submit-confirmation modal per the P2-010
 * spec. Fires on the wizard Review step's Submit button (or on a form's
 * Submit button for irreversible actions).
 *
 * The dialog states the post-submit consequence in one sentence and exposes
 * an explicit Confirm + Cancel pair. The Confirm button is the only path
 * that fires the policy-gated mutation — closing or cancelling the modal
 * aborts the submit. Per the spec's adversarial review, there is no
 * keyboard shortcut to confirm.
 */
export interface ConfirmSubmitDialogProps {
  isOpen: boolean;
  /** Modal close handler. Closing must NOT fire the submit. */
  onOpenChange: (isOpen: boolean) => void;
  /** Title rendered in the modal header. */
  title: ReactNode;
  /**
   * Post-submit consequence statement. The spec requires a single
   * one-sentence description of what will happen
   * (e.g. "12 LPs will receive capital call notices").
   */
  consequence: ReactNode;
  /**
   * Optional list of side-effects rendered as a bullet list under the
   * consequence (audit events fired, notices sent, etc.).
   */
  details?: ReactNode[];
  /** Label for the confirm action. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel action. Defaults to "Cancel". */
  cancelLabel?: string;
  /**
   * Submit handler. Awaited so the button can render a pending state
   * during the policy-gated mutation. If the handler throws, the modal
   * stays open (the submit did not happen) and `onError` is invoked so
   * the consumer can surface the failure via toasts or inline alerts.
   */
  onConfirm: () => void | Promise<void>;
  /** Optional explicit cancel handler. Defaults to closing the modal. */
  onCancel?: () => void;
  /** Invoked when `onConfirm` rejects/throws. Modal remains open. */
  onError?: (error: unknown) => void;
  /** Tone for the confirm button. Defaults to `primary`. */
  confirmTone?: "primary" | "danger";
  testId?: string;
}

export function ConfirmSubmitDialog({
  isOpen,
  onOpenChange,
  title,
  consequence,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  onError,
  confirmTone = "primary",
  testId = "confirm-submit-dialog",
}: ConfirmSubmitDialogProps) {
  const [pending, setPending] = useState(false);

  const handleCancel = () => {
    if (pending) return;
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
      title={<span data-testid={`${testId}-title`}>{title}</span>}
      isDismissable={!pending}
      footer={
        <div
          className="flex w-full items-center justify-end gap-2"
          data-testid={`${testId}-footer`}
        >
          <Button
            color="default"
            variant="flat"
            onPress={handleCancel}
            isDisabled={pending}
            data-testid={`${testId}-cancel`}
          >
            {cancelLabel}
          </Button>
          <Button
            color={confirmTone === "danger" ? "danger" : "primary"}
            onPress={handleConfirm}
            isLoading={pending}
            data-testid={`${testId}-confirm`}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-[var(--app-text)]">
        <p data-testid={`${testId}-consequence`}>{consequence}</p>
        {details && details.length > 0 && (
          <ul
            className="ml-5 list-disc space-y-1 text-[var(--app-text-muted)]"
            data-testid={`${testId}-details`}
          >
            {details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
