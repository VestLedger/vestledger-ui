import { isMockMode } from '@/config/data-mode';
import {
  mockRoleOnboardingPlans,
  type RoleOnboardingPlan,
} from '@/data/mocks/onboarding/role-onboarding';
import { requestJson } from '@/services/shared/httpClient';
import type { UserRole } from '@/types/auth';

export type { RoleOnboardingPlan, RoleOnboardingStep } from '@/data/mocks/onboarding/role-onboarding';

type ApiOnboardingPlan = {
  role?: UserRole;
  title?: string;
  description?: string;
  steps?: Array<{
    id?: string;
    title?: string;
    description?: string;
    route?: string;
    estimatedMinutes?: number;
  }>;
};

const clone = <T>(value: T): T => structuredClone(value);

let roleOnboardingCache: Partial<Record<UserRole, RoleOnboardingPlan>> = {};

function mapApiPlan(role: UserRole, payload: ApiOnboardingPlan): RoleOnboardingPlan {
  const fallback = mockRoleOnboardingPlans[role];
  return {
    role,
    title: payload.title ?? fallback.title,
    description: payload.description ?? fallback.description,
    steps:
      payload.steps?.map((step, index) => ({
        id: step.id ?? `${role}-step-${index + 1}`,
        title: step.title ?? `Step ${index + 1}`,
        description: step.description ?? 'Complete this onboarding step.',
        route: step.route ?? fallback.steps[Math.min(index, fallback.steps.length - 1)]?.route ?? '/home',
        estimatedMinutes:
          typeof step.estimatedMinutes === 'number' && Number.isFinite(step.estimatedMinutes)
            ? step.estimatedMinutes
            : 5,
      })) ?? clone(fallback.steps),
  };
}

export async function getRoleOnboardingPlan(role: UserRole): Promise<RoleOnboardingPlan> {
  if (roleOnboardingCache[role]) {
    return clone(roleOnboardingCache[role] as RoleOnboardingPlan);
  }

  if (isMockMode('onboarding')) {
    const mockPlan = clone(mockRoleOnboardingPlans[role]);
    roleOnboardingCache[role] = mockPlan;
    return mockPlan;
  }

  try {
    const payload = await requestJson<ApiOnboardingPlan>(`/onboarding/roles/${role}`, {
      method: 'GET',
      fallbackMessage: 'Failed to fetch role onboarding plan',
    });
    const plan = mapApiPlan(role, payload);
    roleOnboardingCache[role] = plan;
    return clone(plan);
  } catch {
    const fallback = clone(mockRoleOnboardingPlans[role]);
    roleOnboardingCache[role] = fallback;
    return fallback;
  }
}

export function clearRoleOnboardingCache(): void {
  roleOnboardingCache = {};
}
