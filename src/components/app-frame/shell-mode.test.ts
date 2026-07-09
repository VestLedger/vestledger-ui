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

  it("keeps /pipeline on the legacy frame until opted in", () => {
    expect(resolveShellMode("/pipeline")).toBe("legacy");
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

  it("starts with /home as the only redesigned route", () => {
    expect([...REDESIGNED_FRAME_ROUTES]).toEqual(["/home"]);
  });
});
