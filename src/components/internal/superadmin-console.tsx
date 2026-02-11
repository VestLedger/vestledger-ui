'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Mail, Plus, RefreshCw, UserPlus, Users } from 'lucide-react';
import { Badge, Button, Card, Input, Select } from '@/ui';
import type { AssignableAppRole, Invitation, OrganizationRole, TenantStatus } from '@/data/mocks/internal/superadmin';
import {
  buildInviteSetupLink,
  createTenantUser,
  getTenantDetail,
  listTenants,
  onboardTenant,
  resendInvite,
  setTenantStatus,
  type TenantSummary,
} from '@/services/internal/superadminService';
import { buildAppWebUrl } from '@/config/env';

const APP_ROLE_OPTIONS: Array<{ value: AssignableAppRole; label: string }> = [
  { value: 'gp', label: 'GP' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'ops', label: 'Operations' },
  { value: 'ir', label: 'Investor Relations' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'lp', label: 'LP' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
];

const ORG_ROLE_OPTIONS: Array<{ value: OrganizationRole; label: string }> = [
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'member', label: 'Member' },
];

type NoticeState = {
  type: 'success' | 'error';
  message: string;
} | null;

export function SuperadminConsole() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [detail, setDetail] = useState<ReturnType<typeof getTenantDetail> | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  const [tenantForm, setTenantForm] = useState({
    displayName: '',
    legalName: '',
    primaryDomain: '',
    firstAdminName: '',
    firstAdminEmail: '',
    firstAdminAppRole: 'gp' as AssignableAppRole,
  });

  const [userForm, setUserForm] = useState({
    tenantId: '',
    name: '',
    email: '',
    appRole: 'analyst' as AssignableAppRole,
    organizationRole: 'member' as OrganizationRole,
  });

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? null,
    [selectedTenantId, tenants]
  );

  const refresh = useCallback(
    (requestedTenantId?: string) => {
      const tenantList = listTenants();
      setTenants(tenantList);

      if (tenantList.length === 0) {
        setSelectedTenantId('');
        setDetail(null);
        return;
      }

      const resolvedTenantId =
        requestedTenantId && tenantList.some((tenant) => tenant.id === requestedTenantId)
          ? requestedTenantId
          : selectedTenantId && tenantList.some((tenant) => tenant.id === selectedTenantId)
            ? selectedTenantId
            : tenantList[0].id;

      setSelectedTenantId(resolvedTenantId);
      setDetail(getTenantDetail(resolvedTenantId));
      setUserForm((prev) => ({ ...prev, tenantId: resolvedTenantId }));
    },
    [selectedTenantId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showError = (error: unknown) => {
    setNotice({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unexpected error',
    });
  };

  const showSuccess = (message: string) => {
    setNotice({
      type: 'success',
      message,
    });
  };

  const handleOnboardTenant = () => {
    try {
      const result = onboardTenant({
        displayName: tenantForm.displayName,
        legalName: tenantForm.legalName,
        primaryDomain: tenantForm.primaryDomain,
        firstAdminName: tenantForm.firstAdminName,
        firstAdminEmail: tenantForm.firstAdminEmail,
        firstAdminAppRole: tenantForm.firstAdminAppRole,
      });

      setTenantForm({
        displayName: '',
        legalName: '',
        primaryDomain: '',
        firstAdminName: '',
        firstAdminEmail: '',
        firstAdminAppRole: 'gp',
      });

      refresh(result.tenant.id);
      showSuccess('Tenant onboarded and first-admin invitation created.');
    } catch (error) {
      showError(error);
    }
  };

  const handleToggleTenantStatus = (tenantId: string, status: TenantStatus) => {
    try {
      setTenantStatus(tenantId, status);
      refresh(tenantId);
      showSuccess(`Tenant ${status === 'active' ? 'reactivated' : 'suspended'}.`);
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateUser = () => {
    try {
      createTenantUser({
        tenantId: userForm.tenantId,
        name: userForm.name,
        email: userForm.email,
        appRole: userForm.appRole,
        organizationRole: userForm.organizationRole,
      });

      setUserForm((prev) => ({
        ...prev,
        name: '',
        email: '',
        appRole: 'analyst',
        organizationRole: 'member',
      }));

      refresh(userForm.tenantId);
      showSuccess('User created successfully.');
    } catch (error) {
      showError(error);
    }
  };

  const handleResendInvite = (inviteId: string) => {
    try {
      resendInvite(inviteId);
      refresh(selectedTenantId);
      showSuccess('Invitation resent.');
    } catch (error) {
      showError(error);
    }
  };

  const handleCopySetupLink = async (invitation: Invitation) => {
    try {
      const setupUrl = `${buildAppWebUrl(window.location.hostname)}${buildInviteSetupLink(invitation.id)}`;

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(setupUrl);
      }

      showSuccess('Setup link copied to clipboard.');
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <Card padding="sm" className={notice.type === 'error' ? 'border-[var(--app-danger)]' : 'border-[var(--app-success)]'}>
          <div className="flex items-start gap-3 text-sm">
            {notice.type === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 text-[var(--app-danger)]" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--app-success)]" />
            )}
            <span>{notice.message}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card padding="lg" className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tenant Lifecycle</h2>
              <p className="text-sm text-[var(--app-text-muted)]">
                Onboard, suspend, reactivate, and inspect tenant access state.
              </p>
            </div>
            <Button variant="bordered" startContent={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  tenant.id === selectedTenantId
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                    : 'border-[var(--app-border)] hover:bg-[var(--app-surface-hover)]'
                }`}
                onClick={() => refresh(tenant.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{tenant.displayName}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">{tenant.primaryDomain}</p>
                  </div>
                  <Badge color={tenant.status === 'active' ? 'success' : 'warning'}>
                    {tenant.status}
                  </Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                  <span>{tenant.totalUsers} users</span>
                  <span>{tenant.totalAdmins} admins</span>
                  <span>{tenant.pendingInvites} pending invites</span>
                </div>
                <div className="flex gap-2">
                  {tenant.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="bordered"
                      color="warning"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleTenantStatus(tenant.id, 'suspended');
                      }}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="bordered"
                      color="success"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleTenantStatus(tenant.id, 'active');
                      }}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="mb-1 text-lg font-semibold">Onboard Organization</h2>
          <p className="mb-4 text-sm text-[var(--app-text-muted)]">Create tenant and first-admin invite.</p>

          <div className="space-y-3">
            <Input
              label="Display Name"
              value={tenantForm.displayName}
              onChange={(event) => setTenantForm((prev) => ({ ...prev, displayName: event.target.value }))}
            />
            <Input
              label="Legal Name"
              value={tenantForm.legalName}
              onChange={(event) => setTenantForm((prev) => ({ ...prev, legalName: event.target.value }))}
            />
            <Input
              label="Primary Domain"
              value={tenantForm.primaryDomain}
              onChange={(event) => setTenantForm((prev) => ({ ...prev, primaryDomain: event.target.value }))}
            />
            <Input
              label="First Admin Name"
              value={tenantForm.firstAdminName}
              onChange={(event) => setTenantForm((prev) => ({ ...prev, firstAdminName: event.target.value }))}
            />
            <Input
              label="First Admin Email"
              value={tenantForm.firstAdminEmail}
              onChange={(event) => setTenantForm((prev) => ({ ...prev, firstAdminEmail: event.target.value }))}
            />
            <Select
              label="First Admin App Persona"
              options={APP_ROLE_OPTIONS}
              selectedKeys={[tenantForm.firstAdminAppRole]}
              onChange={(event) =>
                setTenantForm((prev) => ({
                  ...prev,
                  firstAdminAppRole: event.target.value as AssignableAppRole,
                }))
              }
            />
            <Button color="primary" className="w-full" startContent={<Plus className="h-4 w-4" />} onClick={handleOnboardTenant}>
              Onboard Tenant
            </Button>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedTenant?.displayName ?? 'Tenant'}: Users & Invites
            </h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Shared user creation mode. Role assignment remains org-admin owned.
            </p>
          </div>
          <Badge variant="bordered">{selectedTenantId}</Badge>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[var(--app-border)] p-4 lg:grid-cols-5">
          <Input
            label="User Name"
            value={userForm.name}
            onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Email"
            value={userForm.email}
            onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Select
            label="App Persona"
            options={APP_ROLE_OPTIONS}
            selectedKeys={[userForm.appRole]}
            onChange={(event) =>
              setUserForm((prev) => ({ ...prev, appRole: event.target.value as AssignableAppRole }))
            }
          />
          <Select
            label="Org Role"
            options={ORG_ROLE_OPTIONS}
            selectedKeys={[userForm.organizationRole]}
            onChange={(event) =>
              setUserForm((prev) => ({ ...prev, organizationRole: event.target.value as OrganizationRole }))
            }
          />
          <div className="flex items-end">
            <Button color="primary" className="w-full" startContent={<UserPlus className="h-4 w-4" />} onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Users</h3>
            </div>
            <div className="space-y-2">
              {(detail?.users ?? []).map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-[var(--app-border)] p-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="bordered">{user.appRole}</Badge>
                    <Badge color={user.status === 'active' ? 'success' : 'warning'}>{user.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Invitations</h3>
            </div>
            <div className="space-y-2">
              {(detail?.invitations ?? []).map((invite) => (
                <div key={invite.id} className="rounded-lg border border-[var(--app-border)] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{invite.email}</p>
                    <Badge color={invite.status === 'pending' ? 'warning' : 'primary'}>{invite.status}</Badge>
                  </div>
                  <p className="mb-3 text-xs text-[var(--app-text-muted)]">
                    Org role: {invite.targetOrgRole} · App role: {invite.targetAppRole}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<RefreshCw className="h-3.5 w-3.5" />}
                      onClick={() => handleResendInvite(invite.id)}
                      isDisabled={invite.status !== 'pending'}
                    >
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<Copy className="h-3.5 w-3.5" />}
                      onClick={() => void handleCopySetupLink(invite)}
                    >
                      Copy Setup Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
