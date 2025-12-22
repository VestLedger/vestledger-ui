'use client'

import { Card, Button, Badge, Progress } from '@/ui';
import { ThumbsUp, ThumbsDown, MinusCircle, MessageSquare, Users, Building2, Target, SkipForward, SkipBack, Plus, Edit3, FileSearch } from 'lucide-react';
import { CompanyScoring } from './company-scoring';
import { getDealflowReviewSlides, type DealflowReviewSlide } from '@/services/dealflow/dealflowReviewService';
import { useUIKey } from '@/store/ui';
import { dealflowDealsRequested, dealflowSelectors } from '@/store/slices/dealflowSlice';
import { LoadingState, ErrorState } from '@/components/ui/async-states';
import { UI_STATE_KEYS, UI_STATE_DEFAULTS } from '@/store/constants/uiStateKeys';
import { formatCurrencyCompact } from '@/utils/formatting';
import { useAsyncData } from '@/hooks/useAsyncData';
import { PageScaffold } from '@/components/ui';

interface Vote {
  partnerId: string;
  partnerName: string;
  vote: 'yes' | 'no' | 'maybe';
  comments?: string;
  timestamp: string;
}

export function DealflowReview() {
  const { data, isLoading, error, refetch } = useAsyncData(dealflowDealsRequested, dealflowSelectors.selectState, { params: {} });

  // Use centralized UI state defaults
  const { value: ui, patch: patchUI } = useUIKey(
    UI_STATE_KEYS.DEALFLOW_REVIEW,
    UI_STATE_DEFAULTS.dealflowReview
  );

  // Extend with additional UI state not in defaults
  const { value: isPresenting, patch: patchIsPresenting } = useUIKey<boolean>('dealflow-review-presenting', false);
  const { value: votes, patch: patchVotes } = useUIKey<Vote[]>('dealflow-review-votes', []);
  const { value: myVote, patch: patchMyVote } = useUIKey<'yes' | 'no' | 'maybe' | null>('dealflow-review-my-vote', null);
  const { value: voteComment, patch: patchVoteComment } = useUIKey<string>('dealflow-review-vote-comment', '');

  const { currentSlideIndex } = ui;

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading dealflow deals..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to Load Dealflow Deals"
        onRetry={refetch}
      />
    );
  }

  const deals = data?.deals || [];
  const selectedDeal = deals[0];
  const slides = selectedDeal ? getDealflowReviewSlides(selectedDeal) : [];

  if (!selectedDeal) {
    return (
      <PageScaffold
        routePath="/dealflow-review"
        header={{
          title: 'Dealflow Review',
          description: 'No deals available to review yet',
          icon: FileSearch,
        }}
      >
        <Card padding="lg" className="mt-6">
          <div className="text-sm text-[var(--app-text-muted)]">Add deals via the backend integration when ready.</div>
        </Card>
      </PageScaffold>
    );
  }

  const safeSlideIndex =
    slides.length === 0 ? 0 : Math.min(Math.max(currentSlideIndex, 0), slides.length - 1);
  const currentSlide: DealflowReviewSlide | undefined = slides[safeSlideIndex];

  // Calculate AI insights for summary
  const yesVotes = votes.filter(v => v.vote === 'yes').length;
  const maybeVotes = votes.filter(v => v.vote === 'maybe').length;
  const totalVotes = votes.length;
  const consensusPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

  const handleVote = (vote: 'yes' | 'no' | 'maybe') => {
    const newVote: Vote = {
      partnerId: 'current-user',
      partnerName: 'Current User',
      vote,
      comments: voteComment,
      timestamp: new Date().toISOString()
    };
    patchMyVote(vote);
    patchVotes([...votes, newVote]);
  };

  const nextSlide = () => {
    if (safeSlideIndex < slides.length - 1) {
      patchUI({ currentSlideIndex: safeSlideIndex + 1 });
    }
  };

  const prevSlide = () => {
    if (safeSlideIndex > 0) {
      patchUI({ currentSlideIndex: safeSlideIndex - 1 });
    }
  };

  const renderSlideContent = () => {
    if (!currentSlide) return null;
    switch (currentSlide.type) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-accent)] bg-clip-text text-transparent">
                {currentSlide.content.companyName}
              </h1>
              <p className="text-xl text-[var(--app-text-muted)] mb-6">{currentSlide.content.oneLiner}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Founder</p>
                <p className="text-lg font-semibold">{currentSlide.content.founder}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Location</p>
                <p className="text-lg font-semibold">{currentSlide.content.location}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Sector</p>
                <p className="text-lg font-semibold">{currentSlide.content.sector}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Stage</p>
                <p className="text-lg font-semibold">{currentSlide.content.stage}</p>
              </div>
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-[var(--app-primary-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">TAM</p>
                <p className="text-3xl font-bold text-[var(--app-primary)]">{currentSlide.content.tam}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-secondary)] bg-opacity-10 text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">SAM</p>
                <p className="text-3xl font-bold text-[var(--app-secondary)]">{currentSlide.content.sam}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-success-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">SOM</p>
                <p className="text-3xl font-bold text-[var(--app-success)]">{currentSlide.content.som}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Market Growth</p>
              <p className="text-2xl font-bold">{currentSlide.content.growth}</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Key Competitors</p>
              <div className="flex flex-wrap gap-2">
                {currentSlide.content.competitors.map((comp: string, idx: number) => (
                  <Badge key={idx} size="lg" variant="flat" className="bg-[var(--app-surface-hover)]">
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-lg mb-4">{currentSlide.content.description}</p>
            </div>
            <div>
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--app-primary)]" />
                Key Differentiators
              </p>
              <div className="space-y-2">
                {currentSlide.content.differentiators.map((diff: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[var(--app-primary-bg)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-[var(--app-success-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">ARR</p>
                <p className="text-3xl font-bold text-[var(--app-success)]">{formatCurrencyCompact(currentSlide.content.arr)}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-primary-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">YoY Growth</p>
                <p className="text-3xl font-bold text-[var(--app-primary)]">{currentSlide.content.growth}%</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-warning-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">Monthly Burn</p>
                <p className="text-3xl font-bold text-[var(--app-warning)]">{formatCurrencyCompact(currentSlide.content.burn)}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-info-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">Runway</p>
                <p className="text-3xl font-bold text-[var(--app-info)]">{currentSlide.content.runway}mo</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">LTV</p>
                <p className="text-xl font-bold">{formatCurrencyCompact(currentSlide.content.ltv)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">CAC</p>
                <p className="text-xl font-bold">{formatCurrencyCompact(currentSlide.content.cac)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">LTV:CAC</p>
                <p className="text-xl font-bold text-[var(--app-success)]">
                  {(currentSlide.content.ltv / currentSlide.content.cac).toFixed(1)}x
                </p>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <p className="font-semibold mb-3">Leadership Team</p>
              <div className="space-y-3">
                {currentSlide.content.team.map((member, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-[var(--app-primary)]">{member.role}</p>
                      <p className="text-sm text-[var(--app-text-muted)]">{member.background}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3">Advisors</p>
              <div className="flex flex-wrap gap-2">
                {currentSlide.content.advisors.map((advisor: string, idx: number) => (
                  <Badge key={idx} size="lg" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                    {advisor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ask':
        return (
          <div className="space-y-6">
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-secondary)] bg-opacity-10">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Raising</p>
              <p className="text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)] bg-clip-text text-transparent">
                {formatCurrencyCompact(currentSlide.content.amount)}
              </p>
              <p className="text-sm text-[var(--app-text-muted)]">
                at {formatCurrencyCompact(currentSlide.content.valuation)} pre-money valuation
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3">Use of Funds</p>
              <div className="space-y-3">
                {currentSlide.content.useOfFunds.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-[var(--app-text-muted)]">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} maxValue={100} className="h-2" aria-label={`${item.category} ${item.percentage}%`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageScaffold
      routePath="/dealflow-review"
      header={{
        title: 'Dealflow Review',
        description: 'Collaborative deal review with slide presentation and team voting',
        icon: FileSearch,
        aiSummary: {
          text: totalVotes > 0
            ? `${consensusPercentage}% consensus for proceeding (${yesVotes}/${totalVotes} votes in favor). ${maybeVotes} votes requiring more due diligence. Reviewing: ${selectedDeal.companyName}.`
            : `Ready to review ${selectedDeal.companyName}. No votes cast yet. Waiting for team feedback on ${currentSlide?.title ?? 'the deck'}.`,
          confidence: totalVotes > 0 ? 0.88 : 0.72,
        },
        primaryAction: {
          label: isPresenting ? 'Stop Presenting' : 'Start Presentation',
          onClick: () => patchIsPresenting(!isPresenting),
          aiSuggested: false,
        },
        secondaryActions: [
          {
            label: 'Share',
            onClick: () => console.log('Share clicked'),
          },
          {
            label: 'Export',
            onClick: () => console.log('Export clicked'),
          },
        ],
      }}
    >
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slide Navigation */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--app-primary)]" />
              Slides
            </h3>
            <div className="space-y-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => patchUI({ currentSlideIndex: idx })}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === currentSlideIndex
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'bg-[var(--app-surface-hover)] hover:bg-[var(--app-primary-bg)]'
                  }`}
                >
                  <p className="text-xs opacity-75 mb-1">Slide {idx + 1}</p>
                  <p className="text-sm font-medium">{slide.title}</p>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              variant="flat"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Slide
            </Button>
          </Card>

          {/* Voting Panel */}
          <Card padding="md" className="mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--app-primary)]" />
              Vote
            </h3>
            <div className="space-y-2">
              <Button
                className="w-full"
                color={myVote === 'yes' ? 'success' : 'default'}
                variant={myVote === 'yes' ? 'solid' : 'flat'}
                startContent={<ThumbsUp className="w-4 h-4" />}
                onPress={() => handleVote('yes')}
              >
                Yes - Proceed
              </Button>
              <Button
                className="w-full"
                color={myVote === 'maybe' ? 'warning' : 'default'}
                variant={myVote === 'maybe' ? 'solid' : 'flat'}
                startContent={<MinusCircle className="w-4 h-4" />}
                onPress={() => handleVote('maybe')}
              >
                Maybe - More DD
              </Button>
              <Button
                className="w-full"
                color={myVote === 'no' ? 'danger' : 'default'}
                variant={myVote === 'no' ? 'solid' : 'flat'}
                startContent={<ThumbsDown className="w-4 h-4" />}
                onPress={() => handleVote('no')}
              >
                No - Pass
              </Button>
            </div>

            {votes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--app-border)]">
                <p className="text-xs text-[var(--app-text-muted)] mb-2">Votes Cast</p>
                <div className="space-y-1">
                  {votes.map((vote, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{vote.partnerName}</span>
                      <Badge
                        size="sm"
                        className={
                          vote.vote === 'yes'
                            ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                            : vote.vote === 'no'
                            ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]'
                            : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                        }
                      >
                        {vote.vote}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Main Slide Display */}
        <div className="lg:col-span-3">
          <Card padding="lg" className="min-h-[600px]">
            {/* Slide Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--app-border)]">
              <div>
                <Badge size="sm" variant="flat" className="mb-2">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </Badge>
                <h3 className="text-2xl font-bold">{currentSlide.title}</h3>
              </div>
              <Button size="sm" variant="flat" isIconOnly>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide Content */}
            <div className="mb-6">{renderSlideContent()}</div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--app-border)]">
              <Button
                variant="flat"
                startContent={<SkipBack className="w-4 h-4" />}
                onPress={prevSlide}
                isDisabled={currentSlideIndex === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => patchUI({ currentSlideIndex: idx })}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSlideIndex ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]'
                    }`}
                  />
                ))}
              </div>

              <Button
                color="primary"
                endContent={<SkipForward className="w-4 h-4" />}
                onPress={nextSlide}
                isDisabled={currentSlideIndex === slides.length - 1}
              >
                Next
              </Button>
            </div>
          </Card>

          {/* Comments Section */}
          <Card padding="md" className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[var(--app-primary)]" />
              <h4 className="font-semibold">Discussion</h4>
            </div>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
              placeholder="Add your thoughts, questions, or concerns..."
              value={voteComment}
              onChange={(e) => patchVoteComment(e.target.value)}
            />
          </Card>

          <Card padding="lg" className="mt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--app-primary)]" />
              Partner Scoring
            </h3>
            <CompanyScoring companyId={Number(selectedDeal.id)} companyName={selectedDeal.companyName} />
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}
