"use client";

import { Fragment, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye } from "lucide-react";

import { Badge } from "@/ui/components";
import { PageContainer } from "@/ui/components/PageContainer";
import type { PageContainerProps } from "@/ui/components/PageContainer";
import { useDashboardDensity } from "@/contexts/dashboard-density-context";
import { formatDateTime } from "@/utils/formatting";
import {
  ActionToolbar,
  type ActionState,
  type ActionToolbarAction,
  type ActionToolbarIconAction,
} from "./ActionToolbar";

/**
 * PageShell — common top-level screen scaffold (P2-003).
 *
 * Implements the P2-002 layout grammar:
 *
 *   • S1 page header  → `title`, `subtitle`, `lastUpdated`, `contextBadges`,
 *                       `viewOnly`, `icon` (optional)
 *   • S2 action bar   → `primaryAction`, `secondaryActions`, `iconActions`,
 *                       `overflowActions` (forces UX-04 "one primary action")
 *   • S3 filter bar   → `filters` slot (renders between header/action and content)
 *   • S4 content slot → `children`
 *   • S5 right rail   → `rightRail` slot (mounts S6 drawer or S7 assistant —
 *                       only rendered when `rightRail` is truthy; otherwise
 *                       content spans full width)
 *
 * The shell intentionally caps the title at `text-2xl` per P2-001 T14
 * (operational page heading cap) and forbids more than one primary action
 * per render — secondaries are demoted automatically.
 *
 * Visual parity: when only `title` + `subtitle` are passed (the pattern most
 * pages use today through `PageScaffold`), the rendered output stays in the
 * existing `PageContainer` envelope so migration is non-breaking.
 */

export interface PageShellAction {
  label: string;
  onClick: () => void;
  /**
   * P2-004: declarative state for the action. Defaults to `'allowed'`. When
   * set to `'disabled'`, `'unavailable'`, or `'loading'`, the toolbar
   * renders the appropriate visual treatment and blocks click.
   */
  state?: ActionState;
  /**
   * Reason surfaced as the button `title` when `state` is `'disabled'` or
   * `'unavailable'`.
   */
  reason?: string;
  /**
   * @deprecated Use `state: 'disabled'` + `reason` for policy-denied
   * actions. Retained for backwards compatibility with existing PageShell
   * call sites.
   */
  disabled?: boolean;
  /**
   * @deprecated Use `reason` instead. Retained for backwards compatibility.
   */
  disabledReason?: string;
  /** Aria label override when label is icon-only. */
  ariaLabel?: string;
  /** Optional `data-testid` for tests. */
  testId?: string;
}

export interface PageShellIconAction extends PageShellAction {
  icon: LucideIcon;
}

function toToolbarAction(action: PageShellAction): ActionToolbarAction {
  // Bridge the old `disabled` boolean onto the new state vocabulary so
  // existing callers keep working while P2-004 lands.
  const resolvedState =
    action.state ?? (action.disabled ? "disabled" : "allowed");
  const resolvedReason = action.reason ?? action.disabledReason;
  return {
    label: action.label,
    onClick: action.onClick,
    state: resolvedState,
    reason: resolvedReason,
    ariaLabel: action.ariaLabel,
    testId: action.testId,
  };
}

function toToolbarIconAction(
  action: PageShellIconAction,
): ActionToolbarIconAction {
  return { ...toToolbarAction(action), icon: action.icon };
}

export interface PageShellContextBadge {
  id?: string;
  label: ReactNode;
  /**
   * Semantic tone for the badge background. Maps to the P2-001-approved
   * status colors only; ad-hoc inline chip styling is forbidden per P2-001
   * T22.
   */
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  /** Optional `data-testid` for tests. */
  testId?: string;
}

export interface PageShellProps {
  /** Page title (S1). Capped at text-2xl per P2-001 T14. */
  title: string;
  /** Optional one-line subtitle (≤ 90 chars suggested). */
  subtitle?: string;
  /** Optional decorative icon. Rendered without gradient per P2-001 T20. */
  icon?: LucideIcon;
  /**
   * Last successful data update for the screen. Renders as a freshness chip
   * (P0-009 DTVL-01/DTVL-05) in S1. Pass `null` to suppress the chip when
   * freshness has no meaning for the screen.
   */
  lastUpdated?: Date | string | null;
  /** Context badges (tenant scope, fund scope, status, etc.). */
  contextBadges?: PageShellContextBadge[];
  /**
   * Marks the screen as read-only for the current persona (P2-002 S1 rule).
   * Renders a "View only" badge near the title.
   */
  viewOnly?: boolean;

  /**
   * The screen's single primary action (UX-04). Pass `undefined` when no
   * primary action is available; never pass two.
   */
  primaryAction?: PageShellAction;
  /** Up to three secondary actions. Anything beyond the third is dropped into the overflow menu. */
  secondaryActions?: PageShellAction[];
  /** Up to four familiar icon actions (refresh, share, download, …). */
  iconActions?: PageShellIconAction[];
  /** Additional commands routed to the overflow kebab menu. */
  overflowActions?: PageShellAction[];

