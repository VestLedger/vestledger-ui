'use client';

import { PageScaffold } from '@/ui/composites';
import { DocumentManager, type AccessLevel } from './document-manager';
import { DocumentPreviewModal, useDocumentPreview, getMockDocumentUrl, type PreviewDocument } from './preview';
import { useFund } from '@/contexts/fund-context';
import { useAppDispatch } from '@/store/hooks';
import {
  documentFavoriteToggled,
  documentsSelectors,
} from '@/store/slices/documentsSlice';
import { useUIKey } from '@/store/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/ui';
import { loadDocumentsOperation } from '@/store/async/dataOperations';
import {
  createDocumentFolderOperation,
  deleteDocumentOperation,
  downloadDocumentOperation,
  moveDocumentOperation,
  shareDocumentOperation,
  updateDocumentAccessOperation,
  uploadDocumentOperation,
} from '@/store/async/documentsOperations';

export function Documents() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { selectedFund, viewMode } = useFund();
  const selectedFundId = viewMode === 'individual' ? selectedFund?.id ?? null : null;

  const { data } = useAsyncData(loadDocumentsOperation, documentsSelectors.selectState, {
    params: {
      fundId: selectedFundId,
    },
    dependencies: [selectedFundId],
  });

  const documents = data?.documents || [];
  const folders = data?.folders || [];
  const { value: ui } = useUIKey<{ currentFolderId: string | null }>('documents-page', {
    currentFolderId: null,
  });
  const { currentFolderId } = ui;
  const preview = useDocumentPreview();

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const handleUpload = async (folderId?: string | null) => {
    try {
      await dispatch(uploadDocumentOperation({ folderId, fundId: selectedFundId })).unwrap();
      toast.success('Document uploaded.', 'Upload Complete');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to upload document.'), 'Upload Failed');
    }
  };

  const handleCreateFolder = async (parentId?: string | null) => {
    try {
      await dispatch(createDocumentFolderOperation({ parentId })).unwrap();
      toast.success('Folder created.', 'Folder Added');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create folder.'), 'Create Folder Failed');
    }
  };

  const handleOpenDocument = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      const previewDoc: PreviewDocument = {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url ?? getMockDocumentUrl(doc.type),
        size: doc.size,
        uploadedBy: doc.uploadedBy,
        uploadedDate: doc.uploadedDate,
        category: doc.category,
        tags: doc.tags,
      };

      // Map all documents for navigation
      const allPreviewDocs: PreviewDocument[] = documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        url: d.url ?? getMockDocumentUrl(d.type),
        size: d.size,
        uploadedBy: d.uploadedBy,
        uploadedDate: d.uploadedDate,
        category: d.category,
        tags: d.tags,
      }));

      preview.openPreview(previewDoc, allPreviewDocs);
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const url = await dispatch(downloadDocumentOperation(documentId)).unwrap();
      if (!url) {
        toast.warning('Download link unavailable for this document.');
        return;
      }

      const targetDocument = documents.find((document) => document.id === documentId);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = targetDocument?.name ?? 'document';
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      toast.success('Download started.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to download document.'), 'Download Failed');
    }
  };

  const handleShareDocument = async (documentId: string) => {
    try {
      await dispatch(shareDocumentOperation(documentId)).unwrap();
      toast.success('Document shared with investor access.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to share document.'), 'Share Failed');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await dispatch(deleteDocumentOperation(documentId)).unwrap();
      toast.success('Document deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete document.'), 'Delete Failed');
    }
  };

  const handleToggleFavorite = (documentId: string) => {
    dispatch(documentFavoriteToggled(documentId));
  };

  const handleMoveDocument = async (documentId: string, newFolderId: string | null) => {
    try {
      await dispatch(moveDocumentOperation({ documentId, newFolderId })).unwrap();
      toast.success('Document moved.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to move document.'), 'Move Failed');
    }
  };

  const handleUpdateAccess = async (documentId: string, accessLevel: AccessLevel) => {
    try {
      await dispatch(updateDocumentAccessOperation({ documentId, accessLevel })).unwrap();
      toast.success('Document access updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update access.'), 'Access Update Failed');
    }
  };

  return (
    <PageScaffold
      routePath={ROUTE_PATHS.documents}
      header={{
        title: 'Documents',
        description: 'Manage and organize all your fund documents in one secure location',
      }}
    >
      <DocumentManager
        documents={documents}
        folders={folders}
        currentFolderId={currentFolderId}
        onUpload={(folderId) => {
          void handleUpload(folderId);
        }}
        onCreateFolder={(parentId) => {
          void handleCreateFolder(parentId);
        }}
        onOpenDocument={handleOpenDocument}
        onDownloadDocument={(documentId) => {
          void handleDownloadDocument(documentId);
        }}
        onShareDocument={(documentId) => {
          void handleShareDocument(documentId);
        }}
        onDeleteDocument={(documentId) => {
          void handleDeleteDocument(documentId);
        }}
        onToggleFavorite={handleToggleFavorite}
        onMoveDocument={(documentId, folderId) => {
          void handleMoveDocument(documentId, folderId);
        }}
        onUpdateAccess={(documentId, accessLevel) => {
          void handleUpdateAccess(documentId, accessLevel);
        }}
      />

      {/* Document Preview Modal */}
      {preview.isOpen && preview.previewDocument && (
        <DocumentPreviewModal
          document={preview.previewDocument}
          documents={preview.previewDocuments}
          currentIndex={preview.currentIndex}
          isOpen={preview.isOpen}
          onClose={preview.closePreview}
          onNavigate={preview.navigateToDocument}
          onDownload={(documentId) => {
            void handleDownloadDocument(documentId);
          }}
          onShare={(documentId) => {
            void handleShareDocument(documentId);
          }}
        />
      )}
    </PageScaffold>
  );
}
