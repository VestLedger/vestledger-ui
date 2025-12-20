import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type {
  AccessLevel,
  Document,
  DocumentFolder,
} from '@/components/documents/document-manager';
import type { StandardQueryParams } from '@/types/serviceParams';

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

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    documentsRequested: (state, action: PayloadAction<GetDocumentsParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    documentsLoaded: (state, action: PayloadAction<DocumentsData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    documentsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // Local mutations (optimistic updates)
    documentDeleted: (state, action: PayloadAction<string>) => {
      if (state.data) {
        const id = action.payload;
        state.data.documents = state.data.documents.filter((doc) => doc.id !== id);
      }
    },
    documentFavoriteToggled: (state, action: PayloadAction<string>) => {
      if (state.data) {
        const id = action.payload;
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
        );
      }
    },
    documentMoved: (
      state,
      action: PayloadAction<{ documentId: string; newFolderId: string | null }>
    ) => {
      if (state.data) {
        const { documentId, newFolderId } = action.payload;
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === documentId ? { ...doc, folderId: newFolderId } : doc
        );
      }
    },
    documentAccessUpdated: (
      state,
      action: PayloadAction<{ documentId: string; accessLevel: AccessLevel }>
    ) => {
      if (state.data) {
        const { documentId, accessLevel } = action.payload;
        state.data.documents = state.data.documents.map((doc) =>
          doc.id === documentId ? { ...doc, accessLevel } : doc
        );
      }
    },
  },
});

export const {
  documentsRequested,
  documentsLoaded,
  documentsFailed,
  documentDeleted,
  documentFavoriteToggled,
  documentMoved,
  documentAccessUpdated,
} = documentsSlice.actions;

// Centralized selectors
export const documentsSelectors = createAsyncSelectors<DocumentsData>('documents');

export const documentsReducer = documentsSlice.reducer;
