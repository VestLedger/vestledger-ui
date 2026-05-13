import { afterEach, describe, expect, it, vi } from "vitest";

async function importEnv() {
  vi.resetModules();
  return import("@/config/env");
}

describe("env URL resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses the Docker-published API when a localhost UI is configured for api.vestledger.local", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.vestledger.local");
    vi.stubEnv("NEXT_PUBLIC_LOCAL_API_BASE_URL", "http://localhost:3000");

    const { resolveApiBaseUrl } = await importEnv();

    expect(resolveApiBaseUrl("localhost")).toBe("http://localhost:3000");
    expect(resolveApiBaseUrl("127.0.0.1")).toBe("http://localhost:3000");
  });

  it("does not override explicit non-local API hosts", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.vestledger.com");
    vi.stubEnv("NEXT_PUBLIC_LOCAL_API_BASE_URL", "http://localhost:3000");

    const { resolveApiBaseUrl } = await importEnv();

    expect(resolveApiBaseUrl("localhost")).toBe("https://api.vestledger.com");
  });

  it("keeps localhost redirects on the same host and port", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_DOMAIN", "vestledger.local");
    vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "app.vestledger.local");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_DOMAIN", "admin.vestledger.local");

    const { buildAdminSuperadminUrl, buildAppLoginUrl, buildAppWebUrl } =
      await importEnv();

    expect(buildAppWebUrl("localhost:3001")).toBe("http://localhost:3001");
    expect(buildAppLoginUrl("localhost:3001")).toBe(
      "http://localhost:3001/login",
    );
    expect(buildAdminSuperadminUrl("localhost:3001")).toBe(
      "http://localhost:3001/superadmin",
    );
  });

  it("uses configured app and admin domains for non-local hosts", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_DOMAIN", "vestledger.com");
    vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "app.vestledger.com");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_DOMAIN", "admin.vestledger.com");

    const { buildAdminSuperadminUrl, buildAppLoginUrl } = await importEnv();

    expect(buildAppLoginUrl("vestledger.com")).toBe(
      "https://app.vestledger.com/login",
    );
    expect(buildAdminSuperadminUrl("vestledger.com")).toBe(
      "https://admin.vestledger.com/superadmin",
    );
  });
});
