import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTenantDetail,
  listTenants,
  onboardTenant,
  resendInvite,
  setTenantStatus,
  createTenantUser,
} from '@/services/internal/superadminService';
import {
  getTeamAccessSnapshot,
  inviteTeamMember,
  updateTeamMemberRole,
  updateTeamMemberStatus,
} from '@/services/internal/teamAccessService';
import { resetSuperadminMockState } from '@/data/mocks/internal/superadmin';

describe('internal superadmin services', () => {
  beforeEach(() => {
    resetSuperadminMockState();
    vi.useRealTimers();
  });

  it('onboards a tenant and creates first-admin invitation', () => {
    const detail = onboardTenant({
      displayName: 'Apex Ventures',
      legalName: 'Apex Ventures LLC',
      primaryDomain: 'apexventures.com',
      firstAdminName: 'Nina Carter',
      firstAdminEmail: 'nina@apexventures.com',
      firstAdminAppRole: 'gp',
    });

    expect(detail.tenant.displayName).toBe('Apex Ventures');
    expect(detail.invitations[0]?.email).toBe('nina@apexventures.com');
    expect(detail.invitations[0]?.targetOrgRole).toBe('org_admin');

    const tenants = listTenants();
    expect(tenants.some((tenant) => tenant.displayName === 'Apex Ventures')).toBe(true);
  });

  it('updates tenant lifecycle status', () => {
    const targetTenant = listTenants().find((tenant) => tenant.id === 'org_summit_vc');
    expect(targetTenant).toBeDefined();

    const suspended = setTenantStatus('org_summit_vc', 'suspended');
    expect(suspended.status).toBe('suspended');

    const reactivated = setTenantStatus('org_summit_vc', 'active');
    expect(reactivated.status).toBe('active');
  });

  it('creates tenant users in shared mode and rejects duplicates', () => {
    const created = createTenantUser({
      tenantId: 'org_summit_vc',
      name: 'Morgan Lee',
      email: 'morgan@summitvc.com',
      appRole: 'analyst',
      organizationRole: 'member',
    });

    expect(created.email).toBe('morgan@summitvc.com');

    expect(() =>
      createTenantUser({
        tenantId: 'org_summit_vc',
        name: 'Morgan Lee',
        email: 'morgan@summitvc.com',
        appRole: 'analyst',
        organizationRole: 'member',
      })
    ).toThrow('A user with this email already exists for the tenant');
  });

  it('resends pending invitations and refreshes expiry window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11T10:00:00.000Z'));

    const originalInvite = getTenantDetail('org_summit_vc').invitations.find(
      (invite) => invite.id === 'invite_summit_member_001'
    );

    expect(originalInvite).toBeDefined();

    vi.advanceTimersByTime(60 * 60 * 1000);
    const resent = resendInvite('invite_summit_member_001');

    expect(new Date(resent.lastSentAt).getTime()).toBeGreaterThan(
      new Date(originalInvite!.lastSentAt).getTime()
    );
    expect(resent.status).toBe('pending');
  });

  it('enforces last-admin guard for role demotion and disable', () => {
    const snapshot = getTeamAccessSnapshot('org_summit_vc', {
      userId: 'user_demo_gp_001',
      email: 'demo@vestledger.com',
    });

    const onlyAdmin = snapshot.members.find((member) => member.organizationRole === 'org_admin');
    expect(onlyAdmin).toBeDefined();

    expect(() =>
      updateTeamMemberRole({
        tenantId: 'org_summit_vc',
        userId: onlyAdmin!.id,
        organizationRole: 'member',
        actorUserId: 'user_demo_gp_001',
      })
    ).toThrow('Cannot remove or disable the last active org admin');

    expect(() =>
      updateTeamMemberStatus({
        tenantId: 'org_summit_vc',
        userId: onlyAdmin!.id,
        status: 'disabled',
        actorUserId: 'user_demo_gp_001',
      })
    ).toThrow('Cannot remove or disable the last active org admin');
  });

  it('restricts team invitations to org admins', () => {
    expect(() =>
      inviteTeamMember({
        tenantId: 'org_summit_vc',
        email: 'analyst2@summitvc.com',
        targetAppRole: 'analyst',
        targetOrgRole: 'member',
        invitedByUserId: 'user_summit_analyst_001',
      })
    ).toThrow('Only org admins can manage team access');

    const invite = inviteTeamMember({
      tenantId: 'org_summit_vc',
      email: 'analyst2@summitvc.com',
      targetAppRole: 'analyst',
      targetOrgRole: 'member',
      invitedByUserId: 'user_demo_gp_001',
    });

    expect(invite.status).toBe('pending');
  });
});
