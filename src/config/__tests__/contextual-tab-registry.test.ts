import { describe, it, expect } from "vitest";

import {
  CONTEXTUAL_TAB_REGISTRY,
  REGISTERED_OWNERS,
  tabsForOwner,
  tabsInState,
} from "../contextual-tab-registry";
import {
  SIDEBAR_CONTEXTUAL_MENUS,
  type ContextualMenuId,
} from "../sidebar-contextual-menus";
import type { TabState } from "../contextual-tabs";

/**
 * P2-008 — contextual tab registry tests.
 *
 * Acceptance criterion: "All kept tabs are registered with label, route,
 * state, permission, owner."
 *
 * The TypeScript type for `ContextualTabConfig` already makes the five
 * fields non-optional (except `permission`, which is `string | null`), so
 * a missing field would fail to compile. These tests provide runtime
 * verification plus shape rules (route format, owner-route consistency,
 * unique tab ids per owner, every owner present, etc.).
 */
describe("CONTEXTUAL_TAB_REGISTRY (P2-008)", () => {
  it("is non-empty", () => {
    expect(CONTEXTUAL_TAB_REGISTRY.length).toBeGreaterThan(0);
  });

  it("every tab has a non-empty label", () => {
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      expect(tab.label.length).toBeGreaterThan(0);
    }
  });

  it("every tab has a routable parent route (starts with /)", () => {
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      expect(tab.route.startsWith("/")).toBe(true);
    }
  });

  it("every tab has a declared readiness state", () => {
    const validStates: TabState[] = [
      "live",
      "demo",
      "unavailable",
      "stale",
      "needs_review",
      "ai_generated",
    ];
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      expect(validStates).toContain(tab.state);
    }
  });

  it("every tab has a declared permission slot (string or explicit null)", () => {
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      // The shape is `string | null` — undefined would be a registration bug.
      expect(
        tab.permission === null || typeof tab.permission === "string",
      ).toBe(true);
    }
  });

  it("every tab declares an owner from the registered list", () => {
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      expect(REGISTERED_OWNERS).toContain(tab.owner);
    }
  });

  it("every tab has a Lucide icon component", () => {
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      expect(typeof tab.icon).toBe("object");
    }
  });

  it("tab ids are unique within each owner", () => {
    for (const owner of REGISTERED_OWNERS) {
      const ownerTabs = tabsForOwner(owner);
      const ids = ownerTabs.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every registered owner has at least one tab", () => {
    for (const owner of REGISTERED_OWNERS) {
      expect(tabsForOwner(owner).length).toBeGreaterThan(0);
    }
  });

  it("the registered owners cover every SIDEBAR_CONTEXTUAL_MENUS workspace", () => {
    const menuIds = Object.keys(SIDEBAR_CONTEXTUAL_MENUS) as ContextualMenuId[];
    const missing = menuIds.filter(
      (id) =>
        !REGISTERED_OWNERS.includes(id as (typeof REGISTERED_OWNERS)[number]),
    );
    expect(missing).toEqual([]);
  });

  it("each owner's tabs share the same route", () => {
    for (const owner of REGISTERED_OWNERS) {
      const ownerTabs = tabsForOwner(owner);
      const routes = new Set(ownerTabs.map((t) => t.route));
      expect(routes.size).toBe(1);
    }
  });

  it("the legacy SIDEBAR_CONTEXTUAL_MENUS tab list for each workspace exactly matches the registry", () => {
    // The registry is the source of truth going forward, but the existing
    // sidebar consumes per-workspace tab lists. This guard rejects future
    // drift between the two.
    for (const owner of REGISTERED_OWNERS) {
      const sidebarTabs =
        SIDEBAR_CONTEXTUAL_MENUS[owner as ContextualMenuId].tabs;
      const registryIds = tabsForOwner(owner).map((t) => t.id);
      const sidebarIds = sidebarTabs.map((t) => t.id);
      expect(registryIds).toEqual(sidebarIds);
    }
  });

  it("tabsInState returns only tabs in the requested state", () => {
    const unavailable = tabsInState("unavailable");
    expect(unavailable.length).toBeGreaterThan(0);
    for (const tab of unavailable) {
      expect(tab.state).toBe("unavailable");
    }
    // AI Tools tabs are marked unavailable per P1-004 degraded contract.
    expect(unavailable.every((t) => t.owner === "ai-tools")).toBe(true);
  });

  it("workspace-level permission policies are valid action names where set", () => {
    // Action names follow `<domain>.<resource>[.<verb>]` per P1-006.
    const actionPattern = /^[a-z_]+(\.[a-z_0-9]+)+$/;
    for (const tab of CONTEXTUAL_TAB_REGISTRY) {
      if (tab.permission !== null) {
        expect(tab.permission).toMatch(actionPattern);
      }
    }
  });
});
