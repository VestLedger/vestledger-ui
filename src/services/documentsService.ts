import type {
  AccessLevel,
  Document,
  DocumentCategory,
  DocumentFolder,
  DocumentType,
  DocumentVersion,
  SharedAccess,
} from '@/components/documents/document-manager';
import { isMockMode } from '@/config/data-mode';
import { mockDocuments, mockFolders } from '@/data/mocks/documents';
import { getMockDocumentUrl } from '@/data/mocks/documents/preview';
import { requestJson } from '@/services/shared/httpClient';
import type { GetDocumentsParams } from '@/store/slices/documentsSlice';

export type ListDocumentsResponse = {
  documents: Document[];
  folders: DocumentFolder[];
};

type ApiDocument = {
  id: string;
  name: string;
  type?: string;
  category?: string;
  size?: number;
  folderId?: string | null;
  folderPath?: string;
  uploadedBy?: string;
  uploadedDate?: string | Date;
  lastModified?: string | Date;
  lastModifiedBy?: string;
  version?: number;
  versionHistory?: unknown;
  tags?: string[];
  description?: string;
  isFavorite?: boolean;
  accessLevel?: string;
  sharedWith?: unknown;
  isLocked?: boolean;
  lockedBy?: string;
  fundId?: string;
  fundName?: string;
  dealId?: string;
  dealName?: string;
  lpId?: string;
  lpName?: string;
  requiresSignature?: boolean;
  signedBy?: string[];
  expirationDate?: string | Date;
  isArchived?: boolean;
  url?: string;
  thumbnailUrl?: string;
  checksum?: string;
};

type ApiDocumentFolder = {
  id: string;
  name: string;
  parentId?: string | null;
  path?: string;
  color?: string;
  icon?: string;
  description?: string;
  createdBy?: string;
  createdDate?: string | Date;
  documentCount?: number;
  accessLevel?: string;
  isDefault?: boolean;
};

type ApiDocumentsResponse = {
  documents?: ApiDocument[];
  folders?: ApiDocumentFolder[];
};

type CreateFolderParams = {
  parentId?: string | null;
  name?: string;
  createdBy?: string;
  accessLevel?: AccessLevel;
};

type UploadDocumentParams = {
  folderId?: string | null;
  fundId?: string | null;
  name?: string;
  uploadedBy?: string;
  category?: DocumentCategory;
  type?: DocumentType;
  size?: number;
};

let documentsSnapshotCache: ListDocumentsResponse | null = null;

const DEFAULT_USER_NAME = 'Demo User';
const clone = <T>(value: T): T => structuredClone(value);

function normalizeAccessLevel(value?: string): AccessLevel {
  if (value === 'private' || value === 'internal' || value === 'investor' || value === 'public') {
    return value;
  }
  return 'internal';
}

function normalizeDocumentType(value?: string): DocumentType {
  if (
    value === 'pdf'
    || value === 'word'
    || value === 'excel'
    || value === 'image'
    || value === 'presentation'
    || value === 'archive'
    || value === 'other'
  ) {
    return value;
  }
  return 'other';
}

function normalizeDocumentCategory(value?: string): DocumentCategory {
  if (
    value === 'legal'
    || value === 'financial'
    || value === 'tax'
    || value === 'compliance'
    || value === 'investor-relations'
    || value === 'due-diligence'
    || value === 'portfolio'
    || value === 'other'
  ) {
    return value;
  }
  return 'other';
}

function parseDate(value?: string | Date | null, fallback?: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback ?? new Date();
}

