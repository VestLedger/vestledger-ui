import { isMockMode } from '@/config/data-mode';
import {
  mockRoleOnboardingPlans,
  type RoleOnboardingPlan,
} from '@/data/mocks/onboarding/role-onboarding';
import { requestJson } from '@/services/shared/httpClient';
import type { UserRole } from '@/types/auth';
import { ROUTE_PATHS } from '@/config/routes';

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

function formatRoleLabel(role: UserRole): string {
  return role
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function buildEmptyPlan(role: UserRole): RoleOnboardingPlan {
  const roleLabel = formatRoleLabel(role);

  return {
    role,
    title: `${roleLabel} Onboarding`,
    description: `Onboarding guidance for the ${roleLabel.toLowerCase()} role is not available yet.`,
    steps: [],
  };
}

function mapApiPlan(role: UserRole, payload: ApiOnboardingPlan): RoleOnboardingPlan {
  const roleLabel = formatRoleLabel(role);
  return {
    role,
    title: payload.title ?? `${roleLabel} Onboarding`,
    description:
      payload.description
      ?? `Guided onboarding steps for the ${roleLabel.toLowerCase()} role.`,
    steps:
      payload.steps?.map((step, index) => ({
        id: step.id ?? `${role}-step-${index + 1}`,
        title: step.title ?? `Step ${index + 1}`,
        description: step.description ?? 'Complete this onboarding step.',
        route: step.route ?? ROUTE_PATHS.home,
        estimatedMinutes:
          typeof step.estimatedMinutes === 'number' && Number.isFinite(step.estimatedMinutes)
            ? step.estimatedMinutes
            : 5,
      })) ?? [],
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
    const fallback = roleOnboardingCache[role] ?? buildEmptyPlan(role);
    roleOnboardingCache[role] = fallback;
    return clone(fallback);
  }
}

export function clearRoleOnboardingCache(): void {
  roleOnboardingCache = {};
}
