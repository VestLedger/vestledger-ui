import { describe, expect, it } from "vitest";
import { NAV_GROUP_IDS } from "../navigation-stages";
import {
  ALL_WORKFLOW_PATTERNS,
  patternsForStage,
  WORKFLOW_INDEX,
} from "../workflow-index";

describe("workflow index", () => {
  it("covers all 467 MVP rows across 72 patterns", () => {
    expect(WORKFLOW_INDEX.totalRows).toBe(467);
    expect(ALL_WORKFLOW_PATTERNS).toHaveLength(72);
    const idCount = Object.values(WORKFLOW_INDEX.patterns).reduce(
      (sum, p) => sum + p.workflowIds.length,
      0,
    );
    expect(idCount).toBe(467);
  });

  it("only references known stage/group ids", () => {
    for (const entry of Object.values(WORKFLOW_INDEX.patterns)) {
      expect(NAV_GROUP_IDS.has(entry.primaryStage)).toBe(true);
      for (const s of entry.secondaryStages) {
        expect(NAV_GROUP_IDS.has(s)).toBe(true);
      }
    }
  });

  it("partitions workflow ids (no id claimed by two patterns)", () => {
    const seen = new Set<string>();
    for (const entry of Object.values(WORKFLOW_INDEX.patterns)) {
      for (const id of entry.workflowIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
  });

  it("patternsForStage returns primary assignments", () => {
    const compliance = patternsForStage("compliance");
    expect(compliance).toContain(
      "Regulatory filing and jurisdiction reporting",
    );
    expect(compliance.length).toBeGreaterThanOrEqual(10);
    expect(patternsForStage("family-office")).toHaveLength(3);
  });
});
