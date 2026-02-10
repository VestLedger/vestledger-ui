import { Lightbulb, Sparkles, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action?: string;
  description?: string;
  aiSuggested?: boolean;
  confidence?: number;
  onClick?: () => void;
}

export interface Suggestion {
  id: string;
  text: string;
  reasoning: string;
  confidence: number;
}

export const getMockCopilotContextualResponse = (pathname: string, query: string): string => {
  const lowerQuery = query.toLowerCase();

  // General queries
  if (lowerQuery.includes('deals') || lowerQuery.includes('pipeline')) {
    return 'I found 12 active deals in your pipeline. 3 are in due diligence, 4 in term sheet negotiation, and 5 in initial review. Would you like me to show you the deals likely to close this quarter?';
  }

  if (lowerQuery.includes('capital call')) {
    return "You have 2 active capital calls: Fund II Series A ($5.2M, 87% collected) and Fund III Seed ($2.1M, 45% collected). Fund III has 3 overdue LPs. Would you like me to draft reminder emails?";
  }

  if (lowerQuery.includes('portfolio') || lowerQuery.includes('companies')) {
    return 'Your portfolio has 23 active companies. 2 companies (CloudScale, BioTech) are flagged as at-risk due to runway < 12 months. 5 companies are performing above benchmark. Would you like a detailed health report?';
  }

  if (lowerQuery.includes('compliance') || lowerQuery.includes('deadline')) {
    return "You have 1 upcoming compliance deadline: Annual Fund Audit (due in 5 days, complexity: Medium). I've prepared a checklist of required documents. Would you like me to send reminders to your team?";
  }

  // Page-specific responses
  if (pathname === '/home') {
    return "I'm analyzing your dashboard metrics. I noticed 3 overdue capital calls and 2 portfolio companies at risk. Would you like me to prioritize these items or show you predicted health trends?";
  }

  if (pathname === '/pipeline') {
    return "I'm currently viewing your pipeline. I can help you filter deals, predict close likelihood, or detect competitive conflicts. What would you like to explore?";
  }

  if (pathname.startsWith('/fund-admin')) {
    return "I'm in Fund Admin mode. I can help you draft capital calls, track LP responses, or forecast collection timelines. What task can I assist with?";
  }

  // Default response
  return `I'm here to help with "${query}". I can analyze your data, draft documents, or provide insights. Could you provide more context about what you're looking for?`;
};

