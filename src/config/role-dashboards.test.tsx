import { describe, expect, it } from "vitest";
import { PERSONA_CONFIG } from "@/types/auth";
import type { UserRole } from "@/types/auth";
import {
  ROLE_DASHBOARDS,
  resolveRoleDashboard,
} from "@/config/role-dashboards";

const ALL_ROLES = Object.keys(PERSONA_CONFIG) as UserRole[];

describe("role-dashboards registry", () => {
  it("maps every UserRole to a dashboard component", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_DASHBOARDS[role]).toBeDefined();
    }
  });

  it("resolves each role to its registered component", () => {
    for (const role of ALL_ROLES) {
      expect(resolveRoleDashboard(role)).toBe(ROLE_DASHBOARDS[role]);
    }
  });

  it("falls back to the GP dashboard for unknown or missing roles", () => {
    expect(resolveRoleDashboard(undefined)).toBe(ROLE_DASHBOARDS.gp);
    expect(resolveRoleDashboard(null)).toBe(ROLE_DASHBOARDS.gp);
    expect(resolveRoleDashboard("not-a-role" as UserRole)).toBe(
      ROLE_DASHBOARDS.gp,
    );
  });
});
