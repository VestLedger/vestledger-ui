'use client';

import { Button, Badge } from '@/ui';
import { FileQuestion, Download, File } from 'lucide-react';
import { UnsupportedViewerProps } from '../types';
import { formatDate } from '@/utils/formatting';

export function UnsupportedViewer({ document, onDownload }: UnsupportedViewerProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="unsupported-viewer flex items-center justify-center h-full bg-[var(--app-surface)]">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="relative inline-block">
            <File className="w-24 h-24 text-[var(--app-text-muted)] mx-auto" strokeWidth={1} />
            <FileQuestion className="w-10 h-10 text-[var(--app-warning)] absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">Preview Not Available</h3>

        <p className="text-sm text-[var(--app-text-muted)] mb-6">
          This file type cannot be previewed in the browser. Download it to view on your computer.
        </p>

        <div className="bg-[var(--app-surface-hover)] rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--app-text)] truncate mb-1">{document.name}</p>
              <p className="text-xs text-[var(--app-text-muted)]">{formatFileSize(document.size)}</p>
            </div>
            <Badge size="sm" variant="flat" className="ml-3">
              {getFileExtension(document.name)}
            </Badge>
          </div>

          {document.uploadedBy && (
            <div className="text-xs text-[var(--app-text-muted)] flex items-center gap-2">
              <span>Uploaded by {document.uploadedBy}</span>
              {document.uploadedDate && (
                <span>on {formatDate(document.uploadedDate)}</span>
              )}
            </div>
          )}
        </div>

        <Button
          color="primary"
          size="lg"
          startContent={<Download className="w-5 h-5" />}
          onPress={() => {
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
          }}
        >
          Download File
        </Button>

        {document.category && (
          <div className="mt-4">
            <Badge size="sm" variant="light">
              {document.category}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
