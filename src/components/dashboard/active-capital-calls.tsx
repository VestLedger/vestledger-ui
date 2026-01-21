'use client'

import { DollarSign } from 'lucide-react';
import { Card } from '@/ui';
import { CapitalCallCard } from './capital-call-card';

export interface CapitalCall {
  id: string;
  fundName: string;
  amount: number;
  collected: number;
  dueDate: Date;
  totalLPs: number;
  respondedLPs: number;
  overdueLPs: number;
  prediction: {
    expectedCompletion: Date;
    confidence: number;
    atRiskLPs: Array<{
      name: string;
      typicalDelayDays: number;
    }>;
  };
}

interface ActiveCapitalCallsProps {
  calls: CapitalCall[];
}

export function ActiveCapitalCalls({ calls }: ActiveCapitalCallsProps) {
  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-app-primary/10 dark:bg-app-dark-primary/10">
              <DollarSign className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-app-text dark:text-app-dark-text">
                Active Capital Calls
              </h3>
              <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                AI predictions included
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-app-text dark:text-app-dark-text">
              {calls.length}
            </p>
            <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">Active</p>
          </div>
        </div>
      }
    >

      {/* Capital Calls List */}
      <div className="space-y-4">
        {calls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">
              No active capital calls
            </p>
          </div>
        ) : (
          calls.map((call, index) => (
            <CapitalCallCard key={call.id} call={call} index={index} />
          ))
        )}
      </div>
    </Card>
  );
}