export const getMockCopilotPageSuggestions = (pathname: string, tab?: string | null): Suggestion[] => {
  // Create a composite key from pathname and tab for context-specific suggestions
  const contextKey = tab ? `${pathname}:${tab}` : pathname;

  const baseSuggestions: Record<string, Suggestion[]> = {
    '/home': [
      {
        id: 'review-portfolio',
        text: 'Review at-risk portfolio companies',
        reasoning: '2 companies with runway < 12 months detected',
        confidence: 0.92,
      },
      {
        id: 'capital-calls',
        text: 'Follow up on overdue capital calls',
        reasoning: '3 capital calls overdue by 5+ days',
        confidence: 0.88,
      },
    ],
    '/pipeline': [
      {
        id: 'close-deals',
        text: 'Focus on deals likely to close this quarter',
        reasoning: 'Based on stage velocity and historical patterns',
        confidence: 0.78,
      },
      {
        id: 'conflict-check',
        text: 'Run conflict analysis on new deals',
        reasoning: '2 new deals may overlap with portfolio',
        confidence: 0.85,
      },
    ],
    '/portfolio': [
      {
        id: 'health-report',
        text: 'Generate Q4 portfolio health report',
        reasoning: 'Quarter ending soon, typical reporting time',
        confidence: 0.81,
      },
      {
        id: 'runway-analysis',
        text: 'Analyze runway forecasts for next 6 months',
        reasoning: '3 companies projected to need funding',
        confidence: 0.79,
      },
    ],
    '/fund-admin': [
      {
        id: 'draft-call',
        text: 'Draft next capital call for Fund III',
        reasoning: 'Based on deployment schedule',
        confidence: 0.86,
      },
      {
        id: 'lp-reminders',
        text: 'Send reminders to overdue LPs',
        reasoning: '3 LPs overdue on current call',
        confidence: 0.94,
      },
    ],
    '/contacts': [
      {
        id: 'identify-cold-contacts',
        text: 'Identify contacts who haven\'t been reached in 60+ days',
        reasoning: 'Found 8 high-value contacts with no recent activity',
        confidence: 0.89,
      },
      {
        id: 'draft-outreach',
        text: 'Draft personalized outreach emails',
        reasoning: 'Based on interaction history and deals',
        confidence: 0.83,
      },
    ],
    '/lp-management': [
      {
        id: 'send-quarterly-report',
        text: 'Send Q4 quarterly reports to LPs',
        reasoning: 'Reports ready for distribution',
        confidence: 0.90,
      },
      {
        id: 'track-capital-calls',
        text: 'Track capital call responses',
        reasoning: '3 pending responses from LPs',
        confidence: 0.87,
      },
    ],
    '/lp-portal': [
      {
        id: 'investor-summary',
        text: 'Generate investor summary report',
        reasoning: 'Quarterly reporting period approaching',
        confidence: 0.86,
      },
      {
        id: 'performance-highlights',
        text: 'Prepare performance highlights for LP meeting',
        reasoning: 'Based on recent portfolio updates',
        confidence: 0.82,
      },
    ],
    '/deal-intelligence': [
      {
        id: 'deal-flow-insights',
        text: 'Analyze deal flow trends this month',
        reasoning: '15% increase in early-stage deals detected',
        confidence: 0.84,
      },
      {
        id: 'dd-bottlenecks',
        text: 'Identify due diligence bottlenecks',
        reasoning: '3 deals stalled in legal review',
        confidence: 0.90,
      },
    ],
    '/dealflow-review': [
      {
        id: 'review-submissions',
        text: 'Review 12 new dealflow submissions',
        reasoning: 'Recent inbound applications need triage',
        confidence: 0.88,
      },
      {
        id: 'assign-reviewers',
        text: 'Assign reviewers to high-priority deals',
        reasoning: '5 deals flagged as high potential',
        confidence: 0.85,
      },
    ],
    '/analytics': [
      {
        id: 'peer-benchmark',
        text: 'Benchmark fund performance vs peers',
        reasoning: 'New Cambridge Associates data available',
        confidence: 0.86,
      },
      {
        id: 'moic-drivers',
        text: 'Analyze top MOIC drivers this quarter',
        reasoning: '3 companies drove 80% of returns',
        confidence: 0.89,
      },
    ],
    '/compliance': [
      {
        id: 'overdue-tasks',
        text: 'Address 3 overdue compliance items',
        reasoning: 'Form ADV and annual cert need immediate attention',
        confidence: 0.95,
      },
      {
        id: 'upcoming-deadlines',
        text: 'Prepare for upcoming compliance deadlines',
        reasoning: '2 high-priority deadlines in next 30 days',
        confidence: 0.89,
      },
    ],
    '/409a-valuations': [
      {
        id: 'request-refresh',
        text: 'Request 409A refresh for expiring valuations',
        reasoning: '2 valuations expiring in next 90 days',
        confidence: 0.90,
      },
      {
        id: 'material-events',
        text: 'Flag companies with material events',
        reasoning: '1 company raised Series B, needs new valuation',
        confidence: 0.93,
      },
    ],
    '/tax-center': [
      {
        id: 'distribute-k1s',
        text: 'Distribute ready K-1s to LPs',
        reasoning: '12 K-1s ready for distribution',
        confidence: 0.93,
      },
      {
        id: 'filing-reminders',
        text: 'Send tax filing deadline reminders',
        reasoning: 'Filing deadline in 30 days',
        confidence: 0.90,
      },
    ],
    '/reports': [
      {
        id: 'generate-quarterly',
        text: 'Generate Q4 quarterly report',
        reasoning: 'All data collected, ready to compile',
        confidence: 0.93,
      },
      {
        id: 'customize-reports',
        text: 'Customize reports for top 5 LPs',
        reasoning: 'Different reporting preferences detected',
        confidence: 0.79,
      },
    ],
    '/ai-tools': [
      {
        id: 'generate-ic-memo',
        text: 'Generate investment committee memo',
        reasoning: 'Based on recent deal diligence data',
        confidence: 0.88,
      },
      {
        id: 'analyze-deck',
        text: 'Analyze uploaded pitch deck',
        reasoning: 'Extract key metrics and investment thesis',
        confidence: 0.91,
      },
    ],
    '/audit-trail': [
      {
        id: 'review-recent-activity',
        text: 'Review recent user activity logs',
        reasoning: 'Monitor for unusual access patterns',
        confidence: 0.82,
      },
      {
        id: 'export-audit-report',
        text: 'Export audit report for compliance',
        reasoning: 'Annual audit preparation',
        confidence: 0.79,
      },
    ],
    '/documents': [
      {
        id: 'organize-docs',
        text: 'Organize untagged documents',
        reasoning: '23 documents need categorization',
        confidence: 0.85,
      },
      {
        id: 'missing-docs',
        text: 'Follow up on missing quarterly reports',
        reasoning: '3 companies have not submitted Q4 reports',
        confidence: 0.89,
      },
    ],
    '/integrations': [
      {
        id: 'sync-status',
        text: 'Check data sync status',
        reasoning: 'Ensure all integrations are up to date',
        confidence: 0.80,
      },
      {
        id: 'configure-new',
        text: 'Configure new data source integration',
        reasoning: 'Connect additional fund admin tools',
        confidence: 0.75,
      },
    ],
    '/settings': [
      {
        id: 'review-permissions',
        text: 'Review user permissions and access levels',
        reasoning: 'Quarterly security review recommended',
        confidence: 0.81,
      },
      {
        id: 'update-preferences',
        text: 'Update notification preferences',
        reasoning: 'Optimize alert settings for your workflow',
        confidence: 0.73,
      },
    ],
    // Tab-specific suggestions for /contacts page
    '/contacts:overview': [
      {
        id: 'identify-cold-contacts',
        text: 'Identify contacts who haven\'t been reached in 60+ days',
        reasoning: 'Found 8 high-value contacts with no recent activity',
        confidence: 0.89,
      },
      {
        id: 'draft-outreach',
        text: 'Draft personalized outreach emails',
        reasoning: 'Based on interaction history and deals',
        confidence: 0.83,
      },
    ],
    '/contacts:timeline': [
      {
        id: 'schedule-followups',
        text: 'Schedule follow-ups for recent interactions',
        reasoning: '5 conversations need follow-up actions',
        confidence: 0.87,
      },
      {
        id: 'analyze-engagement',
        text: 'Analyze engagement patterns over time',
        reasoning: 'Identify optimal outreach timing',
        confidence: 0.80,
      },
    ],
    '/contacts:email': [
      {
        id: 'sync-emails',
        text: 'Sync recent email conversations',
        reasoning: '12 new emails detected across accounts',
        confidence: 0.91,
      },
      {
        id: 'auto-categorize',
        text: 'Auto-categorize email interactions',
        reasoning: 'Using AI to tag meetings, intros, and updates',
        confidence: 0.84,
      },
    ],
    // Tab-specific suggestions for /lp-portal page
    '/lp-portal:overview': [
      {
        id: 'investor-summary',
        text: 'Generate investor summary report',
        reasoning: 'Quarterly reporting period approaching',
        confidence: 0.86,
      },
      {
        id: 'performance-highlights',
        text: 'Prepare performance highlights for LP meeting',
        reasoning: 'Based on recent portfolio updates',
        confidence: 0.82,
      },
    ],
    '/lp-portal:reports': [
      {
        id: 'generate-quarterly',
        text: 'Generate Q4 quarterly report',
        reasoning: 'All data collected, ready to compile',
        confidence: 0.93,
      },
      {
        id: 'customize-reports',
        text: 'Customize reports for top 5 LPs',
        reasoning: 'Different reporting preferences detected',
        confidence: 0.79,
      },
    ],
    '/lp-portal:capital': [
      {
        id: 'forecast-calls',
        text: 'Forecast next 3 capital calls',
        reasoning: 'Based on deployment schedule',
        confidence: 0.88,
      },
      {
        id: 'track-commitments',
        text: 'Track unfunded commitments by LP',
        reasoning: 'Identify potential dry powder issues',
        confidence: 0.85,
      },
    ],
    '/lp-portal:performance': [
      {
        id: 'benchmark-performance',
        text: 'Benchmark against industry peers',
        reasoning: 'New Cambridge Associates data available',
        confidence: 0.81,
      },
      {
        id: 'explain-variances',
        text: 'Explain TVPI variance vs last quarter',
        reasoning: 'TVPI changed by 0.3x, prepare commentary',
        confidence: 0.87,
      },
    ],
    // Tab-specific for LP Management page (same tabs as LP Portal)
    '/lp-management:overview': [
      {
        id: 'lp-engagement',
        text: 'Analyze LP engagement metrics',
        reasoning: 'Identify low-engagement LPs needing outreach',
        confidence: 0.84,
      },
      {
        id: 'subscription-status',
        text: 'Review subscription status across all LPs',
        reasoning: 'Ensure all commitments are properly documented',
        confidence: 0.81,
      },
    ],
    '/lp-management:reports': [
      {
        id: 'prepare-distribution',
        text: 'Prepare reports for distribution',
        reasoning: '15 reports ready to send to LPs',
        confidence: 0.92,
      },
      {
        id: 'track-downloads',
        text: 'Track report download analytics',
        reasoning: 'Monitor LP engagement with reports',
        confidence: 0.78,
      },
    ],
    '/lp-management:capital': [
      {
        id: 'initiate-call',
        text: 'Initiate new capital call',
        reasoning: 'Based on fund deployment schedule',
        confidence: 0.88,
      },
      {
        id: 'follow-up-overdue',
        text: 'Follow up on overdue payments',
        reasoning: '4 LPs have pending payments',
        confidence: 0.93,
      },
    ],
    '/lp-management:performance': [
      {
        id: 'generate-performance-pack',
        text: 'Generate LP performance pack',
        reasoning: 'Q4 data available for all funds',
        confidence: 0.89,
      },
      {
        id: 'analyze-returns',
        text: 'Analyze LP-level returns by cohort',
        reasoning: 'Identify patterns in LP performance',
        confidence: 0.83,
      },
    ],
    // Tab-specific for Deal Intelligence page
    '/deal-intelligence:fund-level': [
      {
        id: 'deal-flow-insights',
        text: 'Analyze deal flow trends this month',
        reasoning: '15% increase in early-stage deals detected',
        confidence: 0.84,
      },
      {
        id: 'dd-bottlenecks',
        text: 'Identify due diligence bottlenecks',
        reasoning: '3 deals stalled in legal review',
        confidence: 0.90,
      },
    ],
    '/deal-intelligence:per-deal': [
      {
        id: 'deal-risk-analysis',
        text: 'Run comprehensive risk analysis on this deal',
        reasoning: 'Market conditions changed since initial review',
        confidence: 0.82,
      },
      {
        id: 'compare-similar',
        text: 'Compare with similar deals in portfolio',
        reasoning: 'Found 3 comparable investments',
        confidence: 0.86,
      },
    ],
    // Tab-specific for /fund-admin page (7 tabs)
    '/fund-admin:capital-calls': [
      {
        id: 'draft-next-call',
        text: 'Draft next capital call notice',
        reasoning: 'Based on deployment schedule and fund pacing',
        confidence: 0.88,
      },
      {
        id: 'overdue-reminders',
        text: 'Send reminders to overdue LPs',
        reasoning: '3 LPs overdue by 5+ days',
        confidence: 0.94,
      },
    ],
    '/fund-admin:distributions': [
      {
        id: 'prepare-distribution',
        text: 'Prepare Q4 distribution notices',
        reasoning: 'Portfolio exit proceeds available',
        confidence: 0.82,
      },
      {
        id: 'calculate-waterfall',
        text: 'Calculate waterfall distribution',
        reasoning: 'For recent exit: TechCorp acquisition',
        confidence: 0.89,
      },
    ],
    '/fund-admin:lp-responses': [
      {
        id: 'analyze-response-rate',
        text: 'Analyze LP response patterns',
        reasoning: 'Identify consistently slow responders',
        confidence: 0.85,
      },
      {
        id: 'bulk-reminders',
        text: 'Send bulk reminders to pending LPs',
        reasoning: '5 LPs have not responded',
        confidence: 0.91,
      },
    ],
    '/fund-admin:nav-calculator': [
      {
        id: 'calculate-nav',
        text: 'Calculate end-of-quarter NAV',
        reasoning: 'Q4 ending, all valuations updated',
        confidence: 0.93,
      },
      {
        id: 'variance-analysis',
        text: 'Analyze NAV variance vs last quarter',
        reasoning: '12% increase detected, explain drivers',
        confidence: 0.87,
      },
    ],
    '/fund-admin:carried-interest': [
      {
        id: 'calculate-carry',
        text: 'Calculate current carried interest accrual',
        reasoning: 'Recent exits triggered carry calculation',
        confidence: 0.90,
      },
      {
        id: 'distribution-forecast',
        text: 'Forecast carry distribution timeline',
        reasoning: 'Based on fund performance and hurdle rate',
        confidence: 0.84,
      },
    ],
    '/fund-admin:expenses': [
      {
        id: 'categorize-expenses',
        text: 'Categorize pending expense reports',
        reasoning: '8 unreviewed expenses require classification',
        confidence: 0.86,
      },
      {
        id: 'budget-variance',
        text: 'Flag expenses over budget threshold',
        reasoning: '2 categories exceeding quarterly budget',
        confidence: 0.92,
      },
    ],
    '/fund-admin:secondary-transfers': [
      {
        id: 'review-transfer',
        text: 'Review pending transfer applications',
        reasoning: '1 transfer request awaiting approval',
        confidence: 0.88,
      },
      {
        id: 'rofr-valuation',
        text: 'Perform ROFR valuation analysis',
        reasoning: 'For pending secondary transfer',
        confidence: 0.83,
      },
    ],
    // Tab-specific for /compliance page (5 tabs)
    '/compliance:overview': [
      {
        id: 'overdue-tasks',
        text: 'Address 3 overdue compliance items',
        reasoning: 'Form ADV and annual cert need immediate attention',
        confidence: 0.95,
      },
      {
        id: 'upcoming-deadlines',
        text: 'Prepare for upcoming compliance deadlines',
        reasoning: '2 high-priority deadlines in next 30 days',
        confidence: 0.89,
      },
    ],
    '/compliance:filings': [
      {
        id: 'form-adv',
        text: 'Update Form ADV annual filing',
        reasoning: 'Due in 45 days, material changes detected',
        confidence: 0.91,
      },
      {
        id: 'state-filings',
        text: 'Complete state registration renewals',
        reasoning: '3 states require renewal this quarter',
        confidence: 0.87,
      },
    ],
    '/compliance:audits': [
      {
        id: 'audit-prep',
        text: 'Prepare documents for upcoming audit',
        reasoning: 'Annual fund audit scheduled in 2 weeks',
        confidence: 0.93,
      },
      {
        id: 'previous-findings',
        text: 'Review action items from previous audit',
        reasoning: 'Ensure all findings have been addressed',
        confidence: 0.85,
      },
    ],
    '/compliance:aml-kyc': [
      {
        id: 'pending-kyc',
        text: 'Complete KYC for 2 new LPs',
        reasoning: 'Recent subscriptions require verification',
        confidence: 0.94,
      },
      {
        id: 'refresh-kyc',
        text: 'Refresh KYC for high-risk LPs',
        reasoning: 'Annual refresh required for 3 entities',
        confidence: 0.88,
      },
    ],
    '/compliance:resources': [
      {
        id: 'policy-update',
        text: 'Review updated SEC guidance',
        reasoning: 'New marketing rule amendments published',
        confidence: 0.82,
      },
      {
        id: 'training-reminder',
        text: 'Schedule annual compliance training',
        reasoning: 'Q1 training window approaching',
        confidence: 0.79,
      },
    ],
    // Tab-specific for /tax-center page (5 tabs)
    '/tax-center:overview': [
      {
        id: 'distribute-k1s',
        text: 'Distribute ready K-1s to LPs',
        reasoning: '12 K-1s ready for distribution',
        confidence: 0.93,
      },
      {
        id: 'filing-reminders',
        text: 'Send tax filing deadline reminders',
        reasoning: 'Filing deadline in 30 days',
        confidence: 0.90,
      },
    ],
    '/tax-center:k1-generator': [
      {
        id: 'generate-k1s',
        text: 'Generate K-1s for Fund III LPs',
        reasoning: 'All tax data received from portfolio',
        confidence: 0.91,
      },
      {
        id: 'review-allocations',
        text: 'Review income/loss allocations',
        reasoning: 'Verify special allocations are correct',
        confidence: 0.86,
      },
    ],
    '/tax-center:fund-summary': [
      {
        id: 'prepare-tax-summary',
        text: 'Prepare fund-level tax summary',
        reasoning: 'For IRS filing and LP reporting',
        confidence: 0.89,
      },
      {
        id: 'compare-prior-year',
        text: 'Compare with prior year tax positions',
        reasoning: 'Identify significant variances',
        confidence: 0.84,
      },
    ],
    '/tax-center:portfolio': [
      {
        id: 'follow-up-k1s',
        text: 'Follow up on missing portfolio company K-1s',
        reasoning: '3 companies have not provided K-1s',
        confidence: 0.92,
      },
      {
        id: 'estimate-tax-impact',
        text: 'Estimate tax impact of recent exits',
        reasoning: 'For capital gains allocation planning',
        confidence: 0.87,
      },
    ],
    '/tax-center:communications': [
      {
        id: 'draft-tax-memo',
        text: 'Draft LP tax reporting memo',
        reasoning: 'Explain unusual tax items this year',
        confidence: 0.85,
      },
      {
        id: 'extension-notices',
        text: 'Send extension notices to LPs',
        reasoning: 'If K-1s will be late',
        confidence: 0.81,
      },
    ],
    // Tab-specific for /409a-valuations page (3 tabs)
    '/409a-valuations:valuations': [
      {
        id: 'request-refresh',
        text: 'Request 409A refresh for expiring valuations',
        reasoning: '2 valuations expiring in next 90 days',
        confidence: 0.90,
      },
      {
        id: 'material-events',
        text: 'Flag companies with material events',
        reasoning: '1 company raised Series B, needs new valuation',
        confidence: 0.93,
      },
    ],
    '/409a-valuations:strike-prices': [
      {
        id: 'review-grants',
        text: 'Review option grants for Q4',
        reasoning: 'Ensure strike prices match current 409A',
        confidence: 0.88,
      },
      {
        id: 'vesting-schedule',
        text: 'Analyze vesting schedules across portfolio',
        reasoning: 'Identify non-standard vesting terms',
        confidence: 0.82,
      },
    ],
    '/409a-valuations:history': [
      {
        id: 'valuation-trends',
        text: 'Analyze FMV trends across portfolio',
        reasoning: 'Identify companies with unusual changes',
        confidence: 0.85,
      },
      {
        id: 'methodology-review',
        text: 'Review valuation methodologies used',
        reasoning: 'Ensure consistency across providers',
        confidence: 0.80,
      },
    ],
    // Tab-specific for /analytics page (6 tabs)
    '/analytics:performance': [
      {
        id: 'peer-benchmark',
        text: 'Benchmark fund performance vs peers',
        reasoning: 'New Cambridge Associates data available',
        confidence: 0.86,
      },
      {
        id: 'moic-drivers',
        text: 'Analyze top MOIC drivers this quarter',
        reasoning: '3 companies drove 80% of returns',
        confidence: 0.89,
      },
    ],
    '/analytics:j-curve': [
      {
        id: 'j-curve-projection',
        text: 'Project J-curve trajectory',
        reasoning: 'Based on current deployment pace',
        confidence: 0.84,
      },
      {
        id: 'compare-funds',
        text: 'Compare J-curves across all funds',
        reasoning: 'Identify best-performing vintage',
        confidence: 0.87,
      },
    ],
    '/analytics:cohort': [
      {
        id: 'cohort-outliers',
        text: 'Identify outlier performers by cohort',
        reasoning: '2022 cohort has 3 high-performers',
        confidence: 0.91,
      },
      {
        id: 'sector-analysis',
        text: 'Analyze performance by sector cohort',
        reasoning: 'SaaS cohort outperforming hardware',
        confidence: 0.88,
      },
    ],
    '/analytics:valuation': [
      {
        id: 'valuation-momentum',
        text: 'Track valuation momentum trends',
        reasoning: 'Identify mark-up/mark-down patterns',
        confidence: 0.85,
      },
      {
        id: 'unrealized-gains',
        text: 'Forecast unrealized gains for year-end',
        reasoning: 'Based on recent funding rounds',
        confidence: 0.82,
      },
    ],
    '/analytics:deployment': [
      {
        id: 'deployment-pace',
        text: 'Analyze deployment pace vs plan',
        reasoning: 'Currently 15% behind schedule',
        confidence: 0.90,
      },
      {
        id: 'reserve-strategy',
        text: 'Optimize reserve deployment strategy',
        reasoning: '5 companies likely to need follow-on',
        confidence: 0.86,
      },
    ],
    '/analytics:risk': [
      {
        id: 'concentration-risk',
        text: 'Review portfolio concentration risk',
        reasoning: 'Top 3 companies represent 45% of NAV',
        confidence: 0.92,
      },
      {
        id: 'sector-exposure',
        text: 'Analyze sector exposure limits',
        reasoning: 'SaaS allocation at 60%, above target',
        confidence: 0.88,
      },
    ],
    // Tab-specific for /portfolio page (3 tabs)
    '/portfolio:overview': [
      {
        id: 'at-risk-companies',
        text: 'Review 2 at-risk portfolio companies',
        reasoning: 'Runway < 12 months, need intervention',
        confidence: 0.94,
      },
      {
        id: 'health-trends',
        text: 'Analyze portfolio health trends',
        reasoning: 'Overall health score decreased 5%',
        confidence: 0.87,
      },
    ],
    '/portfolio:updates': [
      {
        id: 'pending-updates',
        text: 'Review 5 unread portfolio updates',
        reasoning: 'Recent company submissions require attention',
        confidence: 0.91,
      },
      {
        id: 'schedule-reviews',
        text: 'Schedule quarterly board meetings',
        reasoning: 'Q1 meetings need to be scheduled',
        confidence: 0.84,
      },
    ],
    '/portfolio:documents': [
      {
        id: 'missing-docs',
        text: 'Follow up on missing quarterly reports',
        reasoning: '3 companies have not submitted Q4 reports',
        confidence: 0.89,
      },
      {
        id: 'organize-docs',
        text: 'Organize documents by category',
        reasoning: 'Auto-tag recent uploads for easier search',
        confidence: 0.82,
      },
    ],
    // Tab-specific for /ai-tools page (3 tabs)
    '/ai-tools:decision-writer': [
      {
        id: 'generate-ic-memo',
        text: 'Generate investment committee memo',
        reasoning: 'Based on recent deal diligence data',
        confidence: 0.88,
      },
      {
        id: 'draft-decision',
        text: 'Draft pass/proceed recommendation',
        reasoning: 'AI analysis of risks and opportunities complete',
        confidence: 0.85,
      },
    ],
    '/ai-tools:pitch-deck-reader': [
      {
        id: 'analyze-deck',
        text: 'Analyze uploaded pitch deck',
        reasoning: 'Extract key metrics and investment thesis',
        confidence: 0.91,
      },
      {
        id: 'compare-decks',
        text: 'Compare with similar portfolio decks',
        reasoning: 'Identify patterns in successful investments',
        confidence: 0.83,
      },
    ],
    '/ai-tools:dd-assistant': [
      {
        id: 'ask-dd-questions',
        text: 'Ask AI due diligence questions',
        reasoning: 'Chat through deal analysis and red flags',
        confidence: 0.89,
      },
      {
        id: 'generate-dd-checklist',
        text: 'Generate comprehensive DD checklist',
        reasoning: 'Based on deal stage and industry',
        confidence: 0.86,
      },
    ],
  };

  // Try context-specific (pathname:tab) first, fall back to pathname only
  return baseSuggestions[contextKey] || baseSuggestions[pathname] || [
    {
      id: 'default',
      text: 'Analyze current page data',
      reasoning: 'I can provide insights on this section',
      confidence: 0.75,
    },
  ];
};

