"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  AlertCircle,
  Bell,
  Bot,
  Check,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Mic,
  Monitor,
  Palette,
  Plug,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  RadioGroup,
  Select,
  Skeleton,
  Switch,
  useToast,
} from "@/ui";
import type { PageHeaderBadge } from "@/ui";
import { EmptyState } from "@/ui/async-states";
import { PageScaffold, SectionHeader, StatusBadge } from "@/ui/composites";
import { ROUTE_PATHS } from "@/config/routes";
import { useAuth } from "@/contexts/auth-context";
import { useNavigation } from "@/contexts/navigation-context";
import { useSegmentConfig } from "@/hooks/use-segment-config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useUIKey } from "@/store/ui";
import { alertsSelectors } from "@/store/slices/alertsSlice";
import { authUserUpdated } from "@/store/slices/authSlice";
import { fundUISelectors } from "@/store/slices/fundSlice";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TEAM_APP_ROLE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/config/settings-options";
import { AI_TOOLS_TABS } from "@/config/ai-tools-tabs";
import {
  OPERATING_REGION_OPTIONS,
  getDefaultFundRegulatoryRegime,
  getFundRegimeLabel,
  getOperatingRegionLabel,
} from "@/lib/regulatory-regions";
import { buildPublicWebUrl } from "@/config/env";
import { logger } from "@/lib/logger";
import { updateCurrentOrgSettings } from "@/services/orgSettingsService";
import {
  getTeamAccessSnapshot,
  inviteTeamMember,
  resendTeamInvite,
  updateTeamMember,
  type AssignableAppRole,
  type TeamAccessSnapshot,
  type TeamMember,
} from "@/services/internal/teamAccessApiService";
import type { OperatingRegion } from "@/types/regulatory";
import type { SegmentKey } from "@/types/segments";
import { persistAuthenticatedUser } from "@/utils/auth/persist-authenticated-user";

type SettingsSectionId =
  | "profile"
  | "workspace-theme"
  | "vesta-ai"
  | "notifications-suggestions"
  | "memory-layer"
  | "sessions";

type SettingsUIState = {
  activeSection: SettingsSectionId | string;
  showPassword: boolean;
  twoFactorEnabled: boolean;
  displayDensity: "comfortable" | "compact" | "spacious";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  defaultSegment: SegmentKey;
  defaultFundId: string;
  defaultPortfolioTab: string;
  pinnedCompany: string;
  mutedCategories: string[];
  suggestionsVisible: boolean;
  quickActionsVisible: boolean;
  memoryConfirmText: string;
};

interface SettingsSection {
  id: SettingsSectionId;
  title: string;
  icon: LucideIcon;
  description: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "Personal details, role, team access, and billing summary.",
  },
  {
    id: "workspace-theme",
    title: "Workspace & Theme",
    icon: Palette,
    description:
      "Theme, regional defaults, dashboard density, and default views.",
  },
  {
    id: "vesta-ai",
    title: "Vesta & AI",
    icon: Sparkles,
    description: "Assistant chrome, voice behavior, and AI tool access.",
  },
  {
    id: "notifications-suggestions",
    title: "Notifications & Suggestions",
    icon: Bell,
    description:
      "Notification category preferences and Vesta suggestion visibility.",
  },
  {
    id: "memory-layer",
    title: "Memory layer",
    icon: Bot,
    description: "Read-only Vesta memory state and forgetting controls.",
  },
  {
    id: "sessions",
    title: "Sign-out & Sessions",
    icon: Shield,
    description:
      "Password, two-factor authentication, active sessions, and sign out.",
  },
];

const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTIONS[0] as SettingsSection;

const DEFAULT_SETTINGS_STATE: SettingsUIState = {
  activeSection: "profile",
  showPassword: false,
  twoFactorEnabled: false,
  displayDensity: "comfortable",
  language: "en-us",
  timezone: "pt",
  dateFormat: "mm-dd-yyyy",
  currency: "usd",
  defaultSegment: "micro_vc",
  defaultFundId: "system",
  defaultPortfolioTab: "overview",
  pinnedCompany: "",
  mutedCategories: [],
  suggestionsVisible: true,
  quickActionsVisible: true,
  memoryConfirmText: "",
};

const SEGMENT_OPTIONS: Array<{ value: SegmentKey; label: string }> = [
  { value: "angel_syndicate", label: "Angel / Syndicate" },
  { value: "micro_vc", label: "Micro VC" },
  { value: "family_office", label: "Family Office" },
  { value: "private_equity", label: "Private Equity" },
];

const PORTFOLIO_TAB_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "companies", label: "Companies" },
  { value: "valuations", label: "409A" },
];

const NOTIFICATION_RULES = [
  {
    id: "alert",
    label: "High-priority alerts",
    description:
      "Risk, blocker, and compliance notifications that need review.",
  },
  {
    id: "deal",
    label: "Deal updates",
    description:
      "Pipeline movements, diligence activity, and IC review updates.",
  },
  {
    id: "report",
    label: "Report readiness",
    description: "Narrative drafts, exports, and reporting workflow updates.",
  },
  {
    id: "system",
    label: "System messages",
    description: "Workspace, account, and integration service updates.",
  },
];

