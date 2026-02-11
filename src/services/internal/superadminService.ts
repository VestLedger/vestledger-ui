import {
  createMockId,
  mutateSuperadminMockState,
  readSuperadminMockState,
  type AssignableAppRole,
  type Invitation,
  type OrganizationRole,
  type Tenant,
  type TenantStatus,
  type TenantUser,
} from '@/data/mocks/internal/superadmin';
import { INTERNAL_TENANT_ID } from '@/utils/auth/internal-access';

export interface TenantSummary extends Tenant {
  totalUsers: number;
  totalAdmins: number;
  pendingInvites: number;
}

export interface TenantDetail {
  tenant: Tenant;
  users: TenantUser[];
  admins: TenantUser[];
  invitations: Invitation[];
}

export interface OnboardTenantInput {
  displayName: string;
  legalName: string;
  primaryDomain: string;
  firstAdminName: string;
  firstAdminEmail: string;
  firstAdminAppRole: AssignableAppRole;
}

export interface CreateTenantUserInput {
  tenantId: string;
  name: string;
  email: string;
  appRole: AssignableAppRole;
  organizationRole: OrganizationRole;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const INVITE_TTL_DAYS = 14;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const assertTenantExists = (tenantId: string): Tenant => {
  const state = readSuperadminMockState();
  const tenant = state.tenants.find((record) => record.id === tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  return tenant;
};

const getTenantAdmins = (tenantId: string): TenantUser[] => {
  const state = readSuperadminMockState();
  const adminMemberships = state.memberships.filter(
    (membership) =>
      membership.tenantId === tenantId && membership.organizationRole === 'org_admin'
  );

  return state.users.filter(
    (user) =>
      user.tenantId === tenantId &&
      user.status === 'active' &&
      adminMemberships.some((membership) => membership.userId === user.id)
  );
};

const computeExpiry = (timestamp: number) =>
  new Date(timestamp + INVITE_TTL_DAYS * DAY_IN_MS).toISOString();

export function listTenants(): TenantSummary[] {
  const state = readSuperadminMockState();

  return state.tenants.map((tenant) => {
    const tenantUsers = state.users.filter((user) => user.tenantId === tenant.id);
    const tenantMemberships = state.memberships.filter(
      (membership) => membership.tenantId === tenant.id
    );
    const tenantInvites = state.invitations.filter(
      (invitation) => invitation.tenantId === tenant.id
    );

    return {
      ...tenant,
      totalUsers: tenantUsers.length,
      totalAdmins: tenantMemberships.filter(
        (membership) => membership.organizationRole === 'org_admin'
      ).length,
      pendingInvites: tenantInvites.filter((invite) => invite.status === 'pending').length,
    };
  });
}

export function getTenantDetail(tenantId: string): TenantDetail {
  const tenant = assertTenantExists(tenantId);
  const state = readSuperadminMockState();
  const users = state.users.filter((user) => user.tenantId === tenantId);
  const invitations = state.invitations.filter(
    (invitation) => invitation.tenantId === tenantId
  );
  const admins = getTenantAdmins(tenantId);

  return {
    tenant,
    users,
    admins,
    invitations,
  };
}

export function onboardTenant(input: OnboardTenantInput): TenantDetail {
  const now = Date.now();
  const tenantId = createMockId('org');
  const inviteId = createMockId('invite');
  const normalizedEmail = normalizeEmail(input.firstAdminEmail);

  mutateSuperadminMockState((state) => {
    state.tenants.unshift({
      id: tenantId,
      displayName: input.displayName.trim(),
      legalName: input.legalName.trim(),
      primaryDomain: input.primaryDomain.trim().toLowerCase(),
      status: 'active',
      createdAt: new Date(now).toISOString(),
    });

    state.invitations.unshift({
      id: inviteId,
      tenantId,
      email: normalizedEmail,
      targetOrgRole: 'org_admin',
      targetAppRole: input.firstAdminAppRole,
      status: 'pending',
      expiresAt: computeExpiry(now),
      createdAt: new Date(now).toISOString(),
      lastSentAt: new Date(now).toISOString(),
      invitedByUserId: 'user_superadmin_001',
    });
  });

  return getTenantDetail(tenantId);
}

export function setTenantStatus(tenantId: string, status: TenantStatus): Tenant {
  mutateSuperadminMockState((state) => {
    const tenant = state.tenants.find((record) => record.id === tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    tenant.status = status;
  });

  return assertTenantExists(tenantId);
}

export function createTenantUser(input: CreateTenantUserInput): TenantUser {
  assertTenantExists(input.tenantId);
  const normalizedEmail = normalizeEmail(input.email);

  let createdUserId = '';

  mutateSuperadminMockState((state) => {
    const existingUser = state.users.find(
      (user) =>
        user.tenantId === input.tenantId && normalizeEmail(user.email) === normalizedEmail
    );

    if (existingUser) {
      throw new Error('A user with this email already exists for the tenant');
    }

    createdUserId = createMockId('user');

    state.users.unshift({
      id: createdUserId,
      tenantId: input.tenantId,
      name: input.name.trim(),
      email: normalizedEmail,
      appRole: input.appRole,
      status: 'active',
    });

    state.memberships.unshift({
      tenantId: input.tenantId,
      userId: createdUserId,
      organizationRole: input.organizationRole,
    });
  });

  const state = readSuperadminMockState();
  const createdUser = state.users.find((user) => user.id === createdUserId);

  if (!createdUser) {
    throw new Error('Failed to create user');
  }

  return createdUser;
}

export function resendInvite(inviteId: string): Invitation {
  let updatedInvite: Invitation | null = null;

  mutateSuperadminMockState((state) => {
    const invite = state.invitations.find((record) => record.id === inviteId);

    if (!invite) {
      throw new Error('Invitation not found');
    }

    if (invite.status !== 'pending') {
      throw new Error('Only pending invitations can be resent');
    }

    const now = Date.now();
    invite.lastSentAt = new Date(now).toISOString();
    invite.expiresAt = computeExpiry(now);
    updatedInvite = { ...invite };
  });

  if (!updatedInvite) {
    throw new Error('Failed to resend invitation');
  }

  return updatedInvite;
}

export function buildInviteSetupLink(inviteId: string): string {
  return `/setup/${inviteId}`;
}

export function getInternalTenantId(): string {
  return INTERNAL_TENANT_ID;
}
