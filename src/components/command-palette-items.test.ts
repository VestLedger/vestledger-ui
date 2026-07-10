import { describe, expect, it } from "vitest";
import {
  coverageBadge,
  destinationsForStage,
  destinationSearchKeywords,
  isDestinationVisible,
  resolvePaletteView,
  searchableDestinations,
} from "./command-palette-items";
import { NAV_DESTINATIONS } from "@/config/navigation-destinations";

describe("resolvePaletteView", () => {
  it("routes between the three views", () => {
    expect(resolvePaletteView("", null)).toBe("root");
    expect(resolvePaletteView("", "pipeline")).toBe("stage");
    expect(resolvePaletteView("capital call", null)).toBe("search");
    expect(resolvePaletteView("capital call", "pipeline")).toBe("search");
    expect(resolvePaletteView("   ", null)).toBe("root");
  });
});

describe("role filtering", () => {
  // /pipeline has no route access rule (open to all), so use /deal-intelligence
  // which is restricted to ["gp", "analyst", "strategic_partner"]
  it("gp sees deal-intelligence destinations, lp does not", () => {
    const dest = NAV_DESTINATIONS.find((d) => d.id === "di-page")!;
    expect(isDestinationVisible(dest, "gp")).toBe(true);
    expect(isDestinationVisible(dest, "lp")).toBe(false);
  });

  it("stage listing excludes deferred persona entries", () => {
    for (const stage of ["overview", "raise", "pipeline"] as const) {
      for (const d of destinationsForStage(stage, "gp")) {
        expect(d.coverageState).not.toBe("deferred_persona");
      }
    }
  });

  it("search includes deferred persona entries", () => {
    const ids = searchableDestinations("gp").map((d) => d.id);
    expect(ids).toContain("fo-tax-estate");
  });
});

describe("search keywords", () => {
  it("includes matrix workflow language", () => {
    const compliance = NAV_DESTINATIONS.find((d) => d.id === "comp-page")!;
    const kw = destinationSearchKeywords(compliance).join(" ");
    expect(kw).toContain("Regulatory filing and jurisdiction reporting");
    expect(kw).toContain("Compliance & Records");
  });
});

describe("coverageBadge", () => {
  it("maps states to user-safe labels", () => {
    expect(coverageBadge("existing")).toBeNull();
    expect(coverageBadge("needs_tab")).toBe("Planned");
    expect(coverageBadge("needs_shell")).toBe("Planned");
    expect(coverageBadge("deferred_persona")).toBe("Future");
  });
});
