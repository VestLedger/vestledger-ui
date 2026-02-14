import { describe, expect, it } from 'vitest';
import { getMockDashboardData } from './dashboard-data';
import { mockFunds } from '@/data/mocks/funds';

describe('dashboard data shaping', () => {
  it('computes trust score thresholds and risk flags consistently', () => {
    const data = getMockDashboardData(null, 'consolidated', mockFunds);

    expect(data.fundTrustRows.length).toBeGreaterThan(0);

    for (const row of data.fundTrustRows) {
      expect(row.trustScore).toBeGreaterThanOrEqual(0);
      expect(row.trustScore).toBeLessThanOrEqual(100);

      const expectedRisk = row.trustScore < 75 ? 'critical' : row.trustScore < 85 ? 'watch' : 'stable';
      expect(row.riskFlag).toBe(expectedRisk);
    }
  });

  it('sorts portfolio revenue rows by ARR and maps business lanes', () => {
    const data = getMockDashboardData(null, 'consolidated', mockFunds);
    const rows = data.portfolioRevenueRows;

    expect(rows.length).toBeGreaterThan(0);

    for (let index = 1; index < rows.length; index += 1) {
      expect(rows[index - 1].arr).toBeGreaterThanOrEqual(rows[index].arr);
    }

    for (const item of data.dailyBriefItems) {
      expect(['Portfolio', 'LP Relations', 'Operations']).toContain(item.lane);
    }
  });

  it('keeps blockers and opportunities as non-overlapping signal streams', () => {
    const data = getMockDashboardData(null, 'consolidated', mockFunds);

    const blockerSources = new Set(data.blockers.map((item) => item.sourceId));
    const blockerIds = new Set(data.blockers.map((item) => item.id));
    const opportunityIds = new Set(data.opportunities.map((item) => item.id));

    expect(blockerIds.size).toBe(data.blockers.length);
    expect(opportunityIds.size).toBe(data.opportunities.length);

    for (const blocker of data.blockers) {
      expect(data.dailyBriefItems.some((item) => item.id === blocker.sourceId)).toBe(true);
    }

    for (const opportunity of data.opportunities) {
      expect(blockerSources.has(opportunity.sourceId)).toBe(false);
    }
  });
});
