import { isMockMode } from '@/config/data-mode';
import { getDefaultFundRegulatoryRegime } from '@/lib/regulatory-regions';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { requestJson } from '@/services/shared/httpClient';
import type { User } from '@/types/auth';
import type {
  FundRegulatoryRegime,
  OperatingRegion,
} from '@/types/regulatory';

const STORAGE_USER_KEY = 'user';

export interface OrgSettings {
  orgId: string;
  slug: string;
  operatingRegion: OperatingRegion | null;
  organizationConfigured: boolean;
  defaultRegulatoryRegime: FundRegulatoryRegime | null;
}

function buildOrgSlug(orgId?: string): string {
  if (!orgId) {
    return 'mock-org';
  }

  return orgId
    .replace(/^org[_-]?/i, '')
    .replace(/_/g, '-')
    .toLowerCase();
}

function buildMockOrgSettings(
  user: User | null,
  regionOverride?: OperatingRegion | null
): OrgSettings {
  const operatingRegion = regionOverride ?? user?.operatingRegion ?? null;
  const organizationConfigured =
    operatingRegion !== null
      ? true
      : (user?.organizationConfigured ?? false);
  const orgId = user?.tenantId ?? 'org_mock_demo';

  return {
    orgId,
    slug: buildOrgSlug(orgId),
    operatingRegion,
    organizationConfigured,
    defaultRegulatoryRegime: getDefaultFundRegulatoryRegime(operatingRegion),
  };
}

export async function getCurrentOrgSettings(): Promise<OrgSettings> {
  if (isMockMode()) {
    const user = safeLocalStorage.getJSON<User>(STORAGE_USER_KEY);
    return buildMockOrgSettings(user);
  }

  return requestJson<OrgSettings>('/orgs/current/settings', {
    fallbackMessage: 'Failed to load organization settings',
  });
}

export async function updateCurrentOrgSettings(input: {
  operatingRegion: OperatingRegion;
}): Promise<OrgSettings> {
  if (isMockMode()) {
    const currentUser = safeLocalStorage.getJSON<User>(STORAGE_USER_KEY);
    const nextUser = currentUser
      ? {
          ...currentUser,
          operatingRegion: input.operatingRegion,
          organizationConfigured: true,
        }
      : null;

    if (nextUser) {
      safeLocalStorage.setJSON(STORAGE_USER_KEY, nextUser);
    }

    return buildMockOrgSettings(nextUser, input.operatingRegion);
  }

  return requestJson<OrgSettings>('/orgs/current/settings', {
    method: 'PATCH',
    body: input,
    fallbackMessage: 'Failed to update organization settings',
  });
}
