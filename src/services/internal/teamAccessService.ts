import type { User } from '@/types/auth';
import {
  createMockId,
  mutateSuperadminMockState,
  readSuperadminMockState,
  type AssignableAppRole,
  type Invitation,
  type OrganizationRole,
  type Tenant,
  type TenantUser,
  type TenantUserStatus,
} from '@/data/mocks/internal/superadmin';
import { INTERNAL_TENANT_ID } from '@/utils/auth/internal-access';
import { createTenantUser, resendInvite } from '@/services/internal/superadminService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const INVITE_TTL_DAYS = 14;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface TeamMember extends TenantUser {
  organizationRole: OrganizationRole;
  isLastOrgAdmin: boolean;
}

export interface TeamAccessSnapshot {
  tenant: Tenant | null;
  members: TeamMember[];
  invitations: Invitation[];
  canManageTeam: boolean;
  actorUserId: string | null;
}

export interface InviteTeamMemberInput {
  tenantId: string;
  email: string;
  targetAppRole: AssignableAppRole;
  targetOrgRole: OrganizationRole;
  invitedByUserId?: string;
}

export interface UpdateTeamRoleInput {
  tenantId: string;
  userId: string;
  organizationRole: OrganizationRole;
  actorUserId?: string;
}

export interface UpdateTeamUserStatusInput {
  tenantId: string;
  userId: string;
  status: TenantUserStatus;
  actorUserId?: string;
}

const getActiveAdminUserIds = (tenantId: string): string[] => {
  const state = readSuperadminMockState();

  return state.memberships
    .filter(
      (membership) =>
        membership.tenantId === tenantId && membership.organizationRole === 'org_admin'
    )
    .map((membership) => membership.userId)
    .filter((userId) => {
      const user = state.users.find((candidate) => candidate.id === userId);
      return user?.status === 'active';
    });
};

const resolveActorUserId = (
  tenantId: string,
  actorUserId?: string,
  actorEmail?: string
): string | null => {
  if (actorUserId) {
    return actorUserId;
  }

  if (!actorEmail) {
    return null;
  }

  const state = readSuperadminMockState();
  const normalizedEmail = normalizeEmail(actorEmail);
  const actor = state.users.find(
    (user) => user.tenantId === tenantId && normalizeEmail(user.email) === normalizedEmail
  );

  return actor?.id ?? null;
};

const isOrgAdmin = (tenantId: string, userId: string | null): boolean => {
  if (!userId) {
    return false;
  }

  const state = readSuperadminMockState();
  return state.memberships.some(
    (membership) =>
      membership.tenantId === tenantId &&
      membership.userId === userId &&
      membership.organizationRole === 'org_admin'
  );
};

const assertActorCanManageTeam = (tenantId: string, actorUserId?: string): void => {
  if (!isOrgAdmin(tenantId, actorUserId ?? null)) {
    throw new Error('Only org admins can manage team access');
  }
};

const assertNotLastAdminMutation = (tenantId: string, userId: string): void => {
  const state = readSuperadminMockState();
  const membership = state.memberships.find(
    (entry) => entry.tenantId === tenantId && entry.userId === userId
  );

  if (membership?.organizationRole !== 'org_admin') {
    return;
  }

  const activeAdminIds = getActiveAdminUserIds(tenantId);
  if (activeAdminIds.length <= 1 && activeAdminIds.includes(userId)) {
    throw new Error('Cannot remove or disable the last active org admin');
  }
};