function mapSharedWith(sharedWith: unknown): SharedAccess[] {
  if (!Array.isArray(sharedWith)) return [];

  const mapped = sharedWith
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry, index) => {
      const access = entry.accessLevel;
      const accessLevel =
        access === 'view' || access === 'comment' || access === 'edit'
          ? access
          : 'view';

      return {
        userId: typeof entry.userId === 'string' ? entry.userId : `shared-${index}`,
        userName: typeof entry.userName === 'string' ? entry.userName : 'External User',
        userEmail: typeof entry.userEmail === 'string' ? entry.userEmail : `external-${index}@example.com`,
        accessLevel,
        sharedDate: parseDate(
          typeof entry.sharedDate === 'string' || entry.sharedDate instanceof Date
            ? entry.sharedDate
            : undefined
        ),
        expiresAt:
          typeof entry.expiresAt === 'string' || entry.expiresAt instanceof Date
            ? parseDate(entry.expiresAt)
            : undefined,
      } satisfies SharedAccess;
    });

  return mapped;
}

function mapVersionHistory(versionHistory: unknown): DocumentVersion[] | undefined {
  if (!Array.isArray(versionHistory) || versionHistory.length === 0) return undefined;

  const mapped = versionHistory
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry, index) => ({
      version: typeof entry.version === 'number' ? entry.version : index + 1,
      uploadedBy: typeof entry.uploadedBy === 'string' ? entry.uploadedBy : DEFAULT_USER_NAME,
      uploadedDate: parseDate(
        typeof entry.uploadedDate === 'string' || entry.uploadedDate instanceof Date
          ? entry.uploadedDate
          : undefined
      ),
      changeNote: typeof entry.changeNote === 'string' ? entry.changeNote : undefined,
      size: typeof entry.size === 'number' ? entry.size : 0,
      url:
        typeof entry.url === 'string'
          ? entry.url
          : getMockDocumentUrl('other'),
    }));

  return mapped;
}

function withMockUrls(documents: Document[]): Document[] {
  return documents.map((document) => ({
    ...document,
    url: document.url ?? getMockDocumentUrl(document.type),
  }));
}

function mapApiDocument(apiDocument: ApiDocument): Document {
  const documentType = normalizeDocumentType(apiDocument.type);
  const uploadedDate = parseDate(apiDocument.uploadedDate);
  const lastModified = parseDate(apiDocument.lastModified, uploadedDate);

  return {
    id: apiDocument.id,
    name: apiDocument.name,
    type: documentType,
    category: normalizeDocumentCategory(apiDocument.category),
    size: typeof apiDocument.size === 'number' ? apiDocument.size : 0,
    folderId: apiDocument.folderId ?? null,
    folderPath: apiDocument.folderPath,
    uploadedBy: apiDocument.uploadedBy ?? DEFAULT_USER_NAME,
    uploadedDate,
    lastModified,
    lastModifiedBy: apiDocument.lastModifiedBy ?? apiDocument.uploadedBy ?? DEFAULT_USER_NAME,
    version: typeof apiDocument.version === 'number' ? apiDocument.version : 1,
    versionHistory: mapVersionHistory(apiDocument.versionHistory),
    tags: Array.isArray(apiDocument.tags) ? apiDocument.tags : [],
    description: apiDocument.description,
    isFavorite: Boolean(apiDocument.isFavorite),
    accessLevel: normalizeAccessLevel(apiDocument.accessLevel),
    sharedWith: mapSharedWith(apiDocument.sharedWith),
    isLocked: Boolean(apiDocument.isLocked),
    lockedBy: apiDocument.lockedBy,
    fundId: apiDocument.fundId,
    fundName: apiDocument.fundName,
    dealId: apiDocument.dealId,
    dealName: apiDocument.dealName,
    lpId: apiDocument.lpId,
    lpName: apiDocument.lpName,
    requiresSignature: Boolean(apiDocument.requiresSignature),
    signedBy: Array.isArray(apiDocument.signedBy) ? apiDocument.signedBy : [],
    expirationDate:
      typeof apiDocument.expirationDate === 'string' || apiDocument.expirationDate instanceof Date
        ? parseDate(apiDocument.expirationDate)
        : undefined,
    isArchived: Boolean(apiDocument.isArchived),
    url: apiDocument.url ?? getMockDocumentUrl(documentType),
    thumbnailUrl: apiDocument.thumbnailUrl,
    checksum: apiDocument.checksum,
  };
}

