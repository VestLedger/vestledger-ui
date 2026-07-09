import { describe, expect, it } from "vitest";
import { REDESIGNED_FRAME_ROUTES, resolveShellMode } from "./shell-mode";

describe("resolveShellMode", () => {
  it("routes /login to direct rendering", () => {
    expect(resolveShellMode("/login")).toBe("login");
  });

  it("routes /vesta to the standalone Vesta shell", () => {
    expect(resolveShellMode("/vesta")).toBe("vesta-standalone");
  });

  it("routes /home to the redesigned frame", () => {
    expect(resolveShellMode("/home")).toBe("redesign");
  });

  it("routes /pipeline to the redesigned frame (Phase 4 pilot)", () => {
    expect(resolveShellMode("/pipeline")).toBe("redesign");
  });

  it("keeps every other dashboard route on the legacy frame (no page accidentally changes frame)", () => {
    const legacyRoutes = [
      "/portfolio",
      "/analytics",
      "/deal-intelligence",
      "/dealflow-review",
      "/fund-admin",
      "/lp-management",
      "/waterfall",
      "/compliance",
      "/audit-trail",
      "/409a-valuations",
      "/tax-center",
      "/documents",
      "/reports",
      "/contacts",
      "/integrations",
      "/collaboration",
      "/notifications",
      "/settings",
      "/ai-tools",
      "/lp-portal",
    ];
    for (const path of legacyRoutes) {
      expect(resolveShellMode(path)).toBe("legacy");
    }
  });

  it("treats every opted-in allowlist route as redesigned", () => {
    for (const path of REDESIGNED_FRAME_ROUTES) {
      expect(resolveShellMode(path)).toBe("redesign");
    }
  });

  it("allowlists exactly /home and /pipeline", () => {
    expect([...REDESIGNED_FRAME_ROUTES]).toEqual(["/home", "/pipeline"]);
  });
});
