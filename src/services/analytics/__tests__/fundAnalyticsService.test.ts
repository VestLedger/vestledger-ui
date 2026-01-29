import { describe, it, expect, vi } from 'vitest';
import * as service from '../fundAnalyticsService';

// Mock the config/data-mode module
vi.mock('@/config/data-mode', () => ({
  isMockMode: () => true,
}));

describe('fundAnalyticsService', () => {
  describe('getCurrentFundMetrics', () => {
    it('returns "all" fund metrics when fundId is undefined', () => {
      const result = service.getCurrentFundMetrics(undefined);
      expect(result.fundId).toBe('all');
      expect(result.fundName).toBe('All Funds (Consolidated)');
      // Check aggregated values
      expect(result.fundSize).toBe(425000000);
    });

    it('returns "all" fund metrics when fundId is null', () => {
      // @ts-expect-error - Testing null case
      const result = service.getCurrentFundMetrics(null);
      expect(result.fundId).toBe('all');
    });

    it('returns specific fund metrics when valid fundId is provided', () => {
      const result = service.getCurrentFundMetrics('fund-1');
      expect(result.fundId).toBe('fund-1');
      expect(result.fundName).toBe('VestLedger Fund I');
    });
  });

  describe('getCohortsByVintage', () => {
    it('returns "all" cohorts when fundId is undefined', () => {
      const result = service.getCohortsByVintage(undefined);
      expect(result.length).toBeGreaterThan(0);
      // Check specific aggregated count for a known cohort
      const vintage2021 = result.find(c => c.cohort === '2021 Vintage');
      expect(vintage2021).toBeDefined();
      expect(vintage2021?.count).toBe(8); // 3 (f1) + 5 (f3)
    });

    it('returns specific fund cohorts when valid fundId is provided', () => {
      const result = service.getCohortsByVintage('fund-1');
      const vintage2021 = result.find(c => c.cohort === '2021 Vintage');
      expect(vintage2021?.count).toBe(3);
    });
  });

  describe('getValuationTrends', () => {
    it('returns "all" trends when fundId is undefined', () => {
      const result = service.getValuationTrends(undefined);
      expect(result.length).toBeGreaterThan(0);
      // Check last point
      const lastPoint = result[result.length - 1];
      expect(lastPoint.portfolioValue).toBeGreaterThan(200000000); // Consolidated value
    });

    it('returns specific fund trends when valid fundId is provided', () => {
      const result = service.getValuationTrends('fund-1');
      const lastPoint = result[result.length - 1];
      expect(lastPoint.portfolioValue).toBeLessThan(100000000); // Fund 1 specific value
    });
  });

  describe('getDeploymentPacing', () => {
    it('returns "all" pacing when fundId is undefined', () => {
      const result = service.getDeploymentPacing(undefined);
      expect(result.length).toBeGreaterThan(0);
      const lastPoint = result[result.length - 1];
      expect(lastPoint.cumulativeDeployed).toBeGreaterThan(100000000); // Consolidated
    });
  });

  describe('getConcentrationRiskMetrics', () => {
    it('returns "all" risk metrics when fundId is undefined', () => {
      const result = service.getConcentrationRiskMetrics(undefined);
      expect(result.fromCompany).not.toBeDefined(); // Safety check
      expect(result.byCompany).toBeDefined();
      expect(result.bySector).toBeDefined();
      
      const aiSector = result.bySector.find(s => s.category === 'AI/ML');
      expect(aiSector?.count).toBe(8); // Aggregated count
    });
  });
});
