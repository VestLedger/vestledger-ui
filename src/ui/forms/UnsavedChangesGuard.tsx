"use client";

import { useEffect, type ReactNode } from "react";

import { Modal } from "@/ui/feedback/Modal";
import { Button } from "@/ui/components/Button";

/**
 * UnsavedChangesGuard — guards a form/wizard against unintended loss of
 * unsaved edits per the P2-010 spec.
 *
 * Behaviour:
 *  - When `when` is true, attempts to close the tab / navigate away trigger
 *    the browser's native `beforeunload` confirmation.
 *  - When the caller wants to surface an in-app prompt (Cancel button on a
 *    dirty form, sidebar nav, etc.), they set `isOpen` to true and the
 *    component renders a confirmation modal with Discard / Keep editing.
 *
 * Per the spec:
 *  - Forms: triggers on Cancel when dirty.
 *  - Wizards: triggers when any step is dirty AND no draft saved.
 *
 * This primitive is intentionally controlled; the consumer owns the
 * `dirty` predicate and decides when to open the prompt. Tenant /
 * permission / audit concerns live on the wizard, not the guard.
 */
export interface UnsavedChangesGuardProps {
  /**
   * True when there are unsaved changes. Drives the `beforeunload`
   * listener and gates the `onConfirm` discard.
   */
  when: boolean;
  /** Controls the in-app confirmation modal. */
  isOpen?: boolean;
  /** Modal close handler. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Fired when the user chooses to discard their changes. */
  onConfirm?: () => void;
  /** Optional explicit "keep editing" handler. Defaults to closing the modal. */
  onCancel?: () => void;
  /** Title rendered in the modal header. */
  title?: ReactNode;
  /** Body copy explaining what will be lost. */
  message?: ReactNode;
  /** Label for the discard action. Defaults to "Discard changes". */
  discardLabel?: string;
  /** Label for the keep-editing action. Defaults to "Keep editing". */
  keepLabel?: string;
  testId?: string;
}

export function UnsavedChangesGuard({
  when,
  isOpen = false,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Discard unsaved changes?",
  message = "Your changes have not been saved. Discarding will lose them.",
  discardLabel = "Discard changes",
  keepLabel = "Keep editing",
  testId = "unsaved-changes-guard",
}: UnsavedChangesGuardProps) {
  useEffect(() => {
    if (!when) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Modern browsers ignore the returned string, but setting returnValue
      // is still required for the native prompt to render.
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  const close = () => onOpenChange?.(false);

  const handleKeep = () => {
    if (onCancel) onCancel();
    else close();
  };

  const handleDiscard = () => {
    onConfirm?.();
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      title={<span data-testid={`${testId}-title`}>{title}</span>}
      footer={
        <div
          className="flex w-full items-center justify-end gap-2"
          data-testid={`${testId}-footer`}
        >
          <Button
            color="default"
            variant="flat"
            onPress={handleKeep}
            data-testid={`${testId}-keep`}
          >
            {keepLabel}
          </Button>
          <Button
            color="danger"
            onPress={handleDiscard}
            data-testid={`${testId}-discard`}
          >
            {discardLabel}
          </Button>
        </div>
      }
    >
      <p
        className="text-sm text-[var(--app-text-muted)]"
        data-testid={`${testId}-message`}
      >
        {message}
      </p>
    </Modal>
  );
}
