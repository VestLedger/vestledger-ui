import dynamic from "next/dynamic";

// Export modal with no SSR to avoid browser-only API issues (DOMMatrix, etc.)
export const DocumentPreviewModal = dynamic(
  () =>
    import("./DocumentPreviewModal").then((mod) => ({
      default: mod.DocumentPreviewModal,
    })),
  { ssr: false },
);

export { DocumentPreviewToolbar } from "./DocumentPreviewToolbar";
export { DocumentNavigator } from "./navigation/DocumentNavigator";
export { useDocumentPreview } from "./hooks/useDocumentPreview";
export { getMockDocumentUrl, inferDocumentType } from "./utils/mockDocuments";
export type * from "./types";
