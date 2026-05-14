import { describe, it, expect } from "vitest";

import { PRIMARY_DESTINATIONS } from "../sidebar-grouped";
import {
  SIDEBAR_CONTEXTUAL_MENUS,
  type ContextualMenuId,
} from "@/config/sidebar-contextual-menus";
import { ROUTE_PATHS } from "@/config/routes";
import type { UserRole } from "@/types/auth";

/**
 * P2-007 — simplified sidebar IA navigation tests.
 *
 * Acceptance: "Primary sidebar has no more than 8 top-level destinations."
 *
 * These tests guard the contract in `PRIMARY_DESTINATIONS` so any future
 * edit that violates the IA fails at unit time. The component itself
 * filters this array by `allowedRoles`, so a passing array contract plus
 * a passing role-filter test is sufficient.
 */

const ALL_ROLES: UserRole[] = [
  "gp",
  "analyst",
  "ops",
  "ir",
  "researcher",
  "lp",
  "auditor",
  "service_provider",
  "strategic_partner",
];

function visibleForRole(role: UserRole) {
  return PRIMARY_DESTINATIONS.filter((d) => d.allowedRoles.includes(role));
}

describe("PRIMARY_DESTINATIONS (P2-007)", () => {
  it("declares at most 8 top-level destinations", () => {
    expect(PRIMARY_DESTINATIONS.length).toBeLessThanOrEqual(8);
  });

  it("declares exactly 8 destinations matching the design spec", () => {
    expect(PRIMARY_DESTINATIONS.map((d) => d.id)).toEqual([
      "dashboard",
      "screening",
      "diligence-evidence",
      "decisions-memos",
      "monitoring",
      "reporting-lp-proof",
      "fund-compliance-operations",
      "governance-admin",
    ]);
  });

  it("every destination carries a non-empty label and routable href", () => {
    for (const d of PRIMARY_DESTINATIONS) {
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.href.startsWith("/")).toBe(true);
    }
  });

  it("the Dashboard label is preserved as 'Dashboard' (CLAUDE.md rule)", () => {
    const dashboard = PRIMARY_DESTINATIONS.find((d) => d.id === "dashboard");
    expect(dashboard?.label).toBe("Dashboard");
    expect(dashboard?.href).toBe(ROUTE_PATHS.dashboard);
  });

  it("every contextualMenuId references an existing contextual menu config", () => {
    for (const d of PRIMARY_DESTINATIONS) {
      if (d.contextualMenuId) {
        expect(SIDEBAR_CONTEXTUAL_MENUS[d.contextualMenuId]).toBeDefined();
      }
    }
  });

  it("destinations have unique ids", () => {
    const ids = PRIMARY_DESTINATIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every role sees at most 8 primaries after gating", () => {
    for (const role of ALL_ROLES) {
      const visible = visibleForRole(role);
      expect(visible.length).toBeLessThanOrEqual(8);
    }
  });

  it("GP sees the full set of 8 primaries", () => {
    expect(visibleForRole("gp").length).toBe(8);
  });

  it("LP sees the LP-scoped subset (Dashboard + Monitoring + Reporting & LP Proof)", () => {
    const ids = visibleForRole("lp").map((d) => d.id);
    expect(ids).toContain("dashboard");
    expect(ids).toContain("monitoring");
    expect(ids).toContain("reporting-lp-proof");
    // LP must NOT see operations / governance / decisions / diligence /
    // screening on the daily path.
    expect(ids).not.toContain("fund-compliance-operations");
    expect(ids).not.toContain("governance-admin");
    expect(ids).not.toContain("decisions-memos");
    expect(ids).not.toContain("diligence-evidence");
    expect(ids).not.toContain("screening");
  });

  it("Service Provider sees only Dashboard + Fund & Compliance Operations", () => {
    const ids = visibleForRole("service_provider").map((d) => d.id);
    expect(ids).toEqual(["dashboard", "fund-compliance-operations"]);
  });

  it("Strategic Partner sees Dashboard + Screening + Diligence & Evidence", () => {
    const ids = visibleForRole("strategic_partner").map((d) => d.id);
    expect(ids).toEqual(["dashboard", "screening", "diligence-evidence"]);
  });

  it("AI Tools is NOT a top-level primary destination (UX-06, P0-002 rule 4)", () => {
    // Compare via string coercion so the test does not rely on the
    // `PrimaryDestinationId` union including "ai-tools".
    expect(
      PRIMARY_DESTINATIONS.some((d) => (d.id as string) === "ai-tools"),
    ).toBe(false);
    expect(
      PRIMARY_DESTINATIONS.some((d) => d.href === ROUTE_PATHS.aiTools),
    ).toBe(false);
  });

  it("AI Tools remains reachable as a sub-leaf under Governance & Admin (behaviour preservation)", () => {
    const governance = PRIMARY_DESTINATIONS.find(
      (d) => d.id === "governance-admin",
    );
    const aiTools = governance?.subLeaves?.find((l) => l.id === "ai-tools");
    expect(aiTools).toBeDefined();
    expect(aiTools?.href).toBe(ROUTE_PATHS.aiTools);
    expect(aiTools?.contextualMenuId).toBe("ai-tools");
  });

  it("Settings is NOT a top-level primary destination — it remains a footer entry and a sub-leaf under Governance & Admin", () => {
    const settingsAsPrimary = PRIMARY_DESTINATIONS.find(
      (d) => (d.id as string) === "settings",
    );
    expect(settingsAsPrimary).toBeUndefined();

    const governance = PRIMARY_DESTINATIONS.find(
      (d) => d.id === "governance-admin",
    );
    expect(governance?.subLeaves?.some((l) => l.id === "settings")).toBe(true);
  });
});

