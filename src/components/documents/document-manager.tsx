'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge, Input } from '@/ui';
import {
  Folder,
  File,
  Upload,
  Download,
  Share2,
  Lock,
  Unlock,
  Trash2,
  Star,
  Clock,
  Tag,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  FileText,
  Image,
  FileSpreadsheet,
  Archive,
  MoreVertical,
} from 'lucide-react';

export type DocumentCategory =
  | 'legal'
  | 'financial'
  | 'tax'
  | 'compliance'
  | 'investor-relations'
  | 'due-diligence'
  | 'portfolio'
  | 'other';

export type DocumentType =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'image'
  | 'presentation'
  | 'archive'
  | 'other';

export type AccessLevel = 'private' | 'internal' | 'investor' | 'public';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number; // in bytes
  folderId?: string | null;
  folderPath?: string;

  // Metadata
  uploadedBy: string;
  uploadedDate: Date;
  lastModified: Date;
  lastModifiedBy: string;
  version: number;
  versionHistory?: DocumentVersion[];

  // Organization
  tags: string[];
  description?: string;
  isFavorite: boolean;

  // Access Control
  accessLevel: AccessLevel;
  sharedWith: SharedAccess[];
  isLocked: boolean;
  lockedBy?: string;

  // Relationships
  fundId?: string;
  fundName?: string;
  dealId?: string;
  dealName?: string;
  lpId?: string;
  lpName?: string;

  // Compliance
  requiresSignature: boolean;
  signedBy?: string[];
  expirationDate?: Date;
  isArchived: boolean;

  // File info
  url?: string;
  thumbnailUrl?: string;
  checksum?: string;
}

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedDate: Date;
  changeNote?: string;
  size: number;
  url: string;
}

export interface SharedAccess {
  userId: string;
  userName: string;
  userEmail: string;
  accessLevel: 'view' | 'comment' | 'edit';
  sharedDate: Date;
  expiresAt?: Date;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string | null;
  path: string;
  color?: string;
  icon?: string;
  description?: string;
  createdBy: string;
  createdDate: Date;
  documentCount: number;
  accessLevel: AccessLevel;
  isDefault: boolean;
}

