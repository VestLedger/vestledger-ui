"use client";

import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/ui/components";

/**
 * ActionToolbar — predictable command surface (P2-004).
 *
 * Implements the S2 action-bar contract from P2-002 (layout rules spec):
 *
 *   • exactly one primary action per render (UX-04),
 *   • up to {@link MAX_SECONDARY} secondary actions,
 *   • up to {@link MAX_ICON_ACTIONS} icon actions for familiar commands,
 *   • overflow menu absorbs anything beyond those caps,
 *   • every action explicitly carries one of four states:
 *     `allowed` (default), `disabled` (policy-denied with reason),
 *     `unavailable` (feature not implemented / no-artifact / connector
 *     missing — surfaces a distinct visual treatment per P2-001/P2-005),
 *     or `loading` (in-flight).
 *
 * Used by PageShell (P2-003) and any future page that needs a command bar
 * outside the page header.
 */

export type ActionState = "allowed" | "disabled" | "unavailable" | "loading";

export interface ActionToolbarAction {
  label: string;
  onClick: () => void;
  /**
   * The action's visible state. Determines clickability, styling, and the
   * tooltip surfaced to the user. Defaults to `'allowed'`.
   */
  state?: ActionState;
  /**
   * Human-readable reason surfaced as the button `title` when state is
   * `'disabled'` or `'unavailable'`. Required by the P2-002 S2 rule that
   * disabled buttons must explain why.
   */
  reason?: string;
  /** Aria label override when label is icon-only. */
  ariaLabel?: string;
  /** Optional `data-testid` for tests. */
  testId?: string;
}

export interface ActionToolbarIconAction extends ActionToolbarAction {
  icon: LucideIcon;
}

export interface ActionToolbarProps {
  /** The single primary action. Pass `undefined` when no primary action is offered. */
  primaryAction?: ActionToolbarAction;
  /** Up to {@link MAX_SECONDARY} secondary actions; extras demote to overflow. */
  secondaryActions?: ActionToolbarAction[];
  /** Up to {@link MAX_ICON_ACTIONS} icon actions; extras demote to overflow. */
  iconActions?: ActionToolbarIconAction[];
  /** Additional commands routed straight to the overflow menu. */
  overflowActions?: ActionToolbarAction[];
  /** Aria label for the toolbar landmark. */
  ariaLabel?: string;
  /** Optional `data-testid` override; defaults to `'action-toolbar'`. */
  testId?: string;
  /**
   * Optional `data-testid` for the overflow disclosure button. Defaults to
   * `${testId}-overflow`. Exposed so wrapping composites (e.g. PageShell)
   * can keep stable test identifiers across the delegated toolbar.
   */
  overflowTestId?: string;
}

export const MAX_SECONDARY = 3;
export const MAX_ICON_ACTIONS = 4;

const UNAVAILABLE_DEFAULT_REASON =
  "Unavailable in this environment. Backend support pending.";

function effectiveState(action: ActionToolbarAction): ActionState {
  return action.state ?? "allowed";
}

function actionTitle(action: ActionToolbarAction): string | undefined {
  const state = effectiveState(action);
  if (state === "disabled") return action.reason;
  if (state === "unavailable")
    return action.reason ?? UNAVAILABLE_DEFAULT_REASON;
  if (state === "loading") return action.reason ?? "Working…";
  return undefined;
}

function isBlocked(action: ActionToolbarAction): boolean {
  const state = effectiveState(action);
  return state === "disabled" || state === "unavailable" || state === "loading";
}

function dataState(action: ActionToolbarAction): ActionState {
  return effectiveState(action);
}

export function ActionToolbar({
  primaryAction,
  secondaryActions = [],
  iconActions = [],
  overflowActions = [],
  ariaLabel = "Page actions",
  testId = "action-toolbar",
  overflowTestId,
}: ActionToolbarProps) {
  const visibleSecondary = secondaryActions.slice(0, MAX_SECONDARY);
  const demotedSecondary = secondaryActions.slice(MAX_SECONDARY);
  const visibleIconActions = iconActions.slice(0, MAX_ICON_ACTIONS);
  const demotedIconActions = iconActions.slice(MAX_ICON_ACTIONS);

  const overflow: ActionToolbarAction[] = [
    ...overflowActions,
    ...demotedSecondary,
    ...demotedIconActions,
  ];

  const hasAnything =
    primaryAction !== undefined ||
    visibleSecondary.length > 0 ||
    visibleIconActions.length > 0 ||
    overflow.length > 0;

  if (!hasAnything) return null;

  return (
    <div
      className="flex items-center gap-2 shrink-0"
      role="toolbar"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {visibleIconActions.map((action, index) => {
        const IconComp = action.icon;
        const state = effectiveState(action);
        return (
          <Button
            key={`icon-${action.testId ?? index}`}
            isIconOnly
            size="sm"
            variant={state === "unavailable" ? "flat" : "light"}
            isDisabled={isBlocked(action)}
            isLoading={state === "loading"}
            onPress={action.onClick}
            aria-label={action.ariaLabel ?? action.label}
            title={actionTitle(action) ?? action.label}
            data-testid={action.testId}
            data-state={dataState(action)}
            className={state === "unavailable" ? "opacity-60" : undefined}
          >
            {state !== "loading" && <IconComp className="h-4 w-4" />}
          </Button>
        );
      })}

      {visibleSecondary.map((action, index) => {
        const state = effectiveState(action);
        return (
          <Button
            key={`secondary-${action.testId ?? index}`}
            size="sm"
            variant="bordered"
            isDisabled={isBlocked(action)}
            isLoading={state === "loading"}
            onPress={action.onClick}
            title={actionTitle(action)}
            data-testid={action.testId}
            data-state={dataState(action)}
            className={state === "unavailable" ? "opacity-60" : undefined}
          >
            {action.label}
          </Button>
        );
      })}

      {primaryAction && (
        <Button
          size="sm"
          color="primary"
          isDisabled={isBlocked(primaryAction)}
          isLoading={effectiveState(primaryAction) === "loading"}
          onPress={primaryAction.onClick}
          title={actionTitle(primaryAction)}
          data-testid={primaryAction.testId ?? "action-toolbar-primary"}
          data-state={dataState(primaryAction)}
          className={
            effectiveState(primaryAction) === "unavailable"
              ? "opacity-60"
              : undefined
          }
        >
          {primaryAction.label}
        </Button>
      )}

      {overflow.length > 0 && (
        <details className="relative">
          <summary
            className="list-none rounded-md border border-[var(--app-border)] p-1.5 cursor-pointer hover:bg-[var(--app-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
            aria-label="More actions"
            data-testid={overflowTestId ?? `${testId}-overflow`}
          >
            <MoreHorizontal className="h-4 w-4 text-[var(--app-text-muted)]" />
          </summary>
          <ul
            className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-1 shadow-[var(--app-shadow-1)]"
            role="menu"
          >
            {overflow.map((action, index) => {
              const state = effectiveState(action);
              const blocked = isBlocked(action);
              return (
                <li key={`overflow-${action.testId ?? index}`}>
                  <button
                    type="button"
                    onClick={action.onClick}
                    disabled={blocked}
                    title={actionTitle(action)}
                    className="block w-full text-left rounded-sm px-2 py-1 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:cursor-not-allowed disabled:text-[var(--app-text-subtle)]"
                    data-testid={action.testId}
                    data-state={dataState(action)}
                    role="menuitem"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{action.label}</span>
                      {state === "unavailable" && (
                        <span className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
                          Unavailable
                        </span>
                      )}
                      {state === "loading" && (
                        <span className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
                          Working…
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
