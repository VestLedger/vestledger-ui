'use client';

import { Document, Page } from 'react-pdf';
import { Button, Spinner } from '@/ui';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { PDFViewerProps } from '../types';
import { useUIKey } from '@/store/ui';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export function PDFViewer({
  url,
  className = '',
  zoomLevel: externalZoomLevel,
  currentPage: externalCurrentPage,
  onPageChange,
  onZoomChange,
  onLoadSuccess,
  onLoadError,
}: PDFViewerProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    numPages: number;
    pageNumber: number;
    zoom: number;
    isLoading: boolean;
  }>(`pdf-viewer:${url}`, {
    numPages: 0,
    pageNumber: externalCurrentPage || 1,
    zoom: externalZoomLevel || 100,
    isLoading: true,
  });

  const numPages = ui.numPages;
  const isLoading = ui.isLoading;
  const pageNumber = externalCurrentPage ?? ui.pageNumber;
  const zoom = externalZoomLevel ?? ui.zoom;

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    patchUI({ numPages, isLoading: false });
    onLoadSuccess?.();
  };

  const handleDocumentLoadError = (error: Error) => {
    patchUI({ isLoading: false });
    onLoadError?.(error);
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, pageNumber - 1);
    if (externalCurrentPage === undefined) {
      patchUI({ pageNumber: newPage });
    }
    onPageChange?.(newPage);
  };

  const goToNextPage = () => {
    const newPage = Math.min(numPages, pageNumber + 1);
    if (externalCurrentPage === undefined) {
      patchUI({ pageNumber: newPage });
    }
    onPageChange?.(newPage);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom + 25);
    if (externalZoomLevel === undefined) {
      patchUI({ zoom: newZoom });
    }
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoom - 25);
    if (externalZoomLevel === undefined) {
      patchUI({ zoom: newZoom });
    }
    onZoomChange?.(newZoom);
  };

  const handleFitToWidth = () => {
    if (externalZoomLevel === undefined) {
      patchUI({ zoom: 100 });
    }
    onZoomChange?.(100);
  };

  return (
    <div className={`pdf-viewer flex flex-col h-full bg-[var(--app-surface)] ${className}`}>
      {/* PDF Controls */}
      <div className="pdf-controls flex items-center justify-between gap-4 px-6 py-3 border-b border-[var(--app-border)] bg-[var(--app-surface-hover)]">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={goToPreviousPage}
            isDisabled={pageNumber <= 1 || isLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-[var(--app-text)] min-w-[100px] text-center">
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Page {pageNumber} of {numPages}
              </>
            )}
          </span>

          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={goToNextPage}
            isDisabled={pageNumber >= numPages || isLoading}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={handleZoomOut}
            isDisabled={zoom <= 50 || isLoading}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm text-[var(--app-text)] min-w-[60px] text-center">
            {zoom}%
          </span>

          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={handleZoomIn}
            isDisabled={zoom >= 200 || isLoading}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={handleFitToWidth}
            isDisabled={isLoading}
            aria-label="Fit to width"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="pdf-content flex-1 overflow-auto flex items-center justify-center p-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-[var(--app-text-muted)]">Loading PDF...</p>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={<Spinner size="lg" />}
          error={
            <div className="text-center p-8">
              <p className="text-[var(--app-danger)] mb-2">Failed to load PDF</p>
              <p className="text-sm text-[var(--app-text-muted)]">
                Please check your internet connection and try again
              </p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={zoom / 100}
            renderTextLayer
            renderAnnotationLayer
            loading={<Spinner size="lg" />}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