interface DocumentManagerProps {
  documents: Document[];
  folders: DocumentFolder[];
  currentFolderId?: string | null;
  onUpload?: (folderId?: string | null) => void;
  onCreateFolder?: (parentId?: string | null) => void;
  onOpenDocument?: (documentId: string) => void;
  onDownloadDocument?: (documentId: string) => void;
  onShareDocument?: (documentId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
  onToggleFavorite?: (documentId: string) => void;
  onMoveDocument?: (documentId: string, folderId: string | null) => void;
  onUpdateAccess?: (documentId: string, accessLevel: AccessLevel) => void;
}

export function DocumentManager({
  documents,
  folders,
  currentFolderId,
  onUpload,
  onCreateFolder,
  onOpenDocument,
  onDownloadDocument,
  onShareDocument,
  onDeleteDocument,
  onToggleFavorite,
  onMoveDocument,
  onUpdateAccess,
}: DocumentManagerProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    filterCategory: DocumentCategory | 'all';
    filterAccessLevel: AccessLevel | 'all';
    viewMode: 'grid' | 'list';
    selectedTags: string[];
    sortBy: 'name' | 'date' | 'size';
  }>(`document-manager:${currentFolderId ?? 'root'}`, {
    searchQuery: '',
    filterCategory: 'all',
    filterAccessLevel: 'all',
    viewMode: 'list',
    selectedTags: [],
    sortBy: 'date',
  });
  const { searchQuery, filterCategory, filterAccessLevel, viewMode, selectedTags, sortBy } = ui;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-[var(--app-danger)]" />;
      case 'word':
        return <FileText className="w-5 h-5 text-[var(--app-info)]" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-[var(--app-success)]" />;
      case 'image':
        return <Image className="w-5 h-5 text-[var(--app-warning)]" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-[var(--app-text-muted)]" />;
      default:
        return <File className="w-5 h-5 text-[var(--app-text-muted)]" />;
    }
  };

  const getAccessBadge = (level: AccessLevel) => {
    const colors = {
      'private': 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
      'internal': 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
      'investor': 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
      'public': 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
    };

    const icons = {
      'private': Lock,
      'internal': Unlock,
      'investor': Share2,
      'public': Unlock,
    };

    const Icon = icons[level];

    return (
      <Badge size="sm" variant="flat" className={colors[level]}>
        <Icon className="w-3 h-3 mr-1" />
        {level}
      </Badge>
    );
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    const colors = {
      'legal': 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
      'financial': 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
      'tax': 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
      'compliance': 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
      'investor-relations': 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
      'due-diligence': 'bg-[var(--app-text-muted)]/20 text-[var(--app-text)]',
      'portfolio': 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
      'other': 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]',
    };

    return (
      <Badge size="sm" variant="flat" className={colors[category]}>
        {category.replace(/-/g, ' ')}
      </Badge>
    );
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  ).sort();

  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesAccessLevel = filterAccessLevel === 'all' || doc.accessLevel === filterAccessLevel;
      const matchesFolder = !currentFolderId || doc.folderId === currentFolderId;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doc.tags.includes(tag));
      const notArchived = !doc.isArchived;

      return matchesSearch && matchesCategory && matchesAccessLevel && matchesFolder && matchesTags && notArchived;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.lastModified.getTime() - a.lastModified.getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

  // Get current folder
  const currentFolder = folders.find(f => f.id === currentFolderId);

  // Get subfolders
  const subFolders = folders.filter(f => f.parentId === currentFolderId);

  // Calculate stats
  const totalSize = filteredDocuments.reduce((sum, doc) => sum + doc.size, 0);
  const favoriteCount = filteredDocuments.filter(doc => doc.isFavorite).length;
  const sharedCount = filteredDocuments.filter(doc => doc.sharedWith.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-[var(--app-primary)]" />
            <div>
              <h3 className="text-lg font-semibold">
                {currentFolder ? currentFolder.name : 'All Documents'}
              </h3>
              {currentFolder?.description && (
                <p className="text-xs text-[var(--app-text-muted)]">{currentFolder.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCreateFolder && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Folder className="w-3 h-3" />}
                onPress={() => onCreateFolder(currentFolderId)}
              >
                New Folder
              </Button>
            )}
            {onUpload && (
              <Button
                size="sm"
                color="primary"
                startContent={<Upload className="w-4 h-4" />}
                onPress={() => onUpload(currentFolderId)}
              >
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Documents</p>
            <p className="text-2xl font-bold text-[var(--app-primary)]">{filteredDocuments.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Favorites</p>
            <p className="text-2xl font-bold text-[var(--app-warning)]">{favoriteCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Shared</p>
            <p className="text-2xl font-bold text-[var(--app-info)]">{sharedCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Folders</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">{subFolders.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Size</p>
            <p className="text-lg font-bold">{formatFileSize(totalSize)}</p>
          </div>
        </div>
      </Card>

      {/* Filters & Search */}
      <Card padding="md">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => patchUI({ searchQuery: e.target.value })}
              startContent={<Search className="w-4 h-4" />}
              size="sm"
              className="flex-1"
            />
            <select
              className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
              value={filterCategory}
              onChange={(e) => patchUI({ filterCategory: e.target.value as DocumentCategory | 'all' })}
            >
              <option value="all">All Categories</option>
              <option value="legal">Legal</option>
              <option value="financial">Financial</option>
              <option value="tax">Tax</option>
              <option value="compliance">Compliance</option>
              <option value="investor-relations">Investor Relations</option>
              <option value="due-diligence">Due Diligence</option>
              <option value="portfolio">Portfolio</option>
              <option value="other">Other</option>
            </select>
            <select
              className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
              value={filterAccessLevel}
              onChange={(e) =>
                patchUI({ filterAccessLevel: e.target.value as AccessLevel | 'all' })
              }
            >
              <option value="all">All Access</option>
              <option value="private">Private</option>
              <option value="internal">Internal</option>
              <option value="investor">Investor</option>
              <option value="public">Public</option>
            </select>
            <select
              className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
              value={sortBy}
              onChange={(e) => patchUI({ sortBy: e.target.value as 'name' | 'date' | 'size' })}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'solid' : 'flat'}
                isIconOnly
                onPress={() => patchUI({ viewMode: 'list' })}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'solid' : 'flat'}
                isIconOnly
                onPress={() => patchUI({ viewMode: 'grid' })}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-[var(--app-text-muted)]" />
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      patchUI({ selectedTags: selectedTags.filter((t) => t !== tag) });
                    } else {
                      patchUI({ selectedTags: [...selectedTags, tag] });
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] text-[var(--app-text-muted)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {allTags.length > 10 && (
                <span className="text-xs text-[var(--app-text-muted)]">
                  +{allTags.length - 10} more
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Folders */}
      {subFolders.length > 0 && (
        <Card padding="md">
          <h4 className="text-sm font-semibold mb-3">Folders</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {subFolders.map(folder => (
              <button
                key={folder.id}
                className="p-3 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] border border-[var(--app-border)] transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="w-5 h-5 text-[var(--app-primary)]" />
                  <span className="font-medium truncate">{folder.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                  <span>{folder.documentCount} documents</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Documents */}
      <Card padding="md">
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-4 gap-3' : 'space-y-2'}>
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm text-[var(--app-text-muted)]">
              <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : viewMode === 'grid' ? (
            filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] border border-[var(--app-border)] transition-colors cursor-pointer"
                onClick={() => onOpenDocument?.(doc.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  {getFileIcon(doc.type)}
                  {doc.isFavorite && <Star className="w-4 h-4 text-[var(--app-warning)] fill-current" />}
                </div>
                <p className="text-sm font-medium truncate mb-1">{doc.name}</p>
                <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>v{doc.version}</span>
                </div>
              </div>
            ))
          ) : (
            filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] border border-[var(--app-border)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{doc.name}</span>
                        {doc.isFavorite && <Star className="w-3 h-3 text-[var(--app-warning)] fill-current flex-shrink-0" />}
                        {doc.isLocked && <Lock className="w-3 h-3 text-[var(--app-danger)] flex-shrink-0" />}
                        {getCategoryBadge(doc.category)}
                        {getAccessBadge(doc.accessLevel)}
                        {doc.requiresSignature && !doc.signedBy && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
                            Needs Signature
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>v{doc.version}</span>
                        <span>•</span>
                        <span>Modified {doc.lastModified.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>by {doc.lastModifiedBy}</span>
                        {doc.fundName && (
                          <>
                            <span>•</span>
                            <span>{doc.fundName}</span>
                          </>
                        )}
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {doc.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              size="sm"
                              variant="flat"
                              className="bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-xs text-[var(--app-text-muted)]">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onToggleFavorite && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onToggleFavorite(doc.id)}
                      >
                        <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current text-[var(--app-warning)]' : ''}`} />
                      </Button>
                    )}
                    {onDownloadDocument && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onDownloadDocument(doc.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {onShareDocument && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onShareDocument(doc.id)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteDocument && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 text-[var(--app-danger)]" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
