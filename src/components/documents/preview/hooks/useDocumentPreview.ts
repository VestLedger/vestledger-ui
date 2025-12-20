import { useCallback } from 'react';
import { useUIKey } from '@/store/ui';
import { PreviewDocument } from '../types';

export function useDocumentPreview() {
  const { value: ui, patch: patchUI } = useUIKey<{
    previewDocument: PreviewDocument | null;
    previewDocuments: PreviewDocument[];
    currentIndex: number;
  }>('document-preview', {
    previewDocument: null,
    previewDocuments: [],
    currentIndex: 0,
  });
  const { previewDocument, previewDocuments, currentIndex } = ui;

  const openPreview = useCallback(
    (document: PreviewDocument, documents?: PreviewDocument[]) => {
      if (documents && documents.length > 0) {
        const index = documents.findIndex((d) => d.id === document.id);
        patchUI({
          previewDocument: document,
          previewDocuments: documents,
          currentIndex: index >= 0 ? index : 0,
        });
      } else {
        patchUI({
          previewDocument: document,
          previewDocuments: [document],
          currentIndex: 0,
        });
      }
    },
    [patchUI]
  );

  const closePreview = useCallback(() => {
    patchUI({
      previewDocument: null,
      previewDocuments: [],
      currentIndex: 0,
    });
  }, [patchUI]);

  const navigateToDocument = useCallback(
    (index: number) => {
      if (index >= 0 && index < previewDocuments.length) {
        patchUI({
          currentIndex: index,
          previewDocument: previewDocuments[index],
        });
      }
    },
    [patchUI, previewDocuments]
  );

  const navigateNext = useCallback(() => {
    if (currentIndex < previewDocuments.length - 1) {
      navigateToDocument(currentIndex + 1);
    }
  }, [currentIndex, navigateToDocument, previewDocuments.length]);

  const navigatePrevious = useCallback(() => {
    if (currentIndex > 0) {
      navigateToDocument(currentIndex - 1);
    }
  }, [currentIndex, navigateToDocument]);

  const canNavigateNext = currentIndex < previewDocuments.length - 1;
  const canNavigatePrevious = currentIndex > 0;
  const hasMultipleDocuments = previewDocuments.length > 1;

  const setPreviewDocument = useCallback(
    (document: PreviewDocument | null) => {
      patchUI({ previewDocument: document });
    },
    [patchUI]
  );

  const setCurrentIndex = useCallback(
    (index: number) => {
      patchUI({ currentIndex: index });
    },
    [patchUI]
  );

  return {
    previewDocument,
    previewDocuments,
    currentIndex,
    isOpen: !!previewDocument,
    hasMultipleDocuments,
    canNavigateNext,
    canNavigatePrevious,
    openPreview,
    closePreview,
    navigateToDocument,
    navigateNext,
    navigatePrevious,
    setPreviewDocument,
    setCurrentIndex,
  };
}
