import type { LucideIcon } from "lucide-react";

/**
 * P2-008 — unified contextual tab metadata.
 *
 * Every contextual tab in the application is registered with:
 *
 *   • id          — stable identifier within its workspace
 *   • label       — human-readable label
 *   • icon        — Lucide icon
 *   • route       — parent workspace route (tabs live "at" this route + tab state)
 *   • state       — readiness state per the P0-009 data-truth taxonomy
 *   • permission  — named policy gating visibility (`null` = inherits the workspace policy)
 *   • owner       — workspace identifier this tab belongs to
 *
 * Acceptance criterion for P2-008: "All kept tabs are registered with
 * label, route, state, permission, owner." Making every field except
 * `permission` non-optional is the type-system enforcement of that rule.
 */

export type TabState =
  | "live"
  | "demo"
  | "unavailable"
  | "stale"
  | "needs_review"
  | "ai_generated";

/**
 * Stable workspace identifiers. Aligns 1:1 with `SIDEBAR_CONTEXTUAL_MENUS`
 * ids in `apps/vestledger-ui/src/config/sidebar-contextual-menus.ts` so the
 * sidebar renderer and the tab registry remain interoperable.
 */
export type TabOwner =
  | "portfolio"
  | "analytics"
  | "fund-admin"
  | "lp-management"
  | "lp-portal"
  | "compliance"
  | "tax-center"
  | "valuation-409a"
  | "deal-intelligence"
  | "collaboration"
  | "ai-tools";

export type ContextualTabConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Parent workspace route (e.g. `/portfolio`). Sub-tabs live "at" this route + the tab's selected state. */
  route: string;
  /** Readiness state per P0-009 — drives the data-state badge / unavailable UI. */
  state: TabState;
  /**
   * Named policy that gates this tab. Uses the action vocabulary from
   * P1-006 (`<domain>.<resource>.<verb>`); `null` means the tab inherits
   * the workspace-level policy.
   */
  permission: string | null;
  /** Workspace id this tab belongs to — see {@link TabOwner}. */
  owner: TabOwner;
};
