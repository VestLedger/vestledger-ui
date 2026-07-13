import { describe, expect, it } from "vitest";
import { ALL_WORKFLOW_PATTERNS, WORKFLOW_INDEX } from "../workflow-index";
import { NAV_QUICK_ACTIONS } from "../navigation-destinations";
import { ANALYTICS_TABS } from "../analytics-tabs";
import { COLLABORATION_TABS } from "../collaboration-tabs";
import { COMPLIANCE_TABS } from "../compliance-tabs";
import { DEAL_INTELLIGENCE_TABS } from "../deal-intelligence-tabs";
import { FUND_ADMIN_TABS } from "../fund-admin-tabs";
import { LP_MANAGEMENT_TABS } from "../lp-management-tabs";
import { LP_PORTAL_TABS } from "../lp-portal-tabs";
import { NAV_GROUP_IDS } from "../navigation-stages";
import { NAV_DESTINATIONS } from "../navigation-destinations";
import { PORTFOLIO_TABS } from "../portfolio-tabs";
import { ROUTE_PATHS } from "../routes";
import { TAX_CENTER_TABS } from "../tax-center-tabs";
import { VALUATION_409A_TABS } from "../valuation-409a-tabs";

const TAB_IDS_BY_ROUTE: Record<string, Set<string>> = {
  [ROUTE_PATHS.dealIntelligence]: new Set(
    DEAL_INTELLIGENCE_TABS.map((t) => t.id),
  ),
  [ROUTE_PATHS.fundAdmin]: new Set(FUND_ADMIN_TABS.map((t) => t.id)),
  [ROUTE_PATHS.portfolio]: new Set(PORTFOLIO_TABS.map((t) => t.id)),
  [ROUTE_PATHS.analytics]: new Set(ANALYTICS_TABS.map((t) => t.id)),
  [ROUTE_PATHS.valuations409a]: new Set(VALUATION_409A_TABS.map((t) => t.id)),
  [ROUTE_PATHS.lpManagement]: new Set(LP_MANAGEMENT_TABS.map((t) => t.id)),
  [ROUTE_PATHS.lpPortal]: new Set(LP_PORTAL_TABS.map((t) => t.id)),
  [ROUTE_PATHS.taxCenter]: new Set(TAX_CENTER_TABS.map((t) => t.id)),
  [ROUTE_PATHS.compliance]: new Set(COMPLIANCE_TABS.map((t) => t.id)),
  [ROUTE_PATHS.collaboration]: new Set(COLLABORATION_TABS.map((t) => t.id)),
};

describe("navigation destinations — structure", () => {
  const knownRoutes = new Set<string>(Object.values(ROUTE_PATHS));

  it("has unique ids", () => {
    const ids = NAV_DESTINATIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only known stages and routes", () => {
    for (const d of NAV_DESTINATIONS) {
      expect(NAV_GROUP_IDS.has(d.stage), d.id).toBe(true);
      expect(knownRoutes.has(d.route), `${d.id} route ${d.route}`).toBe(true);
      if (d.fallbackRoute) {
        expect(knownRoutes.has(d.fallbackRoute), d.id).toBe(true);
      }
    }
  });

  it("existing destinations with a tabId point at real tabs", () => {
    for (const d of NAV_DESTINATIONS) {
      if (d.coverageState === "existing" && d.tabId) {
        const tabs = TAB_IDS_BY_ROUTE[d.route];
        expect(tabs, `${d.id}: no tab config for ${d.route}`).toBeDefined();
        expect(tabs.has(d.tabId), `${d.id}: tab ${d.tabId}`).toBe(true);
      }
    }
  });

  it("non-existing destinations always carry a fallbackRoute", () => {
    for (const d of NAV_DESTINATIONS) {
      if (d.coverageState !== "existing") {
        expect(d.fallbackRoute, d.id).toBeDefined();
      }
    }
  });

  it("planned tabs are not already real tabs (no mislabels)", () => {
    for (const d of NAV_DESTINATIONS) {
      if (d.coverageState === "needs_tab" && d.tabId) {
        const tabs = TAB_IDS_BY_ROUTE[d.route];
        if (tabs) expect(tabs.has(d.tabId), d.id).toBe(false);
      }
    }
  });

  it("only /home and /pipeline are redesigned-frame ready", () => {
    for (const d of NAV_DESTINATIONS) {
      const expected =
        d.route === ROUTE_PATHS.dashboard || d.route === ROUTE_PATHS.pipeline;
      expect(d.isRedesignedFrameReady, d.id).toBe(expected);
    }
  });
});

describe("navigation destinations — exhaustive coverage", () => {
  it("claims every workflow pattern at least once (71/71)", () => {
    const claimed = new Set(
      NAV_DESTINATIONS.flatMap((d) => [...d.workflowPatterns]),
    );
    const missing = ALL_WORKFLOW_PATTERNS.filter((p) => !claimed.has(p));
    expect(missing).toEqual([]);
  });

  it("therefore claims every workflow id (467/467)", () => {
    const claimedPatterns = new Set(
      NAV_DESTINATIONS.flatMap((d) => [...d.workflowPatterns]),
    );
    const claimedIds = new Set<string>();
    for (const [pattern, entry] of Object.entries(WORKFLOW_INDEX.patterns)) {
      if (claimedPatterns.has(pattern)) {
        for (const id of entry.workflowIds) claimedIds.add(id);
      }
    }
    expect(claimedIds.size).toBe(467);
  });

  it("does not claim unknown patterns", () => {
    const known = new Set(ALL_WORKFLOW_PATTERNS);
    for (const d of NAV_DESTINATIONS) {
      for (const p of d.workflowPatterns) {
        expect(known.has(p), `${d.id} claims unknown pattern ${p}`).toBe(true);
      }
    }
  });

  it("family-office destinations are deferred with fallbacks", () => {
    const fo = NAV_DESTINATIONS.filter((d) => d.stage === "family-office");
    expect(fo.length).toBeGreaterThanOrEqual(3);
    for (const d of fo) {
      expect(d.coverageState).toBe("deferred_persona");
      expect(d.personaScope).toBe("family_office");
      expect(d.fallbackRoute).toBeDefined();
    }
  });

  it("only family-office destinations use deferred_persona", () => {
    for (const d of NAV_DESTINATIONS) {
      if (d.coverageState === "deferred_persona") {
        expect(d.stage).toBe("family-office");
      }
    }
  });

  it("every stage has at least one destination", () => {
    const stagesWithDest = new Set<string>(
      NAV_DESTINATIONS.map((d) => d.stage),
    );
    for (const stage of [
      "overview",
      "raise",
      "pipeline",
      "deal-intelligence",
      "deal-review",
      "deal-execution",
      "fund-admin",
      "portfolio",
      "analytics",
      "reporting-lps",
      "tax",
      "compliance",
      "network",
      "data-integrations",
      "family-office",
    ]) {
      expect(stagesWithDest.has(stage), stage).toBe(true);
    }
  });

  it("defines the six quick actions", () => {
    expect(NAV_QUICK_ACTIONS.map((a) => a.id)).toEqual([
      "add-deal",
      "add-contact",
      "create-capital-call",
      "start-ic-memo",
      "upload-evidence",
      "ask-vesta",
    ]);
  });
});
