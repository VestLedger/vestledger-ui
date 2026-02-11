'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUIKey } from '@/store/ui';
import { Card, Button, Input, Badge, Checkbox, Select, RadioGroup } from '@/ui';
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
import {
  createTeamUser,
  getTeamAccessSnapshot,
  inviteTeamMember,
  resendTeamInvite,
  resolveTenantIdForUser,
  updateTeamMemberRole,
  updateTeamMemberStatus,
  type TeamAccessSnapshot,
  type TeamMember,
} from '@/services/internal/teamAccessService';
import type { AssignableAppRole, OrganizationRole } from '@/data/mocks/internal/superadmin';

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

const languageOptions = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en-uk', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

const timezoneOptions = [
  { value: 'pt', label: 'Pacific Time (PT)' },
  { value: 'mt', label: 'Mountain Time (MT)' },
  { value: 'ct', label: 'Central Time (CT)' },
  { value: 'et', label: 'Eastern Time (ET)' },
];

const dateFormatOptions = [
  { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd-mm-yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
];

const currencyOptions = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
  { value: 'gbp', label: 'GBP (£)' },
  { value: 'jpy', label: 'JPY (¥)' },
];

const teamRoleOptions = [
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'member', label: 'Member' },
];

const teamAppRoleOptions: Array<{ value: AssignableAppRole; label: string }> = [
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

export function Settings() {
  const { user } = useAuth();
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
  const resolvedTenantId = useMemo(() => resolveTenantIdForUser(user), [user]);
  const [teamSnapshot, setTeamSnapshot] = useState<TeamAccessSnapshot | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [teamInviteForm, setTeamInviteForm] = useState<{
    email: string;
    targetAppRole: AssignableAppRole;
    targetOrgRole: OrganizationRole;
  }>({
    email: '',
    targetAppRole: 'analyst',
    targetOrgRole: 'member',
  });
  const [teamCreateForm, setTeamCreateForm] = useState<{
    name: string;
    email: string;
    appRole: AssignableAppRole;
    organizationRole: OrganizationRole;
  }>({
    name: '',
    email: '',
    appRole: 'analyst',
    organizationRole: 'member',
  });

  const refreshTeamSnapshot = useCallback(() => {
    if (!resolvedTenantId) {
      setTeamSnapshot(null);
      return null;
    }

    const snapshot = getTeamAccessSnapshot(resolvedTenantId, {
      userId: user?.id,
      email: user?.email,
    });
    setTeamSnapshot(snapshot);
    return snapshot;
  }, [resolvedTenantId, user?.email, user?.id]);

  useEffect(() => {
    if (activeSection !== 'team') {
      return;
    }

    try {
      refreshTeamSnapshot();
      setTeamError(null);
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Failed to load team access data');
    }
  }, [activeSection, refreshTeamSnapshot]);

  const aiSummaryText = activeSection === 'security'
    ? `Security status: 2FA is ${twoFactorEnabled ? 'enabled' : 'disabled'}. Review active sessions and update your password regularly.`
    : activeSection === 'notifications'
    ? 'Tune email and push alerts to keep signal high. Prioritize compliance and capital call updates.'
    : activeSection === 'team'
    ? 'Review member roles and access to keep permissions aligned with fund operations.'
    : `You are viewing ${activeSectionLabel}. Adjust preferences to keep your workspace aligned with your team.`;

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

  const runTeamMutation = (mutation: () => void, successMessage: string) => {
    try {
      mutation();
      refreshTeamSnapshot();
      setTeamError(null);
      setTeamNotice(successMessage);
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Team update failed');
      setTeamNotice(null);
    }
  };

  const handleTeamRoleUpdate = (member: TeamMember, role: OrganizationRole) => {
    if (!resolvedTenantId || !teamSnapshot?.actorUserId || !teamSnapshot.canManageTeam) {
      return;
    }

    runTeamMutation(() => {
      updateTeamMemberRole({
        tenantId: resolvedTenantId,
        userId: member.id,
        organizationRole: role,
        actorUserId: teamSnapshot.actorUserId ?? undefined,
      });
    }, 'Team member role updated.');
  };

  const handleTeamStatusToggle = (member: TeamMember) => {
    if (!resolvedTenantId || !teamSnapshot?.actorUserId || !teamSnapshot.canManageTeam) {
      return;
    }

    const nextStatus = member.status === 'active' ? 'disabled' : 'active';

    runTeamMutation(() => {
      updateTeamMemberStatus({
        tenantId: resolvedTenantId,
        userId: member.id,
        status: nextStatus,
        actorUserId: teamSnapshot.actorUserId ?? undefined,
      });
    }, `Team member ${nextStatus === 'active' ? 'activated' : 'disabled'}.`);
  };

  const handleTeamInvite = () => {
    if (!resolvedTenantId || !teamSnapshot?.actorUserId || !teamSnapshot.canManageTeam) {
      return;
    }

    runTeamMutation(() => {
      inviteTeamMember({
        tenantId: resolvedTenantId,
        email: teamInviteForm.email,
        targetAppRole: teamInviteForm.targetAppRole,
        targetOrgRole: teamInviteForm.targetOrgRole,
        invitedByUserId: teamSnapshot.actorUserId ?? undefined,
      });
    }, 'Invitation sent.');

    setTeamInviteForm({
      email: '',
      targetAppRole: 'analyst',
      targetOrgRole: 'member',
    });
  };

  const handleTeamCreateUser = () => {
    if (!resolvedTenantId || !teamSnapshot?.actorUserId || !teamSnapshot.canManageTeam) {
      return;
    }

    runTeamMutation(() => {
      createTeamUser({
        tenantId: resolvedTenantId,
        name: teamCreateForm.name,
        email: teamCreateForm.email,
        appRole: teamCreateForm.appRole,
        organizationRole: teamCreateForm.organizationRole,
        actorUserId: teamSnapshot.actorUserId ?? undefined,
      });
    }, 'User created.');

    setTeamCreateForm({
      name: '',
      email: '',
      appRole: 'analyst',
      organizationRole: 'member',
    });
  };

  const handleTeamResendInvite = (inviteId: string) => {
    if (!resolvedTenantId || !teamSnapshot?.actorUserId || !teamSnapshot.canManageTeam) {
      return;
    }

    runTeamMutation(() => {
      resendTeamInvite(resolvedTenantId, inviteId, teamSnapshot.actorUserId ?? undefined);
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
                  onClick={() => patchSettingsUI({ twoFactorEnabled: !twoFactorEnabled })}
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
            <div>
              <SectionHeader title="Regional Settings" className="mb-4" />
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Select
                    options={languageOptions}
                    selectedKeys={[language]}
                    onChange={(event) => patchSettingsUI({ language: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <Select
                    options={timezoneOptions}
                    selectedKeys={[timezone]}
                    onChange={(event) => patchSettingsUI({ timezone: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <Select
                    options={dateFormatOptions}
                    selectedKeys={[dateFormat]}
                    onChange={(event) => patchSettingsUI({ dateFormat: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <Select
                    options={currencyOptions}
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
                      {teamSnapshot?.canManageTeam ? 'Org Admin Access' : 'Read Only'}
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

                {teamSnapshot?.canManageTeam && (
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
                        options={teamAppRoleOptions}
                        selectedKeys={[teamInviteForm.targetAppRole]}
                        onChange={(event) =>
                          setTeamInviteForm((prev) => ({
                            ...prev,
                            targetAppRole: event.target.value as AssignableAppRole,
                          }))
                        }
                      />
                      <Select
                        label="Org Role"
                        options={teamRoleOptions}
                        selectedKeys={[teamInviteForm.targetOrgRole]}
                        onChange={(event) =>
                          setTeamInviteForm((prev) => ({
                            ...prev,
                            targetOrgRole: event.target.value as OrganizationRole,
                          }))
                        }
                      />
                      <div className="flex items-end">
                        <Button
                          color="primary"
                          className="w-full"
                          startContent={<Plus className="w-4 h-4" />}
                          onClick={handleTeamInvite}
                        >
                          Invite Member
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {teamSnapshot?.canManageTeam && (
                  <div className="mb-4 rounded-lg border border-[var(--app-border)] p-4">
                    <SectionHeader title="Create User (Shared Mode)" className="mb-3" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                      <Input
                        label="Name"
                        value={teamCreateForm.name}
                        onChange={(event) =>
                          setTeamCreateForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                      <Input
                        label="Email"
                        value={teamCreateForm.email}
                        onChange={(event) =>
                          setTeamCreateForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                      <Select
                        label="App Persona"
                        options={teamAppRoleOptions}
                        selectedKeys={[teamCreateForm.appRole]}
                        onChange={(event) =>
                          setTeamCreateForm((prev) => ({
                            ...prev,
                            appRole: event.target.value as AssignableAppRole,
                          }))
                        }
                      />
                      <Select
                        label="Org Role"
                        options={teamRoleOptions}
                        selectedKeys={[teamCreateForm.organizationRole]}
                        onChange={(event) =>
                          setTeamCreateForm((prev) => ({
                            ...prev,
                            organizationRole: event.target.value as OrganizationRole,
                          }))
                        }
                      />
                      <div className="flex items-end">
                        <Button color="primary" className="w-full" onClick={handleTeamCreateUser}>
                          Create User
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
                        <Badge variant="bordered">{member.appRole}</Badge>
                        <Select
                          aria-label={`${member.name} org role`}
                          options={teamRoleOptions}
                          selectedKeys={[member.organizationRole]}
                          size="sm"
                          className="min-w-[160px]"
                          onChange={(event) =>
                            handleTeamRoleUpdate(member, event.target.value as OrganizationRole)
                          }
                          isDisabled={!teamSnapshot?.canManageTeam || member.isLastOrgAdmin}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          color={member.status === 'active' ? 'danger' : 'success'}
                          onClick={() => handleTeamStatusToggle(member)}
                          isDisabled={!teamSnapshot?.canManageTeam || member.isLastOrgAdmin}
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
                            {invite.targetOrgRole} · {invite.targetAppRole}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={invite.status} domain="general" size="sm" />
                          <Button
                            variant="bordered"
                            size="sm"
                            onClick={() => handleTeamResendInvite(invite.id)}
                            isDisabled={!teamSnapshot?.canManageTeam || invite.status !== 'pending'}
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
          confidence: 0.83,
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
