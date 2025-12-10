'use client'

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Sparkles, Info } from 'lucide-react';
import { Card, ProgressBar, Badge } from '@/ui';

export interface PortfolioCompany {
  id: string;
  name: string;
  health: number; // 0-100
  healthChange: number; // -100 to +100
  runway: number; // months
  burnRate: number;
  prediction: {
    nextQuarterHealth: number;
    confidence: number;
    reasoning: string;
  };
  anomalies?: Array<{
    metric: string;
    change: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

interface PortfolioHealthProps {
  companies: PortfolioCompany[];
}

export function PortfolioHealth({ companies }: PortfolioHealthProps) {
  const atRiskCompanies = companies.filter(c => c.health < 70 || c.runway < 12);
  const healthyCompanies = companies.filter(c => c.health >= 80);

  const getHealthVariant = (health: number) => {
    if (health >= 80) return 'success';
    if (health >= 60) return 'primary';
    if (health >= 40) return 'warning';
    return 'danger';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-primary)]/10">
              <Activity className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">
                Portfolio Health
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                AI-powered forecasting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="success" size="sm">
              {healthyCompanies.length} healthy
            </Badge>
            {atRiskCompanies.length > 0 && (
              <Badge color="warning" size="sm">
                {atRiskCompanies.length} at risk
              </Badge>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {companies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--app-text-muted)]">
              No portfolio companies
            </p>
          </div>
        ) : (
          companies.map((company, index) => {
            const healthTrend = company.healthChange >= 0 ? 'up' : 'down';
            const predictedChange = company.prediction.nextQuarterHealth - company.health;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 rounded-lg border border-[var(--app-border)] hover:border-[var(--app-primary)]/30 transition-colors"
              >
                {/* Company Name + Health Score */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[var(--app-text)] mb-1">
                      {company.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--app-text-muted)]">
                        Runway: {company.runway} months
                      </span>
                      <span className="text-[var(--app-text-subtle)]">•</span>
                      <span className="text-[var(--app-text-muted)]">
                        Burn: {formatCurrency(company.burnRate)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Health Score Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-lg font-bold ${
                        company.health >= 80 ? 'text-[var(--app-success)]' :
                        company.health >= 60 ? 'text-[var(--app-primary)]' :
                        company.health >= 40 ? 'text-[var(--app-warning)]' :
                        'text-[var(--app-danger)]'
                      }`}>
                        {company.health}
                      </span>
                      <span className="text-xs text-[var(--app-text-subtle)]">/100</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      healthTrend === 'up' ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
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
                  <div className="mb-3 p-2 rounded-lg bg-[var(--app-warning-bg)] border border-[var(--app-border)]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--app-warning)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[var(--app-text)] mb-1">
                          Anomalies Detected
                        </p>
                        <div className="space-y-1">
                          {company.anomalies.map((anomaly, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs text-[var(--app-text-muted)]">
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
                <div className="p-3 rounded-lg bg-[var(--app-primary)]/5 border border-[var(--app-border)]">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[var(--app-text)] mb-1">
                        AI Forecast: Next Quarter
                      </p>

                      {/* Predicted Health */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[var(--app-text-muted)]">
                          Predicted Health
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            predictedChange >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
                          }`}>
                            {company.prediction.nextQuarterHealth}
                          </span>
                          <span className={`text-xs ${
                            predictedChange >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
                          }`}>
                            ({predictedChange >= 0 ? '+' : ''}{predictedChange})
                          </span>
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[var(--app-text-subtle)] flex-shrink-0">
                          Confidence
                        </span>
                        <ProgressBar
                          value={company.prediction.confidence * 100}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        />
                        <span className="text-xs font-bold text-[var(--app-primary)] flex-shrink-0">
                          {Math.round(company.prediction.confidence * 100)}%
                        </span>
                      </div>

                      {/* Reasoning */}
                      <div className="flex items-start gap-2 p-2 rounded bg-[var(--app-surface)]/50">
                        <Info className="w-3 h-3 text-[var(--app-text-subtle)] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[var(--app-text-subtle)]">
                          {company.prediction.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
