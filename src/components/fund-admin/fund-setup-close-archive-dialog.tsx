'use client';

import { Button, Modal } from '@/ui';

export interface FundSetupCloseArchiveDialogProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FundSetupCloseArchiveDialog({
  isOpen,
  title,
  body,
  confirmLabel,
  confirmColor = 'warning',
  isLoading,
  onClose,
  onConfirm,
}: FundSetupCloseArchiveDialogProps) {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size="md"
      footer={(
        <>
          <Button variant="bordered" onPress={onClose}>
            Cancel
          </Button>
          <Button color={confirmColor} isLoading={isLoading} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <p className="text-sm text-[var(--app-text-muted)]">{body}</p>
    </Modal>
  );
}