const ACTIVE_SESSIONS = [
  {
    device: "MacBook Pro",
    location: "San Francisco, CA",
    lastActive: "2 minutes ago",
    current: true,
  },
  {
    device: "iPhone 14 Pro",
    location: "San Francisco, CA",
    lastActive: "1 hour ago",
    current: false,
  },
];

function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

function initialsForName(name: string | undefined): string {
  if (!name) return "U";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2);
  return initials || "U";
}

function formatSegmentLabel(segment: SegmentKey): string {
  return (
    SEGMENT_OPTIONS.find((option) => option.value === segment)?.label ??
    "Micro VC"
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--app-border)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="mt-1 text-sm text-[var(--app-text-muted)]">
            {description}
          </div>
        </div>
      </div>
      <div className="md:min-w-[220px]">{children}</div>
    </div>
  );
}

export function Settings() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { sidebarState, toggleRightSidebar } = useNavigation();
  const { segmentKey, config: segmentConfig } = useSegmentConfig(user);
  const alertsData = useAppSelector(alertsSelectors.selectData);
  const alertsStatus = useAppSelector(alertsSelectors.selectStatus);
  const alertsError = useAppSelector(alertsSelectors.selectError);
  const visibleFunds = useAppSelector(fundUISelectors.selectVisibleFunds);
  const selectedFund = useAppSelector(fundUISelectors.selectSelectedFund);

  const { value: rawSettingsUI, patch: patchSettingsUI } =
    useUIKey<SettingsUIState>("settings", {
      ...DEFAULT_SETTINGS_STATE,
      defaultSegment: segmentKey,
      defaultFundId: selectedFund?.id ?? DEFAULT_SETTINGS_STATE.defaultFundId,
    });
  const { patch: patchDashboardDensity } = useUIKey(
    UI_STATE_KEYS.DASHBOARD_DENSITY,
    UI_STATE_DEFAULTS.dashboardDensity,
  );
  const { value: vestaShellUI, patch: patchVestaShellUI } = useUIKey(
    UI_STATE_KEYS.VESTA_SHELL,
    UI_STATE_DEFAULTS.vestaShell,
  );
  const settingsUI = useMemo<SettingsUIState>(
    () => ({
      ...DEFAULT_SETTINGS_STATE,
      ...rawSettingsUI,
      defaultSegment: rawSettingsUI.defaultSegment ?? segmentKey,
      defaultFundId:
        rawSettingsUI.defaultFundId ??
        selectedFund?.id ??
        DEFAULT_SETTINGS_STATE.defaultFundId,
    }),
    [rawSettingsUI, selectedFund?.id, segmentKey],
  );

  const activeSection = isSettingsSectionId(settingsUI.activeSection)
    ? settingsUI.activeSection
    : "profile";
  const activeSectionConfig =
    SETTINGS_SECTIONS.find((section) => section.id === activeSection) ??
    DEFAULT_SETTINGS_SECTION;
  const ActiveSectionIcon = activeSectionConfig.icon;
  const defaultSegment = settingsUI.defaultSegment || segmentKey;
  const currentTheme =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";
  const resolvedTenantId = user?.tenantId ?? null;
  const canManageOrgSettings =
    Boolean(user) && user?.role !== "superadmin" && user?.isAdmin === true;
  const alertItems = alertsData?.items ?? [];
  const mutedCategories = settingsUI.mutedCategories ?? [];
  const mutedCategoryLabels = NOTIFICATION_RULES.filter((rule) =>
    mutedCategories.includes(rule.id),
  ).map((rule) => rule.label);

  const [teamSnapshot, setTeamSnapshot] = useState<TeamAccessSnapshot | null>(
    null,
  );
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [orgRegion, setOrgRegion] = useState<OperatingRegion | "">(
    user?.operatingRegion ?? "",
  );
  const [isSavingOrgRegion, setIsSavingOrgRegion] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isResetVestaOpen, setIsResetVestaOpen] = useState(false);
  const [isWipeMemoryOpen, setIsWipeMemoryOpen] = useState(false);
  const [teamInviteForm, setTeamInviteForm] = useState<{
    email: string;
    targetAppRole: AssignableAppRole;
    targetIsAdmin: boolean;
  }>({
    email: "",
    targetAppRole: "analyst",
    targetIsAdmin: false,
  });

  const fundOptions = useMemo(
    () => [
      { value: "system", label: "System default" },
      ...visibleFunds.map((fund) => ({
        value: fund.id,
        label: fund.displayName || fund.name,
      })),
    ],
    [visibleFunds],
  );

  useEffect(() => {
    if (!isSettingsSectionId(settingsUI.activeSection)) {
      patchSettingsUI({ activeSection: "profile" });
    }
  }, [patchSettingsUI, settingsUI.activeSection]);

  useEffect(() => {
    patchVestaShellUI({
      activeThreadContext: {
        contextType: "route-tab",
        contextId: `${ROUTE_PATHS.settings}:${activeSection}`,
      },
    });
  }, [activeSection, patchVestaShellUI]);

  useEffect(() => {
    setOrgRegion(user?.operatingRegion ?? "");
  }, [user?.operatingRegion]);

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
    if (activeSection !== "profile") {
      return;
    }

    void (async () => {
      try {
        await refreshTeamSnapshot();
        setTeamError(null);
      } catch (error) {
        setTeamError(
          error instanceof Error
            ? error.message
            : "Failed to load team access data",
        );
      }
    })();
  }, [activeSection, refreshTeamSnapshot]);

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
      setTeamError(
        error instanceof Error ? error.message : "Team update failed",
      );
      setTeamNotice(null);
    }
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
    }, "Invitation sent.");

    setTeamInviteForm({
      email: "",
      targetAppRole: "analyst",
      targetIsAdmin: false,
    });
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
    }, "Team member role updated.");
  };

  const handleTeamAdminToggle = async (
    member: TeamMember,
    isAdmin: boolean,
  ) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(
      () => {
        return updateTeamMember({
          userId: member.id,
          isAdmin,
        });
      },
      `Team member ${isAdmin ? "granted" : "removed from"} org admin access.`,
    );
  };

  const handleTeamStatusToggle = async (member: TeamMember) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    const nextStatus = member.status === "active" ? "disabled" : "active";

    await runTeamMutation(
      () => {
        return updateTeamMember({
          userId: member.id,
          status: nextStatus,
        });
      },
      `Team member ${nextStatus === "active" ? "activated" : "disabled"}.`,
    );
  };

  const handleTeamResendInvite = async (inviteId: string) => {
    if (!resolvedTenantId || !canManageOrgSettings) {
      return;
    }

    await runTeamMutation(() => {
      return resendTeamInvite(inviteId);
    }, "Invitation resent.");
  };

  const saveOrgRegion = async () => {
    if (!orgRegion) {
      toast.warning(
        "Select an operating region before saving.",
        "Region required",
      );
      return;
    }

    setIsSavingOrgRegion(true);
    try {
      const settings = await updateCurrentOrgSettings({
        operatingRegion: orgRegion,
      });
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
        "Organization settings saved",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update organization settings",
        "Save failed",
      );
    } finally {
      setIsSavingOrgRegion(false);
    }
  };

  const saveWorkspaceDefaults = () => {
    if (user && defaultSegment !== user.segment) {
      const nextUser = { ...user, segment: defaultSegment };
      persistAuthenticatedUser(nextUser);
      dispatch(authUserUpdated(nextUser));
    }

    toast.success(
      `${formatSegmentLabel(defaultSegment)} defaults saved for Dashboard, Portfolio, and Vesta.`,
      "Workspace defaults saved",
    );
  };

  const resetWorkspaceDefaults = () => {
    patchSettingsUI({
      defaultSegment: segmentKey,
      defaultFundId: "system",
      defaultPortfolioTab: "overview",
      pinnedCompany: "",
    });
    toast.success("Default views reset to system defaults.", "Defaults reset");
  };

  const toggleMutedCategory = (categoryId: string, isEnabled: boolean) => {
    const nextMuted = isEnabled
      ? mutedCategories.filter((id) => id !== categoryId)
      : Array.from(new Set([...mutedCategories, categoryId]));

    patchSettingsUI({ mutedCategories: nextMuted });
    toast.success("Notification preference updated.", "Preference saved");
  };

  const openVestaPreview = () => {
    patchVestaShellUI({
      vestaViewMode: "sidebar",
      activeThreadContext: {
        contextType: "route-tab",
        contextId: `${ROUTE_PATHS.settings}:vesta-ai`,
      },
    });

    if (sidebarState.rightCollapsed) {
      toggleRightSidebar();
    }

    toast.success(
      "Vesta is open in the right rail with Settings context.",
      "Vesta preview",
    );
  };

  const resetVestaPreferences = () => {
    patchVestaShellUI({
      vestaViewMode: UI_STATE_DEFAULTS.vestaShell.vestaViewMode,
      voiceCaptureMode: UI_STATE_DEFAULTS.vestaShell.voiceCaptureMode,
      ttsEnabled: UI_STATE_DEFAULTS.vestaShell.ttsEnabled,
      activeThreadContext: {
        contextType: "route-tab",
        contextId: `${ROUTE_PATHS.settings}:vesta-ai`,
      },
    });
    patchSettingsUI({
      suggestionsVisible: true,
      quickActionsVisible: true,
    });
    setIsResetVestaOpen(false);
    toast.success("Vesta preferences reset to defaults.", "Vesta reset");
  };

  const confirmMemoryWipe = () => {
    patchSettingsUI({ memoryConfirmText: "" });
    setIsWipeMemoryOpen(false);
    toast.success(
      "No saved memories were found to wipe.",
      "Memory layer unchanged",
    );
  };

  const handleSignOut = () => {
    sessionStorage.setItem("isLoggingOut", "true");
    logout();

    const redirectUrl = buildPublicWebUrl(window.location.hostname);
    logger.info("Logging out user from Settings.", {
      component: "settings",
      redirectUrl,
    });
    window.location.href = redirectUrl;
  };

  const headerBadges: PageHeaderBadge[] = [
    {
      label: "Platform Admin",
      size: "md",
      variant: "bordered",
      className: "text-[var(--app-text-muted)] border-[var(--app-border)]",
    },
    {
      label: `Active: ${activeSectionConfig.title}`,
      size: "md",
      variant: "flat",
      className: "bg-[var(--app-primary-bg)] text-[var(--app-primary)]",
    },
    {
      label: `${formatSegmentLabel(defaultSegment)} defaults`,
      size: "md",
      variant: "bordered",
      className: "text-[var(--app-text-muted)] border-[var(--app-border)]",
    },
  ];

  const aiSummaryText =
    activeSection === "vesta-ai"
      ? "Vesta lives in the right rail by default. Toggle voice, spoken replies, and suggestion chrome here."
      : activeSection === "memory-layer"
        ? "Vesta hasn't saved any memories yet. This panel stays read-only until the AI provider is connected."
        : activeSection === "notifications-suggestions"
          ? "Notification and suggestion preferences mirror the Signals and topbar surfaces without hiding functionality."
          : "Settings centralizes account, workspace, assistant, and session preferences for every segment.";

  const renderProfileSection = () => {
    const [firstName = "", ...restName] = (user?.name ?? "").split(" ");
    const lastName = restName.join(" ");

    return (
      <div className="space-y-8">
        <section>
          <SectionHeader title="Personal Information" className="mb-4" />
          <div className="grid gap-4 2xl:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--app-border)] p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--app-primary)] text-lg font-semibold text-white">
                {initialsForName(user?.name)}
              </div>
              <div className="mt-3 font-medium">
                {user?.name ?? "Workspace user"}
              </div>
              <div className="text-sm text-[var(--app-text-muted)]">
                {user?.role ?? "Member"}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              <Input label="First name" defaultValue={firstName} />
              <Input label="Last name" defaultValue={lastName} />
              <Input
                label="Email"
                type="email"
                defaultValue={user?.email ?? ""}
                startContent={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                startContent={<Smartphone className="h-4 w-4" />}
              />
              <Input label="Job title" placeholder="General Partner" />
              <Input
                label="Role"
                defaultValue={user?.role ?? "member"}
                isDisabled
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              color="primary"
              onPress={() =>
                toast.success("Profile preferences saved.", "Profile saved")
              }
            >
              Save profile
            </Button>
            <Button
              variant="bordered"
              onPress={() =>
                toast.info("Profile edits discarded.", "No changes saved")
              }
            >
              Cancel
            </Button>
          </div>
        </section>

        <section className="border-t border-[var(--app-border)] pt-8">
          <SectionHeader
            title="Team Access"
            className="mb-4"
            action={
              <Badge variant="bordered">
                {canManageOrgSettings ? "Org admin access" : "Admin only"}
              </Badge>
            }
          />

          {!resolvedTenantId && (
            <div className="rounded-lg border border-[var(--app-warning)] p-3 text-sm text-[var(--app-warning)]">
              Team access data is unavailable for this account.
            </div>
          )}

          {teamError && (
            <div className="mb-3 rounded-lg border border-[var(--app-danger)] p-3 text-sm text-[var(--app-danger)]">
              {teamError}
            </div>
          )}

          {teamNotice && (
            <div className="mb-3 rounded-lg border border-[var(--app-success)] p-3 text-sm text-[var(--app-success)]">
              {teamNotice}
            </div>
          )}

          {!canManageOrgSettings && (
            <div className="mb-3 rounded-lg border border-[var(--app-warning)] p-3 text-sm text-[var(--app-warning)]">
              Only tenant org admins can manage team access.
            </div>
          )}

          {canManageOrgSettings && (
            <div className="mb-4 rounded-lg border border-[var(--app-border)] p-4">
              <SectionHeader title="Invite User" className="mb-3" />
              <div className="grid grid-cols-1 gap-3 2xl:grid-cols-4">
                <Input
                  label="Email"
                  value={teamInviteForm.email}
                  onChange={(event) =>
                    setTeamInviteForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
                <Select
                  label="App persona"
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
                      setTeamInviteForm((prev) => ({
                        ...prev,
                        targetIsAdmin: value,
                      }))
                    }
                  >
                    Org Admin
                  </Checkbox>
                </div>
                <div className="flex items-end">
                  <Button
                    color="primary"
                    className="w-full"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={handleTeamInvite}
                  >
                    Invite member
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(teamSnapshot?.members ?? []).map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--app-border)] p-4 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary)] text-sm font-semibold text-white">
                    {initialsForName(member.name)}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-[var(--app-text-muted)]">
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <StatusBadge
                    status={member.status === "active" ? "Active" : "Disabled"}
                    domain="general"
                    size="sm"
                  />
                  <Select
                    aria-label={`${member.name} app role`}
                    options={TEAM_APP_ROLE_OPTIONS}
                    selectedKeys={[member.role]}
                    size="sm"
                    className="min-w-[160px]"
                    onChange={(event) =>
                      void handleTeamRoleUpdate(
                        member,
                        event.target.value as AssignableAppRole,
                      )
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
                    color={member.status === "active" ? "danger" : "success"}
                    onPress={() => {
                      void handleTeamStatusToggle(member);
                    }}
                    isDisabled={!canManageOrgSettings}
                  >
                    {member.status === "active" ? "Disable" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {(teamSnapshot?.invitations ?? []).length > 0 && (
            <div className="mt-4">
              <SectionHeader title="Invitations" className="mb-3" />
              <div className="space-y-2">
                {(teamSnapshot?.invitations ?? []).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--app-border)] p-3"
                  >
                    <div>
                      <div className="font-medium">{invite.email}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">
                        {invite.targetIsAdmin ? "Admin" : "Member"} ·{" "}
                        {invite.targetAppRole}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={invite.status}
                        domain="general"
                        size="sm"
                      />
                      <Button
                        variant="bordered"
                        size="sm"
                        onPress={() => {
                          void handleTeamResendInvite(invite.id);
                        }}
                        isDisabled={
                          !canManageOrgSettings || invite.status !== "pending"
                        }
                      >
                        Resend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="border-t border-[var(--app-border)] pt-8">
          <SectionHeader title="Billing Summary" className="mb-4" />
          <div className="grid gap-3 2xl:grid-cols-3">
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <div className="text-sm text-[var(--app-text-muted)]">
                Current plan
              </div>
              <div className="mt-1 text-lg font-semibold">Professional</div>
              <Badge className="mt-2" color="primary">
                Current
              </Badge>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <div className="text-sm text-[var(--app-text-muted)]">
                Payment method
              </div>
              <div className="mt-1 font-medium">Visa ending 4242</div>
              <div className="text-sm text-[var(--app-text-muted)]">
                Expires 12/2025
              </div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <div className="text-sm text-[var(--app-text-muted)]">
                Last invoice
              </div>
              <div className="mt-1 font-medium">$299.00</div>
              <div className="text-sm text-[var(--app-text-muted)]">
                Paid Dec 1, 2024
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderWorkspaceSection = () => (
    <div className="space-y-8">
      <section>
        <SectionHeader title="Theme" className="mb-4" />
        <div className="grid gap-4 2xl:grid-cols-2">
          <SettingRow
            icon={Monitor}
            title="Workspace theme"
            description={`Current rendered theme: ${resolvedTheme ?? "system"}. The topbar toggle mirrors this state.`}
          >
            <RadioGroup
              aria-label="Theme selection"
              value={currentTheme}
              onValueChange={(value) => {
                if (
                  value === "light" ||
                  value === "dark" ||
                  value === "system"
                ) {
                  setTheme(value);
                  toast.success(`Theme set to ${value}.`, "Theme updated");
                }
              }}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
            />
          </SettingRow>
          <SettingRow
            icon={LayoutDashboard}
            title="Dashboard density"
            description="Controls compact or comfortable spacing on cockpit surfaces."
          >
            <RadioGroup
              aria-label="Display density selection"
              value={settingsUI.displayDensity}
              onValueChange={(value) => {
                if (
                  value === "comfortable" ||
                  value === "compact" ||
                  value === "spacious"
                ) {
                  patchSettingsUI({ displayDensity: value });
                  patchDashboardDensity({
                    mode: value === "compact" ? "compact" : "comfortable",
                  });
                  toast.success("Dashboard density updated.", "Density saved");
                }
              }}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
                { value: "spacious", label: "Spacious" },
              ]}
            />
          </SettingRow>
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader title="Default Views" className="mb-4" />
        <div className="grid gap-4 2xl:grid-cols-2">
          <Select
            label="Default segment"
            options={SEGMENT_OPTIONS}
            selectedKeys={[defaultSegment]}
            onChange={(event) =>
              patchSettingsUI({
                defaultSegment: event.target.value as SegmentKey,
              })
            }
          />
          <Select
            label="Default fund"
            options={fundOptions}
            selectedKeys={[settingsUI.defaultFundId || "system"]}
            onChange={(event) =>
              patchSettingsUI({ defaultFundId: event.target.value })
            }
          />
          <Select
            label="Default Portfolio tab"
            options={PORTFOLIO_TAB_OPTIONS}
            selectedKeys={[settingsUI.defaultPortfolioTab || "overview"]}
            onChange={(event) =>
              patchSettingsUI({ defaultPortfolioTab: event.target.value })
            }
          />
          <Input
            label="Pinned company"
            value={settingsUI.pinnedCompany}
            placeholder="Company name or slug"
            onChange={(event) =>
              patchSettingsUI({ pinnedCompany: event.target.value })
            }
          />
        </div>
        <div className="mt-4 grid gap-3 2xl:grid-cols-3">
          <div className="rounded-lg border border-[var(--app-border)] p-3">
            <div className="text-sm text-[var(--app-text-muted)]">
              Segment prominence
            </div>
            <div className="mt-1 font-medium">
              {segmentConfig.modules.settings.sourceWeight}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-3">
            <div className="text-sm text-[var(--app-text-muted)]">
              Dashboard source
            </div>
            <div className="mt-1 font-medium">
              {segmentConfig.dashboardBlocks[0]?.label ?? "Dashboard defaults"}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-3">
            <div className="text-sm text-[var(--app-text-muted)]">
              Vesta default
            </div>
            <div className="mt-1 font-medium">
              {segmentConfig.vestaSuggestions[0] ?? "Contextual only"}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button color="primary" onPress={saveWorkspaceDefaults}>
            Save defaults
          </Button>
          <Button
            variant="bordered"
            onPress={() => patchSettingsUI({ pinnedCompany: "" })}
          >
            Clear pinned
          </Button>
          <Button variant="ghost" onPress={resetWorkspaceDefaults}>
            Reset to system default
          </Button>
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader title="Regional Settings" className="mb-4" />
        {canManageOrgSettings && (
          <div className="mb-4 rounded-lg border border-[var(--app-border)] p-4">
            <div className="grid gap-4 2xl:grid-cols-2">
              <Select
                label="Operating region"
                options={OPERATING_REGION_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                selectedKeys={orgRegion ? [orgRegion] : []}
                onChange={(event) =>
                  setOrgRegion(event.target.value as OperatingRegion)
                }
              />
              <div className="rounded-lg border border-[var(--app-border)] p-3 text-sm">
                <div className="text-[var(--app-text-muted)]">
                  Default fund regime
                </div>
                <div className="mt-1 font-medium">
                  {getFundRegimeLabel(
                    getDefaultFundRegulatoryRegime(
                      orgRegion || user?.operatingRegion || null,
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                color="primary"
                isLoading={isSavingOrgRegion}
                onPress={saveOrgRegion}
              >
                Save organization region
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-4 2xl:grid-cols-2">
          <Select
            label="Language"
            options={LANGUAGE_OPTIONS}
            selectedKeys={[settingsUI.language]}
            onChange={(event) =>
              patchSettingsUI({ language: event.target.value })
            }
          />
          <Select
            label="Timezone"
            options={TIMEZONE_OPTIONS}
            selectedKeys={[settingsUI.timezone]}
            onChange={(event) =>
              patchSettingsUI({ timezone: event.target.value })
            }
          />
          <Select
            label="Date format"
            options={DATE_FORMAT_OPTIONS}
            selectedKeys={[settingsUI.dateFormat]}
            onChange={(event) =>
              patchSettingsUI({ dateFormat: event.target.value })
            }
          />
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            selectedKeys={[settingsUI.currency]}
            onChange={(event) =>
              patchSettingsUI({ currency: event.target.value })
            }
          />
        </div>
      </section>
    </div>
  );

  const renderVestaSection = () => (
    <div className="space-y-8">
      <section>
        <SectionHeader
          title="Vesta right rail"
          className="mb-4"
          action={
            <Badge color="primary" variant="flat">
              Contextual
            </Badge>
          }
        />
        <div className="grid gap-4 2xl:grid-cols-2">
          <SettingRow
            icon={Volume2}
            title="Spoken replies"
            description="Mirrors the Vesta panel audio control."
          >
            <Switch
              isSelected={Boolean(vestaShellUI.ttsEnabled)}
              onValueChange={(value) => {
                patchVestaShellUI({ ttsEnabled: value });
                toast.success(
                  `Spoken replies ${value ? "enabled" : "disabled"}.`,
                  "Vesta preference saved",
                );
              }}
            >
              {vestaShellUI.ttsEnabled ? "On" : "Off"}
            </Switch>
          </SettingRow>
          <SettingRow
            icon={Mic}
            title="Voice capture mode"
            description="Choose how the mic behaves when opened from the topbar or panel."
          >
            <RadioGroup
              aria-label="Voice capture mode"
              value={vestaShellUI.voiceCaptureMode}
              onValueChange={(value) => {
                if (value === "tap" || value === "hold") {
                  patchVestaShellUI({ voiceCaptureMode: value });
                  toast.success(
                    "Voice capture mode saved.",
                    "Vesta preference saved",
                  );
                }
              }}
              options={[
                { value: "tap", label: "Tap" },
                { value: "hold", label: "Hold" },
              ]}
            />
          </SettingRow>
          <SettingRow
            icon={Bot}
            title="Panel default state"
            description="Settings can open Vesta in the right rail, but Vesta remains out of the page canvas."
          >
            <RadioGroup
              aria-label="Vesta panel default"
              value={vestaShellUI.vestaViewMode}
              onValueChange={(value) => {
                if (
                  value === "collapsed" ||
                  value === "sidebar" ||
                  value === "fullscreen"
                ) {
                  patchVestaShellUI({ vestaViewMode: value });
                  toast.success(
                    "Vesta panel state saved.",
                    "Vesta preference saved",
                  );
                }
              }}
              options={[
                { value: "collapsed", label: "Collapsed" },
                { value: "sidebar", label: "Right rail" },
                { value: "fullscreen", label: "Full width" },
              ]}
            />
          </SettingRow>
          <SettingRow
            icon={Sparkles}
            title="Settings tour"
            description="Open a contextual Settings summary in the right rail."
          >
            <Button color="primary" onPress={openVestaPreview}>
              Open Vesta preview
            </Button>
          </SettingRow>
        </div>
        <div className="mt-4">
          <Button
            variant="bordered"
            startContent={<RotateCcw className="h-4 w-4" />}
            onPress={() => setIsResetVestaOpen(true)}
          >
            Reset Vesta preferences
          </Button>
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader title="AI tool access" className="mb-4" />
        <div className="grid gap-3 2xl:grid-cols-3">
          {AI_TOOLS_TABS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="rounded-lg border border-[var(--app-border)] p-4"
              >
                <Icon className="h-5 w-5 text-[var(--app-primary)]" />
                <div className="mt-3 font-medium">{tool.label}</div>
                <div className="mt-1 text-sm text-[var(--app-text-muted)]">
                  Standalone route preserved; deal-record embedding lands in the
                  Deals module.
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            as={Link}
            href={ROUTE_PATHS.aiTools}
            variant="bordered"
            startContent={<Sparkles className="h-4 w-4" />}
          >
            Open AI Tools
          </Button>
          <Button
            as={Link}
            href={ROUTE_PATHS.integrations}
            variant="bordered"
            startContent={<Plug className="h-4 w-4" />}
          >
            Open Integrations
          </Button>
        </div>
      </section>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <section>
        <SectionHeader title="Notification rules" className="mb-4" />
        {alertsStatus === "loading" && (
          <div className="grid gap-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-20" />
            ))}
          </div>
        )}
        {alertsError && (
          <div className="mb-3 rounded-lg border border-[var(--app-danger)] p-3 text-sm text-[var(--app-danger)]">
            Failed to load notification preferences. Retry from the Signals
            page.
          </div>
        )}
        <div className="space-y-3">
          {NOTIFICATION_RULES.map((rule) => {
            const count = alertItems.filter(
              (item) => item.type === rule.id,
            ).length;
            const isEnabled = !mutedCategories.includes(rule.id);
            return (
              <div
                key={rule.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--app-border)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{rule.label}</div>
                    <Badge size="sm" variant="bordered">
                      {count} in feed
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-[var(--app-text-muted)]">
                    {rule.description}
                  </div>
                </div>
                <Switch
                  isSelected={isEnabled}
                  onValueChange={(value) => toggleMutedCategory(rule.id, value)}
                >
                  {isEnabled ? "Enabled" : "Muted"}
                </Switch>
              </div>
            );
          })}
        </div>
        {mutedCategoryLabels.length === 0 ? (
          <div className="mt-4 rounded-lg border border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
            No muted categories.
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-[var(--app-border)] p-4">
            <div className="font-medium">Muted categories</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {mutedCategoryLabels.map((label) => (
                <Badge key={label} variant="bordered">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader
          title="Vesta suggestions and quick actions"
          className="mb-4"
        />
        <div className="grid gap-4 2xl:grid-cols-2">
          <SettingRow
            icon={MessageSquare}
            title="Suggestion section"
            description="Controls whether the Vesta panel shows contextual suggestions."
          >
            <Switch
              isSelected={settingsUI.suggestionsVisible}
              onValueChange={(value) => {
                patchSettingsUI({ suggestionsVisible: value });
                toast.success(
                  "Suggestion visibility saved.",
                  "Preference saved",
                );
              }}
            >
              {settingsUI.suggestionsVisible ? "Visible" : "Hidden"}
            </Switch>
          </SettingRow>
          <SettingRow
            icon={RefreshCw}
            title="Quick actions"
            description="Controls page-specific action shortcuts in the Vesta panel."
          >
            <Switch
              isSelected={settingsUI.quickActionsVisible}
              onValueChange={(value) => {
                patchSettingsUI({ quickActionsVisible: value });
                toast.success(
                  "Quick action visibility saved.",
                  "Preference saved",
                );
              }}
            >
              {settingsUI.quickActionsVisible ? "Visible" : "Hidden"}
            </Switch>
          </SettingRow>
        </div>
        <div className="mt-4 rounded-lg border border-[var(--app-border)] p-4">
          <div className="text-sm text-[var(--app-text-muted)]">
            Segment-aware default suggestions
          </div>
          <div className="mt-3 grid gap-2">
            {segmentConfig.vestaSuggestions.slice(0, 3).map((suggestion) => (
              <div
                key={suggestion}
                className="rounded-md bg-[var(--app-surface-hover)] px-3 py-2 text-sm"
              >
                {suggestion}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button as={Link} href={ROUTE_PATHS.signals} variant="bordered">
              Open Signals saved views
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderMemorySection = () => (
    <div className="space-y-8">
      <section>
        <SectionHeader
          title="Saved Vesta facts"
          className="mb-4"
          action={<Badge variant="bordered">Read-only v1</Badge>}
        />
        <EmptyState
          icon={Bot}
          title="Vesta hasn't saved any memories yet"
          message="It will start once the AI provider is connected."
        />
        <div className="rounded-lg border border-[var(--app-border)] p-4">
          <div className="font-medium">Memory layer scope</div>
          <div className="mt-1 text-sm text-[var(--app-text-muted)]">
            Memory will show entity, fact, source citation, and last-updated
            fields when the backend is ready. Authoring stays out of v1.
          </div>
          <div className="mt-4">
            <Button
              color="danger"
              variant="bordered"
              startContent={<Trash2 className="h-4 w-4" />}
              onPress={() => setIsWipeMemoryOpen(true)}
            >
              Wipe memory
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderSessionsSection = () => (
    <div className="space-y-8">
      <section>
        <SectionHeader title="Password and authentication" className="mb-4" />
        <div className="grid gap-4 2xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Input
              label="Current password"
              type={settingsUI.showPassword ? "text" : "password"}
              placeholder="Enter current password"
              startContent={<Lock className="h-4 w-4" />}
              endContent={
                <button
                  type="button"
                  onClick={() =>
                    patchSettingsUI({ showPassword: !settingsUI.showPassword })
                  }
                  aria-label={
                    settingsUI.showPassword ? "Hide password" : "Show password"
                  }
                >
                  {settingsUI.showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            <Input
              label="New password"
              type="password"
              placeholder="Enter new password"
              startContent={<Lock className="h-4 w-4" />}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Confirm new password"
              startContent={<Lock className="h-4 w-4" />}
            />
            <Button
              color="primary"
              onPress={() =>
                toast.success("Password update queued.", "Password settings")
              }
            >
              Update password
            </Button>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">2FA Status</span>
              {settingsUI.twoFactorEnabled ? (
                <Badge
                  color="success"
                  startContent={<Check className="h-3 w-3" />}
                >
                  Enabled
                </Badge>
              ) : (
                <Badge
                  color="warning"
                  startContent={<AlertCircle className="h-3 w-3" />}
                >
                  Disabled
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--app-text-muted)]">
              Add an extra layer of security to your account with two-factor
              authentication.
            </p>
            <Button
              className="mt-4"
              color={settingsUI.twoFactorEnabled ? "default" : "primary"}
              variant={settingsUI.twoFactorEnabled ? "bordered" : "solid"}
              onPress={() =>
                patchSettingsUI({
                  twoFactorEnabled: !settingsUI.twoFactorEnabled,
                })
              }
            >
              {settingsUI.twoFactorEnabled ? "Disable" : "Enable"} 2FA
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader title="Active Sessions" className="mb-4" />
        <div className="space-y-3">
          {ACTIVE_SESSIONS.map((session) => (
            <div
              key={session.device}
              className="flex flex-col gap-3 rounded-lg border border-[var(--app-border)] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {session.device}
                  {session.current && (
                    <Badge color="primary" size="sm">
                      Current session
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-[var(--app-text-muted)]">
                  {session.location} · Last active {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <Button
                  variant="bordered"
                  size="sm"
                  color="danger"
                  onPress={() =>
                    toast.success(
                      `${session.device} revoked.`,
                      "Session revoked",
                    )
                  }
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] pt-8">
        <SectionHeader title="Sign out" className="mb-4" />
        <div className="rounded-lg border border-[var(--app-border)] p-4">
          <div className="font-medium">End this browser session</div>
          <div className="mt-1 text-sm text-[var(--app-text-muted)]">
            You will be returned to the public Vestledger site.
          </div>
          <Button
            className="mt-4"
            color="danger"
            variant="bordered"
            startContent={<LogOut className="h-4 w-4" />}
            onPress={() => setIsSignOutOpen(true)}
          >
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "workspace-theme":
        return renderWorkspaceSection();
      case "vesta-ai":
        return renderVestaSection();
      case "notifications-suggestions":
        return renderNotificationsSection();
      case "memory-layer":
        return renderMemorySection();
      case "sessions":
        return renderSessionsSection();
      default:
        return null;
    }
  };

  return (
    <PageScaffold
      routePath={ROUTE_PATHS.settings}
      header={{
        title: "Settings",
        description: "Account, workspace, and assistant preferences",
        icon: SettingsIcon,
        aiSummary: {
          text: aiSummaryText,
        },
        badges: headerBadges,
      }}
    >
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card padding="sm">
            <nav className="space-y-1" aria-label="Settings sections">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      patchSettingsUI({ activeSection: section.id })
                    }
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                        : "hover:bg-[var(--app-surface-hover)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{section.title}</span>
                    </span>
                    <span className="mt-1 block pl-7 text-xs text-[var(--app-text-muted)]">
                      {section.description}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card padding="sm">
            <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              Related routes
            </div>
            <div className="space-y-2">
              <Button
                as={Link}
                href={ROUTE_PATHS.integrations}
                variant="light"
                className="w-full justify-start"
                startContent={<Plug className="h-4 w-4" />}
              >
                Integrations
              </Button>
              <Button
                as={Link}
                href={ROUTE_PATHS.aiTools}
                variant="light"
                className="w-full justify-start"
                startContent={<Sparkles className="h-4 w-4" />}
              >
                AI Tools
              </Button>
            </div>
          </Card>
        </aside>

        <main className="min-w-0">
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4 lg:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <ActiveSectionIcon className="h-5 w-5 text-[var(--app-primary)]" />
                <h2 className="text-xl font-semibold">
                  {activeSectionConfig.title}
                </h2>
              </div>
              <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                {activeSectionConfig.description}
              </p>
            </div>
            {renderSectionContent()}
          </div>
        </main>
      </div>

      <Modal
        title="Reset Vesta preferences"
        isOpen={isResetVestaOpen}
        onOpenChange={setIsResetVestaOpen}
        footer={
          <>
            <Button
              variant="bordered"
              onPress={() => setIsResetVestaOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={resetVestaPreferences}>
              Reset Vesta preferences
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--app-text-muted)]">
          This resets spoken replies, voice capture, panel state, suggestions,
          and quick action visibility to system defaults.
        </p>
      </Modal>

      <Modal
        title="Wipe Vesta memory"
        isOpen={isWipeMemoryOpen}
        onOpenChange={setIsWipeMemoryOpen}
        footer={
          <>
            <Button
              variant="bordered"
              onPress={() => setIsWipeMemoryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmMemoryWipe}
              isDisabled={settingsUI.memoryConfirmText !== "WIPE"}
            >
              Wipe memory
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">
            Vesta memory is empty in v1, but irreversible memory actions still
            require confirmation. Type WIPE to continue.
          </p>
          <Input
            label="Confirmation"
            value={settingsUI.memoryConfirmText}
            onChange={(event) =>
              patchSettingsUI({ memoryConfirmText: event.target.value })
            }
          />
        </div>
      </Modal>

      <Modal
        title="Sign out"
        isOpen={isSignOutOpen}
        onOpenChange={setIsSignOutOpen}
        footer={
          <>
            <Button variant="bordered" onPress={() => setIsSignOutOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleSignOut}>
              Sign out
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--app-text-muted)]">
          Sign out of this Vestledger session and return to the public site.
        </p>
      </Modal>
    </PageScaffold>
  );
}
