/**
 * Relationship Scoring System
 * Calculates relationship strength and warmth based on interaction patterns
 * Affinity CRM Parity Feature
 */

export interface RelationshipMetrics {
  lastInteractionDate: Date;
  interactionCount: number;
  interactionTypes: {
    email?: number;
    call?: number;
    meeting?: number;
    note?: number;
  };
  responseRate?: number; // 0-1
  averageResponseTime?: number; // in hours
  dealValue?: number;
  sharedConnections?: number;
}

export interface RelationshipScore {
  overall: number; // 0-100
  strength: 'cold' | 'warm' | 'hot' | 'champion';
  warmth: number; // 0-100
  engagement: number; // 0-100
  recency: number; // 0-100
  frequency: number; // 0-100
  quality: number; // 0-100
  trend: 'increasing' | 'stable' | 'declining';
  recommendations: string[];
}

/**
 * Calculate days since last interaction
 */
function getDaysSinceLastInteraction(lastInteractionDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - lastInteractionDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate recency score (0-100)
 * Higher score for more recent interactions
 */
function calculateRecencyScore(lastInteractionDate: Date): number {
  const days = getDaysSinceLastInteraction(lastInteractionDate);

  if (days <= 7) return 100; // Within a week - excellent
  if (days <= 14) return 90; // Within 2 weeks - very good
  if (days <= 30) return 75; // Within a month - good
  if (days <= 60) return 50; // Within 2 months - fair
  if (days <= 90) return 30; // Within 3 months - declining
  return 10; // Over 3 months - cold
}

/**
 * Calculate frequency score (0-100)
 * Based on total interaction count and interaction density
 */
function calculateFrequencyScore(metrics: RelationshipMetrics): number {
  const { interactionCount, lastInteractionDate } = metrics;

  // Base score from total interactions
  let baseScore = Math.min(interactionCount * 5, 70); // Max 70 from count

  // Bonus for high interaction rate
  const days = getDaysSinceLastInteraction(lastInteractionDate);
  const monthsSinceFirst = Math.max(days / 30, 1);
  const interactionsPerMonth = interactionCount / monthsSinceFirst;

  if (interactionsPerMonth >= 4) baseScore += 30; // 4+ per month
  else if (interactionsPerMonth >= 2) baseScore += 20; // 2-4 per month
  else if (interactionsPerMonth >= 1) baseScore += 10; // 1-2 per month

  return Math.min(baseScore, 100);
}

/**
 * Calculate quality score (0-100)
 * Based on interaction types and response patterns
 */
function calculateQualityScore(metrics: RelationshipMetrics): number {
  const { interactionTypes, responseRate, averageResponseTime } = metrics;
  let score = 50; // Base score

  // High-value interaction types
  if (interactionTypes.meeting) {
    score += Math.min(interactionTypes.meeting * 10, 30); // Meetings are high value
  }

  if (interactionTypes.call) {
    score += Math.min(interactionTypes.call * 5, 20); // Calls are good
  }

  // Response rate bonus
  if (responseRate !== undefined) {
    score += responseRate * 20; // Up to +20 for 100% response rate
  }

  // Response time bonus (faster is better)
  if (averageResponseTime !== undefined) {
    if (averageResponseTime <= 24) score += 15; // Within 24 hours
    else if (averageResponseTime <= 48) score += 10; // Within 48 hours
    else if (averageResponseTime <= 72) score += 5; // Within 3 days
  }

  return Math.min(score, 100);
}

/**
 * Calculate engagement score (0-100)
 * Combination of recency and frequency
 */
function calculateEngagementScore(recency: number, frequency: number): number {
  // Weighted average: recency is slightly more important
  return Math.round(recency * 0.6 + frequency * 0.4);
}

/**
 * Calculate warmth score (0-100)
 * Based on shared connections, deal value, and quality
 */
function calculateWarmthScore(metrics: RelationshipMetrics, quality: number): number {
  let warmth = quality * 0.5; // Start with 50% of quality

  // Shared connections bonus
  if (metrics.sharedConnections) {
    warmth += Math.min(metrics.sharedConnections * 5, 25);
  }

  // Deal value bonus (indicates trust and commitment)
  if (metrics.dealValue) {
    if (metrics.dealValue >= 5000000) warmth += 25;
    else if (metrics.dealValue >= 1000000) warmth += 15;
    else if (metrics.dealValue >= 500000) warmth += 10;
  }

  return Math.min(warmth, 100);
}

/**
 * Determine relationship strength category
 */
function determineStrength(overall: number): RelationshipScore['strength'] {
  if (overall >= 80) return 'champion';
  if (overall >= 60) return 'hot';
  if (overall >= 40) return 'warm';
  return 'cold';
}

/**
 * Determine relationship trend
 */
function determineTrend(recency: number, frequency: number): RelationshipScore['trend'] {
  // If recent activity is high, trending up
  if (recency >= 80 && frequency >= 60) return 'increasing';

  // If recent activity is low, trending down
  if (recency < 40) return 'declining';

  return 'stable';
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(score: RelationshipScore, metrics: RelationshipMetrics): string[] {
  const recommendations: string[] = [];
  const days = getDaysSinceLastInteraction(metrics.lastInteractionDate);

  // Recency recommendations
  if (score.recency < 50) {
    if (days > 90) {
      recommendations.push('⚠️ No contact in 3+ months - Reach out immediately to re-engage');
    } else if (days > 60) {
      recommendations.push('Schedule a call or meeting within the next week');
    } else if (days > 30) {
      recommendations.push('Send a follow-up email or schedule a check-in');
    }
  }

  // Frequency recommendations
  if (score.frequency < 40) {
    recommendations.push('Increase touch frequency - Aim for monthly interactions');
  }

  // Quality recommendations
  if (score.quality < 50) {
    if (!metrics.interactionTypes.meeting || metrics.interactionTypes.meeting < 2) {
      recommendations.push('Schedule an in-person or video meeting to deepen relationship');
    }
    if (metrics.responseRate && metrics.responseRate < 0.5) {
      recommendations.push('Try different communication channels or adjust outreach timing');
    }
  }

  // Warmth recommendations
  if (score.warmth < 50 && !metrics.sharedConnections) {
    recommendations.push('Identify mutual connections for warm introductions');
  }

  // Positive reinforcement
  if (score.overall >= 80) {
    recommendations.push('✅ Strong relationship - Maintain regular cadence');
  } else if (score.trend === 'increasing') {
    recommendations.push('📈 Relationship improving - Continue current engagement strategy');
  }

  return recommendations;
}

/**
 * Main function: Calculate comprehensive relationship score
 */
export function calculateRelationshipScore(metrics: RelationshipMetrics): RelationshipScore {
  // Calculate individual components
  const recency = calculateRecencyScore(metrics.lastInteractionDate);
  const frequency = calculateFrequencyScore(metrics);
  const quality = calculateQualityScore(metrics);
  const engagement = calculateEngagementScore(recency, frequency);
  const warmth = calculateWarmthScore(metrics, quality);

  // Calculate overall score (weighted average)
  const overall = Math.round(
    recency * 0.3 +      // 30% - Recent activity is important
    frequency * 0.25 +   // 25% - Consistency matters
    quality * 0.25 +     // 25% - Quality of interactions
    warmth * 0.2         // 20% - Relationship depth
  );

  const strength = determineStrength(overall);
  const trend = determineTrend(recency, frequency);

  const score: RelationshipScore = {
    overall,
    strength,
    warmth,
    engagement,
    recency,
    frequency,
    quality,
    trend,
    recommendations: [],
  };

  score.recommendations = generateRecommendations(score, metrics);

  return score;
}

/**
 * Get color for relationship strength
 */
export function getStrengthColor(strength: RelationshipScore['strength']): string {
  switch (strength) {
    case 'champion': return 'text-[var(--app-success)]';
    case 'hot': return 'text-[var(--app-warning)]';
    case 'warm': return 'text-[var(--app-info)]';
    case 'cold': return 'text-[var(--app-text-muted)]';
  }
}

/**
 * Get icon for relationship strength
 */
export function getStrengthIcon(strength: RelationshipScore['strength']): string {
  switch (strength) {
    case 'champion': return '🔥';
    case 'hot': return '⚡';
    case 'warm': return '💛';
    case 'cold': return '❄️';
  }
}
