import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockRoleOnboardingPlans } from '@/data/mocks/onboarding/role-onboarding';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('roleOnboardingService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized role onboarding plan in mock mode', async () => {
    const service = await import('@/services/onboarding/roleOnboardingService');
    const plan = await service.getRoleOnboardingPlan('gp');
    expect(plan).toEqual(mockRoleOnboardingPlans.gp);
  });

  it('falls back to mock plan in API mode when endpoint fails', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/onboarding/roleOnboardingService');
    const plan = await service.getRoleOnboardingPlan('ops');
    expect(plan.role).toBe('ops');
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it('maps API payload when endpoint is available', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockResolvedValue({
      title: 'API onboarding plan',
      description: 'Fetched from API',
      steps: [
        {
          id: 'api-step-1',
          title: 'API step',
          description: 'From backend',
          route: '/home',
          estimatedMinutes: 3,
        },
      ],
    });

    const service = await import('@/services/onboarding/roleOnboardingService');
    const plan = await service.getRoleOnboardingPlan('analyst');
    expect(plan.title).toBe('API onboarding plan');
    expect(plan.steps[0].id).toBe('api-step-1');
  });
});
