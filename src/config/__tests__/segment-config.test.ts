import { describe, expect, it } from "vitest";
import {
  getCollapsedDashboardBlocks,
  getDefaultVisibleDashboardBlocks,
  getSegmentConfig,
  getSegmentModuleConfig,
  resolveSegmentKey,
  sortItemsBySegmentNavigation,
} from "../segment-config";

describe("segment-config", () => {
  it("defaults unavailable segment values to Micro VC", () => {
    expect(resolveSegmentKey(undefined)).toBe("micro_vc");
    expect(resolveSegmentKey("unknown")).toBe("micro_vc");
    expect(getSegmentConfig(undefined).label).toBe("Micro VC");
  });

  it("normalizes the supported segment keys and common labels", () => {
    expect(resolveSegmentKey("Angel / Syndicate")).toBe("angel_syndicate");
    expect(resolveSegmentKey("family-office")).toBe("family_office");
    expect(resolveSegmentKey("PE")).toBe("private_equity");
  });

  it("maps module prominence without removing routes", () => {
    expect(getSegmentModuleConfig("angel_syndicate", "funds")?.prominence).toBe(
      "low",
    );
    expect(getSegmentModuleConfig("micro_vc", "funds")?.prominence).toBe(
      "high",
    );
    expect(getSegmentModuleConfig("family_office", "deals")?.prominence).toBe(
      "medium",
    );
    expect(
      getSegmentModuleConfig("private_equity", "workflows")?.prominence,
    ).toBe("high");
  });

  it("orders navigation by segment prominence and configured order", () => {
    const items = [
      { id: "workflows" },
      { id: "funds" },
      { id: "signals" },
      { id: "dashboard" },
      { id: "portfolio" },
      { id: "deals" },
    ];

    expect(
      sortItemsBySegmentNavigation("angel_syndicate", items).map(
        (item) => item.id,
      ),
    ).toEqual([
      "dashboard",
      "portfolio",
      "signals",
      "deals",
      "funds",
      "workflows",
    ]);
  });

  it("separates default-visible and collapsed dashboard blocks", () => {
    expect(getDefaultVisibleDashboardBlocks("angel_syndicate")).toHaveLength(5);
    expect(getCollapsedDashboardBlocks("angel_syndicate")).toHaveLength(5);
    expect(getDefaultVisibleDashboardBlocks("private_equity")).toHaveLength(10);
    expect(getCollapsedDashboardBlocks("private_equity")).toHaveLength(0);
  });
});
