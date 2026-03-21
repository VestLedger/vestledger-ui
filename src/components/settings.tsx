'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUIKey } from '@/store/ui';
import { Card, Button, Input, Badge, Checkbox, Select, RadioGroup, useToast } from '@/ui';
import type { PageHeaderBadge } from '@/ui';
import { UI_STATE_KEYS, UI_STATE_DEFAULTS } from '@/store/constants/uiStateKeys';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Settings as SettingsIcon,
  Plus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageScaffold, SectionHeader, StatusBadge } from '@/ui/composites';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/contexts/auth-context';
import { useAppDispatch } from '@/store/hooks';
import { authUserUpdated } from '@/store/slices/authSlice';
import {
  OPERATING_REGION_OPTIONS,
  getDefaultFundRegulatoryRegime,
  getFundRegimeLabel,
  getOperatingRegionLabel,
} from '@/lib/regulatory-regions';
import { updateCurrentOrgSettings } from '@/services/orgSettingsService';
import {
  getTeamAccessSnapshot,
  inviteTeamMember,
  resendTeamInvite,
  updateTeamMember,
  type AssignableAppRole,
  type TeamAccessSnapshot,
  type TeamMember,
} from '@/services/internal/teamAccessApiService';
import type { OperatingRegion } from '@/types/regulatory';
import { persistAuthenticatedUser } from '@/utils/auth/persist-authenticated-user';
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TEAM_APP_ROLE_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/config/settings-options';

interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    description: 'Manage your personal information and profile settings'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Configure how and when you receive notifications'
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Manage your password, 2FA, and security preferences'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    description: 'Customize the look and feel of your workspace'
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: Globe,
    description: 'Set your timezone, language, and regional preferences'
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: CreditCard,
    description: 'Manage your subscription and payment methods'
  },
  {
    id: 'team',
    title: 'Team & Access',
    icon: Users,
    description: 'Manage team members and access permissions'
  }
];

