import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Distribution } from '@/types/distribution';

const loadService = async () => import('@/services/backOffice/distributionService');

const buildDistribution = (): Partial<Distribution> => ({
  fundId: 'fund-test',
  fundName: 'Test Fund',
  name: 'Test Distribution',
  eventType: 'exit',
  eventDate: '2024-12-31',
  paymentDate: '2025-01-05',
  grossProceeds: 1_500_000,
  totalFees: 50_000,
  totalExpenses: 25_000,
  netProceeds: 1_425_000,
  totalTaxWithholding: 0,
  totalDistributed: 1_425_000,
  createdBy: 'Tester',
});

describe('distributionService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('fetchDistributions filters by fundId', async () => {
    const { fetchDistributions } = await loadService();
    const results = await fetchDistributions({ fundId: 'fund-2' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((distribution) => distribution.fundId === 'fund-2')).toBe(true);
  });

  it('createDistribution adds a new distribution', async () => {
    const { createDistribution, fetchDistributions } = await loadService();
    const baseline = await fetchDistributions();
    const created = await createDistribution(buildDistribution());
    const updated = await fetchDistributions();
    expect(updated.length).toBe(baseline.length + 1);
    expect(updated.some((distribution) => distribution.id === created.id)).toBe(true);
  });

  it('updateDistribution updates fields and increments revision', async () => {
    const { createDistribution, updateDistribution } = await loadService();
    const created = await createDistribution(buildDistribution());
    const updated = await updateDistribution(created.id, { name: 'Updated Distribution' });
    expect(updated.name).toBe('Updated Distribution');
    expect(updated.revisionNumber).toBe(created.revisionNumber + 1);
  });

  it('deleteDistribution removes draft distributions', async () => {
    const { createDistribution, deleteDistribution, fetchDistributions } = await loadService();
    const created = await createDistribution(buildDistribution());
    await deleteDistribution(created.id);
    const results = await fetchDistributions();
    expect(results.some((distribution) => distribution.id === created.id)).toBe(false);
  });

  it('deleteDistribution throws for non-draft distributions', async () => {
    const { deleteDistribution } = await loadService();
    await expect(deleteDistribution('dist-1')).rejects.toThrow('Only draft distributions can be deleted');
  });

  it('fetchDistributionSummary returns summary data', async () => {
    const { fetchDistributionSummary } = await loadService();
    const summary = await fetchDistributionSummary();
    expect(summary.totalDistributions).toBeGreaterThan(0);
  });

  it('fetchDistributionCalendarEvents filters by date range', async () => {
    const { fetchDistributionCalendarEvents } = await loadService();
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const events = await fetchDistributionCalendarEvents(startDate, endDate);
    expect(events.every((event) => event.date >= startDate && event.date <= endDate)).toBe(true);
  });

  it('fetchFeeTemplates filters by fundId', async () => {
    const { fetchFeeTemplates } = await loadService();
    const templates = await fetchFeeTemplates('fund-2');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((template) => !template.fundId || template.fundId === 'fund-2')).toBe(true);
  });
});
