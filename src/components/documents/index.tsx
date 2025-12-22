'use client';

import { PageScaffold } from '@/components/ui';
import { DocumentManager, type AccessLevel } from './document-manager';
import { DocumentPreviewModal, useDocumentPreview, getMockDocumentUrl, type PreviewDocument } from './preview';
import { useAppDispatch } from '@/store/hooks';
import {
  documentAccessUpdated,
  documentDeleted,
  documentFavoriteToggled,
  documentMoved,
  documentsRequested,
  documentsSelectors,
} from '@/store/slices/documentsSlice';
import { useUIKey } from '@/store/ui';
import { useAsyncData } from '@/hooks/useAsyncData';

export function Documents() {
  const dispatch = useAppDispatch();
  const { data } = useAsyncData(documentsRequested, documentsSelectors.selectState, { params: {} });
  const documents = data?.documents || [];
  const folders = data?.folders || [];
  const { value: ui } = useUIKey<{ currentFolderId: string | null }>('documents-page', {
    currentFolderId: null,
  });
  const { currentFolderId } = ui;
  const preview = useDocumentPreview();

  const handleUpload = (folderId?: string | null) => {
    console.log('Upload file to folder:', folderId);
    // TODO: Implement file upload
  };

  const handleCreateFolder = (parentId?: string | null) => {
    console.log('Create folder in parent:', parentId);
    // TODO: Implement folder creation (e.g., open modal to capture name)
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

  const handleDownloadDocument = (documentId: string) => {
    console.log('Download document:', documentId);
    // TODO: Implement document download
  };

  const handleShareDocument = (documentId: string) => {
    console.log('Share document:', documentId);
    // TODO: Implement document sharing
  };

  const handleDeleteDocument = (documentId: string) => {
    console.log('Delete document:', documentId);
    dispatch(documentDeleted(documentId));
  };

  const handleToggleFavorite = (documentId: string) => {
    dispatch(documentFavoriteToggled(documentId));
  };

  const handleMoveDocument = (documentId: string, newFolderId: string | null) => {
    console.log('Move document:', documentId, newFolderId);
    dispatch(documentMoved({ documentId, newFolderId }));
  };

  const handleUpdateAccess = (documentId: string, accessLevel: AccessLevel) => {
    console.log('Update access:', documentId, accessLevel);
    dispatch(documentAccessUpdated({ documentId, accessLevel }));
  };

  return (
    <PageScaffold
      routePath="/documents"
      header={{
        title: 'Documents',
        description: 'Manage and organize all your fund documents in one secure location',
      }}
    >
      <DocumentManager
        documents={documents}
        folders={folders}
        currentFolderId={currentFolderId}
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        onOpenDocument={handleOpenDocument}
        onDownloadDocument={handleDownloadDocument}
        onShareDocument={handleShareDocument}
        onDeleteDocument={handleDeleteDocument}
        onToggleFavorite={handleToggleFavorite}
        onMoveDocument={handleMoveDocument}
        onUpdateAccess={handleUpdateAccess}
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
          onDownload={handleDownloadDocument}
          onShare={handleShareDocument}
        />
      )}
    </PageScaffold>
  );
}
