'use client';

import { Card, Button, Badge } from '@/ui';
import {
  Sparkles,
  Building2,
  MapPin,
  Users,
  Plus,
  ExternalLink,
  Star,
  Zap
} from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { companySearchRequested, companySearchSelectors } from '@/store/slices/miscSlice';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';
import { formatCurrencyCompact } from '@/utils/formatting';
import { useAsyncData } from '@/hooks/useAsyncData';
import { SearchToolbar } from '@/components/ui';

export function CompanySearch() {
  const { data, isLoading, error, refetch, status } = useAsyncData(companySearchRequested, companySearchSelectors.selectState);

  // UI state MUST be called before any early returns (Rules of Hooks)
  const { value: ui, patch: patchUI } = useUIKey('company-search', {
    searchQuery: '',
    selectedIndustry: 'All Industries',
    selectedStage: 'All Stages',
    showAIOnly: true,
  });
  const { searchQuery, selectedIndustry, selectedStage, showAIOnly } = ui;

  if (isLoading) return <LoadingState message="Loading company search…" fullHeight={false} />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load company search"
        onRetry={refetch}
      />
    );
  }

  const industries = data?.industries || [];
  const stages = data?.stages || [];
  const companies = data?.companies || [];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'var(--app-success)';
    if (score >= 80) return 'var(--app-primary)';
    if (score >= 70) return 'var(--app-warning)';
    return 'var(--app-text-muted)';
  };

  const filteredCompanies = companies.filter(company => {
    if (searchQuery && !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedIndustry && selectedIndustry !== industries[0] && company.industry !== selectedIndustry) return false;
    if (selectedStage && selectedStage !== stages[0] && company.funding.lastRound !== selectedStage) return false;
    return true;
  }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  if (status === 'succeeded' && companies.length === 0) {
    return <EmptyState icon={Sparkles} title="No companies found" message="Try adjusting your filters." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Deal Sourcing</h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Discover companies matched to your investment thesis
            </p>
          </div>
        </div>
        <Badge variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
          <Zap className="w-3 h-3 mr-1" />
          {companies.length} AI-Matched Companies
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search companies, industries, or keywords..."
          rightActions={(
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => patchUI({ selectedIndustry: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <select
                value={selectedStage}
                onChange={(e) => patchUI({ selectedStage: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <Button
                variant={showAIOnly ? 'solid' : 'bordered'}
                color={showAIOnly ? 'primary' : 'default'}
                size="sm"
                startContent={<Sparkles className="w-4 h-4" />}
                onPress={() => patchUI({ showAIOnly: !showAIOnly })}
              >
                AI Recommended
              </Button>
            </div>
          )}
        />
      </Card>

      {/* Company Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredCompanies.map((company) => (
          <Card key={company.id} padding="lg" className="hover:border-[var(--app-primary)] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-surface)] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[var(--app-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                    <MapPin className="w-3 h-3" />
                    {company.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: getMatchScoreColor(company.aiMatchScore) }}
                >
                  {company.aiMatchScore}%
                </div>
                <div className="text-xs text-[var(--app-text-muted)]">AI Match</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--app-text-muted)] mb-4 line-clamp-2">
              {company.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                {company.industry}
              </Badge>
              <Badge size="sm" variant="flat">
                {company.funding.lastRound}
              </Badge>
              <Badge size="sm" variant="flat">
                <Users className="w-3 h-3 mr-1" />
                {company.employees}
              </Badge>
              {company.status === 'contacted' && (
                <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                  Contacted
                </Badge>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-[var(--app-surface-hover)]">
              <div className="text-center">
                <div className="text-lg font-semibold">{formatCurrencyCompact(company.funding.total)}</div>
                <div className="text-xs text-[var(--app-text-muted)]">Total Raised</div>
              </div>
              {company.metrics.revenue && (
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatCurrencyCompact(company.metrics.revenue)}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">ARR</div>
                </div>
              )}
              {company.metrics.growth && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-[var(--app-success)]">+{company.metrics.growth}%</div>
                  <div className="text-xs text-[var(--app-text-muted)]">YoY Growth</div>
                </div>
              )}
            </div>

            {/* AI Reasoning */}
            <div className="p-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-primary-bg)]/30 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-primary)] mb-1">
                <Sparkles className="w-4 h-4" />
                AI Analysis
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">{company.aiReasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--app-border-subtle)]">
              <Button size="sm" variant="light" startContent={<ExternalLink className="w-3 h-3" />}>
                View Profile
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="bordered" isIconOnly>
                  <Star className="w-4 h-4" />
                </Button>
                <Button size="sm" color="primary" startContent={<Plus className="w-4 h-4" />}>
                  Add to Pipeline
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="bordered" size="lg">
          Load More Companies
        </Button>
      </div>
    </div>
  );
}
