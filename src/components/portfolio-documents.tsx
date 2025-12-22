'use client'

import { Filter, Upload, Download, Eye, FileText, AlertCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/ui';
import { ListItemCard, SearchToolbar, StatusBadge } from '@/components/ui';
import { DocumentPreviewModal, useDocumentPreview, getMockDocumentUrl, inferDocumentType } from './documents/preview';
import { useUIKey } from '@/store/ui';
import { PortfolioTabHeader } from '@/components/portfolio-tab-header';
import {
  getPortfolioDocumentsSnapshot,
  type PortfolioDocumentCompany as PortfolioCompany,
  type PortfolioDocumentCategory as DocumentCategory,
} from '@/services/portfolio/portfolioDocumentsService';

export function PortfolioDocuments() {
  const { companies: portfolioCompanies, documents, categories: documentCategories } = getPortfolioDocumentsSnapshot();
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedCompany: PortfolioCompany | null;
    selectedCategory: DocumentCategory | 'all';
    searchQuery: string;
  }>('portfolio-documents', {
    selectedCompany: portfolioCompanies[0] ?? null,
    selectedCategory: 'all',
    searchQuery: '',
  });
  const { selectedCompany, selectedCategory, searchQuery } = ui;
  const preview = useDocumentPreview();

  const filteredDocuments = documents.filter(doc => {
    const matchesCompany = !selectedCompany || doc.companyId === selectedCompany.id;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompany && matchesCategory && matchesSearch;
  });

  const overdueCount = documents.filter(d => d.status === 'overdue').length;
  const pendingCount = documents.filter(d => d.status === 'pending-review').length;

  return (
    <div>
      {/* Header */}
      <PortfolioTabHeader
        title="Portfolio Documents"
        description="Document management for portfolio companies"
        actions={(
          <Button
            variant="flat"
            size="sm"
            startContent={<Upload className="w-4 h-4" />}
            className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
          >
            Upload Document
          </Button>
        )}
      />

      {/* Attention Items */}
      {(overdueCount > 0 || pendingCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {overdueCount > 0 && (
            <Card padding="md" className="border-[var(--app-danger)]">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--app-danger)]" />
                <div>
                  <div className="text-lg font-medium">{overdueCount} Overdue</div>
                  <div className="text-sm text-[var(--app-text-muted)]">Documents past due date</div>
                </div>
              </div>
            </Card>
          )}
          {pendingCount > 0 && (
            <Card padding="md" className="border-[var(--app-info)]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[var(--app-info)]" />
                <div>
                  <div className="text-lg font-medium">{pendingCount} Pending Review</div>
                  <div className="text-sm text-[var(--app-text-muted)]">Documents awaiting approval</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Company Directory */}
        <Card className="lg:col-span-1" padding="md">
          <h3 className="text-lg font-medium mb-4">Companies</h3>
          <div className="space-y-2">
            <Card
              isPressable
              onPress={() => patchUI({ selectedCompany: null })}
              padding="sm"
              className={`cursor-pointer transition-all ${
                !selectedCompany
                  ? 'bg-[var(--app-surface-hover)] border-[var(--app-primary)]'
                  : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)]'
              }`}
            >
              <div className="text-sm font-medium">All Companies</div>
              <div className="text-xs text-[var(--app-text-muted)]">
                {documents.length} documents
              </div>
            </Card>
            {portfolioCompanies.map((company) => (
              <Card
                key={company.id}
                isPressable
                onPress={() => patchUI({ selectedCompany: company })}
                padding="sm"
                className={`cursor-pointer transition-all ${
                  selectedCompany?.id === company.id
                    ? 'bg-[var(--app-surface-hover)] border-[var(--app-primary)]'
                    : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">{company.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{company.name}</div>
                    <div className="text-xs text-[var(--app-text-muted)]">{company.sector}</div>
                  </div>
                </div>
                {(company.overdueCount > 0 || company.pendingCount > 0) && (
                  <div className="flex items-center gap-2 mt-2">
                    {company.overdueCount > 0 && (
                      <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
                        {company.overdueCount} overdue
                      </Badge>
                    )}
                    {company.pendingCount > 0 && (
                      <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                        {company.pendingCount} pending
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>

        {/* Document Library */}
        <Card className="lg:col-span-3" padding="md">
          {/* Search and Filters */}
          <div className="mb-6">
            <SearchToolbar
              searchValue={searchQuery}
              onSearchChange={(value) => patchUI({ searchQuery: value })}
              searchPlaceholder="Search documents..."
              rightActions={(
                <Button
                  variant="flat"
                  startContent={<Filter className="w-4 h-4" />}
                >
                  Category
                </Button>
              )}
            />
          </div>

          {/* Document Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
            {documentCategories.map((category) => {
              const count = documents.filter(d => d.category === category.id).length;
              return (
                <Card
                  key={category.id}
                  padding="sm"
                  className="hover:border-[var(--app-border-subtle)] transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[var(--app-primary)] mb-2" />
                  <div className="text-sm font-medium mb-1">{category.name}</div>
                  <div className="text-2xl font-medium mb-1">{count}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">{category.description}</div>
                </Card>
              );
            })}
          </div>

          {/* Document List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {selectedCompany ? `${selectedCompany.name} Documents` : 'All Documents'}
              </h3>
              <div className="flex gap-2">
                <Button variant="flat" size="sm" startContent={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </div>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-[var(--app-text-muted)]">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <ListItemCard
                    key={doc.id}
                    icon={<FileText className="w-4 h-4 text-[var(--app-primary)]" />}
                    title={doc.name}
                    badges={(
                      <StatusBadge status={doc.status} domain="documents" size="sm" showIcon />
                    )}
                    description={doc.companyName}
                    meta={(
                      <div className="flex flex-wrap items-center gap-2">
                        {doc.frequency && (
                          <>
                            <span className="capitalize">{doc.frequency}</span>
                            <span>•</span>
                          </>
                        )}
                        {doc.uploadedBy && (
                          <>
                            <span>{doc.uploadedBy}</span>
                            <span>•</span>
                          </>
                        )}
                        {doc.uploadedDate && (
                          <>
                            <span>{doc.uploadedDate}</span>
                            <span>•</span>
                          </>
                        )}
                        {doc.dueDate && <span>Due: {doc.dueDate}</span>}
                      </div>
                    )}
                    actions={(
                      <div className="flex items-center gap-3">
                        {doc.size && (
                          <span className="text-xs text-[var(--app-text-muted)] hidden sm:inline">{doc.size}</span>
                        )}
                        <div className="flex gap-1">
                          {doc.status !== 'awaiting-upload' && (
                            <>
                              <Button
                                variant="light"
                                size="sm"
                                isIconOnly
                                onPress={() => {
                                  preview.openPreview({
                                    id: doc.id.toString(),
                                    name: doc.name,
                                    type: inferDocumentType(doc.name),
                                    url: getMockDocumentUrl(inferDocumentType(doc.name)),
                                    uploadedBy: doc.uploadedBy,
                                    uploadedDate: doc.uploadedDate ? new Date(doc.uploadedDate) : undefined,
                                    size: doc.size ? parseInt(doc.size.replace(/[^0-9]/g, '')) * 1024 : undefined,
                                    category: doc.category,
                                  });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="light" size="sm" isIconOnly>
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {doc.status === 'awaiting-upload' && (
                            <Button variant="light" size="sm" isIconOnly>
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Document Preview Modal */}
      {preview.isOpen && preview.previewDocument && (
        <DocumentPreviewModal
          document={preview.previewDocument}
          isOpen={preview.isOpen}
          onClose={preview.closePreview}
        />
      )}
    </div>
  );
}
