'use client';

import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { Spinner, Button } from '@/ui';
import { Download, AlertCircle } from 'lucide-react';
import { OfficeDocViewerProps } from '../types';
import { useUIKey } from '@/store/ui';

export function OfficeDocViewer({
  url,
  fileName,
  fileType,
  className = '',
  onLoadSuccess,
  onLoadError,
}: OfficeDocViewerProps) {
  const { value: ui, patch: patchUI } = useUIKey(`office-doc-viewer:${url}`, {
    isLoading: true,
    hasError: false,
  });
  const { isLoading, hasError } = ui;

  const handleDocumentLoad = () => {
    patchUI({ isLoading: false, hasError: false });
    onLoadSuccess?.();
  };

  const handleDocumentError = (error: Error) => {
    patchUI({ isLoading: false, hasError: true });
    onLoadError?.(error);
  };

  const docs = [
    {
      uri: url,
      fileName: fileName,
    },
  ];

  const fileTypeLabel = {
    word: 'Word Document',
    excel: 'Excel Spreadsheet',
    presentation: 'PowerPoint Presentation',
  }[fileType];

  if (hasError) {
    return (
      <div className="office-viewer flex items-center justify-center h-full bg-[var(--app-surface)]">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-[var(--app-warning)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">
            Unable to Preview {fileTypeLabel}
          </h3>
          <p className="text-sm text-[var(--app-text-muted)] mb-6">
            This {fileTypeLabel.toLowerCase()} cannot be previewed in the browser.
            Please download it to view on your computer.
          </p>
          <Button
            color="primary"
            startContent={<Download className="w-4 h-4" />}
            onPress={() => {
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download {fileTypeLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`office-viewer h-full bg-[var(--app-surface)] relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--app-text-muted)]">Loading {fileTypeLabel.toLowerCase()}...</p>
        </div>
      )}

      <DocViewer
        documents={docs}
        pluginRenderers={DocViewerRenderers}
        onDocumentChange={handleDocumentLoad}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
          },
          pdfVerticalScrollByDefault: true,
        }}
        theme={{
          primary: 'var(--app-primary)',
          secondary: 'var(--app-surface)',
          tertiary: 'var(--app-border)',
          textPrimary: 'var(--app-text)',
          textSecondary: 'var(--app-text-muted)',
          textTertiary: 'var(--app-text-subtle)',
          disableThemeScrollbar: false,
        }}
        style={{ height: '100%' }}
        className="doc-viewer-container"
      />
    </div>
  );
}
