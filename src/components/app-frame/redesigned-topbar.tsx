"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { Bell, HelpCircle, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTE_PATHS } from "@/config/routes";
import { openCopilotWithQuery } from "@/hooks/use-copilot-controller";
import { useAppDispatch } from "@/store/hooks";
import { useUIKey } from "@/store/ui";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import { buildPublicWebUrl } from "@/config/env";
import { logger } from "@/lib/logger";
import { cx } from "./cx";

// Frame-level durable copy (spec §Frame Copy): the help control asks Vesta
// for orientation on the current screen rather than opening a help surface.
export const VESTA_HELP_PROMPT = "What can Vesta help me with on this screen?";

export const getInitials = (name?: string) => {
  if (!name) return "GP";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

function TopbarIconButton({
  label,
  children,
  className,
  onClick,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-hover hover:text-app-text dark:text-app-dark-text-muted dark:hover:bg-app-dark-surface-hover dark:hover:text-app-dark-text",
        className,
      )}
    >
      {children}
    </button>
  );
}

export type RedesignedTopbarProps = {
  title: string;
  actions?: ReactNode;
};

export function RedesignedTopbar({ title, actions }: RedesignedTopbarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const initials = getInitials(user?.name);
  const { patch: patchCommandPaletteUI } = useUIKey(
    UI_STATE_KEYS.COMMAND_PALETTE,
    UI_STATE_DEFAULTS.commandPalette,
  );
  const { value: topbarUI, patch: patchTopbarUI } = useUIKey(
    UI_STATE_KEYS.REDESIGNED_TOPBAR,
    UI_STATE_DEFAULTS.redesignedTopbar,
  );
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const closeProfileMenu = useCallback(() => {
    patchTopbarUI({ isProfileOpen: false });
  }, [patchTopbarUI]);

  const handleSignOut = () => {
    sessionStorage.setItem("isLoggingOut", "true");
    logout();
    const redirectUrl = buildPublicWebUrl(window.location.host);
    logger.info("Logging out user and redirecting to public website.", {
      component: "redesigned-topbar",
      redirectUrl,
    });
    window.location.href = redirectUrl;
  };

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-app-border bg-app-surface/40 px-5 py-3 dark:border-app-dark-border dark:bg-app-dark-surface/40 lg:px-8">
      <div className="flex items-center gap-3">
        <TopbarIconButton
          label="Open menu"
          onClick={() => patchCommandPaletteUI({ open: true })}
        >
          <Menu className="h-5 w-5" />
        </TopbarIconButton>
        <span className="text-base font-medium text-app-text dark:text-app-dark-text">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {actions ?? null}
        <TopbarIconButton
          label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </TopbarIconButton>
        <TopbarIconButton
          label="Notifications"
          onClick={() => router.push(ROUTE_PATHS.notifications)}
        >
          <Bell className="h-5 w-5" />
        </TopbarIconButton>
        <TopbarIconButton
          label="Help"
          onClick={() => {
            void openCopilotWithQuery(dispatch, pathname, VESTA_HELP_PROMPT);
          }}
        >
          <HelpCircle className="h-5 w-5" />
        </TopbarIconButton>
        <div
          className="relative ml-1"
          onKeyDown={(event) => {
            if (event.key === "Escape" && topbarUI.isProfileOpen) {
              closeProfileMenu();
              profileButtonRef.current?.focus();
            }
          }}
        >
          <button
            ref={profileButtonRef}
            type="button"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={topbarUI.isProfileOpen}
            onClick={() =>
              patchTopbarUI({ isProfileOpen: !topbarUI.isProfileOpen })
            }
            className="relative inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-app-info dark:focus-visible:ring-app-dark-info"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-app-vesta to-app-primary text-xs font-semibold text-white dark:from-app-dark-vesta dark:to-app-dark-primary">
              {initials}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-app-bg bg-app-success dark:border-app-dark-bg dark:bg-app-dark-success" />
          </button>
          {topbarUI.isProfileOpen ? (
            <>
              <div
                role="menu"
                aria-label="Profile"
                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-app-border bg-app-surface p-2 shadow-lg dark:border-app-dark-border dark:bg-app-dark-surface"
              >
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    closeProfileMenu();
                    router.push(ROUTE_PATHS.settings);
                  }}
                  className="mb-2 w-full rounded-lg border-b border-app-border px-3 py-3 text-left transition hover:bg-app-surface-hover dark:border-app-dark-border dark:hover:bg-app-dark-surface-hover"
                >
                  <span className="block truncate text-sm font-medium text-app-text dark:text-app-dark-text">
                    {user?.name || "User"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-app-text-muted dark:text-app-dark-text-muted">
                    {user?.email || "user@example.com"}
                  </span>
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-app-danger transition hover:bg-app-danger/10 dark:text-app-dark-danger dark:hover:bg-app-dark-danger/15"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
              <div
                className="fixed inset-0 z-40"
                onClick={closeProfileMenu}
                aria-hidden="true"
              />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