function mapApiFolder(apiFolder: ApiDocumentFolder): DocumentFolder {
  return {
    id: apiFolder.id,
    name: apiFolder.name,
    parentId: apiFolder.parentId ?? null,
    path: apiFolder.path ?? `/${apiFolder.name}`,
    color: apiFolder.color,
    icon: apiFolder.icon,
    description: apiFolder.description,
    createdBy: apiFolder.createdBy ?? DEFAULT_USER_NAME,
    createdDate: parseDate(apiFolder.createdDate),
    documentCount: typeof apiFolder.documentCount === 'number' ? apiFolder.documentCount : 0,
    accessLevel: normalizeAccessLevel(apiFolder.accessLevel),
    isDefault: Boolean(apiFolder.isDefault),
  };
}

function applyFilters(
  snapshot: ListDocumentsResponse,
  params?: GetDocumentsParams
): ListDocumentsResponse {
  if (!params) return clone(snapshot);

  let filteredDocuments = [...snapshot.documents];

  if (params.fundId) {
    filteredDocuments = filteredDocuments.filter((document) => document.fundId === params.fundId);
  }

  if (params.folderId !== undefined && params.folderId !== null) {
    filteredDocuments = filteredDocuments.filter((document) => document.folderId === params.folderId);
  }

  if (params.favoritesOnly) {
    filteredDocuments = filteredDocuments.filter((document) => document.isFavorite);
  }

  if (params.search && params.search.trim().length > 0) {
    const searchQuery = params.search.toLowerCase().trim();
    filteredDocuments = filteredDocuments.filter((document) =>
      document.name.toLowerCase().includes(searchQuery)
      || document.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
      || document.description?.toLowerCase().includes(searchQuery)
      || document.fundName?.toLowerCase().includes(searchQuery)
      || document.dealName?.toLowerCase().includes(searchQuery)
    );
  }

  const sortBy = params.sortBy ?? 'uploadedDate';
  const sortOrder = params.sortOrder ?? 'desc';
  filteredDocuments.sort((left, right) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = left.name.localeCompare(right.name);
    } else if (sortBy === 'size') {
      comparison = left.size - right.size;
    } else if (sortBy === 'lastModified') {
      comparison = left.lastModified.getTime() - right.lastModified.getTime();
    } else {
      comparison = left.uploadedDate.getTime() - right.uploadedDate.getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const offset = params.offset ?? 0;
  const limit = params.limit ?? filteredDocuments.length;
  const slicedDocuments = filteredDocuments.slice(offset, offset + limit);

  return {
    documents: clone(slicedDocuments),
    folders: clone(snapshot.folders),
  };
}

function getBaseMockSnapshot(): ListDocumentsResponse {
  return {
    documents: withMockUrls(clone(mockDocuments)),
    folders: clone(mockFolders),
  };
}

function getCachedOrMockSnapshot(): ListDocumentsResponse {
  return clone(documentsSnapshotCache ?? getBaseMockSnapshot());
}

function updateCachedDocument(
  documentId: string,
  updater: (document: Document) => Document
): void {
  const snapshot = getCachedOrMockSnapshot();
  snapshot.documents = snapshot.documents.map((document) =>
    document.id === documentId ? updater(document) : document
  );
  documentsSnapshotCache = snapshot;
}

function upsertCachedDocument(document: Document): void {
  const snapshot = getCachedOrMockSnapshot();
  const existingIndex = snapshot.documents.findIndex((item) => item.id === document.id);
  if (existingIndex >= 0) {
    snapshot.documents[existingIndex] = document;
  } else {
    snapshot.documents.unshift(document);
  }
  documentsSnapshotCache = snapshot;
}

function upsertCachedFolder(folder: DocumentFolder): void {
  const snapshot = getCachedOrMockSnapshot();
  const existingIndex = snapshot.folders.findIndex((item) => item.id === folder.id);
  if (existingIndex >= 0) {
    snapshot.folders[existingIndex] = folder;
  } else {
    snapshot.folders.push(folder);
  }
  documentsSnapshotCache = snapshot;
}

function removeCachedDocument(documentId: string): void {
  const snapshot = getCachedOrMockSnapshot();
  snapshot.documents = snapshot.documents.filter((document) => document.id !== documentId);
  documentsSnapshotCache = snapshot;
}

export async function listDocuments(params?: GetDocumentsParams): Promise<ListDocumentsResponse> {
  if (isMockMode('documents')) {
    if (!documentsSnapshotCache) {
      documentsSnapshotCache = getBaseMockSnapshot();
    }
    return applyFilters(documentsSnapshotCache, params);
  }

  try {
    const response = await requestJson<ApiDocumentsResponse>('/documents', {
      method: 'GET',
      query: {
        fundId: params?.fundId,
        folderId: params?.folderId,
        favoritesOnly: params?.favoritesOnly,
        search: params?.search,
        limit: params?.limit ?? 200,
        offset: params?.offset ?? 0,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
      fallbackMessage: 'Failed to fetch documents',
    });

    const snapshot: ListDocumentsResponse = {
      documents: withMockUrls((response.documents ?? []).map(mapApiDocument)),
      folders: (response.folders ?? []).map(mapApiFolder),
    };

    documentsSnapshotCache = snapshot;
    return applyFilters(snapshot, params);
  } catch {
    const fallback = getCachedOrMockSnapshot();
    return applyFilters(fallback, params);
  }
}

export function getDocumentPreviewUrl(type: DocumentType): string {
  return getMockDocumentUrl(type);
}

export async function uploadDocument(
  params: UploadDocumentParams = {}
): Promise<Document> {
  const now = new Date();
  const documentName = params.name ?? `Uploaded Document ${now.toISOString().slice(0, 10)}.pdf`;
  const documentType = params.type ?? 'pdf';
  const uploader = params.uploadedBy ?? DEFAULT_USER_NAME;

  if (isMockMode('documents')) {
    const document: Document = {
      id: `mock-doc-${Date.now()}`,
      name: documentName,
      type: documentType,
      category: params.category ?? 'other',
      size: params.size ?? 245_000,
      folderId: params.folderId ?? null,
      uploadedBy: uploader,
      uploadedDate: now,
      lastModified: now,
      lastModifiedBy: uploader,
      version: 1,
      tags: ['uploaded'],
      isFavorite: false,
      accessLevel: 'internal',
      sharedWith: [],
      isLocked: false,
      requiresSignature: false,
      signedBy: [],
      isArchived: false,
      url: getMockDocumentUrl(documentType),
      fundId: params.fundId ?? undefined,
    };

    upsertCachedDocument(document);
    return clone(document);
  }

  try {
    const created = await requestJson<ApiDocument>('/documents', {
      method: 'POST',
      body: {
        name: documentName,
        type: documentType,
        category: params.category ?? 'other',
        size: params.size ?? 245_000,
        folderId: params.folderId ?? undefined,
        uploadedBy: uploader,
        lastModifiedBy: uploader,
        tags: ['uploaded'],
        accessLevel: 'internal',
        fundId: params.fundId ?? undefined,
        requiresSignature: false,
        url: getMockDocumentUrl(documentType),
      },
      fallbackMessage: 'Failed to upload document',
    });

    const mapped = mapApiDocument(created);
    upsertCachedDocument(mapped);
    return clone(mapped);
  } catch {
    const fallback = getCachedOrMockSnapshot().documents[0];
    if (fallback) return clone(fallback);
    throw new Error('Failed to upload document');
  }
}

export async function createDocumentFolder(
  params: CreateFolderParams = {}
): Promise<DocumentFolder> {
  const snapshot = getCachedOrMockSnapshot();
  const parentFolder = params.parentId
    ? snapshot.folders.find((folder) => folder.id === params.parentId)
    : null;
  const folderName = params.name ?? `New Folder ${new Date().toISOString().slice(0, 10)}`;
  const folderPath = parentFolder ? `${parentFolder.path}/${folderName}` : `/${folderName}`;

  if (isMockMode('documents')) {
    const folder: DocumentFolder = {
      id: `mock-folder-${Date.now()}`,
      name: folderName,
      parentId: params.parentId ?? null,
      path: folderPath,
      createdBy: params.createdBy ?? DEFAULT_USER_NAME,
      createdDate: new Date(),
      documentCount: 0,
      accessLevel: params.accessLevel ?? 'internal',
      isDefault: false,
    };

    upsertCachedFolder(folder);
    return clone(folder);
  }

  try {
    const created = await requestJson<ApiDocumentFolder>('/documents/folders', {
      method: 'POST',
      body: {
        name: folderName,
        parentId: params.parentId ?? undefined,
        path: folderPath,
        createdBy: params.createdBy ?? DEFAULT_USER_NAME,
        accessLevel: params.accessLevel ?? 'internal',
      },
      fallbackMessage: 'Failed to create folder',
    });

    const mapped = mapApiFolder(created);
    upsertCachedFolder(mapped);
    return clone(mapped);
  } catch {
    const fallback = getCachedOrMockSnapshot().folders[0];
    if (fallback) return clone(fallback);
    throw new Error('Failed to create folder');
  }
}

export async function downloadDocument(documentId: string): Promise<string | null> {
  const snapshot = getCachedOrMockSnapshot();
  const cached = snapshot.documents.find((document) => document.id === documentId);
  if (cached?.url) return cached.url;

  if (!isMockMode('documents')) {
    try {
      const response = await requestJson<ApiDocument>(`/documents/${documentId}`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch document',
      });
      const mapped = mapApiDocument(response);
      upsertCachedDocument(mapped);
      return mapped.url ?? getMockDocumentUrl(mapped.type);
    } catch {
      return null;
    }
  }

  return null;
}

export async function shareDocument(documentId: string): Promise<void> {
  await updateDocumentAccess(documentId, 'investor');
}

export async function deleteDocument(documentId: string): Promise<void> {
  if (isMockMode('documents')) {
    removeCachedDocument(documentId);
    return;
  }

  await requestJson<void>(`/documents/${documentId}`, {
    method: 'DELETE',
    fallbackMessage: 'Failed to delete document',
  });
  removeCachedDocument(documentId);
}

export async function moveDocument(
  documentId: string,
  folderId: string | null
): Promise<void> {
  const snapshot = getCachedOrMockSnapshot();
  const targetFolder = folderId
    ? snapshot.folders.find((folder) => folder.id === folderId)
    : undefined;

  if (isMockMode('documents')) {
    updateCachedDocument(documentId, (document) => ({
      ...document,
      folderId,
      folderPath: targetFolder?.path,
      lastModified: new Date(),
      lastModifiedBy: DEFAULT_USER_NAME,
    }));
    return;
  }

  await requestJson<ApiDocument>(`/documents/${documentId}`, {
    method: 'PATCH',
    body: {
      folderId,
      lastModifiedBy: DEFAULT_USER_NAME,
    },
    fallbackMessage: 'Failed to move document',
  });

  updateCachedDocument(documentId, (document) => ({
    ...document,
    folderId,
    folderPath: targetFolder?.path,
    lastModified: new Date(),
    lastModifiedBy: DEFAULT_USER_NAME,
  }));
}

export async function updateDocumentAccess(
  documentId: string,
  accessLevel: AccessLevel
): Promise<void> {
  if (isMockMode('documents')) {
    updateCachedDocument(documentId, (document) => ({
      ...document,
      accessLevel,
      lastModified: new Date(),
      lastModifiedBy: DEFAULT_USER_NAME,
    }));
    return;
  }

  await requestJson<void>(`/documents/${documentId}/access`, {
    method: 'PATCH',
    body: { accessLevel },
    fallbackMessage: 'Failed to update document access',
  });

  updateCachedDocument(documentId, (document) => ({
    ...document,
    accessLevel,
    lastModified: new Date(),
    lastModifiedBy: DEFAULT_USER_NAME,
  }));
}
