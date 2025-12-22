'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Input, Badge } from '@/ui';
import type { PageHeaderBadge } from '@/ui';
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
import { PageScaffold, StatusBadge } from '@/components/ui';

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
  const { value: settingsUI, patch: patchSettingsUI } = useUIKey('settings', {
    activeSection: 'profile',
    showPassword: false,
    twoFactorEnabled: false,
  });
  const activeSection = settingsUI.activeSection;
  const showPassword = settingsUI.showPassword;
  const twoFactorEnabled = settingsUI.twoFactorEnabled;
  const activeSectionConfig = settingsSections.find((section) => section.id === activeSection);
  const activeSectionLabel = activeSectionConfig?.title ?? 'Settings';

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

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: 'Deal updates and activity', description: 'Get notified about new deals and changes' },
                  { label: 'Capital calls and distributions', description: 'Important fund administration updates' },
                  { label: 'Compliance deadlines', description: 'Regulatory and compliance reminders' },
                  { label: 'Team mentions and comments', description: 'When someone mentions you or replies' },
                  { label: 'Weekly digest', description: 'Weekly summary of portfolio performance' }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--app-surface-hover)] cursor-pointer">
                    <input type="checkbox" defaultChecked={idx < 3} className="mt-1" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">{item.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: 'High priority alerts', description: 'Critical notifications that need immediate attention' },
                  { label: 'Message notifications', description: 'New messages from team members' }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--app-surface-hover)] cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">{item.description}</div>
                    </div>
                  </label>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
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

            <div className="border-t border-[var(--app-border)] pt-6">
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
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

            <div className="border-t border-[var(--app-border)] pt-6">
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Light', 'Dark', 'System'].map((theme) => (
                  <label key={theme} className="relative cursor-pointer">
                    <input type="radio" name="theme" defaultChecked={theme === 'Dark'} className="peer sr-only" />
                    <div className="p-4 rounded-lg border-2 border-[var(--app-border)] peer-checked:border-[var(--app-primary)] peer-checked:bg-[var(--app-primary-bg)] hover:border-[var(--app-border-hover)] transition-colors">
                      <div className="font-medium mb-2">{theme}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">
                        {theme === 'System' ? 'Match system preference' : `Use ${theme.toLowerCase()} theme`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Display Density</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Comfortable', 'Compact', 'Spacious'].map((density) => (
                  <label key={density} className="relative cursor-pointer">
                    <input type="radio" name="density" defaultChecked={density === 'Comfortable'} className="peer sr-only" />
                    <div className="p-4 rounded-lg border-2 border-[var(--app-border)] peer-checked:border-[var(--app-primary)] peer-checked:bg-[var(--app-primary-bg)] hover:border-[var(--app-border-hover)] transition-colors">
                      <div className="font-medium">{density}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button color="primary">Save Preferences</Button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Regional Settings</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>JPY (¥)</option>
                  </select>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
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
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
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
              <h3 className="text-lg font-semibold mb-4">Billing History</h3>
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
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button color="primary" startContent={<Plus className="w-4 h-4" />}>Invite Member</Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'John Doe', email: 'john@vestledger.com', role: 'Owner', status: 'Active' },
                  { name: 'Jane Smith', email: 'jane@vestledger.com', role: 'Admin', status: 'Active' },
                  { name: 'Mike Johnson', email: 'mike@vestledger.com', role: 'Member', status: 'Active' },
                  { name: 'Sarah Williams', email: 'sarah@vestledger.com', role: 'Member', status: 'Invited' }
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-[var(--app-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-[var(--app-text-muted)]">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={member.status} domain="general" size="sm" />
                      <select className="px-3 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm">
                        <option selected={member.role === 'Owner'}>Owner</option>
                        <option selected={member.role === 'Admin'}>Admin</option>
                        <option selected={member.role === 'Member'}>Member</option>
                      </select>
                      <Button variant="ghost" size="sm" color="danger">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageScaffold
      routePath="/settings"
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
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            <div className="mb-6">
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