export const getMockCopilotQuickActions = (pathname: string, tab?: string | null): QuickAction[] => {
  // Create a composite key from pathname and tab for context-specific actions
  const contextKey = tab ? `${pathname}:${tab}` : pathname;

  const baseActions: Record<string, QuickAction[]> = {
    '/home': [
      {
        id: 'summarize',
        label: 'Summarize Today',
        icon: Sparkles,
        action: 'Generate daily summary',
        aiSuggested: true,
        confidence: 0.9,
      },
      {
        id: 'urgent',
        label: 'Show Urgent Items',
        icon: Zap,
        action: 'Filter urgent tasks',
        aiSuggested: true,
        confidence: 0.86,
      },
    ],
    '/pipeline': [
      { id: 'analyze', label: 'Analyze Deals', icon: Sparkles, action: 'Run deal analysis' },
      { id: 'conflicts', label: 'Check Conflicts', icon: Zap, action: 'Detect conflicts' },
    ],
    '/fund-admin': [
      { id: 'draft-call', label: 'Draft Capital Call', icon: Sparkles, action: 'Generate capital call' },
      { id: 'track-lps', label: 'Track LPs', icon: Zap, action: 'Show LP status' },
    ],
    '/contacts': [
      { id: 'filter-cold', label: 'Filter Cold Contacts', icon: Zap, action: 'Show inactive contacts' },
      { id: 'export-list', label: 'Export Contact List', icon: Sparkles, action: 'Generate export' },
    ],
    '/lp-management': [
      { id: 'send-reports', label: 'Send Reports', icon: Sparkles, action: 'Distribute quarterly reports' },
      { id: 'track-calls', label: 'Track Capital Calls', icon: Zap, action: 'Show LP responses' },
    ],
    '/deal-intelligence': [
      { id: 'analyze-flow', label: 'Analyze Deal Flow', icon: Sparkles, action: 'Run trend analysis' },
      { id: 'check-bottlenecks', label: 'Check Bottlenecks', icon: Zap, action: 'Identify DD delays' },
    ],
    '/dealflow-review': [
      { id: 'review-new', label: 'Review New Submissions', icon: Sparkles, action: 'Triage applications' },
      { id: 'assign-deals', label: 'Assign Reviewers', icon: Zap, action: 'Distribute workload' },
    ],
    '/analytics': [
      { id: 'benchmark', label: 'Benchmark Performance', icon: Sparkles, action: 'Compare to peers' },
      { id: 'analyze-moic', label: 'Analyze MOIC', icon: Zap, action: 'Top return drivers' },
    ],
    '/compliance': [
      { id: 'address-overdue', label: 'Address Overdue', icon: Sparkles, action: 'Show overdue items' },
      { id: 'view-deadlines', label: 'View Deadlines', icon: Zap, action: 'Show calendar' },
    ],
    '/409a-valuations': [
      { id: 'request-refresh', label: 'Request Refresh', icon: Sparkles, action: 'Request new valuation' },
      { id: 'flag-events', label: 'Flag Material Events', icon: Zap, action: 'Identify trigger events' },
    ],
    '/tax-center': [
      { id: 'distribute-k1s', label: 'Distribute K-1s', icon: Sparkles, action: 'Send ready K-1s' },
      { id: 'send-reminders', label: 'Send Reminders', icon: Zap, action: 'Email filing deadline' },
    ],
    '/reports': [
      { id: 'generate-quarterly', label: 'Generate Report', icon: Sparkles, action: 'Create Q4 report' },
      { id: 'customize', label: 'Customize Reports', icon: Zap, action: 'Edit templates' },
    ],
    '/ai-tools': [
      { id: 'generate-memo', label: 'Generate IC Memo', icon: Sparkles, action: 'Create investment memo' },
      { id: 'analyze-deck', label: 'Analyze Deck', icon: Zap, action: 'Extract metrics' },
    ],
    '/audit-trail': [
      { id: 'review-activity', label: 'Review Activity', icon: Sparkles, action: 'Show recent logs' },
      { id: 'export-audit', label: 'Export Audit', icon: Zap, action: 'Download report' },
    ],
    '/documents': [
      { id: 'organize', label: 'Organize Documents', icon: Sparkles, action: 'Auto-tag uploads' },
      { id: 'follow-up', label: 'Follow Up Missing', icon: Zap, action: 'Request reports' },
    ],
    '/integrations': [
      { id: 'check-sync', label: 'Check Sync', icon: Sparkles, action: 'View sync status' },
      { id: 'configure', label: 'Configure New', icon: Zap, action: 'Add integration' },
    ],
    '/settings': [
      { id: 'review-permissions', label: 'Review Permissions', icon: Sparkles, action: 'Check access levels' },
      { id: 'update-prefs', label: 'Update Preferences', icon: Zap, action: 'Configure alerts' },
    ],
    // Tab-specific quick actions for /contacts page
    '/contacts:overview': [
      { id: 'filter-cold', label: 'Filter Cold Contacts', icon: Zap, action: 'Show inactive contacts' },
      { id: 'export-list', label: 'Export Contact List', icon: Sparkles, action: 'Generate export' },
    ],
    '/contacts:timeline': [
      { id: 'add-note', label: 'Add Interaction Note', icon: Sparkles, action: 'Log new interaction' },
      { id: 'schedule-meeting', label: 'Schedule Follow-up', icon: Zap, action: 'Create calendar event' },
    ],
    '/contacts:email': [
      { id: 'compose-email', label: 'Compose Email', icon: Sparkles, action: 'Draft new email' },
      { id: 'sync-now', label: 'Sync Emails Now', icon: Zap, action: 'Force sync all accounts' },
    ],
    // Tab-specific quick actions for /lp-portal page
    '/lp-portal:overview': [
      { id: 'send-update', label: 'Send LP Update', icon: Sparkles, action: 'Draft investor update' },
      { id: 'view-activity', label: 'View Recent Activity', icon: Zap, action: 'Show activity log' },
    ],
    '/lp-portal:reports': [
      { id: 'generate-report', label: 'Generate Report', icon: Sparkles, action: 'Create quarterly report' },
      { id: 'customize-template', label: 'Customize Template', icon: Zap, action: 'Edit report format' },
    ],
    '/lp-portal:capital': [
      { id: 'new-call', label: 'Create Capital Call', icon: Sparkles, action: 'Draft new call' },
      { id: 'track-responses', label: 'Track Responses', icon: Zap, action: 'Show LP responses' },
    ],
    '/lp-portal:performance': [
      { id: 'export-metrics', label: 'Export Metrics', icon: Sparkles, action: 'Download performance data' },
      { id: 'compare-benchmark', label: 'Compare to Benchmark', icon: Zap, action: 'Load peer data' },
    ],
    '/lp-portal': [
      { id: 'send-update', label: 'Send LP Update', icon: Sparkles, action: 'Draft investor update' },
      { id: 'view-activity', label: 'View Recent Activity', icon: Zap, action: 'Show activity log' },
    ],
    // Tab-specific quick actions for /lp-management page (same tabs as LP Portal)
    '/lp-management:overview': [
      { id: 'analyze-engagement', label: 'Analyze Engagement', icon: Sparkles, action: 'Show LP metrics' },
      { id: 'review-subscriptions', label: 'Review Subscriptions', icon: Zap, action: 'Check commitments' },
    ],
    '/lp-management:reports': [
      { id: 'send-reports', label: 'Send Reports', icon: Sparkles, action: 'Distribute to LPs' },
      { id: 'track-downloads', label: 'Track Downloads', icon: Zap, action: 'View analytics' },
    ],
    '/lp-management:capital': [
      { id: 'new-call', label: 'New Capital Call', icon: Sparkles, action: 'Draft capital call' },
      { id: 'follow-up-overdue', label: 'Follow Up Overdue', icon: Zap, action: 'Send reminders' },
    ],
    '/lp-management:performance': [
      { id: 'generate-pack', label: 'Generate Pack', icon: Sparkles, action: 'Create performance pack' },
      { id: 'analyze-returns', label: 'Analyze Returns', icon: Zap, action: 'LP cohort analysis' },
    ],
    // Tab-specific for Deal Intelligence page
    '/deal-intelligence:fund-level': [
      { id: 'pipeline-report', label: 'Generate Pipeline Report', icon: Sparkles, action: 'Create pipeline summary' },
      { id: 'dd-status', label: 'DD Status Overview', icon: Zap, action: 'Show all DD progress' },
    ],
    '/deal-intelligence:per-deal': [
      { id: 'risk-report', label: 'Generate Risk Report', icon: Sparkles, action: 'Analyze deal risks' },
      { id: 'share-summary', label: 'Share Deal Summary', icon: Zap, action: 'Export deal memo' },
    ],
    // Tab-specific quick actions for /fund-admin page (7 tabs)
    '/fund-admin:capital-calls': [
      { id: 'draft-call', label: 'Draft Capital Call', icon: Sparkles, action: 'Generate capital call notice' },
      { id: 'send-reminders', label: 'Send LP Reminders', icon: Zap, action: 'Bulk reminder emails' },
    ],
    '/fund-admin:distributions': [
      { id: 'calculate-dist', label: 'Calculate Distribution', icon: Sparkles, action: 'Run waterfall calculation' },
      { id: 'prepare-notices', label: 'Prepare Notices', icon: Zap, action: 'Generate distribution notices' },
    ],
    '/fund-admin:lp-responses': [
      { id: 'track-responses', label: 'Track Responses', icon: Sparkles, action: 'Show response dashboard' },
      { id: 'send-bulk-reminder', label: 'Send Bulk Reminders', icon: Zap, action: 'Email pending LPs' },
    ],
    '/fund-admin:nav-calculator': [
      { id: 'calculate-nav', label: 'Calculate NAV', icon: Sparkles, action: 'Run NAV calculation' },
      { id: 'export-nav', label: 'Export NAV Report', icon: Zap, action: 'Download NAV analysis' },
    ],
    '/fund-admin:carried-interest': [
      { id: 'calc-carry', label: 'Calculate Carry', icon: Sparkles, action: 'Run carry accrual' },
      { id: 'forecast-dist', label: 'Forecast Distribution', icon: Zap, action: 'Project carry payments' },
    ],
    '/fund-admin:expenses': [
      { id: 'categorize', label: 'Categorize Expenses', icon: Sparkles, action: 'Auto-classify expenses' },
      { id: 'budget-check', label: 'Check Budget', icon: Zap, action: 'Show budget variance' },
    ],
    '/fund-admin:secondary-transfers': [
      { id: 'review-transfer', label: 'Review Transfer', icon: Sparkles, action: 'Open pending transfer' },
      { id: 'rofr-calc', label: 'Calculate ROFR', icon: Zap, action: 'Run ROFR valuation' },
    ],
    // Tab-specific quick actions for /compliance page (5 tabs)
    '/compliance:overview': [
      { id: 'address-overdue', label: 'Address Overdue', icon: Sparkles, action: 'Show overdue items' },
      { id: 'upcoming-deadlines', label: 'View Deadlines', icon: Zap, action: 'Show calendar' },
    ],
    '/compliance:filings': [
      { id: 'prepare-adv', label: 'Prepare Form ADV', icon: Sparkles, action: 'Start ADV update' },
      { id: 'state-renewals', label: 'State Renewals', icon: Zap, action: 'Show renewal status' },
    ],
    '/compliance:audits': [
      { id: 'audit-checklist', label: 'Audit Checklist', icon: Sparkles, action: 'Generate audit prep list' },
      { id: 'findings-review', label: 'Review Findings', icon: Zap, action: 'Show previous findings' },
    ],
    '/compliance:aml-kyc': [
      { id: 'complete-kyc', label: 'Complete KYC', icon: Sparkles, action: 'Open pending KYC' },
      { id: 'refresh-kyc', label: 'Refresh KYC', icon: Zap, action: 'Start annual refresh' },
    ],
    '/compliance:resources': [
      { id: 'sec-guidance', label: 'View SEC Guidance', icon: Sparkles, action: 'Show latest rules' },
      { id: 'schedule-training', label: 'Schedule Training', icon: Zap, action: 'Book compliance training' },
    ],
    // Tab-specific quick actions for /tax-center page (5 tabs)
    '/tax-center:overview': [
      { id: 'distribute-k1s', label: 'Distribute K-1s', icon: Sparkles, action: 'Send ready K-1s' },
      { id: 'deadline-reminders', label: 'Send Reminders', icon: Zap, action: 'Email filing deadline' },
    ],
    '/tax-center:k1-generator': [
      { id: 'generate-k1s', label: 'Generate K-1s', icon: Sparkles, action: 'Create K-1 package' },
      { id: 'review-allocations', label: 'Review Allocations', icon: Zap, action: 'Verify tax allocations' },
    ],
    '/tax-center:fund-summary': [
      { id: 'tax-summary', label: 'Tax Summary', icon: Sparkles, action: 'Generate fund summary' },
      { id: 'prior-year-compare', label: 'Compare Prior Year', icon: Zap, action: 'Show variance analysis' },
    ],
    '/tax-center:portfolio': [
      { id: 'follow-up', label: 'Follow Up', icon: Sparkles, action: 'Email missing K-1s' },
      { id: 'estimate-impact', label: 'Estimate Tax Impact', icon: Zap, action: 'Calculate exit tax' },
    ],
    '/tax-center:communications': [
      { id: 'draft-memo', label: 'Draft Tax Memo', icon: Sparkles, action: 'Create LP memo' },
      { id: 'extension-notice', label: 'Extension Notice', icon: Zap, action: 'Send extension alerts' },
    ],
    // Tab-specific quick actions for /409a-valuations page (3 tabs)
    '/409a-valuations:valuations': [
      { id: 'request-refresh', label: 'Request Refresh', icon: Sparkles, action: 'Request new valuation' },
      { id: 'flag-events', label: 'Flag Material Events', icon: Zap, action: 'Identify trigger events' },
    ],
    '/409a-valuations:strike-prices': [
      { id: 'review-grants', label: 'Review Grants', icon: Sparkles, action: 'Show recent grants' },
      { id: 'vesting-analysis', label: 'Vesting Analysis', icon: Zap, action: 'Analyze vesting terms' },
    ],
    '/409a-valuations:history': [
      { id: 'trend-analysis', label: 'Trend Analysis', icon: Sparkles, action: 'Chart FMV trends' },
      { id: 'methodology-review', label: 'Review Methods', icon: Zap, action: 'Compare methodologies' },
    ],
    // Tab-specific quick actions for /analytics page (6 tabs)
    '/analytics:performance': [
      { id: 'benchmark', label: 'Benchmark Performance', icon: Sparkles, action: 'Compare to peers' },
      { id: 'moic-analysis', label: 'MOIC Drivers', icon: Zap, action: 'Analyze top performers' },
    ],
    '/analytics:j-curve': [
      { id: 'project-curve', label: 'Project J-Curve', icon: Sparkles, action: 'Forecast trajectory' },
      { id: 'compare-funds', label: 'Compare Funds', icon: Zap, action: 'Multi-fund comparison' },
    ],
    '/analytics:cohort': [
      { id: 'find-outliers', label: 'Find Outliers', icon: Sparkles, action: 'Identify high performers' },
      { id: 'sector-analysis', label: 'Sector Analysis', icon: Zap, action: 'Compare by sector' },
    ],
    '/analytics:valuation': [
      { id: 'momentum-tracker', label: 'Track Momentum', icon: Sparkles, action: 'Show markup trends' },
      { id: 'forecast-gains', label: 'Forecast Gains', icon: Zap, action: 'Project year-end value' },
    ],
    '/analytics:deployment': [
      { id: 'pace-analysis', label: 'Pace Analysis', icon: Sparkles, action: 'Compare vs plan' },
      { id: 'reserve-strategy', label: 'Reserve Strategy', icon: Zap, action: 'Optimize reserves' },
    ],
    '/analytics:risk': [
      { id: 'concentration', label: 'Concentration Risk', icon: Sparkles, action: 'Review portfolio mix' },
      { id: 'sector-exposure', label: 'Sector Exposure', icon: Zap, action: 'Check allocation limits' },
    ],
    // Tab-specific quick actions for /portfolio page (3 tabs)
    '/portfolio:overview': [
      { id: 'at-risk', label: 'Review At-Risk', icon: Sparkles, action: 'Show companies needing help' },
      { id: 'health-trends', label: 'Health Trends', icon: Zap, action: 'Analyze trend data' },
    ],
    '/portfolio:updates': [
      { id: 'review-updates', label: 'Review Updates', icon: Sparkles, action: 'Read pending updates' },
      { id: 'schedule-meetings', label: 'Schedule Meetings', icon: Zap, action: 'Book board meetings' },
    ],
    '/portfolio:documents': [
      { id: 'follow-up-docs', label: 'Follow Up Docs', icon: Sparkles, action: 'Request missing reports' },
      { id: 'organize-docs', label: 'Organize Documents', icon: Zap, action: 'Auto-tag uploads' },
    ],
    // Tab-specific quick actions for /ai-tools page (3 tabs)
    '/ai-tools:decision-writer': [
      { id: 'generate-memo', label: 'Generate IC Memo', icon: Sparkles, action: 'Create investment memo' },
      { id: 'draft-recommendation', label: 'Draft Recommendation', icon: Zap, action: 'Write pass/proceed' },
    ],
    '/ai-tools:pitch-deck-reader': [
      { id: 'upload-deck', label: 'Upload Deck', icon: Sparkles, action: 'Analyze pitch deck' },
      { id: 'extract-metrics', label: 'Extract Metrics', icon: Zap, action: 'Pull key data points' },
    ],
    '/ai-tools:dd-assistant': [
      { id: 'ask-question', label: 'Ask DD Question', icon: Sparkles, action: 'Chat with AI assistant' },
      { id: 'generate-checklist', label: 'Generate Checklist', icon: Zap, action: 'Create DD checklist' },
    ],
  };

  // Try context-specific (pathname:tab) first, fall back to pathname only
  return baseActions[contextKey] || baseActions[pathname] || [
    { id: 'help', label: 'What can you do?', icon: Lightbulb, action: 'Show capabilities' },
  ];
};

