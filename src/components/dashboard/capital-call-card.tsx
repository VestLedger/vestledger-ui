'use client'

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Clock, Users, Sparkles } from 'lucide-react';
import { ProgressBar } from '@/ui';
import { formatCurrencyCompact, formatDate as formatDateValue } from '@/utils/formatting';
import type { CapitalCall } from './active-capital-calls';

interface CapitalCallCardProps {
  call: CapitalCall;
  index: number;
}

const formatDate = (date: Date) => {
  return formatDateValue(date, {
    month: 'short',
    day: 'numeric',
  });
};

const getCollectionPercentage = (collected: number, amount: number) => {
  return Math.round((collected / amount) * 100);
};

const isOverdue = (dueDate: Date) => {
  return new Date() > dueDate;
};

export const CapitalCallCard = memo(function CapitalCallCard({ call, index }: CapitalCallCardProps) {
  const percentage = useMemo(
    () => getCollectionPercentage(call.collected, call.amount),
    [call.collected, call.amount]
  );
  const overdue = useMemo(() => isOverdue(call.dueDate), [call.dueDate]);
  const daysUntilExpected = useMemo(() => {
    return Math.ceil(
      (call.prediction.expectedCompletion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [call.prediction.expectedCompletion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 rounded-lg border border-[var(--app-border)] hover:border-[var(--app-primary)]/30 transition-colors"
    >
      {/* Fund Name + Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-[var(--app-text)] mb-1">
            {call.fundName}
          </h4>
          <p className="text-xs text-[var(--app-text-muted)]">
            Due {formatDate(call.dueDate)}
            {overdue && (
              <span className="ml-2 text-[var(--app-danger)]">
                • Overdue
              </span>
            )}
          </p>
        </div>
        {call.overdueLPs > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--app-danger-bg)]">
            <AlertCircle className="w-3 h-3 text-[var(--app-danger)]" />
            <span className="text-xs font-semibold text-[var(--app-danger)]">
              {call.overdueLPs} overdue
            </span>
          </div>
        )}
      </div>

      {/* Amount + Collection Progress */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-lg font-bold text-[var(--app-text)]">
            {formatCurrencyCompact(call.collected)}
          </span>
          <span className="text-sm text-[var(--app-text-muted)]">
            of {formatCurrencyCompact(call.amount)}
          </span>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          value={percentage}
          variant={
            percentage === 100
              ? 'success'
              : percentage >= 75
              ? 'primary'
              : percentage >= 50
              ? 'warning'
              : 'danger'
          }
          size="md"
          showLabel
          label={`${percentage}% collected`}
        />
      </div>

      {/* LP Status */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-[var(--app-text-muted)]" />
          <span className="text-[var(--app-text-muted)]">
            {call.respondedLPs}/{call.totalLPs} LPs responded
          </span>
        </div>
      </div>

      {/* AI Prediction */}
      <div className="p-3 rounded-lg bg-[var(--app-primary)]/5 border border-[var(--app-border)]">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--app-text)] mb-1">
              Forecast
            </p>
            <div className="flex items-baseline gap-2">
              <TrendingUp className="w-3 h-3 text-[var(--app-primary)]" />
              <p className="text-xs text-[var(--app-text-muted)]">
                Expected 100% collection by{' '}
                <span className="font-semibold text-[var(--app-text)]">
                  {formatDate(call.prediction.expectedCompletion)}
                </span>
                {daysUntilExpected > 0 && (
                  <span className="text-[var(--app-text-subtle)]">
                    {' '}({daysUntilExpected} days)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 bg-[var(--app-surface-hover)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--app-primary)] rounded-full"
                  style={{ width: `${call.prediction.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[var(--app-primary)]">
                {Math.round(call.prediction.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* At-Risk LPs */}
        {call.prediction.atRiskLPs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[var(--app-primary)]/10">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">
              At-risk LPs (historical delays):
            </p>
            <div className="flex flex-wrap gap-2">
              {call.prediction.atRiskLPs.map((lp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--app-warning-bg)]"
                >
                  <Clock className="w-3 h-3 text-[var(--app-warning)]" />
                  <span className="text-xs text-[var(--app-text)]">
                    {lp.name}
                  </span>
                  <span className="text-xs text-[var(--app-text-subtle)]">
                    (~{lp.typicalDelayDays}d)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});
