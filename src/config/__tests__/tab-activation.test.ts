import { describe, expect, it } from "vitest";
import { ROUTE_PATHS } from "../routes";
import { TAB_ACTIVATION_BY_ROUTE } from "../tab-activation";

describe("tab activation map", () => {
  it("maps only real routes", () => {
    const known = new Set<string>(Object.values(ROUTE_PATHS));
    for (const route of Object.keys(TAB_ACTIVATION_BY_ROUTE)) {
      expect(known.has(route)).toBe(true);
    }
  });

  it("covers every tab-config page the registry deep-links into", () => {
    for (const route of [
      ROUTE_PATHS.dealIntelligence,
      ROUTE_PATHS.fundAdmin,
      ROUTE_PATHS.portfolio,
      ROUTE_PATHS.analytics,
      ROUTE_PATHS.valuations409a,
      ROUTE_PATHS.lpManagement,
      ROUTE_PATHS.lpPortal,
      ROUTE_PATHS.taxCenter,
      ROUTE_PATHS.compliance,
      ROUTE_PATHS.collaboration,
    ]) {
      expect(TAB_ACTIVATION_BY_ROUTE[route]).toBeDefined();
      expect(TAB_ACTIVATION_BY_ROUTE[route].uiKey.length).toBeGreaterThan(0);
      expect(TAB_ACTIVATION_BY_ROUTE[route].field.length).toBeGreaterThan(0);
    }
  });
});
