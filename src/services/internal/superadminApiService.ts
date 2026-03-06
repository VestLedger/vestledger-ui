import { requestJson } from '@/services/shared/httpClient';
import type { UserRole } from '@/types/auth';

export type AssignableAppRole = Exclude<UserRole, 'superadmin'>;
export type TenantStatus = 'active' | 'suspended';
export type TenantUserStatus = 'active' | 'disabled';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

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
  isAdmin: boolean;
  status: TenantUserStatus;
}

export interface Invitation {
  id: string;
  tenantId: string;
  inviteeName?: string | null;
  email: string;
  targetAppRole: AssignableAppRole;
  targetIsAdmin: boolean;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  lastSentAt: string;
  invitedByUserId?: string | null;
}

export interface TenantSummary extends Tenant {
  totalUsers: number;
  pendingInvites: number;
}

export interface TenantDetail {
  tenant: Tenant;
  users: TenantUser[];
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

export interface CreateTenantInvitationInput {
  tenantId: string;
  name: string;
  email: string;
  targetAppRole: AssignableAppRole;
  targetIsAdmin: boolean;
}

export async function listTenants(): Promise<TenantSummary[]> {
  return requestJson<TenantSummary[]>('/superadmin/tenants', {
    fallbackMessage: 'Failed to fetch tenants',
  });
}

export async function getTenantDetail(tenantId: string): Promise<TenantDetail> {
  return requestJson<TenantDetail>(`/superadmin/tenants/${tenantId}`, {
    fallbackMessage: 'Failed to fetch tenant detail',
  });
}

export async function onboardTenant(input: OnboardTenantInput): Promise<TenantDetail> {
  return requestJson<TenantDetail>('/superadmin/tenants', {
    method: 'POST',
    body: input,
    fallbackMessage: 'Failed to onboard tenant',
  });
}

export async function setTenantStatus(
  tenantId: string,
  status: TenantStatus
): Promise<Tenant> {
  return requestJson<Tenant>(`/superadmin/tenants/${tenantId}/status`, {
    method: 'PATCH',
    body: { status },
    fallbackMessage: 'Failed to update tenant status',
  });
}

export async function createTenantInvitation(
  input: CreateTenantInvitationInput
): Promise<Invitation> {
  return requestJson<Invitation>(`/superadmin/tenants/${input.tenantId}/invitations`, {
    method: 'POST',
    body: {
      name: input.name,
      email: input.email,
      targetAppRole: input.targetAppRole,
      targetIsAdmin: input.targetIsAdmin,
    },
    fallbackMessage: 'Failed to invite user',
  });
}

export async function resendInvitation(inviteId: string): Promise<Invitation> {
  return requestJson<Invitation>(`/superadmin/invitations/${inviteId}/resend`, {
    method: 'POST',
    fallbackMessage: 'Failed to resend invitation',
  });
}
