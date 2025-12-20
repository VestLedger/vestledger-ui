'use client'

import { useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { Star, User, TrendingUp, Target, Users, Lightbulb, CheckCircle2, Edit3 } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { getCompanyScoreData } from '@/services/dealflow/companyScoringService';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { companyScoringRequested } from '@/store/slices/dealflowSlice';

interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage
  icon: React.ReactNode;
}

const defaultCriteria: ScoringCriteria[] = [
  {
    id: 'team',
    name: 'Team Quality',
    description: 'Founder experience, domain expertise, execution capability',
    weight: 25,
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'market',
    name: 'Market Opportunity',
    description: 'Market size, growth rate, timing',
    weight: 20,
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'product',
    name: 'Product/Solution',
    description: 'Innovation, defensibility, product-market fit',
    weight: 20,
    icon: <Lightbulb className="w-4 h-4" />
  },
  {
    id: 'traction',
    name: 'Traction',
    description: 'Revenue growth, user metrics, customer validation',
    weight: 20,
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'financials',
    name: 'Unit Economics',
    description: 'Margins, CAC/LTV, path to profitability',
    weight: 15,
    icon: <TrendingUp className="w-4 h-4" />
  }
];

export function CompanyScoring({ companyId, companyName }: { companyId: number; companyName: string }) {
  // TODO: Restore company scoring Redux integration via separate scoring slice
  // For now calling service directly since dealflow slice was migrated to handle deals only
  const scoreData = getCompanyScoreData();

  const { value: ui, patch: patchUI } = useUIKey<{
    isEditingScores: boolean;
    currentUserScore: Record<string, number>;
  }>(`company-scoring:${companyId}`, {
    isEditingScores: false,
    currentUserScore: {
      team: 0,
      market: 0,
      product: 0,
      traction: 0,
      financials: 0,
    },
  });
  const { isEditingScores, currentUserScore } = ui;

  // Return early if no data
  if (!scoreData) {
    return <div className="text-sm text-[var(--app-text-muted)]">Loading scoring data...</div>;
  }

  const calculateWeightedScore = (scores: { [key: string]: number }) => {
    let totalScore = 0;
    let totalWeight = 0;

    defaultCriteria.forEach(criteria => {
      if (scores[criteria.id]) {
        totalScore += scores[criteria.id] * criteria.weight;
        totalWeight += criteria.weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const getConsensusLabel = (consensus: string) => {
    switch (consensus) {
      case 'strong-yes': return 'Strong Yes';
      case 'yes': return 'Yes';
      case 'maybe': return 'Maybe';
      case 'no': return 'No';
      case 'strong-no': return 'Strong No';
      default: return 'Pending';
    }
  };

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case 'strong-yes': return 'bg-[var(--app-success-bg)] text-[var(--app-success)] border-[var(--app-success)]';
      case 'yes': return 'bg-[var(--app-success-bg)] text-[var(--app-success)] border-[var(--app-success)]';
      case 'maybe': return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)] border-[var(--app-warning)]';
      case 'no': return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] border-[var(--app-danger)]';
      case 'strong-no': return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] border-[var(--app-danger)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-[var(--app-success)]';
    if (score >= 6) return 'text-[var(--app-warning)]';
    return 'text-[var(--app-danger)]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Company Scoring: {companyName}</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Collaborative evaluation with weighted criteria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            size="lg"
            variant="bordered"
            className={getConsensusColor(scoreData.consensus)}
          >
            {getConsensusLabel(scoreData.consensus)}
          </Badge>
          <Button
            variant="flat"
            startContent={<Edit3 className="w-4 h-4" />}
            onPress={() => patchUI({ isEditingScores: !isEditingScores })}
          >
            {isEditingScores ? 'Cancel' : 'Add My Score'}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card padding="lg" className="border-[var(--app-primary)]">
        <div className="text-center">
          <p className="text-sm text-[var(--app-text-muted)] mb-2">Weighted Average Score</p>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(scoreData.weightedAverageScore)}`}>
            {scoreData.weightedAverageScore.toFixed(2)}
          </div>
          <p className="text-xs text-[var(--app-text-subtle)]">
            Based on {scoreData.individualScores.length} partner evaluations
          </p>
          <div className="mt-4">
            <Progress
              value={scoreData.weightedAverageScore * 10}
              maxValue={100}
              className="h-3"
              aria-label={`Weighted average score ${scoreData.weightedAverageScore.toFixed(2)} out of 10`}
            />
          </div>
        </div>
      </Card>

      {/* Scoring Criteria with Breakdown */}
      <Card padding="lg">
        <h4 className="font-semibold mb-4">Score Breakdown by Criteria</h4>
        <div className="space-y-4">
          {defaultCriteria.map(criteria => {
            const avgScore = scoreData.individualScores.reduce((sum: number, score: any) =>
              sum + (score.scores[criteria.id] || 0), 0) / scoreData.individualScores.length;

            return (
              <div key={criteria.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[var(--app-primary-bg)]">
                      {criteria.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{criteria.name}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{criteria.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                      {criteria.weight}% weight
                    </Badge>
                    <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                      {avgScore.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                    <div
                      key={value}
                      className={`h-2 rounded-sm ${
                        value <= avgScore
                          ? avgScore >= 8 ? 'bg-[var(--app-success)]' :
                            avgScore >= 6 ? 'bg-[var(--app-warning)]' :
                            'bg-[var(--app-danger)]'
                          : 'bg-[var(--app-surface-hover)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Individual Partner Scores */}
      <div>
        <h4 className="font-semibold mb-4">Individual Partner Scores</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {scoreData.individualScores.map((partnerScore: any) => (
            <Card key={partnerScore.partnerId} padding="md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white font-semibold">
                    {partnerScore.partnerInitials}
                  </div>
                  <div>
                    <p className="font-medium">{partnerScore.partnerName}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      {new Date(partnerScore.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(partnerScore.overallScore)}`}>
                  {partnerScore.overallScore.toFixed(1)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {defaultCriteria.map(criteria => (
                  <div key={criteria.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--app-text-muted)]">{criteria.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(partnerScore.scores[criteria.id] || 0)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[var(--app-warning)] text-[var(--app-warning)]" />
                      ))}
                      <span className="ml-1 font-medium">{partnerScore.scores[criteria.id]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {partnerScore.comments && (
                <div className="pt-3 border-t border-[var(--app-border)]">
                  <p className="text-xs text-[var(--app-text-muted)] italic">
                    "{partnerScore.comments}"
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Edit My Score Form */}
      {isEditingScores && (
        <Card padding="lg" className="border-[var(--app-primary)]">
          <h4 className="font-semibold mb-4">Submit Your Score</h4>
          <div className="space-y-4">
            {defaultCriteria.map(criteria => (
              <div key={criteria.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {criteria.icon}
                    <div>
                      <p className="font-medium text-sm">{criteria.name}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{criteria.description}</p>
                    </div>
                  </div>
                  <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                    {criteria.weight}% weight
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                    <button
                      key={value}
                      onClick={() =>
                        patchUI({
                          currentUserScore: { ...currentUserScore, [criteria.id]: value },
                        })
                      }
                      className={`flex-1 h-10 rounded-lg border-2 transition-all ${
                        currentUserScore[criteria.id] === value
                          ? 'border-[var(--app-primary)] bg-[var(--app-primary)] text-white font-semibold'
                          : 'border-[var(--app-border)] hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-bg)]'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium mb-2 block">Comments (Optional)</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
                placeholder="Share your thoughts on this investment opportunity..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm">
                <span className="text-[var(--app-text-muted)]">Your weighted score: </span>
                <span className={`text-2xl font-bold ${getScoreColor(calculateWeightedScore(currentUserScore))}`}>
                  {calculateWeightedScore(currentUserScore).toFixed(2)}
                </span>
              </div>
              <Button
                color="primary"
                startContent={<CheckCircle2 className="w-4 h-4" />}
                isDisabled={Object.values(currentUserScore).some(score => score === 0)}
              >
                Submit Score
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Scoring Methodology */}
      <Card padding="md" className="bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--app-info)] mb-1">Weighted Scoring Methodology</p>
            <p className="text-xs text-[var(--app-text-muted)]">
              Each criterion is rated 1-10, then weighted according to importance. Final score is the weighted average across all partner evaluations.
              Consensus recommendations appear once all partners submit scores.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
