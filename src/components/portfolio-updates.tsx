'use client'

import { Card, Badge, Button, Input, PageContainer } from '@/ui';
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Trophy,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';
import { useUIKey } from '@/store/ui';
import {
  portfolioUpdatesRequested,
  portfolioSelectors,
} from '@/store/slices/portfolioSlice';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/async-states';
import { UI_STATE_KEYS, UI_STATE_DEFAULTS } from '@/store/constants/uiStateKeys';
import { useAsyncData } from '@/hooks/useAsyncData';
import { PortfolioTabHeader } from '@/components/portfolio-tab-header';

const updateIcons = {
  financial: <DollarSign className="w-5 h-5" />,
  product: <Package className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  funding: <TrendingUp className="w-5 h-5" />,
  milestone: <Trophy className="w-5 h-5" />,
};

const updateColors = {
  financial: 'from-[var(--app-info)] to-[var(--app-primary)]',
  product: 'from-[var(--app-secondary)] to-[var(--app-accent)]',
  team: 'from-[var(--app-accent)] to-[var(--app-success)]',
  funding: 'from-[var(--app-success)] to-[var(--app-primary)]',
  milestone: 'from-[var(--app-warning)] to-[var(--app-danger)]',
};

const updateBadgeColors = {
  financial: 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
  product: 'bg-[var(--app-secondary)]/10 text-[var(--app-secondary)]',
  team: 'bg-[var(--app-accent)]/10 text-[var(--app-accent)]',
  funding: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
  milestone: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
};

export function PortfolioUpdates() {
  const { data, isLoading, error, refetch } = useAsyncData(portfolioUpdatesRequested, portfolioSelectors.selectState, { params: {} });

  // Use centralized UI state defaults
  const { value: ui, patch: patchUI } = useUIKey(
    UI_STATE_KEYS.PORTFOLIO_UPDATES,
    UI_STATE_DEFAULTS.portfolioUpdates
  );
  const { selectedType, searchQuery } = ui;

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading portfolio updates..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to Load Portfolio Updates"
        onRetry={refetch}
      />
    );
  }

  const portfolioUpdates = data?.updates || [];

  const filteredUpdates = portfolioUpdates.filter(update => {
    const typeMatch = selectedType === 'all' || update.type === selectedType;
    const searchMatch = searchQuery === '' ||
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Header */}
      <PortfolioTabHeader
        title="Portfolio Updates"
        description="Latest communications and milestones from portfolio companies"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => patchUI({ searchQuery: e.target.value })}
            startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
            size="md"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedType === 'all' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'all' })}
            className={selectedType === 'all' ? 'bg-[var(--app-primary)] text-white' : ''}
          >
            All
          </Button>
          <Button
            variant={selectedType === 'financial' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'financial' })}
            className={selectedType === 'financial' ? 'bg-[var(--app-info)] text-white' : ''}
          >
            Financial
          </Button>
          <Button
            variant={selectedType === 'product' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'product' })}
            className={selectedType === 'product' ? 'bg-[var(--app-secondary)] text-white' : ''}
          >
            Product
          </Button>
          <Button
            variant={selectedType === 'team' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'team' })}
            className={selectedType === 'team' ? 'bg-[var(--app-accent)] text-white' : ''}
          >
            Team
          </Button>
          <Button
            variant={selectedType === 'funding' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'funding' })}
            className={selectedType === 'funding' ? 'bg-[var(--app-success)] text-white' : ''}
          >
            Funding
          </Button>
          <Button
            variant={selectedType === 'milestone' ? 'solid' : 'flat'}
            size="sm"
            onPress={() => patchUI({ selectedType: 'milestone' })}
            className={selectedType === 'milestone' ? 'bg-[var(--app-warning)] text-white' : ''}
          >
            Milestone
          </Button>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {filteredUpdates.map((update) => (
          <Card
            key={update.id}
            padding="lg"
            className="hover:border-[var(--app-primary)] transition-all"
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${updateColors[update.type as keyof typeof updateColors]} flex items-center justify-center flex-shrink-0`}>
                <div className="text-white">
                  {updateIcons[update.type as keyof typeof updateIcons]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      <Badge
                        size="sm"
                        variant="flat"
                        className={updateBadgeColors[update.type as keyof typeof updateBadgeColors]}
                      >
                        {update.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                      <span className="font-medium text-[var(--app-primary)]">{update.companyName}</span>
                      <span>•</span>
                      <span>{update.author}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(update.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[var(--app-text)] leading-relaxed">
                  {update.description}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {filteredUpdates.length === 0 && (
          <Card padding="lg" className="text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[var(--app-text-subtle)]" />
            <p className="text-[var(--app-text-muted)]">No updates match your filters</p>
          </Card>
        )}
      </div>

      {/* Load More */}
      {filteredUpdates.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="flat" size="md">
            Load More Updates
          </Button>
        </div>
      )}
    </div>
  );
}
