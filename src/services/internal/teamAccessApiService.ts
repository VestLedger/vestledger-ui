import { isMockMode } from '@/config/data-mode';
import { requestJson } from '@/services/shared/httpClient';
import type { UserRole } from '@/types/auth';

export type AssignableAppRole = Exclude<UserRole, 'superadmin'>;
export type TeamUserStatus = 'active' | 'disabled';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AssignableAppRole;
  isAdmin: boolean;
  status: TeamUserStatus;
}

export interface TeamInvitation {
  id: string;
  inviteeName?: string | null;
  email: string;
  targetAppRole: AssignableAppRole;
  targetIsAdmin: boolean;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  lastSentAt: string;
}

export interface TeamAccessSnapshot {
  members: TeamMember[];
  invitations: TeamInvitation[];
}

export interface CreateTeamInvitationInput {
  name?: string;
  email: string;
  targetAppRole: AssignableAppRole;
  targetIsAdmin: boolean;
}

export interface UpdateTeamMemberInput {
  userId: string;
  role?: AssignableAppRole;
  isAdmin?: boolean;
  status?: TeamUserStatus;
}

function assertApiMode() {
  if (isMockMode()) {
    throw new Error('Team access is unavailable in demo mode.');
  }
}

export async function getTeamAccessSnapshot(): Promise<TeamAccessSnapshot> {
  assertApiMode();
  return requestJson<TeamAccessSnapshot>('/orgs/current/team', {
    fallbackMessage: 'Failed to load team access data',
  });
}

export async function inviteTeamMember(
  input: CreateTeamInvitationInput,
): Promise<TeamInvitation> {
  assertApiMode();
  return requestJson<TeamInvitation>('/orgs/current/team/invitations', {
    method: 'POST',
    body: input,
    fallbackMessage: 'Failed to invite team member',
  });
}

export async function resendTeamInvite(inviteId: string): Promise<TeamInvitation> {
  assertApiMode();
  return requestJson<TeamInvitation>(
    `/orgs/current/team/invitations/${inviteId}/resend`,
    {
      method: 'POST',
      fallbackMessage: 'Failed to resend invitation',
    },
  );
}

export async function updateTeamMember(
  input: UpdateTeamMemberInput,
): Promise<TeamMember> {
  assertApiMode();
  return requestJson<TeamMember>(`/orgs/current/team/users/${input.userId}`, {
    method: 'PATCH',
    body: {
      role: input.role,
      isAdmin: input.isAdmin,
      status: input.status,
    },
    fallbackMessage: 'Failed to update team member',
  });
}
