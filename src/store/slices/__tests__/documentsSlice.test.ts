import { describe, expect, it } from "vitest";
import {
  documentDeleted,
  documentMoved,
  documentUpserted,
  documentsLoaded,
  documentsReducer,
} from "../documentsSlice";
import type { DocumentsData } from "../documentsSlice";

const baseDocumentsData: DocumentsData = {
  documents: [
    {
      id: "doc-1",
      name: "Term Sheet",
      type: "pdf",
      category: "legal",
      size: 1000,
      folderId: "folder-1",
      uploadedBy: "Ops",
      uploadedDate: new Date("2024-01-01"),
      lastModified: new Date("2024-01-01"),
      lastModifiedBy: "Ops",
      version: 1,
      tags: [],
      isFavorite: false,
      accessLevel: "internal",
      sharedWith: [],
      isLocked: false,
      requiresSignature: false,
      isArchived: false,
    },
  ],
  folders: [
    {
      id: "folder-1",
      name: "Legal",
      parentId: null,
      path: "/Legal",
      createdBy: "Ops",
      createdDate: new Date("2024-01-01"),
      documentCount: 1,
      accessLevel: "internal",
      isDefault: false,
    },
    {
      id: "folder-2",
      name: "Investor",
      parentId: null,
      path: "/Investor",
      createdBy: "Ops",
      createdDate: new Date("2024-01-01"),
      documentCount: 0,
      accessLevel: "internal",
      isDefault: false,
    },
  ],
};

describe("documentsSlice", () => {
  it("increments folder counts when adding a document", () => {
    const loadedState = documentsReducer(
      undefined,
      documentsLoaded(baseDocumentsData),
    );
    const state = documentsReducer(
      loadedState,
      documentUpserted({
        ...baseDocumentsData.documents[0],
        id: "doc-2",
        name: "Cap Table",
        folderId: "folder-2",
      }),
    );

    expect(
      state.data?.folders.find((folder) => folder.id === "folder-1")
        ?.documentCount,
    ).toBe(1);
    expect(
      state.data?.folders.find((folder) => folder.id === "folder-2")
        ?.documentCount,
    ).toBe(1);
  });

  it("moves folder counts when a document changes folders", () => {
    const loadedState = documentsReducer(
      undefined,
      documentsLoaded(baseDocumentsData),
    );
    const state = documentsReducer(
      loadedState,
      documentMoved({ documentId: "doc-1", newFolderId: "folder-2" }),
    );

    expect(
      state.data?.folders.find((folder) => folder.id === "folder-1")
        ?.documentCount,
    ).toBe(0);
    expect(
      state.data?.folders.find((folder) => folder.id === "folder-2")
        ?.documentCount,
    ).toBe(1);
  });

  it("decrements folder counts when deleting a document", () => {
    const loadedState = documentsReducer(
      undefined,
      documentsLoaded(baseDocumentsData),
    );
    const state = documentsReducer(loadedState, documentDeleted("doc-1"));

    expect(state.data?.documents).toHaveLength(0);
    expect(
      state.data?.folders.find((folder) => folder.id === "folder-1")
        ?.documentCount,
    ).toBe(0);
  });
});
