import type { AccessLevel, Document, DocumentFolder, DocumentType } from '@/components/documents/document-manager';
import { isMockMode } from '@/config/data-mode';
import { mockDocuments, mockFolders } from '@/data/mocks/documents';
import { getMockDocumentUrl } from '@/data/mocks/documents/preview';

export type ListDocumentsResponse = {
  documents: Document[];
  folders: DocumentFolder[];
};

function withMockUrls(documents: Document[]): Document[] {
  return documents.map((doc) => ({
    ...doc,
    url: doc.url ?? getMockDocumentUrl(doc.type),
  }));
}

export async function listDocuments(): Promise<ListDocumentsResponse> {
  if (isMockMode()) {
    return { documents: withMockUrls(mockDocuments), folders: mockFolders };
  }

  throw new Error('Documents API not implemented yet');
}

export function getDocumentPreviewUrl(type: DocumentType): string {
  return getMockDocumentUrl(type);
}

export async function deleteDocument(_documentId: string): Promise<void> {
  if (isMockMode()) return;
  throw new Error('Documents API not implemented yet');
}

export async function updateDocumentAccess(
  _documentId: string,
  _accessLevel: AccessLevel
): Promise<void> {
  if (isMockMode()) return;
  throw new Error('Documents API not implemented yet');
}

