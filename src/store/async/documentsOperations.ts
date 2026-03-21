import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import {
  createDocumentFolder,
  deleteDocument,
  downloadDocument,
  moveDocument,
  shareDocument,
  updateDocumentAccess,
  uploadDocument,
  type CreateFolderParams,
  type UploadDocumentParams,
} from "@/services/documentsService";
import {
  documentAccessUpdated,
  documentDeleted,
  documentMoved,
  documentUpserted,
  folderUpserted,
} from "@/store/slices/documentsSlice";
import type { AccessLevel } from "@/components/documents/document-manager";
import type {
  Document,
  DocumentFolder,
} from "@/components/documents/document-manager";
import type { NormalizedError } from "@/store/types/AsyncState";
import { normalizeError } from "@/store/utils/normalizeError";

type DocumentsThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: NormalizedError;
};

export const uploadDocumentOperation = createAsyncThunk<
  Document,
  UploadDocumentParams | undefined,
  DocumentsThunkConfig
>("documents/upload", async (params, thunkApi) => {
  try {
    const document = await uploadDocument(params);
    thunkApi.dispatch(documentUpserted(document));
    return document;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const createDocumentFolderOperation = createAsyncThunk<
  DocumentFolder,
  CreateFolderParams | undefined,
  DocumentsThunkConfig
>("documents/createFolder", async (params, thunkApi) => {
  try {
    const folder = await createDocumentFolder(params);
    thunkApi.dispatch(folderUpserted(folder));
    return folder;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const downloadDocumentOperation = createAsyncThunk<
  string | null,
  string,
  DocumentsThunkConfig
>("documents/download", async (documentId, thunkApi) => {
  try {
    return await downloadDocument(documentId);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const shareDocumentOperation = createAsyncThunk<
  { documentId: string; accessLevel: AccessLevel },
  string,
  DocumentsThunkConfig
>("documents/share", async (documentId, thunkApi) => {
  try {
    await shareDocument(documentId);
    const result = { documentId, accessLevel: "investor" as const };
    thunkApi.dispatch(documentAccessUpdated(result));
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const deleteDocumentOperation = createAsyncThunk<
  string,
  string,
  DocumentsThunkConfig
>("documents/delete", async (documentId, thunkApi) => {
  try {
    await deleteDocument(documentId);
    thunkApi.dispatch(documentDeleted(documentId));
    return documentId;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const moveDocumentOperation = createAsyncThunk<
  { documentId: string; newFolderId: string | null },
  { documentId: string; newFolderId: string | null },
  DocumentsThunkConfig
>("documents/move", async ({ documentId, newFolderId }, thunkApi) => {
  try {
    await moveDocument(documentId, newFolderId);
    const result = { documentId, newFolderId };
    thunkApi.dispatch(documentMoved(result));
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});

export const updateDocumentAccessOperation = createAsyncThunk<
  { documentId: string; accessLevel: AccessLevel },
  { documentId: string; accessLevel: AccessLevel },
  DocumentsThunkConfig
>("documents/updateAccess", async ({ documentId, accessLevel }, thunkApi) => {
  try {
    await updateDocumentAccess(documentId, accessLevel);
    const result = { documentId, accessLevel };
    thunkApi.dispatch(documentAccessUpdated(result));
    return result;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(normalizeError(error));
  }
});