const buildTeamMembers = (tenantId: string): TeamMember[] => {
  const state = readSuperadminMockState();
  const activeAdminIds = getActiveAdminUserIds(tenantId);

  return state.users
    .filter((user) => user.tenantId === tenantId)
    .map((user) => {
      const membership = state.memberships.find(
        (entry) => entry.tenantId === tenantId && entry.userId === user.id
      );

      const organizationRole = membership?.organizationRole ?? 'member';

      return {
        ...user,
        organizationRole,
        isLastOrgAdmin:
          organizationRole === 'org_admin' &&
          user.status === 'active' &&
          activeAdminIds.length === 1 &&
          activeAdminIds.includes(user.id),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};

export function resolveTenantIdForUser(user: Partial<User> | null | undefined): string | null {
  if (!user) {
    return null;
  }

  if (user.tenantId) {
    return user.tenantId;
  }

  const normalizedEmail = user.email ? normalizeEmail(user.email) : null;
  if (!normalizedEmail) {
    return null;
  }

  const state = readSuperadminMockState();
  return state.users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail)?.tenantId ?? null;
}

export function getTeamAccessSnapshot(
  tenantId: string,
  actor: { userId?: string; email?: string }
): TeamAccessSnapshot {
  const state = readSuperadminMockState();
  const tenant = state.tenants.find((record) => record.id === tenantId) ?? null;
  const actorUserId = resolveActorUserId(tenantId, actor.userId, actor.email);

  return {
    tenant,
    members: buildTeamMembers(tenantId),
    invitations: state.invitations
      .filter((invitation) => invitation.tenantId === tenantId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    canManageTeam: isOrgAdmin(tenantId, actorUserId),
    actorUserId,
  };
}

export function createTeamUser(
  input: {
    tenantId: string;
    name: string;
    email: string;
    appRole: AssignableAppRole;
    organizationRole: OrganizationRole;
    actorUserId?: string;
  }
): TeamMember {
  assertActorCanManageTeam(input.tenantId, input.actorUserId);

  const created = createTenantUser({
    tenantId: input.tenantId,
    name: input.name,
    email: input.email,
    appRole: input.appRole,
    organizationRole: input.organizationRole,
  });

  const members = buildTeamMembers(input.tenantId);
  const resolvedMember = members.find((member) => member.id === created.id);

  if (!resolvedMember) {
    throw new Error('Failed to create team member');
  }

  return resolvedMember;
}

export function inviteTeamMember(input: InviteTeamMemberInput): Invitation {
  assertActorCanManageTeam(input.tenantId, input.invitedByUserId);

  const now = Date.now();
  const normalizedEmail = normalizeEmail(input.email);
  let invitationId = '';

  mutateSuperadminMockState((state) => {
    const userExists = state.users.some(
      (user) =>
        user.tenantId === input.tenantId &&
        normalizeEmail(user.email) === normalizedEmail
    );

    if (userExists) {
      throw new Error('A user with this email already exists');
    }

    invitationId = createMockId('invite');

    state.invitations.unshift({
      id: invitationId,
      tenantId: input.tenantId,
      email: normalizedEmail,
      targetOrgRole: input.targetOrgRole,
      targetAppRole: input.targetAppRole,
      status: 'pending',
      createdAt: new Date(now).toISOString(),
      lastSentAt: new Date(now).toISOString(),
      expiresAt: new Date(now + INVITE_TTL_DAYS * DAY_IN_MS).toISOString(),
      invitedByUserId: input.invitedByUserId,
    });
  });

  const state = readSuperadminMockState();
  const invitation = state.invitations.find((record) => record.id === invitationId);

  if (!invitation) {
    throw new Error('Failed to create invitation');
  }

  return invitation;
}

export function resendTeamInvite(
  tenantId: string,
  inviteId: string,
  actorUserId?: string
): Invitation {
  assertActorCanManageTeam(tenantId, actorUserId);

  const invitation = readSuperadminMockState().invitations.find(
    (record) => record.id === inviteId && record.tenantId === tenantId
  );

  if (!invitation) {
    throw new Error('Invitation not found');
  }

  return resendInvite(inviteId);
}

export function updateTeamMemberRole(input: UpdateTeamRoleInput): TeamMember {
  assertActorCanManageTeam(input.tenantId, input.actorUserId);

  if (input.organizationRole === 'member') {
    assertNotLastAdminMutation(input.tenantId, input.userId);
  }

  mutateSuperadminMockState((state) => {
    const user = state.users.find(
      (candidate) =>
        candidate.id === input.userId && candidate.tenantId === input.tenantId
    );

    if (!user) {
      throw new Error('Team member not found');
    }

    const membership = state.memberships.find(
      (entry) => entry.tenantId === input.tenantId && entry.userId === input.userId
    );

    if (membership) {
      membership.organizationRole = input.organizationRole;
      return;
    }

    state.memberships.push({
      tenantId: input.tenantId,
      userId: input.userId,
      organizationRole: input.organizationRole,
    });
  });

  const members = buildTeamMembers(input.tenantId);
  const resolved = members.find((member) => member.id === input.userId);

  if (!resolved) {
    throw new Error('Updated team member not found');
  }

  return resolved;
}

export function updateTeamMemberStatus(input: UpdateTeamUserStatusInput): TeamMember {
  assertActorCanManageTeam(input.tenantId, input.actorUserId);

  if (input.status === 'disabled') {
    assertNotLastAdminMutation(input.tenantId, input.userId);
  }

  mutateSuperadminMockState((state) => {
    const user = state.users.find(
      (candidate) =>
        candidate.id === input.userId && candidate.tenantId === input.tenantId
    );

    if (!user) {
      throw new Error('Team member not found');
    }

    user.status = input.status;
  });

  const members = buildTeamMembers(input.tenantId);
  const resolved = members.find((member) => member.id === input.userId);

  if (!resolved) {
    throw new Error('Updated team member not found');
  }

  return resolved;
}

export function isInternalTenant(tenantId: string): boolean {
  return tenantId === INTERNAL_TENANT_ID;
}