  /** Filter bar slot (S3). */
  filters?: ReactNode;
  /**
   * Right rail slot (S5). When provided, mounts to the right of `children`
   * at 480px wide on desktop and stacks below on mobile. When absent, the
   * content slot spans full width.
   */
  rightRail?: ReactNode;
  /**
   * Optional `data-testid` for the outer shell, useful for migrations and
   * snapshot tests.
   */
  testId?: string;
  /** Pass-through container props (max width, padding). */
  containerProps?: Omit<PageContainerProps, "children">;

  children: ReactNode;
}

function freshnessLabel(
  value: Date | string | null | undefined,
): string | null {
  if (value === null) return null;
  if (value === undefined) return null;
  try {
    return `Updated ${formatDateTime(value)}`;
  } catch {
    return null;
  }
}

const TONE_TO_BADGE_CLASS: Record<
  NonNullable<PageShellContextBadge["tone"]>,
  string
> = {
  neutral:
    "bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]",
  info: "bg-[var(--app-info-bg)] text-[var(--app-info)] border border-[var(--app-info-bg)]",
  success:
    "bg-[var(--app-success-bg)] text-[var(--app-success)] border border-[var(--app-success-bg)]",
  warning:
    "bg-[var(--app-warning-bg)] text-[var(--app-warning)] border border-[var(--app-warning-bg)]",
  danger:
    "bg-[var(--app-danger-bg)] text-[var(--app-danger)] border border-[var(--app-danger-bg)]",
};

export function PageShell({
  title,
  subtitle,
  icon: Icon,
  lastUpdated,
  contextBadges,
  viewOnly,
  primaryAction,
  secondaryActions = [],
  iconActions = [],
  overflowActions = [],
  filters,
  rightRail,
  testId,
  containerProps,
  children,
}: PageShellProps) {
  const density = useDashboardDensity();
  const contentId = "page-content";
  const freshness = freshnessLabel(lastUpdated);

  return (
    <PageContainer {...containerProps} data-testid={testId ?? "page-shell"}>
      <a
        href={`#${contentId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--app-surface)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--app-text)] focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* S1 — Page header */}
      <header
        className="flex items-start justify-between gap-4"
        data-testid="page-shell-header"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {Icon && (
            <div className="mt-0.5 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-1.5">
              <Icon className="h-4 w-4 text-[var(--app-text-muted)]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-2xl font-semibold tracking-tight text-[var(--app-text)]"
                data-testid="page-shell-title"
              >
                {title}
              </h1>
              {viewOnly && (
                <Badge
                  size="sm"
                  variant="flat"
                  className={`${TONE_TO_BADGE_CLASS.neutral} inline-flex items-center gap-1`}
                  data-testid="page-shell-view-only"
                >
                  <Eye className="h-3 w-3" />
                  View only
                </Badge>
              )}
              {freshness && (
                <span
                  className="text-xs text-[var(--app-text-subtle)]"
                  data-testid="page-shell-last-updated"
                >
                  {freshness}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                {subtitle}
              </p>
            )}
            {contextBadges && contextBadges.length > 0 && (
              <div
                className="mt-2 flex flex-wrap items-center gap-1.5"
                data-testid="page-shell-context-badges"
              >
                {contextBadges.map((badge, index) => (
                  <Badge
                    key={badge.id ?? index}
                    size="sm"
                    variant="flat"
                    className={TONE_TO_BADGE_CLASS[badge.tone ?? "neutral"]}
                    data-testid={badge.testId}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* S2 — Action bar (delegates to ActionToolbar, P2-004) */}
        <ActionToolbar
          primaryAction={
            primaryAction
              ? {
                  ...toToolbarAction(primaryAction),
                  testId: primaryAction.testId ?? "page-shell-primary-action",
                }
              : undefined
          }
          secondaryActions={secondaryActions.map(toToolbarAction)}
          iconActions={iconActions.map(toToolbarIconAction)}
          overflowActions={overflowActions.map(toToolbarAction)}
          testId="page-shell-action-bar"
          overflowTestId="page-shell-overflow"
        />
      </header>

      {/* S3 — Filter bar */}
      {filters && (
        <div
          className={density.mode === "compact" ? "mt-3" : "mt-4"}
          data-testid="page-shell-filters"
        >
          {filters}
        </div>
      )}

      {/* S4 content + S5 right rail */}
      <div
        id={contentId}
        tabIndex={-1}
        className={`${density.mode === "compact" ? "mt-3" : "mt-4"} ${
          rightRail
            ? "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_480px]"
            : ""
        }`}
      >
        <div className="min-w-0" data-testid="page-shell-content">
          {children}
        </div>
        {rightRail && (
          <Fragment>
            <aside
              className="min-w-0"
              data-testid="page-shell-right-rail"
              aria-label="Detail panel"
            >
              {rightRail}
            </aside>
          </Fragment>
        )}
      </div>
    </PageContainer>
  );
}
