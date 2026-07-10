import { describe, expect, it } from "vitest";
import {
  FAMILY_OFFICE_GROUP_ID,
  NAV_GROUP_IDS,
  NAV_STAGES,
} from "../navigation-stages";

describe("navigation stages", () => {
  it("lists the 14 GP lifecycle stages in spec order", () => {
    expect(NAV_STAGES.map((s) => s.label)).toEqual([
      "Overview",
      "Raise & LP Onboarding",
      "Pipeline",
      "Deal Intelligence",
      "Deal Review",
      "Deal Execution & Closing",
      "Capital & Fund Admin",
      "Portfolio",
      "Analytics & Valuation",
      "Reporting & LPs",
      "Tax & Reporting",
      "Compliance & Records",
      "Network & Service Providers",
      "Data & Integrations",
    ]);
  });

  it("has unique ids and excludes the family-office group from stages", () => {
    const ids = NAV_STAGES.map((s) => s.id);
    expect(new Set(ids).size).toBe(14);
    expect(ids).not.toContain(FAMILY_OFFICE_GROUP_ID);
    expect(NAV_GROUP_IDS.has(FAMILY_OFFICE_GROUP_ID)).toBe(true);
    expect(NAV_GROUP_IDS.size).toBe(15);
  });
});
