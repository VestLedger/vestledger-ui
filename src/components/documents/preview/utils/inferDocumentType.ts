import type { DocumentType } from '../types';

export function inferDocumentType(fileName: string): DocumentType {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const typeMap: Record<string, DocumentType> = {
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    ppt: 'presentation',
    pptx: 'presentation',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
  };

  return (typeMap[ext || ''] as DocumentType) || 'other';
}

