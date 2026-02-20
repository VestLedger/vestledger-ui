import type { DocumentType } from '@/components/documents/document-manager';

export const MOCK_DOCUMENT_URLS: Record<DocumentType, string> = {
  pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  image: 'https://via.placeholder.com/1920x1080/0066FF/FFFFFF?text=VestLedger+Document',
  word: 'https://calibre-ebook.com/downloads/demos/demo.docx',
  excel: '/mocks/sample.xlsx',
  presentation: '/mocks/sample.pptx',
  archive: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  other: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

export function getMockDocumentUrl(type: DocumentType): string {
  return MOCK_DOCUMENT_URLS[type] ?? MOCK_DOCUMENT_URLS.pdf;
}

