'use client'

import { Card, Button, Badge, Progress } from '@/ui';
import { AlertTriangle, PieChart } from 'lucide-react';
import { getConcentrationRiskMetrics, type ConcentrationMetric } from '@/services/analytics/fundAnalyticsService';
import { useUIKey } from '@/store/ui';

type ConcentrationView = 'company' | 'sector' | 'stage';

interface ConcentrationRowProps {
  item: ConcentrationMetric;
  maxPercentage: number;
  isHighRisk: boolean;
}

function ConcentrationRow({ item, maxPercentage, isHighRisk }: ConcentrationRowProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const getRiskColor = (percentage: number) => {
    if (percentage >= 25) return 'var(--app-danger)';
    if (percentage >= 15) return 'var(--app-warning)';
    return 'var(--app-success)';
  };

  const getRiskLabel = (percentage: number) => {
    if (percentage >= 25) return 'High';
    if (percentage >= 15) return 'Medium';
    return 'Low';
  };

  return (
    <div className="p-4 rounded-lg border border-[var(--app-border)] hover:bg-[var(--app-surface-hover)] transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{item.percentage.toFixed(0)}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold truncate">{item.category}</p>
              {isHighRisk && (
                <Badge
                  size="sm"
                  className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]"
                >
                  High Risk
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
              <span>{formatCurrency(item.value)}</span>
              {item.count !== undefined && (
                <>
                  <span>•</span>
                  <span>{item.count} {item.count === 1 ? 'company' : 'companies'}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: getRiskColor(item.percentage) }}>
            {item.percentage.toFixed(1)}%
          </p>
          <p className="text-xs font-medium" style={{ color: getRiskColor(item.percentage) }}>
            {getRiskLabel(item.percentage)} Risk
          </p>
        </div>
      </div>
      <Progress
        value={item.percentage}
        maxValue={maxPercentage}
        className="mb-1"
        aria-label={`${item.category} concentration ${item.percentage.toFixed(1)}%`}
        style={{
          '--progress-color': getRiskColor(item.percentage)
        } as React.CSSProperties}
      />
    </div>
  );
}

export function ConcentrationRisk() {
  const { byCompany: concentrationByCompany, bySector: concentrationBySector, byStage: concentrationByStage } =
    getConcentrationRiskMetrics();
  const { value: ui, patch: patchUI } = useUIKey<{ selectedView: ConcentrationView }>(
    'concentration-risk',
    { selectedView: 'company' }
  );
  const { selectedView } = ui;

  const getConcentrationData = (): ConcentrationMetric[] => {
    switch (selectedView) {
      case 'company': return concentrationByCompany;
      case 'sector': return concentrationBySector;
      case 'stage': return concentrationByStage;
      default: return concentrationByCompany;
    }
  };

  const data = getConcentrationData();
  const maxPercentage = Math.max(...data.map(d => d.percentage));

  // Calculate risk metrics
  const top3Concentration = data.slice(0, 3).reduce((sum, d) => sum + d.percentage, 0);
  const top5Concentration = data.slice(0, 5).reduce((sum, d) => sum + d.percentage, 0);
  const highRiskCount = data.filter(d => d.percentage >= 25).length;
  const mediumRiskCount = data.filter(d => d.percentage >= 15 && d.percentage < 25).length;

  // HHI (Herfindahl-Hirschman Index) calculation
  const hhi = data.reduce((sum, d) => sum + Math.pow(d.percentage, 2), 0);
  const getHHIRating = (hhi: number) => {
    if (hhi < 1500) return { label: 'Low', color: 'var(--app-success)' };
    if (hhi < 2500) return { label: 'Moderate', color: 'var(--app-warning)' };
    return { label: 'High', color: 'var(--app-danger)' };
  };
  const hhiRating = getHHIRating(hhi);

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--app-warning)]" />
            <h3 className="text-lg font-semibold">Concentration Risk Analysis</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'company' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => patchUI({ selectedView: 'company' })}
              className={selectedView === 'company' ? 'bg-[var(--app-primary)] text-white' : ''}
            >
              By Company
            </Button>
            <Button
              variant={selectedView === 'sector' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => patchUI({ selectedView: 'sector' })}
              className={selectedView === 'sector' ? 'bg-[var(--app-primary)] text-white' : ''}
            >
              By Sector
            </Button>
            <Button
              variant={selectedView === 'stage' ? 'solid' : 'flat'}
              size="sm"
              onPress={() => patchUI({ selectedView: 'stage' })}
              className={selectedView === 'stage' ? 'bg-[var(--app-primary)] text-white' : ''}
            >
              By Stage
            </Button>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Top Position</p>
            <p className="text-xl font-bold">{data[0].percentage.toFixed(1)}%</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1 truncate">{data[0].category}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Top 3 Concentration</p>
            <p className="text-xl font-bold">{top3Concentration.toFixed(1)}%</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">of portfolio</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Top 5 Concentration</p>
            <p className="text-xl font-bold">{top5Concentration.toFixed(1)}%</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">of portfolio</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${hhiRating.color}20` }}>
            <p className="text-xs text-[var(--app-text-muted)] mb-1">HHI Score</p>
            <p className="text-xl font-bold" style={{ color: hhiRating.color }}>{hhi.toFixed(0)}</p>
            <p className="text-xs font-medium mt-1" style={{ color: hhiRating.color }}>{hhiRating.label} Concentration</p>
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="p-4 rounded-lg border border-[var(--app-border)] mb-6">
          <h4 className="text-sm font-semibold mb-3">Risk Distribution</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--app-text-muted)]">High Risk (≥25%)</span>
                <span className="text-sm font-semibold text-[var(--app-danger)]">{highRiskCount}</span>
              </div>
              <Progress
                value={highRiskCount}
                maxValue={data.length}
                className="mb-1"
                color="danger"
                aria-label={`High risk positions: ${highRiskCount} of ${data.length}`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--app-text-muted)]">Medium Risk (15-25%)</span>
                <span className="text-sm font-semibold text-[var(--app-warning)]">{mediumRiskCount}</span>
              </div>
              <Progress
                value={mediumRiskCount}
                maxValue={data.length}
                className="mb-1"
                color="warning"
                aria-label={`Medium risk positions: ${mediumRiskCount} of ${data.length}`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--app-text-muted)]">Low Risk (&lt;15%)</span>
                <span className="text-sm font-semibold text-[var(--app-success)]">{data.length - highRiskCount - mediumRiskCount}</span>
              </div>
              <Progress
                value={data.length - highRiskCount - mediumRiskCount}
                maxValue={data.length}
                className="mb-1"
                color="success"
                aria-label={`Low risk positions: ${data.length - highRiskCount - mediumRiskCount} of ${data.length}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Concentration List */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <ConcentrationRow
            key={index}
            item={item}
            maxPercentage={maxPercentage}
            isHighRisk={item.percentage >= 25}
          />
        ))}
      </div>

      {/* Risk Insights */}
      <div className="mt-6 pt-6 border-t border-[var(--app-border)]">
        <h4 className="text-sm font-semibold mb-3">Risk Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {highRiskCount > 0 ? (
            <div className="p-3 rounded-lg border border-[var(--app-danger)]/20 bg-[var(--app-danger-bg)]">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--app-danger)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--app-danger)]">High Concentration Detected</p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">
                    {highRiskCount} {selectedView === 'company' ? 'companies' : selectedView === 'sector' ? 'sectors' : 'stages'} exceed 25% concentration threshold. Consider diversification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-[var(--app-success)]/20 bg-[var(--app-success-bg)]">
              <div className="flex items-start gap-2">
                <PieChart className="w-4 h-4 text-[var(--app-success)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--app-success)]">Well Diversified</p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">
                    No positions exceed 25% concentration threshold. Portfolio shows healthy diversification.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg border border-[var(--app-border)]">
            <div className="flex items-start gap-2">
              <PieChart className="w-4 h-4 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">HHI Analysis</p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  {hhi < 1500 ?
                    'Low concentration risk. Portfolio is well-diversified across holdings.' :
                    hhi < 2500 ?
                    'Moderate concentration. Some positions dominate but diversification is acceptable.' :
                    'High concentration risk. Portfolio heavily weighted toward few positions.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info about HHI */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--app-info-bg)] border border-[var(--app-info)]/20">
          <p className="text-xs text-[var(--app-text-muted)]">
            <strong>HHI (Herfindahl-Hirschman Index)</strong>: Measures market concentration.
            &lt;1,500 = Low concentration (competitive), 1,500-2,500 = Moderate concentration,
            &gt;2,500 = High concentration. Lower scores indicate better diversification.
          </p>
        </div>
      </div>
    </Card>
  );
}
