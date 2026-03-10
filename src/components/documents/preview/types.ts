export type DocumentType =
  | "pdf"
  | "word"
  | "excel"
  | "presentation"
  | "image"
  | "archive"
  | "other";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface PreviewDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size?: number;
  uploadedBy?: string;
  uploadedDate?: Date;
  lastModified?: Date;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  metadata?: Record<string, JsonValue>;
}

export interface DocumentPreviewProps {
  document: PreviewDocument;
  documents?: PreviewDocument[];
  currentIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  onDownload?: (documentId: string) => void;
  onShare?: (documentId: string) => void;
  onPrint?: (documentId: string) => void;
  showMetadata?: boolean;
  showVersions?: boolean;
  showThumbnails?: boolean;
  aiInsights?: AIInsightData;
}

export interface AIInsightData {
  summary?: string;
  keyMetrics?: Array<{ label: string; value: string }>;
  strengths?: string[];
  redFlags?: string[];
  insights?: string[];
}

export interface ViewerCommonProps {
  url: string;
  className?: string;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export interface PDFViewerProps extends ViewerCommonProps {
  zoomLevel?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export interface ImageViewerProps extends ViewerCommonProps {
  alt: string;
}

export interface OfficeDocViewerProps extends ViewerCommonProps {
  fileName: string;
  fileType: "word" | "excel" | "presentation";
}

export interface UnsupportedViewerProps {
  document: PreviewDocument;
  onDownload?: () => void;
}
