"use client";

import type { ReactNode } from "react";
import { Bell, HelpCircle, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { cx } from "./cx";

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
  const { user } = useAuth();
  const initials = getInitials(user?.name);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-app-border bg-app-surface/40 px-5 py-3 dark:border-app-dark-border dark:bg-app-dark-surface/40 lg:px-8">
      <div className="flex items-center gap-3">
        <TopbarIconButton label="Open menu">
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
        <TopbarIconButton label="Notifications">
          <Bell className="h-5 w-5" />
        </TopbarIconButton>
        <TopbarIconButton label="Help">
          <HelpCircle className="h-5 w-5" />
        </TopbarIconButton>
        <span className="relative ml-1 inline-flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-app-vesta to-app-primary text-xs font-semibold text-white dark:from-app-dark-vesta dark:to-app-dark-primary">
            {initials}
          </span>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-app-bg bg-app-success dark:border-app-dark-bg dark:bg-app-dark-success" />
        </span>
      </div>
    </header>
  );
}
