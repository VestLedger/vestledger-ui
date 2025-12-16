import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  AccessLevel,
  Document,
  DocumentFolder,
} from '@/components/documents/document-manager';

export interface DocumentsState {
  documents: Document[];
  folders: DocumentFolder[];
  loading: boolean;
  error?: string;
}

const initialState: DocumentsState = {
  documents: [],
  folders: [],
  loading: false,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    documentsRequested: (state) => {
      state.loading = true;
      state.error = undefined;
    },
    documentsLoaded: (
      state,
      action: PayloadAction<{ documents: Document[]; folders: DocumentFolder[] }>
    ) => {
      state.documents = action.payload.documents;
      state.folders = action.payload.folders;
      state.loading = false;
    },
    documentsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    documentDeleted: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.documents = state.documents.filter((doc) => doc.id !== id);
    },
    documentFavoriteToggled: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.documents = state.documents.map((doc) =>
        doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
      );
    },
    documentMoved: (
      state,
      action: PayloadAction<{ documentId: string; newFolderId: string | null }>
    ) => {
      const { documentId, newFolderId } = action.payload;
      state.documents = state.documents.map((doc) =>
        doc.id === documentId ? { ...doc, folderId: newFolderId } : doc
      );
    },
    documentAccessUpdated: (
      state,
      action: PayloadAction<{ documentId: string; accessLevel: AccessLevel }>
    ) => {
      const { documentId, accessLevel } = action.payload;
      state.documents = state.documents.map((doc) =>
        doc.id === documentId ? { ...doc, accessLevel } : doc
      );
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

export const documentsReducer = documentsSlice.reducer;