export function Settings() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { value: settingsUI, patch: patchSettingsUI } = useUIKey('settings', {
    activeSection: 'profile',
    showPassword: false,
    twoFactorEnabled: false,
    theme: 'dark' as 'light' | 'dark' | 'system',
    displayDensity: 'comfortable' as 'comfortable' | 'compact' | 'spacious',
    language: 'en-us',
    timezone: 'pt',
    dateFormat: 'mm-dd-yyyy',
    currency: 'usd',
  });
  const { patch: patchDashboardDensity } = useUIKey(
    UI_STATE_KEYS.DASHBOARD_DENSITY,
    UI_STATE_DEFAULTS.dashboardDensity
  );
  const activeSection = settingsUI.activeSection;
  const showPassword = settingsUI.showPassword;
  const twoFactorEnabled = settingsUI.twoFactorEnabled;
  const theme = settingsUI.theme;
  const displayDensity = settingsUI.displayDensity;
  const language = settingsUI.language;
  const timezone = settingsUI.timezone;
  const dateFormat = settingsUI.dateFormat;
  const currency = settingsUI.currency;
  const activeSectionConfig = settingsSections.find((section) => section.id === activeSection);
  const activeSectionLabel = activeSectionConfig?.title ?? 'Settings';
  const resolvedTenantId = user?.tenantId ?? null;
  const canManageOrgSettings =
    Boolean(user) && user?.role !== 'superadmin' && user?.isAdmin === true;
  const [teamSnapshot, setTeamSnapshot] = useState<TeamAccessSnapshot | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [orgRegion, setOrgRegion] = useState<OperatingRegion | ''>(
    user?.operatingRegion ?? ''
  );
  const [isSavingOrgRegion, setIsSavingOrgRegion] = useState(false);
  const [teamInviteForm, setTeamInviteForm] = useState<{
    email: string;
    targetAppRole: AssignableAppRole;
    targetIsAdmin: boolean;
  }>({
    email: '',
    targetAppRole: 'analyst',
    targetIsAdmin: false,
  });

  const refreshTeamSnapshot = useCallback(async () => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      setTeamSnapshot(null);
      return null;
    }

    const snapshot = await getTeamAccessSnapshot();
    setTeamSnapshot(snapshot);
    return snapshot;
  }, [canManageOrgSettings, resolvedTenantId]);

  useEffect(() => {
    if (activeSection !== 'team') {
      return;
    }

    void (async () => {
      try {
        await refreshTeamSnapshot();
        setTeamError(null);
      } catch (error) {
        setTeamError(error instanceof Error ? error.message : 'Failed to load team access data');
      }
    })();
  }, [activeSection, refreshTeamSnapshot]);

  useEffect(() => {
    setOrgRegion(user?.operatingRegion ?? '');
  }, [user?.operatingRegion]);

  const aiSummaryText = activeSection === 'security'
    ? `Security status: 2FA is ${twoFactorEnabled ? 'enabled' : 'disabled'}. Review active sessions and update your password regularly.`
    : activeSection === 'notifications'
    ? 'Tune email and push alerts to keep signal high. Prioritize compliance and capital call updates.'
    : activeSection === 'team'
    ? 'Review member roles and access to keep permissions aligned with fund operations.'
    : activeSection === 'preferences' && user
    ? `Organization region: ${getOperatingRegionLabel(user.operatingRegion)}. Update locale and reporting defaults for your workspace here.`
    : `You are viewing ${activeSectionLabel}. Adjust preferences to keep your workspace aligned with your team.`;

  const saveOrgRegion = async () => {
    if (!orgRegion) {
      toast.warning('Select an operating region before saving.', 'Region required');
      return;
    }

    setIsSavingOrgRegion(true);
    try {
      const settings = await updateCurrentOrgSettings({ operatingRegion: orgRegion });
      if (!user) {
        return;
      }

      const nextUser = {
        ...user,
        tenantId: settings.orgId,
        operatingRegion: settings.operatingRegion,
        organizationConfigured: settings.organizationConfigured,
      };
      persistAuthenticatedUser(nextUser);
      dispatch(authUserUpdated(nextUser));
      toast.success(
        `Organization updated for ${getOperatingRegionLabel(settings.operatingRegion)}.`,
        'Organization settings saved'
      );
    } catch (error) {
      console.error('Failed to save organization settings', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update organization settings',
        'Save failed'
      );
    } finally {
      setIsSavingOrgRegion(false);
    }
  };

  const headerBadges: PageHeaderBadge[] = [
    {
      label: `${settingsSections.length} sections`,
      size: 'md',
      variant: 'bordered',
      className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
    },
    {
      label: `Active: ${activeSectionLabel}`,
      size: 'md',
      variant: 'flat',
      className: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
    },
  ];

  if (activeSection === 'security') {
    headerBadges.push({
      label: twoFactorEnabled ? '2FA enabled' : '2FA disabled',
      size: 'md',
      variant: 'bordered',
      className: twoFactorEnabled
        ? 'text-[var(--app-success)] border-[var(--app-success)]'
        : 'text-[var(--app-warning)] border-[var(--app-warning)]',
    });
  }

  const runTeamMutation = async (
    mutation: () => Promise<unknown>,
    successMessage: string,
  ) => {
    try {
      await mutation();
      await refreshTeamSnapshot();
      setTeamError(null);
      setTeamNotice(successMessage);
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Team update failed');
      setTeamNotice(null);
    }
  };

  const handleTeamRoleUpdate = async (
    member: TeamMember,
    role: AssignableAppRole,
  ) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(() => {
      return updateTeamMember({
        userId: member.id,
        role,
      });
    }, 'Team member role updated.');
  };

  const handleTeamAdminToggle = async (member: TeamMember, isAdmin: boolean) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(() => {
      return updateTeamMember({
        userId: member.id,
        isAdmin,
      });
    }, `Team member ${isAdmin ? 'granted' : 'removed from'} org admin access.`);
  };

  const handleTeamStatusToggle = async (member: TeamMember) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    const nextStatus = member.status === 'active' ? 'disabled' : 'active';

    await runTeamMutation(() => {
      return updateTeamMember({
        userId: member.id,
        status: nextStatus,
      });
    }, `Team member ${nextStatus === 'active' ? 'activated' : 'disabled'}.`);
  };

  const handleTeamInvite = async () => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(() => {
      return inviteTeamMember({
        email: teamInviteForm.email,
        targetAppRole: teamInviteForm.targetAppRole,
        targetIsAdmin: teamInviteForm.targetIsAdmin,
      });
    }, 'Invitation sent.');

    setTeamInviteForm({
      email: '',
      targetAppRole: 'analyst',
      targetIsAdmin: false,
    });
  };

  const handleTeamResendInvite = async (inviteId: string) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(() => {
      return resendTeamInvite(inviteId);
    }, 'Invitation resent.');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Personal Information" className="mb-4" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="john.doe@example.com" startContent={<Mail className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input type="tel" placeholder="+1 (555) 123-4567" startContent={<Smartphone className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title</label>
                  <Input placeholder="General Partner" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button color="primary">Save Changes</Button>
              <Button variant="bordered">Cancel</Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Email Notifications" className="mb-4" />
              <div className="space-y-3">
                {[
                  { label: 'Deal updates and activity', description: 'Get notified about new deals and changes' },
                  { label: 'Capital calls and distributions', description: 'Important fund administration updates' },
                  { label: 'Compliance deadlines', description: 'Regulatory and compliance reminders' },
                  { label: 'Team mentions and comments', description: 'When someone mentions you or replies' },
                  { label: 'Weekly digest', description: 'Weekly summary of portfolio performance' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg hover:bg-[var(--app-surface-hover)]">
                    <Checkbox defaultSelected={idx < 3}>
                      <span className="font-medium">{item.label}</span>
                    </Checkbox>
                    <div>
                      <div className="text-sm text-[var(--app-text-muted)] pl-7">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader title="Push Notifications" className="mb-4" />
              <div className="space-y-3">
                {[
                  { label: 'High priority alerts', description: 'Critical notifications that need immediate attention' },
                  { label: 'Message notifications', description: 'New messages from team members' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg hover:bg-[var(--app-surface-hover)]">
                    <Checkbox defaultSelected>
                      <span className="font-medium">{item.label}</span>
                    </Checkbox>
                    <div>
                      <div className="text-sm text-[var(--app-text-muted)] pl-7">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button color="primary">Save Preferences</Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Change Password" className="mb-4" />
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    startContent={<Lock className="w-4 h-4" />}
                    endContent={
                      <button onClick={() => patchSettingsUI({ showPassword: !showPassword })}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <Input type="password" placeholder="Enter new password" startContent={<Lock className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <Input type="password" placeholder="Confirm new password" startContent={<Lock className="w-4 h-4" />} />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--app-border)] pt-4">
              <SectionHeader title="Two-Factor Authentication" className="mb-4" />
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--app-surface)]">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">2FA Status</span>
                    {twoFactorEnabled ? (
                      <Badge color="success" startContent={<Check className="w-3 h-3" />}>Enabled</Badge>
                    ) : (
                      <Badge color="warning" startContent={<AlertCircle className="w-3 h-3" />}>Disabled</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    Add an extra layer of security to your account with two-factor authentication
                  </p>
                </div>
                <Button
                  color={twoFactorEnabled ? "default" : "primary"}
                  variant={twoFactorEnabled ? "bordered" : "solid"}
                  onPress={() => patchSettingsUI({ twoFactorEnabled: !twoFactorEnabled })}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                </Button>
              </div>
            </div>

            <div className="border-t border-[var(--app-border)] pt-4">
              <SectionHeader title="Active Sessions" className="mb-4" />
              <div className="space-y-3">
                {[
                  { device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
                  { device: 'iPhone 14 Pro', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false }
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && <Badge color="primary" size="sm">Current Session</Badge>}
                      </div>
                      <div className="text-sm text-[var(--app-text-muted)]">
                        {session.location} · Last active {session.lastActive}
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="bordered" size="sm" color="danger">Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button color="primary">Update Password</Button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Theme" className="mb-4" />
              <RadioGroup
                aria-label="Theme selection"
                orientation="horizontal"
                classNames={{ wrapper: 'grid grid-cols-1 md:grid-cols-3 gap-3' }}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' },
                ]}
                value={theme}
                onValueChange={(value) => {
                  if (value === 'light' || value === 'dark' || value === 'system') {
                    patchSettingsUI({ theme: value });
                  }
                }}
              />
              <p className="mt-3 text-sm text-[var(--app-text-muted)]">
                {theme === 'system' ? 'Match system preference' : `Use ${theme} theme`}
              </p>
            </div>
            <div>
              <SectionHeader title="Display Density" className="mb-4" />
              <RadioGroup
                aria-label="Display density selection"
                orientation="horizontal"
                classNames={{ wrapper: 'grid grid-cols-1 md:grid-cols-3 gap-3' }}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
                value={displayDensity}
                onValueChange={(value) => {
                  if (value === 'comfortable' || value === 'compact' || value === 'spacious') {
                    patchSettingsUI({ displayDensity: value });
                    patchDashboardDensity({ mode: value === 'compact' ? 'compact' : 'comfortable' });
                  }
                }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button color="primary">Save Preferences</Button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-4">
            {canManageOrgSettings && (
              <div>
                <SectionHeader title="Organization Region" className="mb-4" />
                <Card padding="md" className="max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Operating Region</label>
                      <Select
                        options={OPERATING_REGION_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        selectedKeys={orgRegion ? [orgRegion] : []}
                        onChange={(event) => setOrgRegion(event.target.value as OperatingRegion)}
                      />
                      <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                        This sets the default regulatory regime for new funds and controls which
                        back-office surfaces appear across the workspace.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-[var(--app-border)] p-3">
                        <div className="text-[var(--app-text-muted)] mb-1">Current Region</div>
                        <div className="font-medium">
                          {getOperatingRegionLabel(user?.operatingRegion)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--app-border)] p-3">
                        <div className="text-[var(--app-text-muted)] mb-1">Default Fund Regime</div>
                        <div className="font-medium">
                          {getFundRegimeLabel(
                            getDefaultFundRegulatoryRegime(orgRegion || user?.operatingRegion || null)
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button color="primary" isLoading={isSavingOrgRegion} onPress={saveOrgRegion}>
                        Save Organization Region
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div>
              <SectionHeader title="Regional Settings" className="mb-4" />
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Select
                    options={LANGUAGE_OPTIONS}
                    selectedKeys={[language]}
                    onChange={(event) => patchSettingsUI({ language: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <Select
                    options={TIMEZONE_OPTIONS}
                    selectedKeys={[timezone]}
                    onChange={(event) => patchSettingsUI({ timezone: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <Select
                    options={DATE_FORMAT_OPTIONS}
                    selectedKeys={[dateFormat]}
                    onChange={(event) => patchSettingsUI({ dateFormat: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <Select
                    options={CURRENCY_OPTIONS}
                    selectedKeys={[currency]}
                    onChange={(event) => patchSettingsUI({ currency: event.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button color="primary">Save Preferences</Button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Current Plan" className="mb-4" />
              <Card padding="lg" className="border-[var(--app-primary)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold">Professional Plan</span>
                      <Badge color="primary">Current</Badge>
                    </div>
                    <p className="text-[var(--app-text-muted)] mb-4">
                      Full access to all features, unlimited team members
                    </p>
                    <div className="text-2xl font-bold">$299<span className="text-base font-normal text-[var(--app-text-muted)]">/month</span></div>
                  </div>
                  <Button variant="bordered">Change Plan</Button>
                </div>
              </Card>
            </div>

            <div>
              <SectionHeader title="Payment Method" className="mb-4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-[var(--app-primary)] to-transparent rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-[var(--app-text-muted)]">Expires 12/2025</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="bordered" size="sm">Edit</Button>
                    <Button variant="bordered" size="sm" color="danger">Remove</Button>
                  </div>
                </div>
              </div>
              <Button variant="bordered" className="mt-3" startContent={<Plus className="w-4 h-4" />}>
                Add Payment Method
              </Button>
            </div>

            <div>
              <SectionHeader title="Billing History" className="mb-4" />
              <div className="space-y-2">
                {[
                  { date: 'Dec 1, 2024', amount: '$299.00', status: 'Paid' },
                  { date: 'Nov 1, 2024', amount: '$299.00', status: 'Paid' },
                  { date: 'Oct 1, 2024', amount: '$299.00', status: 'Paid' }
                ].map((invoice, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                    <div>
                      <div className="font-medium">{invoice.date}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">Professional Plan</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={invoice.status} domain="general" size="sm" />
                      <span className="font-semibold">{invoice.amount}</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            {!resolvedTenantId && (
              <Card padding="md" className="border-[var(--app-warning)]">
                <p className="text-sm text-[var(--app-warning)]">
                  Team access data is unavailable for this account.
                </p>
              </Card>
            )}

            {resolvedTenantId && (
              <div>
                <SectionHeader
                  title="Team Members"
                  className="mb-4"
                  action={(
                    <Badge variant="bordered">
                      {canManageOrgSettings ? 'Org Admin Access' : 'Admin Only'}
                    </Badge>
                  )}
                />

                {teamError && (
                  <Card padding="sm" className="mb-3 border-[var(--app-danger)]">
                    <div className="text-sm text-[var(--app-danger)]">{teamError}</div>
                  </Card>
                )}

                {teamNotice && (
                  <Card padding="sm" className="mb-3 border-[var(--app-success)]">
                    <div className="text-sm text-[var(--app-success)]">{teamNotice}</div>
                  </Card>
                )}

                {!canManageOrgSettings && (
                  <Card padding="sm" className="mb-3 border-[var(--app-warning)]">
                    <div className="text-sm text-[var(--app-warning)]">
                      Only tenant org admins can manage team access.
                    </div>
                  </Card>
                )}

                {canManageOrgSettings && (
                  <div className="mb-4 rounded-lg border border-[var(--app-border)] p-4">
                    <SectionHeader title="Invite User" className="mb-3" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <Input
                        label="Email"
                        value={teamInviteForm.email}
                        onChange={(event) =>
                          setTeamInviteForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                      <Select
                        label="App Persona"
                    options={TEAM_APP_ROLE_OPTIONS}
                        selectedKeys={[teamInviteForm.targetAppRole]}
                        onChange={(event) =>
                          setTeamInviteForm((prev) => ({
                            ...prev,
                            targetAppRole: event.target.value as AssignableAppRole,
                          }))
                        }
                      />
                      <div className="flex items-center rounded-lg border border-[var(--app-border)] px-3">
                        <Checkbox
                          isSelected={teamInviteForm.targetIsAdmin}
                          onValueChange={(value) =>
                            setTeamInviteForm((prev) => ({ ...prev, targetIsAdmin: value }))
                          }
                        >
                          Org Admin
                        </Checkbox>
                      </div>
                      <div className="flex items-end">
                        <Button
                          color="primary"
                          className="w-full"
                          startContent={<Plus className="w-4 h-4" />}
                          onPress={handleTeamInvite}
                        >
                          Invite Member
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(teamSnapshot?.members ?? []).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-transparent flex items-center justify-center text-white font-semibold">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-[var(--app-text-muted)]">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={member.status === 'active' ? 'Active' : 'Disabled'} domain="general" size="sm" />
                        <Select
                          aria-label={`${member.name} app role`}
                          options={TEAM_APP_ROLE_OPTIONS}
                          selectedKeys={[member.role]}
                          size="sm"
                          className="min-w-[160px]"
                          onChange={(event) =>
                            void handleTeamRoleUpdate(member, event.target.value as AssignableAppRole)
                          }
                          isDisabled={!canManageOrgSettings}
                        />
                        <Checkbox
                          isSelected={member.isAdmin}
                          onValueChange={(value) => {
                            void handleTeamAdminToggle(member, value);
                          }}
                          isDisabled={!canManageOrgSettings}
                        >
                          Admin
                        </Checkbox>
                        <Button
                          variant="ghost"
                          size="sm"
                          color={member.status === 'active' ? 'danger' : 'success'}
                          onPress={() => {
                            void handleTeamStatusToggle(member);
                          }}
                          isDisabled={!canManageOrgSettings}
                        >
                          {member.status === 'active' ? 'Disable' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <SectionHeader title="Invitations" className="mb-3" />
                  <div className="space-y-2">
                    {(teamSnapshot?.invitations ?? []).map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between rounded-lg border border-[var(--app-border)] p-3">
                        <div>
                          <div className="font-medium">{invite.email}</div>
                          <div className="text-sm text-[var(--app-text-muted)]">
                            {invite.targetIsAdmin ? 'Admin' : 'Member'} · {invite.targetAppRole}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={invite.status} domain="general" size="sm" />
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => {
                              void handleTeamResendInvite(invite.id);
                            }}
                            isDisabled={!canManageOrgSettings || invite.status !== 'pending'}
                          >
                            Resend
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageScaffold
      routePath={ROUTE_PATHS.settings}
      header={{
        title: 'Settings',
        description: 'Manage your account settings and preferences',
        icon: SettingsIcon,
        aiSummary: {
          text: aiSummaryText,
        },
        badges: headerBadges,
      }}
    >
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => patchSettingsUI({ activeSection: section.id })}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]'
                        : 'hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card padding="lg">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">
                {activeSectionConfig?.title ?? 'Settings'}
              </h2>
              <p className="text-[var(--app-text-muted)]">
                {activeSectionConfig?.description ?? 'Manage your account settings and preferences'}
              </p>
            </div>
            {renderSectionContent()}
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}
