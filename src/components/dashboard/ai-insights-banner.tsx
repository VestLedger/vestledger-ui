'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Info, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/ui';
import { useUIKey } from '@/store/ui';

export interface AIInsight {
  summary: string;
  confidence: number;
  details: InsightDetail[];
  timestamp: Date;
}

export interface InsightDetail {
  id: string;
  category: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  actionable: boolean;
  reasoning: string;
}

interface AIInsightsBannerProps {
  insight: AIInsight;
}

export function AIInsightsBanner({ insight }: AIInsightsBannerProps) {
  const { value: ui, patch: patchUI } = useUIKey('ai-insights-banner', { isExpanded: false });
  const { isExpanded } = ui;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.75) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500/10 border-green-500/20';
    if (confidence >= 0.75) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-orange-500/10 border-orange-500/20';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-[var(--app-danger)]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[var(--app-warning)]" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[var(--app-success)]" />;
      default:
        return <Info className="w-4 h-4 text-[var(--app-info)]" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'bg-[var(--app-danger-bg)]';
      case 'warning':
        return 'bg-[var(--app-warning-bg)]';
      case 'success':
        return 'bg-[var(--app-success-bg)]';
      default:
        return 'bg-[var(--app-info-bg)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-10 mb-6"
    >
      <div className="bg-gradient-to-r from-[var(--app-primary)]/8 to-[var(--app-accent)]/8 border border-[var(--app-border)] rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-[var(--app-primary)]/20">
              <Sparkles className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--app-text)] mb-1">
                AI Daily Briefing
              </h2>
              <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">
                {insight.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Confidence Score */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getConfidenceBg(insight.confidence)}`}>
              <TrendingUp className={`w-4 h-4 ${getConfidenceColor(insight.confidence)}`} />
              <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                {Math.round(insight.confidence * 100)}%
              </span>
            </div>

            {/* Expand/Collapse Button */}
            <Button
              size="sm"
              variant="flat"
              onClick={() => patchUI({ isExpanded: !isExpanded })}
              className="px-3"
            >
              <span className="text-xs mr-2">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pt-4 border-t border-[var(--app-border)] mt-4 space-y-3">
                {insight.details.map((detail) => (
                  <div
                    key={detail.id}
                    className={`p-4 rounded-lg border border-[var(--app-border)] ${getCategoryBg(detail.category)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(detail.category)}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[var(--app-text)] mb-1">
                          {detail.title}
                        </h3>
                        <p className="text-sm text-[var(--app-text-muted)] mb-2">
                          {detail.description}
                        </p>

                        {/* AI Reasoning */}
                        <div className="flex items-start gap-2 p-2 rounded bg-[var(--app-surface)]/50 mt-2">
                          <Info className="w-3 h-3 text-[var(--app-text-subtle)] mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-[var(--app-text-subtle)]">
                            <span className="font-semibold">AI Analysis: </span>
                            {detail.reasoning}
                          </p>
                        </div>

                        {/* Actionable Tag */}
                        {detail.actionable && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] text-xs font-medium">
                              <Sparkles className="w-3 h-3" />
                              Action Required
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Confidence Explanation */}
                <div className="p-3 rounded-lg bg-[var(--app-surface)]/50 border border-[var(--app-border)]">
                  <p className="text-xs text-[var(--app-text-subtle)]">
                    <span className="font-semibold text-[var(--app-text-muted)]">Confidence Score: </span>
                    This {Math.round(insight.confidence * 100)}% confidence is based on current fund data quality,
                    historical pattern analysis, and the completeness of available information.
                    Higher scores indicate greater certainty in AI predictions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
