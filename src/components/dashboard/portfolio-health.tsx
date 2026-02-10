'use client'

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { Card, Badge } from '@/ui';
import { PortfolioCompanyCard } from './portfolio-company-card';

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
  const atRiskCompanies = useMemo(
    () => companies.filter(c => c.health < 70 || c.runway < 12),
    [companies]
  );
  const healthyCompanies = useMemo(
    () => companies.filter(c => c.health >= 80),
    [companies]
  );

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
                Health scores, runway, and forward outlook
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
              No portfolio companies available
            </p>
          </div>
        ) : (
          companies.map((company, index) => (
            <PortfolioCompanyCard key={company.id} company={company} index={index} />
          ))
        )}
      </div>
    </Card>
  );
}
