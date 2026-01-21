'use client'

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, Info } from 'lucide-react';
import { Badge, ProgressBar } from '@/ui';
import { formatCurrencyCompact } from '@/utils/formatting';
import type { PortfolioCompany } from './portfolio-health';

interface PortfolioCompanyCardProps {
  company: PortfolioCompany;
  index: number;
}

const getHealthVariant = (health: number) => {
  if (health >= 80) return 'success';
  if (health >= 60) return 'primary';
  if (health >= 40) return 'warning';
  return 'danger';
};

const getHealthColorClass = (health: number) => {
  if (health >= 80) return 'text-app-success dark:text-app-dark-success';
  if (health >= 60) return 'text-app-primary dark:text-app-dark-primary';
  if (health >= 40) return 'text-app-warning dark:text-app-dark-warning';
  return 'text-app-danger dark:text-app-dark-danger';
};

export const PortfolioCompanyCard = memo(function PortfolioCompanyCard({
  company,
  index,
}: PortfolioCompanyCardProps) {
  const healthTrend = useMemo(
    () => (company.healthChange >= 0 ? 'up' : 'down'),
    [company.healthChange]
  );
  const predictedChange = useMemo(
    () => company.prediction.nextQuarterHealth - company.health,
    [company.prediction.nextQuarterHealth, company.health]
  );
  const healthColorClass = useMemo(
    () => getHealthColorClass(company.health),
    [company.health]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 rounded-lg border border-app-border dark:border-app-dark-border hover:border-app-primary/30 dark:hover:border-app-dark-primary/30 transition-colors"
    >
      {/* Company Name + Health Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-app-text dark:text-app-dark-text mb-1">
            {company.name}
          </h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-app-text-muted dark:text-app-dark-text-muted">
              Runway: {company.runway} months
            </span>
            <span className="text-app-text-subtle dark:text-app-dark-text-subtle">•</span>
            <span className="text-app-text-muted dark:text-app-dark-text-muted">
              Burn: {formatCurrencyCompact(company.burnRate)}/mo
            </span>
          </div>
        </div>

        {/* Health Score Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className={`text-lg font-bold ${healthColorClass}`}>
              {company.health}
            </span>
            <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">/100</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${
            healthTrend === 'up' ? 'text-app-success dark:text-app-dark-success' : 'text-app-danger dark:text-app-dark-danger'
          }`}>
            {healthTrend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="font-semibold">
              {healthTrend === 'up' ? '+' : ''}{company.healthChange}
            </span>
          </div>
        </div>
      </div>

      {/* Health Progress Bar */}
      <ProgressBar
        value={company.health}
        variant={getHealthVariant(company.health)}
        size="md"
        className="mb-3"
      />

      {/* Anomalies */}
      {company.anomalies && company.anomalies.length > 0 && (
        <div className="mb-3 p-2 rounded-lg bg-app-warning-bg dark:bg-app-dark-warning-bg border border-app-border dark:border-app-dark-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-app-warning dark:text-app-dark-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-app-text dark:text-app-dark-text mb-1">
                Anomalies Detected
              </p>
              <div className="space-y-1">
                {company.anomalies.map((anomaly, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                      <span className="font-semibold">{anomaly.metric}:</span> {anomaly.change}
                    </span>
                    <Badge
                      color={anomaly.severity === 'high' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {anomaly.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Prediction */}
      <div className="p-3 rounded-lg bg-app-primary/5 dark:bg-app-dark-primary/5 border border-app-border dark:border-app-dark-border">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-app-primary dark:text-app-dark-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-app-text dark:text-app-dark-text mb-1">
              AI Forecast: Next Quarter
            </p>

            {/* Predicted Health */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                Predicted Health
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${
                  predictedChange >= 0 ? 'text-app-success dark:text-app-dark-success' : 'text-app-danger dark:text-app-dark-danger'
                }`}>
                  {company.prediction.nextQuarterHealth}
                </span>
                <span className={`text-xs ${
                  predictedChange >= 0 ? 'text-app-success dark:text-app-dark-success' : 'text-app-danger dark:text-app-dark-danger'
                }`}>
                  ({predictedChange >= 0 ? '+' : ''}{predictedChange})
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle flex-shrink-0">
                Confidence
              </span>
              <ProgressBar
                value={company.prediction.confidence * 100}
                variant="primary"
                size="sm"
                className="flex-1"
              />
              <span className="text-xs font-bold text-app-primary dark:text-app-dark-primary flex-shrink-0">
                {Math.round(company.prediction.confidence * 100)}%
              </span>
            </div>

            {/* Reasoning */}
            <div className="flex items-start gap-2 p-2 rounded bg-app-surface/50 dark:bg-app-dark-surface/50">
              <Info className="w-3 h-3 text-app-text-subtle dark:text-app-dark-text-subtle mt-0.5 flex-shrink-0" />
              <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
                {company.prediction.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
