'use client';

import { TrendingUp, TrendingDown, Minus, Zap, Clock, MessageSquare, Heart } from 'lucide-react';
import { Badge, Card } from '@/ui';

export interface RelationshipMetrics {
  score: number; // 0-100
  strength: 'strong' | 'moderate' | 'weak' | 'cold';
  warmth: 'hot' | 'warm' | 'neutral' | 'cold';
  trend: 'up' | 'down' | 'stable';
  lastInteraction: Date;
  interactionFrequency: number; // interactions per month
  responseRate: number; // 0-100
  touchPoints: number; // total interactions
  daysSinceLastContact: number;
  recommendedAction?: string;
}

interface RelationshipScoreProps {
  metrics: RelationshipMetrics;
  compact?: boolean;
}

export function calculateRelationshipScore(
  interactions: number,
  daysSinceLastContact: number,
  responseRate: number,
  interactionFrequency: number
): RelationshipMetrics {
  // Scoring algorithm
  let score = 0;

  // Interaction volume (0-30 points)
  score += Math.min(interactions * 2, 30);

  // Recency (0-30 points) - decays over time
  const recencyScore = Math.max(0, 30 - (daysSinceLastContact * 0.5));
  score += recencyScore;

  // Response rate (0-20 points)
  score += (responseRate / 100) * 20;

  // Frequency (0-20 points)
  score += Math.min(interactionFrequency * 4, 20);

  // Cap at 100
  score = Math.min(Math.round(score), 100);

  // Determine strength
  let strength: RelationshipMetrics['strength'];
  if (score >= 70) strength = 'strong';
  else if (score >= 50) strength = 'moderate';
  else if (score >= 30) strength = 'weak';
  else strength = 'cold';

  // Determine warmth based on recency and frequency
  let warmth: RelationshipMetrics['warmth'];
  if (daysSinceLastContact <= 7 && interactionFrequency >= 4) warmth = 'hot';
  else if (daysSinceLastContact <= 30 && interactionFrequency >= 2) warmth = 'warm';
  else if (daysSinceLastContact <= 90) warmth = 'neutral';
  else warmth = 'cold';

  // Determine trend (simple heuristic based on recent activity)
  let trend: RelationshipMetrics['trend'];
  if (daysSinceLastContact <= 14 && interactionFrequency >= 3) trend = 'up';
  else if (daysSinceLastContact >= 60) trend = 'down';
  else trend = 'stable';

  // Recommended action
  let recommendedAction: string | undefined;
  if (warmth === 'cold') {
    recommendedAction = 'Schedule a catch-up call to re-engage';
  } else if (warmth === 'hot' && strength === 'strong') {
    recommendedAction = 'Maintain momentum - share relevant opportunities';
  } else if (daysSinceLastContact >= 30) {
    recommendedAction = 'Send a follow-up email to stay top of mind';
  }

  return {
    score,
    strength,
    warmth,
    trend,
    lastInteraction: new Date(Date.now() - daysSinceLastContact * 24 * 60 * 60 * 1000),
    interactionFrequency,
    responseRate,
    touchPoints: interactions,
    daysSinceLastContact,
    recommendedAction,
  };
}

