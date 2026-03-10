import { describe, expect, it } from "vitest";
import {
  INTERNAL_TENANT_ID,
  isInternalTenantUser,
  isSuperadminUser,
  resolveUserDomainTarget,
} from "@/utils/auth/internal-access";

describe("internal-access helpers", () => {
  it("detects internal tenant users", () => {
    expect(isInternalTenantUser({ tenantId: INTERNAL_TENANT_ID })).toBe(true);
    expect(isInternalTenantUser({ tenantId: "org_summit_vc" })).toBe(false);
  });

  it("recognizes superadmin user by role alone", () => {
    expect(
      isSuperadminUser({
        tenantId: "org_external",
        role: "superadmin",
      }),
    ).toBe(true);
  });

  it("does not treat tenant org admins as superadmin users", () => {
    expect(
      isSuperadminUser({
        tenantId: "org_external",
        role: "gp",
        isAdmin: true,
      }),
    ).toBe(false);
  });

  it("routes superadmin users to admin domain and others to app", () => {
    expect(
      resolveUserDomainTarget({
        tenantId: INTERNAL_TENANT_ID,
        role: "superadmin",
      }),
    ).toBe("admin");

    expect(
      resolveUserDomainTarget({
        tenantId: "org_summit_vc",
        role: "gp",
      }),
    ).toBe("app");
  });
});
