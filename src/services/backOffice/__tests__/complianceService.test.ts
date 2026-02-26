import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockAuditSchedule,
  mockComplianceItems,
  mockRegulatoryFilings,
} from '@/data/mocks/back-office/compliance';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('complianceService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized mock data in mock mode', async () => {
    const service = await import('@/services/backOffice/complianceService');

    await expect(service.getComplianceItems()).resolves.toEqual(mockComplianceItems);
    await expect(service.getRegulatoryFilings()).resolves.toEqual(mockRegulatoryFilings);
    await expect(service.getAuditSchedule()).resolves.toEqual(mockAuditSchedule);
  });

  it('falls back to cached mock data in API mode when requests fail', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/backOffice/complianceService');

    const items = await service.getComplianceItems();
    const filings = await service.getRegulatoryFilings();
    const schedule = await service.getAuditSchedule();

    expect(items).toEqual(mockComplianceItems);
    expect(filings).toEqual(mockRegulatoryFilings);
    expect(schedule).toEqual(mockAuditSchedule);
  });

  it('maps API payloads when endpoints are available', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockImplementation(async (path: string) => {
      if (path === '/compliance/items') {
        return [
          {
            id: 'api-compliance-1',
            title: 'API Filing',
            type: 'filing',
            dueDate: '2026-03-15',
            status: 'upcoming',
            priority: 'high',
            assignedTo: 'API Team',
            description: 'Loaded from API',
            fundName: 'Fund API',
          },
        ];
      }

      if (path === '/compliance/filings') {
        return [
          {
            id: 'api-filing-1',
            filingType: 'Form ADV',
            regulator: 'SEC',
            frequency: 'Annual',
            lastFiled: '2025-03-20',
            nextDue: '2026-03-20',
            status: 'current',
            fundName: 'Fund API',
          },
        ];
      }

      if (path === '/compliance/audits') {
        return [
          {
            id: 'api-audit-1',
            auditType: 'Financial Audit',
            auditor: 'Audit Firm',
            year: 2025,
            startDate: '2025-12-01',
            completionDate: null,
            status: 'scheduled',
            fundName: 'Fund API',
          },
        ];
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const service = await import('@/services/backOffice/complianceService');

    const items = await service.getComplianceItems();
    const filings = await service.getRegulatoryFilings();
    const schedule = await service.getAuditSchedule();

    expect(items[0].id).toBe('api-compliance-1');
    expect(filings[0].id).toBe('api-filing-1');
    expect(schedule[0].id).toBe('api-audit-1');
  });
});
