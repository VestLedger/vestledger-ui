'use client';

import { Button } from '@/ui';
import { Download, Share2, Printer, X } from 'lucide-react';
import { PreviewDocument } from './types';
import { formatDate } from '@/utils/formatting';

interface DocumentPreviewToolbarProps {
  document: PreviewDocument;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onClose: () => void;
}

export function DocumentPreviewToolbar({
  document,
  onDownload,
  onShare,
  onPrint,
  onClose,
}: DocumentPreviewToolbarProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (document.url) {
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="document-preview-toolbar flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
      {/* Document Title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-[var(--app-text)] truncate">{document.name}</h2>
        {document.uploadedBy && (
          <p className="text-sm text-[var(--app-text-muted)]">
            Uploaded by {document.uploadedBy}
            {document.uploadedDate && ` on ${formatDate(document.uploadedDate)}`}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          startContent={<Download className="w-4 h-4" />}
          onPress={handleDownload}
        >
          Download
        </Button>

        {onShare && (
          <Button
            size="sm"
            variant="flat"
            startContent={<Share2 className="w-4 h-4" />}
            onPress={onShare}
          >
            Share
          </Button>
        )}

        <Button
          size="sm"
          variant="flat"
          startContent={<Printer className="w-4 h-4" />}
          onPress={handlePrint}
        >
          Print
        </Button>

        <div className="w-px h-6 bg-[var(--app-border)] mx-2" />

        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={onClose}
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
