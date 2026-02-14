import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAuditEvents } from '@/data/mocks/blockchain/audit-trail';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('auditTrailService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized audit events in mock mode', async () => {
    const service = await import('@/services/blockchain/auditTrailService');
    await expect(service.getAuditEvents()).resolves.toEqual(mockAuditEvents);
  });

  it('falls back to cached mock events in API mode when request fails', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/blockchain/auditTrailService');
    const events = await service.getAuditEvents();

    expect(events).toEqual(mockAuditEvents);
  });

  it('maps API events when endpoint is available', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockResolvedValue([
      {
        id: 'api-audit-1',
        txHash: '0xabc123',
        blockNumber: 19000001,
        timestamp: '2026-01-10T12:00:00.000Z',
        eventType: 'capital_call',
        description: 'API capital call',
        parties: ['API Fund', 'API LP'],
        amount: 1000000,
        verificationStatus: 'verified',
        proofHash: '0xproof-api-1',
      },
    ]);

    const service = await import('@/services/blockchain/auditTrailService');
    const events = await service.getAuditEvents();

    expect(events[0].id).toBe('api-audit-1');
    expect(events[0].eventType).toBe('capital_call');
    expect(events[0].timestamp).toBeInstanceOf(Date);
  });
});
