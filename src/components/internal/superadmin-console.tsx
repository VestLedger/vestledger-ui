'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Plus,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, Checkbox, Input, Select } from '@/ui';
import {
  createTenantInvitation,
  getTenantDetail,
  listTenants,
  onboardTenant,
  resendInvitation,
  setTenantStatus,
  type AssignableAppRole,
  type Invitation,
  type TenantDetail,
  type TenantStatus,
  type TenantSummary,
} from '@/services/internal/superadminApiService';
import { TEAM_APP_ROLE_OPTIONS } from '@/config/settings-options';

type NoticeState = {
  type: 'success' | 'error';
  message: string;
} | null;

const EMPTY_TENANT_FORM = {
  displayName: '',
  legalName: '',
  primaryDomain: '',
  firstAdminName: '',
  firstAdminEmail: '',
  firstAdminAppRole: 'gp' as AssignableAppRole,
};

const EMPTY_INVITE_FORM = {
  name: '',
  email: '',
  appRole: 'analyst' as AssignableAppRole,
  isAdmin: false,
};

export function SuperadminConsole() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [tenantForm, setTenantForm] = useState(EMPTY_TENANT_FORM);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE_FORM);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? null,
    [selectedTenantId, tenants]
  );

  const showError = useCallback((error: unknown) => {
    setNotice({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unexpected error',
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setNotice({
      type: 'success',
      message,
    });
  }, []);

  const refresh = useCallback(
    async (requestedTenantId?: string) => {
      setIsRefreshing(true);

      try {
        const tenantList = await listTenants();
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
        setDetail(await getTenantDetail(resolvedTenantId));
      } catch (error) {
        showError(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [selectedTenantId, showError]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleOnboardTenant = async () => {
    setIsMutating(true);

    try {
      const result = await onboardTenant({
        displayName: tenantForm.displayName,
        legalName: tenantForm.legalName,
        primaryDomain: tenantForm.primaryDomain,
        firstAdminName: tenantForm.firstAdminName,
        firstAdminEmail: tenantForm.firstAdminEmail,
        firstAdminAppRole: tenantForm.firstAdminAppRole,
      });

      setTenantForm(EMPTY_TENANT_FORM);
      await refresh(result.tenant.id);
      showSuccess('Tenant onboarded and first-user invitation created.');
    } catch (error) {
      showError(error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleTenantStatus = async (
    tenantId: string,
    status: TenantStatus
  ) => {
    setIsMutating(true);

    try {
      await setTenantStatus(tenantId, status);
      await refresh(tenantId);
      showSuccess(`Tenant ${status === 'active' ? 'reactivated' : 'suspended'}.`);
    } catch (error) {
      showError(error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedTenantId) return;

    setIsMutating(true);

    try {
      await createTenantInvitation({
        tenantId: selectedTenantId,
        name: inviteForm.name,
        email: inviteForm.email,
        targetAppRole: inviteForm.appRole,
        targetIsAdmin: inviteForm.isAdmin,
      });

      setInviteForm(EMPTY_INVITE_FORM);
      await refresh(selectedTenantId);
      showSuccess('Invitation created successfully.');
    } catch (error) {
      showError(error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setIsMutating(true);

    try {
      await resendInvitation(inviteId);
      await refresh(selectedTenantId);
      showSuccess('Invitation resent.');
    } catch (error) {
      showError(error);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <Card
          padding="sm"
          className={
            notice.type === 'error'
              ? 'border-[var(--app-danger)]'
              : 'border-[var(--app-success)]'
          }
        >
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
            <Button
              variant="bordered"
              startContent={<RefreshCw className="h-4 w-4" />}
              onPress={() => {
                void refresh();
              }}
              isLoading={isRefreshing}
            >
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
                onClick={() => {
                  void refresh(tenant.id);
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{tenant.displayName}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      {tenant.primaryDomain}
                    </p>
                  </div>
                  <Badge color={tenant.status === 'active' ? 'success' : 'warning'}>
                    {tenant.status}
                  </Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                  <span>{tenant.totalUsers} users</span>
                  <span>{tenant.pendingInvites} pending invites</span>
                </div>
                <div className="flex gap-2">
                  {tenant.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="bordered"
                      color="warning"
                      onPress={() => {
                        void handleToggleTenantStatus(tenant.id, 'suspended');
                      }}
                      isLoading={isMutating}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="bordered"
                      color="success"
                      onPress={() => {
                        void handleToggleTenantStatus(tenant.id, 'active');
                      }}
                      isLoading={isMutating}
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
          <p className="mb-4 text-sm text-[var(--app-text-muted)]">
            Create a tenant and its first-user invitation. The first invited user
            is always an org admin.
          </p>

          <div className="space-y-3">
            <Input
              label="Display Name"
              value={tenantForm.displayName}
              onChange={(event) =>
                setTenantForm((prev) => ({ ...prev, displayName: event.target.value }))
              }
            />
            <Input
              label="Legal Name"
              value={tenantForm.legalName}
              onChange={(event) =>
                setTenantForm((prev) => ({ ...prev, legalName: event.target.value }))
              }
            />
            <Input
              label="Primary Domain"
              value={tenantForm.primaryDomain}
              onChange={(event) =>
                setTenantForm((prev) => ({ ...prev, primaryDomain: event.target.value }))
              }
            />
            <Input
              label="First User Name"
              value={tenantForm.firstAdminName}
              onChange={(event) =>
                setTenantForm((prev) => ({ ...prev, firstAdminName: event.target.value }))
              }
            />
            <Input
              label="First User Email"
              value={tenantForm.firstAdminEmail}
              onChange={(event) =>
                setTenantForm((prev) => ({ ...prev, firstAdminEmail: event.target.value }))
              }
            />
            <Select
              label="First User Role"
                  options={TEAM_APP_ROLE_OPTIONS}
              selectedKeys={[tenantForm.firstAdminAppRole]}
              onChange={(event) =>
                setTenantForm((prev) => ({
                  ...prev,
                  firstAdminAppRole: event.target.value as AssignableAppRole,
                }))
              }
            />
            <Button
              color="primary"
              className="w-full"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => {
                void handleOnboardTenant();
              }}
              isLoading={isMutating}
            >
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
              Invite users into the selected tenant with an app role and admin flag.
            </p>
          </div>
          <Badge variant="bordered">{selectedTenantId || 'No tenant selected'}</Badge>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[var(--app-border)] p-4 lg:grid-cols-5">
          <Input
            label="User Name"
            value={inviteForm.name}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <Input
            label="Email"
            value={inviteForm.email}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <Select
            label="Role"
                    options={TEAM_APP_ROLE_OPTIONS}
            selectedKeys={[inviteForm.appRole]}
            onChange={(event) =>
              setInviteForm((prev) => ({
                ...prev,
                appRole: event.target.value as AssignableAppRole,
              }))
            }
          />
          <div className="flex items-center rounded-lg border border-[var(--app-border)] px-3">
            <Checkbox
              isSelected={inviteForm.isAdmin}
              onValueChange={(value) =>
                setInviteForm((prev) => ({ ...prev, isAdmin: value }))
              }
            >
              Org Admin
            </Checkbox>
          </div>
          <div className="flex items-end lg:col-span-1">
            <Button
              color="primary"
              className="w-full"
              startContent={<UserPlus className="h-4 w-4" />}
              onPress={() => {
                void handleInviteUser();
              }}
              isDisabled={!selectedTenantId}
              isLoading={isMutating}
            >
              Invite User
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
              {(detail?.users ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--app-border)] p-3 text-sm text-[var(--app-text-muted)]">
                  No users have been activated for this tenant yet.
                </p>
              ) : (
                (detail?.users ?? []).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--app-border)] p-3"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="bordered">{user.appRole}</Badge>
                      <Badge variant="bordered">
                        {user.isAdmin ? 'Admin' : 'Member'}
                      </Badge>
                      <Badge color={user.status === 'active' ? 'success' : 'warning'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Invitations</h3>
            </div>
            <div className="space-y-2">
              {(detail?.invitations ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--app-border)] p-3 text-sm text-[var(--app-text-muted)]">
                  No invitations have been created for this tenant yet.
                </p>
              ) : (
                (detail?.invitations ?? []).map((invite: Invitation) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border border-[var(--app-border)] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {invite.inviteeName || invite.email}
                        </p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          {invite.email}
                        </p>
                      </div>
                      <Badge
                        color={invite.status === 'pending' ? 'warning' : 'primary'}
                      >
                        {invite.status}
                      </Badge>
                    </div>
                    <p className="mb-3 text-xs text-[var(--app-text-muted)]">
                      Role: {invite.targetAppRole} · {invite.targetIsAdmin ? 'Admin' : 'Member'}
                    </p>
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<RefreshCw className="h-3.5 w-3.5" />}
                      onPress={() => {
                        void handleResendInvite(invite.id);
                      }}
                      isDisabled={invite.status !== 'pending'}
                      isLoading={isMutating}
                    >
                      Resend
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