/**
 * Behaviour-preservation tests (P2-007).
 *
 * The user requirement: every existing `SIDEBAR_CONTEXTUAL_MENUS` config
 * must remain reachable from the sidebar — either directly by clicking a
 * primary that opens it, or by clicking a sub-leaf inside an expanded
 * primary. These tests guard against orphaning any contextual menu in
 * future edits.
 */
describe("Sidebar behaviour preservation (P2-007)", () => {
  function collectReachableContextualIds(): Set<ContextualMenuId> {
    const reachable = new Set<ContextualMenuId>();
    for (const d of PRIMARY_DESTINATIONS) {
      if (d.contextualMenuId) reachable.add(d.contextualMenuId);
      for (const leaf of d.subLeaves ?? []) {
        if (leaf.contextualMenuId) reachable.add(leaf.contextualMenuId);
      }
    }
    return reachable;
  }

  it("every contextual menu config is reachable from the sidebar", () => {
    const reachable = collectReachableContextualIds();
    const allIds = Object.keys(SIDEBAR_CONTEXTUAL_MENUS) as ContextualMenuId[];
    const orphaned = allIds.filter((id) => !reachable.has(id));
    expect(orphaned).toEqual([]);
  });

  it("every sub-leaf has a routable href", () => {
    for (const d of PRIMARY_DESTINATIONS) {
      for (const leaf of d.subLeaves ?? []) {
        expect(leaf.href.startsWith("/")).toBe(true);
        expect(leaf.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("Screening exposes Pipeline / Dealflow Review / Deal Intelligence / Contacts", () => {
    const screening = PRIMARY_DESTINATIONS.find((d) => d.id === "screening");
    const leafIds = (screening?.subLeaves ?? []).map((l) => l.id);
    expect(leafIds).toEqual([
      "pipeline",
      "dealflow-review",
      "deal-intelligence",
      "contacts",
    ]);
    const dealIntel = screening?.subLeaves?.find(
      (l) => l.id === "deal-intelligence",
    );
    expect(dealIntel?.contextualMenuId).toBe("deal-intelligence");
  });

  it("Monitoring exposes Portfolio / Analytics / Waterfall with their existing contextual ids", () => {
    const monitoring = PRIMARY_DESTINATIONS.find((d) => d.id === "monitoring");
    const leaves = monitoring?.subLeaves ?? [];
    expect(leaves.find((l) => l.id === "portfolio")?.contextualMenuId).toBe(
      "portfolio",
    );
    expect(leaves.find((l) => l.id === "analytics")?.contextualMenuId).toBe(
      "analytics",
    );
    expect(leaves.find((l) => l.id === "waterfall")?.contextualMenuId).toBe(
      undefined,
    );
  });

  it("Reporting & LP Proof exposes Reports / LP Management / LP Portal", () => {
    const reporting = PRIMARY_DESTINATIONS.find(
      (d) => d.id === "reporting-lp-proof",
    );
    const leafIds = (reporting?.subLeaves ?? []).map((l) => l.id);
    expect(leafIds).toEqual(["reports", "lp-management", "lp-portal"]);
    expect(
      reporting?.subLeaves?.find((l) => l.id === "lp-management")
        ?.contextualMenuId,
    ).toBe("lp-management");
    expect(
      reporting?.subLeaves?.find((l) => l.id === "lp-portal")?.contextualMenuId,
    ).toBe("lp-portal");
  });

  it("Fund & Compliance Operations exposes Fund Admin / Compliance / Tax Center / 409A / Audit Trail with their contextual ids", () => {
    const fco = PRIMARY_DESTINATIONS.find(
      (d) => d.id === "fund-compliance-operations",
    );
    const leaves = fco?.subLeaves ?? [];
    expect(leaves.map((l) => l.id)).toEqual([
      "fund-admin",
      "compliance",
      "tax-center",
      "409a-valuations",
      "audit-trail",
    ]);
    expect(leaves.find((l) => l.id === "fund-admin")?.contextualMenuId).toBe(
      "fund-admin",
    );
    expect(leaves.find((l) => l.id === "compliance")?.contextualMenuId).toBe(
      "compliance",
    );
    expect(leaves.find((l) => l.id === "tax-center")?.contextualMenuId).toBe(
      "tax-center",
    );
    expect(
      leaves.find((l) => l.id === "409a-valuations")?.contextualMenuId,
    ).toBe("valuation-409a");
  });

  it("Governance & Admin exposes Settings / Integrations / AI Tools", () => {
    const gov = PRIMARY_DESTINATIONS.find((d) => d.id === "governance-admin");
    const leafIds = (gov?.subLeaves ?? []).map((l) => l.id);
    expect(leafIds).toEqual(["settings", "integrations", "ai-tools"]);
  });

  it("primaries that consolidate workspaces declare subLeaves; primaries that map 1:1 use contextualMenuId", () => {
    const primariesWithSubLeaves = PRIMARY_DESTINATIONS.filter(
      (d) => (d.subLeaves?.length ?? 0) > 0,
    ).map((d) => d.id);
    const primariesWithContextual = PRIMARY_DESTINATIONS.filter(
      (d) => d.contextualMenuId !== undefined,
    ).map((d) => d.id);

    // subLeaves and contextualMenuId are mutually exclusive on a primary
    // (each primary uses exactly one of the two opening mechanisms or is
    // a direct route).
    const overlap = primariesWithSubLeaves.filter((id) =>
      primariesWithContextual.includes(id),
    );
    expect(overlap).toEqual([]);
  });

  /**
   * Fluidity tests (P2-007): the sub-leaves area must
   *   • stay HIDDEN on a route that does not match any sub-leaf,
   *   • AUTO-EXPAND when the route matches a sub-leaf,
   *   • match the parent primary's id when auto-expanded.
   * The implementation derives expansion from pathname; we mirror that
   * derivation here so the contract is type-checked.
   */
  function autoExpandedPrimaryFor(pathname: string) {
    for (const primary of PRIMARY_DESTINATIONS) {
      for (const leaf of primary.subLeaves ?? []) {
        if (pathname === leaf.href || pathname.startsWith(`${leaf.href}/`)) {
          return primary.id;
        }
      }
    }
    return null;
  }

  it("auto-expand is null on a parent / direct-route page (sub-leaves area hidden)", () => {
    expect(autoExpandedPrimaryFor("/home")).toBeNull();
    expect(autoExpandedPrimaryFor("/documents")).toBeNull();
  });

  it("auto-expand resolves to the parent primary on a child route", () => {
    expect(autoExpandedPrimaryFor("/compliance")).toBe(
      "fund-compliance-operations",
    );
    expect(autoExpandedPrimaryFor("/tax-center")).toBe(
      "fund-compliance-operations",
    );
    expect(autoExpandedPrimaryFor("/portfolio")).toBe("monitoring");
    expect(autoExpandedPrimaryFor("/analytics")).toBe("monitoring");
    expect(autoExpandedPrimaryFor("/waterfall")).toBe("monitoring");
    expect(autoExpandedPrimaryFor("/lp-management")).toBe("reporting-lp-proof");
    expect(autoExpandedPrimaryFor("/deal-intelligence")).toBe("screening");
    expect(autoExpandedPrimaryFor("/integrations")).toBe("governance-admin");
    expect(autoExpandedPrimaryFor("/ai-tools")).toBe("governance-admin");
  });

  it("auto-expand also matches nested child routes (deep links)", () => {
    expect(autoExpandedPrimaryFor("/portfolio/health")).toBe("monitoring");
    expect(autoExpandedPrimaryFor("/compliance/2026-q1")).toBe(
      "fund-compliance-operations",
    );
  });

  it("auto-expand is null for routes that are not sub-leaves", () => {
    expect(autoExpandedPrimaryFor("/settings")).toBe("governance-admin"); // settings IS a leaf
    expect(autoExpandedPrimaryFor("/superadmin")).toBeNull();
    expect(autoExpandedPrimaryFor("/login")).toBeNull();
  });

  it("sub-leaf labels match the legacy sidebar leaf labels", () => {
    // Spot-check against the old `navigationStructure` labels so legacy
    // muscle memory and any test selectors that match by visible text
    // keep working.
    const legacyLabels: Record<string, string> = {
      pipeline: "Pipeline",
      "dealflow-review": "Dealflow Review",
      "deal-intelligence": "Deal Intelligence",
      contacts: "Contacts",
      portfolio: "Portfolio",
      analytics: "Analytics",
      waterfall: "Waterfall",
      "fund-admin": "Fund Admin",
      "lp-management": "LP Management",
      "audit-trail": "Audit Trail",
      compliance: "Compliance",
      "409a-valuations": "409A Valuations",
      "tax-center": "Tax Center",
      "lp-portal": "LP Portal",
      reports: "Reports",
      integrations: "Integrations",
      settings: "Settings",
      "ai-tools": "AI Tools",
    };
    for (const d of PRIMARY_DESTINATIONS) {
      for (const leaf of d.subLeaves ?? []) {
        const expected = legacyLabels[leaf.id];
        if (expected) {
          expect(leaf.label).toBe(expected);
        }
      }
    }
  });
});
