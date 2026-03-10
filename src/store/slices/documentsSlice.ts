import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AsyncState, NormalizedError } from "@/store/types/AsyncState";
import { createInitialAsyncState } from "@/store/types/AsyncState";
import { createAsyncSelectors } from "@/store/utils/createAsyncSelectors";
import type {
  AccessLevel,
  Document,
  DocumentFolder,
} from "@/components/documents/document-manager";
import type { StandardQueryParams } from "@/types/serviceParams";

export interface DocumentsData {
  documents: Document[];
  folders: DocumentFolder[];
}

export interface GetDocumentsParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
  folderId?: string | null;
  favoritesOnly?: boolean;
}

type DocumentsState = AsyncState<DocumentsData>;

const initialState: DocumentsState = createInitialAsyncState<DocumentsData>();

function adjustFolderCount(
  folders: DocumentFolder[],
  folderId: string | null | undefined,
  delta: number,
) {
  if (!folderId) return folders;

  return folders.map((folder) =>
    folder.id === folderId
      ? { ...folder, documentCount: Math.max(0, folder.documentCount + delta) }
      : folder,
  );
}

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    documentsRequested: (state, _action: PayloadAction<GetDocumentsParams>) => {
      state.status = "loading";
      state.error = undefined;
    },
    documentsLoaded: (state, action: PayloadAction<DocumentsData>) => {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = undefined;
    },
    documentsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    documentUpserted: (state, action: PayloadAction<Document>) => {
      if (!state.data) {
        state.data = {
          documents: [],
          folders: [],
        };
      }

      const nextDocument = action.payload;
      const existingIndex = state.data.documents.findIndex(
        (document) => document.id === nextDocument.id,
      );
      const existingDocument =
        existingIndex === -1 ? null : state.data.documents[existingIndex];

      if (existingIndex === -1) {
        state.data.documents = [nextDocument, ...state.data.documents];
        state.data.folders = adjustFolderCount(
          state.data.folders,
          nextDocument.folderId,
          1,
        );
      } else {
        state.data.documents[existingIndex] = nextDocument;
        if (existingDocument?.folderId !== nextDocument.folderId) {
          state.data.folders = adjustFolderCount(
            state.data.folders,
            existingDocument?.folderId,
            -1,
          );
          state.data.folders = adjustFolderCount(
            state.data.folders,
            nextDocument.folderId,
            1,
          );
        }
      }
    },
    folderUpserted: (state, action: PayloadAction<DocumentFolder>) => {
      if (!state.data) {
        state.data = {
          documents: [],
          folders: [],
        };
      }

      const nextFolder = action.payload;
      const existingIndex = state.data.folders.findIndex(
        (folder) => folder.id === nextFolder.id,
      );

      if (existingIndex === -1) {
        state.data.folders = [nextFolder, ...state.data.folders];
      } else {
        state.data.folders[existingIndex] = nextFolder;
      }
    },

    // Local mutations (optimistic updates)
    documentDeleted: (state, action: PayloadAction<string>) => {
      if (state.data) {
        const id = action.payload;
        const existingDocument = state.data.documents.find(
          (doc) => doc.id === id,
        );
        state.data.documents = state.data.documents.filter(
          (doc) => doc.id !== id,
        );
        state.data.folders = adjustFolderCount(
          state.data.folders,
          existingDocument?.folderId,
          -1,
        );
      }
    },
    documentFavoriteToggled: (state, action: PayloadAction<string>) => {
      if (state.data) {
        const id = action.payload;
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc,
        );
      }
    },
    documentMoved: (
      state,
      action: PayloadAction<{ documentId: string; newFolderId: string | null }>,
    ) => {
      if (state.data) {
        const { documentId, newFolderId } = action.payload;
        const existingDocument = state.data.documents.find(
          (doc) => doc.id === documentId,
        );
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === documentId ? { ...doc, folderId: newFolderId } : doc,
        );
        if (existingDocument?.folderId !== newFolderId) {
          state.data.folders = adjustFolderCount(
            state.data.folders,
            existingDocument?.folderId,
            -1,
          );
          state.data.folders = adjustFolderCount(
            state.data.folders,
            newFolderId,
            1,
          );
        }
      }
    },
    documentAccessUpdated: (
      state,
      action: PayloadAction<{ documentId: string; accessLevel: AccessLevel }>,
    ) => {
      if (state.data) {
        const { documentId, accessLevel } = action.payload;
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === documentId ? { ...doc, accessLevel } : doc,
        );
      }
    },
  },
});

export const {
  documentsLoaded,
  documentsFailed,
  documentUpserted,
  folderUpserted,
  documentDeleted,
  documentFavoriteToggled,
  documentMoved,
  documentAccessUpdated,
} = documentsSlice.actions;

// Centralized selectors
export const documentsSelectors =
  createAsyncSelectors<DocumentsData>("documents");

export const documentsReducer = documentsSlice.reducer;
