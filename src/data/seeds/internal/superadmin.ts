import type { UserRole } from '@/types/auth';
import { INTERNAL_TENANT_ID } from '@/utils/auth/internal-access';

export type OrganizationRole = 'org_admin' | 'member';
export type TenantStatus = 'active' | 'suspended';
export type TenantUserStatus = 'active' | 'disabled';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type AssignableAppRole = Exclude<UserRole, 'superadmin'>;

export interface Tenant {
  id: string;
  displayName: string;
  legalName: string;
  primaryDomain: string;
  status: TenantStatus;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  appRole: AssignableAppRole;
  status: TenantUserStatus;
}

export interface Membership {
  tenantId: string;
  userId: string;
  organizationRole: OrganizationRole;
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  targetOrgRole: OrganizationRole;
  targetAppRole: AssignableAppRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  lastSentAt: string;
  invitedByUserId?: string;
}

export interface SuperadminMockState {
  tenants: Tenant[];
  users: TenantUser[];
  memberships: Membership[];
  invitations: Invitation[];
}

const SEED_STATE: SuperadminMockState = {
  tenants: [
    {
      id: INTERNAL_TENANT_ID,
      displayName: 'VestLedger Internal',
      legalName: 'VestLedger Inc.',
      primaryDomain: 'vestledger.com',
      status: 'active',
      createdAt: '2025-10-01T09:00:00.000Z',
    },
    {
      id: 'org_summit_vc',
      displayName: 'Summit VC',
      legalName: 'Summit Ventures Management LLC',
      primaryDomain: 'summitvc.com',
      status: 'active',
      createdAt: '2025-11-12T10:30:00.000Z',
    },
    {
      id: 'org_orbit_growth',
      displayName: 'Orbit Growth Partners',
      legalName: 'Orbit Growth Partners LP',
      primaryDomain: 'orbitgrowth.com',
      status: 'active',
      createdAt: '2025-12-09T13:20:00.000Z',
    },
    {
      id: 'org_northstar_capital',
      displayName: 'Northstar Capital',
      legalName: 'Northstar Capital Advisors LLC',
      primaryDomain: 'northstarcapital.com',
      status: 'suspended',
      createdAt: '2026-01-06T16:45:00.000Z',
    },
  ],
  users: [
    {
      id: 'user_superadmin_001',
      tenantId: INTERNAL_TENANT_ID,
      name: 'Platform Superadmin',
      email: 'superadmin@vestledger.com',
      appRole: 'ops',
      status: 'active',
    },
    {
      id: 'user_demo_gp_001',
      tenantId: 'org_summit_vc',
      name: 'Alex Morgan',
      email: 'demo@vestledger.com',
      appRole: 'gp',
      status: 'active',
    },
    {
      id: 'user_summit_analyst_001',
      tenantId: 'org_summit_vc',
      name: 'Jamie Chen',
      email: 'jamie@summitvc.com',
      appRole: 'analyst',
      status: 'active',
    },
    {
      id: 'user_orbit_ops_001',
      tenantId: 'org_orbit_growth',
      name: 'Taylor Brooks',
      email: 'taylor@orbitgrowth.com',
      appRole: 'ops',
      status: 'active',
    },
  ],
  memberships: [
    {
      tenantId: INTERNAL_TENANT_ID,
      userId: 'user_superadmin_001',
      organizationRole: 'org_admin',
    },
    {
      tenantId: 'org_summit_vc',
      userId: 'user_demo_gp_001',
      organizationRole: 'org_admin',
    },
    {
      tenantId: 'org_summit_vc',
      userId: 'user_summit_analyst_001',
      organizationRole: 'member',
    },
    {
      tenantId: 'org_orbit_growth',
      userId: 'user_orbit_ops_001',
      organizationRole: 'org_admin',
    },
  ],
  invitations: [
    {
      id: 'invite_orbit_first_admin_001',
      tenantId: 'org_orbit_growth',
      email: 'founder@orbitgrowth.com',
      targetOrgRole: 'org_admin',
      targetAppRole: 'gp',
      status: 'pending',
      expiresAt: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-02-02T09:00:00.000Z',
      lastSentAt: '2026-02-02T09:00:00.000Z',
      invitedByUserId: 'user_superadmin_001',
    },
    {
      id: 'invite_northstar_first_admin_001',
      tenantId: 'org_northstar_capital',
      email: 'opslead@northstarcapital.com',
      targetOrgRole: 'org_admin',
      targetAppRole: 'ops',
      status: 'accepted',
      expiresAt: '2026-01-20T00:00:00.000Z',
      createdAt: '2026-01-08T11:15:00.000Z',
      lastSentAt: '2026-01-08T11:15:00.000Z',
      invitedByUserId: 'user_superadmin_001',
    },
    {
      id: 'invite_summit_member_001',
      tenantId: 'org_summit_vc',
      email: 'newhire@summitvc.com',
      targetOrgRole: 'member',
      targetAppRole: 'analyst',
      status: 'pending',
      expiresAt: '2026-02-21T00:00:00.000Z',
      createdAt: '2026-02-07T14:00:00.000Z',
      lastSentAt: '2026-02-07T14:00:00.000Z',
      invitedByUserId: 'user_demo_gp_001',
    },
  ],
};

let idSequence = 1000;
let inMemoryState: SuperadminMockState = cloneState(SEED_STATE);

function cloneState(state: SuperadminMockState): SuperadminMockState {
  return {
    tenants: state.tenants.map((tenant) => ({ ...tenant })),
    users: state.users.map((user) => ({ ...user })),
    memberships: state.memberships.map((membership) => ({ ...membership })),
    invitations: state.invitations.map((invitation) => ({ ...invitation })),
  };
}

export function readSuperadminMockState(): SuperadminMockState {
  return cloneState(inMemoryState);
}

export function writeSuperadminMockState(nextState: SuperadminMockState): SuperadminMockState {
  inMemoryState = cloneState(nextState);
  return readSuperadminMockState();
}

export function mutateSuperadminMockState<T>(mutate: (draft: SuperadminMockState) => T): T {
  const nextState = cloneState(inMemoryState);
  const result = mutate(nextState);
  inMemoryState = nextState;
  return result;
}

export function createMockId(prefix: string): string {
  idSequence += 1;
  return `${prefix}_${idSequence}`;
}

export function resetSuperadminMockState(): void {
  idSequence = 1000;
  inMemoryState = cloneState(SEED_STATE);
}
