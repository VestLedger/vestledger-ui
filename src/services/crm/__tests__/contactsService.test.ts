import { beforeEach, describe, expect, it, vi } from 'vitest';

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('contactsService API mode', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  it('returns no CRM email accounts when the integrations API is unavailable', async () => {
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/crm/contactsService');
    const accounts = await service.getCRMEmailAccounts({});

    expect(accounts).toEqual([]);
  });

  it('rejects placeholder contact creation in live mode', async () => {
    const service = await import('@/services/crm/contactsService');

    await expect(service.createCRMContact()).rejects.toThrow(
      'Creating CRM contacts in live mode requires user-provided form input and an API implementation.',
    );
  });
});
