'use client'

import { useState } from 'react';
import { Plus, Filter, Search, Upload, Download, Eye, FileText, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import { Button, Card, Badge, Input, PageContainer } from '@/ui';

type DocumentStatus = 'overdue' | 'due-soon' | 'pending-review' | 'current' | 'awaiting-upload' | 'optional';
type DocumentCategory = 'board-materials' | 'financial-reports' | 'compliance' | 'investor-updates' | 'pre-investment-dd';

interface PortfolioCompany {
  id: number;
  name: string;
  sector: string;
  stage: string;
  overdueCount: number;
  pendingCount: number;
}

interface Document {
  id: number;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  companyId: number;
  companyName: string;
  uploadedBy?: string;
  uploadedDate?: string;
  dueDate?: string;
  size?: string;
  frequency?: 'monthly' | 'quarterly' | 'annual' | 'one-time';
}

const portfolioCompanies: PortfolioCompany[] = [
  { id: 1, name: 'Quantum AI', sector: 'AI/ML', stage: 'Series B', overdueCount: 1, pendingCount: 2 },
  { id: 2, name: 'BioTech Labs', sector: 'Healthcare', stage: 'Series A', overdueCount: 0, pendingCount: 1 },
  { id: 3, name: 'CloudScale', sector: 'SaaS', stage: 'Series B', overdueCount: 2, pendingCount: 0 },
  { id: 4, name: 'FinFlow', sector: 'FinTech', stage: 'Series A', overdueCount: 0, pendingCount: 3 },
  { id: 5, name: 'DataStream', sector: 'Analytics', stage: 'Seed', overdueCount: 1, pendingCount: 1 },
  { id: 6, name: 'EcoEnergy', sector: 'CleanTech', stage: 'Series B', overdueCount: 0, pendingCount: 2 },
];

const documents: Document[] = [
  // Board Materials
  { id: 1, name: 'Q4 2024 Board Deck', category: 'board-materials', status: 'awaiting-upload', companyId: 1, companyName: 'Quantum AI', dueDate: 'Dec 15, 2024', frequency: 'quarterly' },
  { id: 2, name: 'Board Meeting Minutes - November', category: 'board-materials', status: 'pending-review', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Sarah Chen', uploadedDate: 'Nov 28, 2024', size: '245 KB' },
  { id: 3, name: 'Board Consent - New Hire', category: 'board-materials', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Dr. James Wilson', uploadedDate: 'Nov 20, 2024', size: '156 KB' },

  // Financial Reports
  { id: 4, name: 'Monthly Financial Report - November', category: 'financial-reports', status: 'overdue', companyId: 1, companyName: 'Quantum AI', dueDate: 'Dec 5, 2024', frequency: 'monthly' },
  { id: 5, name: 'Q3 2024 Financial Package', category: 'financial-reports', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Finance Team', uploadedDate: 'Oct 15, 2024', size: '1.8 MB', frequency: 'quarterly' },
  { id: 6, name: 'Cash Flow Projection - Q1 2025', category: 'financial-reports', status: 'pending-review', companyId: 3, companyName: 'CloudScale', uploadedBy: 'Maria Rodriguez', uploadedDate: 'Nov 30, 2024', size: '892 KB' },
  { id: 7, name: 'Monthly Financial Report - October', category: 'financial-reports', status: 'overdue', companyId: 3, companyName: 'CloudScale', dueDate: 'Nov 5, 2024', frequency: 'monthly' },
  { id: 8, name: 'Annual Budget 2025', category: 'financial-reports', status: 'due-soon', companyId: 4, companyName: 'FinFlow', dueDate: 'Dec 10, 2024', frequency: 'annual' },

  // Compliance Documents
  { id: 9, name: 'SOC 2 Type II Report', category: 'compliance', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Security Team', uploadedDate: 'Nov 1, 2024', size: '3.2 MB', frequency: 'annual' },
  { id: 10, name: 'Annual Audit Package 2024', category: 'compliance', status: 'overdue', companyId: 3, companyName: 'CloudScale', dueDate: 'Nov 30, 2024', frequency: 'annual' },
  { id: 11, name: 'Insurance Renewal Documents', category: 'compliance', status: 'pending-review', companyId: 5, companyName: 'DataStream', uploadedBy: 'Operations', uploadedDate: 'Dec 1, 2024', size: '678 KB' },

  // Investor Updates
  { id: 12, name: 'Monthly Investor Update - November', category: 'investor-updates', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Sarah Chen', uploadedDate: 'Nov 25, 2024', size: '445 KB', frequency: 'monthly' },
  { id: 13, name: 'Q4 2024 Investor Letter', category: 'investor-updates', status: 'awaiting-upload', companyId: 4, companyName: 'FinFlow', dueDate: 'Dec 20, 2024', frequency: 'quarterly' },
  { id: 14, name: 'Product Milestone Update', category: 'investor-updates', status: 'current', companyId: 6, companyName: 'EcoEnergy', uploadedBy: 'John Park', uploadedDate: 'Nov 18, 2024', size: '1.1 MB' },

  // Pre-Investment DD (historical reference)
  { id: 15, name: 'Investment Committee Memo', category: 'pre-investment-dd', status: 'current', companyId: 1, companyName: 'Quantum AI', uploadedBy: 'Investment Team', uploadedDate: 'Jan 10, 2022', size: '2.4 MB', frequency: 'one-time' },
  { id: 16, name: 'Due Diligence Report', category: 'pre-investment-dd', status: 'current', companyId: 2, companyName: 'BioTech Labs', uploadedBy: 'Investment Team', uploadedDate: 'Mar 5, 2022', size: '4.8 MB', frequency: 'one-time' },
];

const documentCategories = [
  { id: 'board-materials', name: 'Board Materials', description: 'Decks, minutes, consents' },
  { id: 'financial-reports', name: 'Financial Reports', description: 'Monthly/quarterly/annual reports' },
  { id: 'compliance', name: 'Compliance Docs', description: 'Audits, SOC2, legal' },
  { id: 'investor-updates', name: 'Investor Updates', description: 'LP communications' },
  { id: 'pre-investment-dd', name: 'Pre-Investment DD', description: 'Historical reference' },
];

export function PortfolioDocuments() {
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(portfolioCompanies[0]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-[var(--app-danger)]" />;
      case 'due-soon':
        return <Clock className="w-4 h-4 text-[var(--app-warning)]" />;
      case 'pending-review':
        return <Eye className="w-4 h-4 text-[var(--app-info)]" />;
      case 'current':
        return <CheckCircle2 className="w-4 h-4 text-[var(--app-success)]" />;
      case 'awaiting-upload':
        return <Upload className="w-4 h-4 text-[var(--app-text-subtle)]" />;
      default:
        return <Circle className="w-4 h-4 text-[var(--app-text-subtle)]" />;
    }
  };

  const getStatusBadgeClass = (status: DocumentStatus) => {
    switch (status) {
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      case 'due-soon':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'pending-review':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'current':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'awaiting-upload':
        return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
      default:
        return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

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
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl mb-2">Portfolio</h2>
          <p className="text-sm sm:text-base text-[var(--app-text-muted)]">
            Document management for portfolio companies
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="flat"
            size="sm"
            startContent={<Upload className="w-4 h-4" />}
            className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
          >
            Upload Document
          </Button>
        </div>
      </div>

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
              onPress={() => setSelectedCompany(null)}
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
                onPress={() => setSelectedCompany(company)}
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                size="md"
              />
            </div>
            <Button
              variant="flat"
              startContent={<Filter className="w-4 h-4" />}
            >
              Category
            </Button>
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
                  <Card
                    key={doc.id}
                    padding="sm"
                    className="hover:bg-[var(--app-surface-hover)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(doc.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{doc.name}</span>
                            <Badge
                              size="sm"
                              variant="flat"
                              className={getStatusBadgeClass(doc.status)}
                            >
                              {doc.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="font-medium text-[var(--app-text)]">{doc.companyName}</span>
                            {doc.frequency && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{doc.frequency}</span>
                              </>
                            )}
                            {doc.uploadedBy && (
                              <>
                                <span>•</span>
                                <span>{doc.uploadedBy}</span>
                              </>
                            )}
                            {doc.uploadedDate && (
                              <>
                                <span>•</span>
                                <span>{doc.uploadedDate}</span>
                              </>
                            )}
                            {doc.dueDate && (
                              <>
                                <span>•</span>
                                <span>Due: {doc.dueDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {doc.size && (
                          <span className="text-xs text-[var(--app-text-muted)] hidden sm:inline">{doc.size}</span>
                        )}
                        <div className="flex gap-1">
                          {doc.status !== 'awaiting-upload' && (
                            <>
                              <Button variant="light" size="sm" isIconOnly>
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