export function RelationshipScore({ metrics, compact = false }: RelationshipScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[var(--app-success)]';
    if (score >= 50) return 'text-[var(--app-warning)]';
    return 'text-[var(--app-danger)]';
  };

  const getStrengthConfig = (strength: RelationshipMetrics['strength']) => {
    switch (strength) {
      case 'strong':
        return { color: 'bg-[var(--app-success)]', label: 'Strong', icon: Heart };
      case 'moderate':
        return { color: 'bg-[var(--app-warning)]', label: 'Moderate', icon: TrendingUp };
      case 'weak':
        return { color: 'bg-[var(--app-danger)]', label: 'Weak', icon: TrendingDown };
      case 'cold':
        return { color: 'bg-[var(--app-text-muted)]', label: 'Cold', icon: Minus };
    }
  };

  const getWarmthConfig = (warmth: RelationshipMetrics['warmth']) => {
    switch (warmth) {
      case 'hot':
        return { color: 'text-[var(--app-danger)]', bgColor: 'bg-[var(--app-danger-bg)]', label: '🔥 Hot', icon: Zap };
      case 'warm':
        return { color: 'text-[var(--app-warning)]', bgColor: 'bg-[var(--app-warning-bg)]', label: '☀️ Warm', icon: TrendingUp };
      case 'neutral':
        return { color: 'text-[var(--app-info)]', bgColor: 'bg-[var(--app-info-bg)]', label: '➖ Neutral', icon: Minus };
      case 'cold':
        return { color: 'text-[var(--app-text-muted)]', bgColor: 'bg-[var(--app-surface-hover)]', label: '❄️ Cold', icon: Clock };
    }
  };

  const getTrendIcon = (trend: RelationshipMetrics['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-[var(--app-success)]" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-[var(--app-danger)]" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-[var(--app-text-muted)]" />;
    }
  };

  const strengthConfig = getStrengthConfig(metrics.strength);
  const warmthConfig = getWarmthConfig(metrics.warmth);
  const StrengthIcon = strengthConfig.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Score Badge */}
        <Badge size="sm" variant="flat" className={`${getScoreColor(metrics.score)} font-semibold`}>
          {metrics.score}
        </Badge>

        {/* Warmth Indicator */}
        <Badge size="sm" variant="flat" className={`${warmthConfig.bgColor} ${warmthConfig.color}`}>
          {warmthConfig.label}
        </Badge>

        {/* Trend */}
        {getTrendIcon(metrics.trend)}
      </div>
    );
  }

  return (
    <Card padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[var(--app-primary)]" />
          <h3 className="text-sm font-semibold">Relationship Health</h3>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon(metrics.trend)}
          <span className={`text-3xl font-bold ${getScoreColor(metrics.score)}`}>
            {metrics.score}
          </span>
        </div>
      </div>

      {/* Score Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--app-text-muted)]">Relationship Strength</span>
          <Badge size="sm" variant="flat" className={strengthConfig.color}>
            <StrengthIcon className="w-3 h-3 mr-1" />
            {strengthConfig.label}
          </Badge>
        </div>
        <div className="h-2 bg-[var(--app-surface-hover)] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metrics.score >= 70
                ? 'bg-[var(--app-success)]'
                : metrics.score >= 50
                ? 'bg-[var(--app-warning)]'
                : 'bg-[var(--app-danger)]'
            }`}
            style={{ width: `${metrics.score}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Warmth */}
        <div className={`p-3 rounded-lg ${warmthConfig.bgColor}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--app-text-muted)]">Warmth</span>
          </div>
          <p className={`text-sm font-medium ${warmthConfig.color}`}>{warmthConfig.label}</p>
        </div>

        {/* Touch Frequency */}
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3 h-3 text-[var(--app-text-muted)]" />
            <span className="text-xs text-[var(--app-text-muted)]">Touch Frequency</span>
          </div>
          <p className="text-sm font-medium">{metrics.interactionFrequency}/mo</p>
        </div>

        {/* Last Contact */}
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-[var(--app-text-muted)]" />
            <span className="text-xs text-[var(--app-text-muted)]">Last Contact</span>
          </div>
          <p className="text-sm font-medium">
            {metrics.daysSinceLastContact === 0
              ? 'Today'
              : metrics.daysSinceLastContact === 1
              ? 'Yesterday'
              : `${metrics.daysSinceLastContact}d ago`}
          </p>
        </div>

        {/* Response Rate */}
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-[var(--app-text-muted)]" />
            <span className="text-xs text-[var(--app-text-muted)]">Response Rate</span>
          </div>
          <p className="text-sm font-medium">{metrics.responseRate}%</p>
        </div>
      </div>

      {/* Total Touchpoints */}
      <div className="pt-3 border-t border-[var(--app-border)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--app-text-muted)]">Total Touchpoints</span>
          <span className="font-medium">{metrics.touchPoints} interactions</span>
        </div>
      </div>

      {/* AI Recommendation */}
      {metrics.recommendedAction && (
        <div className="p-3 rounded-lg bg-[var(--app-primary-bg)] border border-[var(--app-primary)]">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--app-primary)] mb-1">AI Recommendation</p>
              <p className="text-xs text-[var(--app-text-muted)]">{metrics.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
