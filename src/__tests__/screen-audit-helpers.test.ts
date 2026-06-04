import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  collectSourceFileText,
  createCoverageSummary,
  createOverlayInventoryFromSourceText,
  createScreenshotSlug,
} from "../../e2e/audit/screen-audit-helpers";

describe("screen audit helpers", () => {
  it("creates stable screenshot slugs from route and state parts", () => {
    expect(
      createScreenshotSlug([
        "GP",
        "/fund-admin/distributions/new?step=tax",
        "Tax Forms",
      ]),
    ).toBe("gp-fund-admin-distributions-new-step-tax-tax-forms");
  });

  it("extracts overlay inventory entries from source text", () => {
    const inventory = createOverlayInventoryFromSourceText([
      {
        filePath: "src/components/example.tsx",
        text: [
          "export function Example() {",
          '  return <Modal isOpen={true} title="Add Deal" />;',
          "}",
          "export function Drawer() {",
          "  return <SideDrawer isOpen={true} />;",
          "}",
          "<Command.Dialog open={true} />",
        ].join("\n"),
      },
    ]);

    expect(inventory).toEqual([
      expect.objectContaining({
        category: "modal",
        filePath: "src/components/example.tsx",
        line: 2,
      }),
      expect.objectContaining({
        category: "side-drawer",
        filePath: "src/components/example.tsx",
        line: 5,
      }),
      expect.objectContaining({
        category: "command-dialog",
        filePath: "src/components/example.tsx",
        line: 7,
      }),
    ]);
  });

  it("does not scan the audit harness as application source", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "screen-audit-"));
    try {
      fs.mkdirSync(path.join(rootDir, "e2e", "audit"), { recursive: true });
      fs.mkdirSync(path.join(rootDir, "src", "components"), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(rootDir, "e2e", "audit", "screen-audit-helpers.ts"),
        "export const auditOnly = '<Modal />';",
      );
      fs.writeFileSync(
        path.join(rootDir, "src", "components", "example.tsx"),
        "export const Example = () => <Modal />;",
      );

      expect(
        collectSourceFileText(rootDir).map((file) => file.filePath),
      ).toEqual(["src/components/example.tsx"]);
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("summarizes screen and overlay coverage", () => {
    const summary = createCoverageSummary(
      [
        { type: "screen", status: "captured" },
        { type: "screen", status: "skipped" },
        { type: "overlay", status: "captured" },
        { type: "overlay", status: "unreachable" },
      ],
      [
        {
          id: "overlay-1",
          category: "modal",
          filePath: "src/components/example.tsx",
          line: 1,
          match: "<Modal",
        },
      ],
    );

    expect(summary).toEqual({
      capturedScreens: 1,
      skippedScreens: 1,
      capturedOverlays: 1,
      skippedOrUnreachableOverlays: 1,
      inventoriedOverlays: 1,
    });
  });
});
