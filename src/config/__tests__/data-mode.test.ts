import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDataModeUnavailableResult,
  DATA_MODE_OVERRIDE_KEY,
  getDataMode,
  getDataModeOverrideFromCookieHeader,
  isAuditedNoMockRuntime,
  isMockMode,
  parseDataMode,
  resolveDataModeContract,
} from "@/config/data-mode";

function clearDataModeCookie() {
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

describe("data-mode contract", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDataModeCookie();
    vi.unstubAllEnvs();
  });

  it("parses valid data modes and ignores invalid values", () => {
    expect(parseDataMode("api")).toBe("api");
    expect(parseDataMode("MOCK")).toBe("mock");
    expect(parseDataMode("production")).toBeNull();
    expect(parseDataMode(null)).toBeNull();
  });

  it("reads data-mode cookies with or without spaces between entries", () => {
    expect(
      getDataModeOverrideFromCookieHeader("theme=dark;dataModeOverride=api"),
    ).toBe("api");
    expect(
      getDataModeOverrideFromCookieHeader(
        "theme=dark; dataModeOverride=mock; other=value",
      ),
    ).toBe("mock");
  });

  it("resolves hybrid services to API mode with mock fallback blocked", () => {
    const resolution = resolveDataModeContract({ feature: "funds" });

    expect(resolution).toMatchObject({
      mode: "api",
      requestedMode: "api",
      source: "feature-flag",
      feature: "funds",
      classification: "hybrid-with-explicit-state",
      dataState: "live",
      shouldUseApi: true,
      shouldUseMock: false,
      mockFallbackAllowed: false,
      requiresTypedUnavailableState: false,
    });
    expect(isMockMode("funds")).toBe(false);
    expect(isAuditedNoMockRuntime("funds")).toBe(true);
  });

  it("treats stored mock override as explicit demo mode", () => {
    localStorage.setItem(DATA_MODE_OVERRIDE_KEY, "mock");

    const resolution = resolveDataModeContract({ feature: "documents" });

    expect(resolution).toMatchObject({
      mode: "mock",
      requestedMode: "mock",
      source: "stored-override",
      dataState: "demo",
      shouldUseApi: false,
      shouldUseMock: true,
      mockFallbackAllowed: true,
    });
    expect(getDataMode()).toBe("mock");
    expect(isMockMode("documents")).toBe(true);
    expect(isAuditedNoMockRuntime("documents")).toBe(false);
  });

  it("uses cookie override when local storage has no data-mode override", () => {
    document.cookie = `${DATA_MODE_OVERRIDE_KEY}=mock; path=/`;

    const resolution = resolveDataModeContract({ feature: "pipeline" });

    expect(resolution).toMatchObject({
      mode: "mock",
      requestedMode: "mock",
      source: "cookie-override",
      dataState: "demo",
      shouldUseMock: true,
    });
  });

  it("returns unavailable state for demo-only services in API mode", () => {
    const resolution = resolveDataModeContract({
      feature: "ai",
      classification: "demo-only",
      unavailableReason: "backend_not_implemented",
    });

    expect(resolution).toMatchObject({
      mode: "api",
      requestedMode: "api",
      classification: "demo-only",
      dataState: "unavailable",
      shouldUseApi: false,
      shouldUseMock: false,
      mockFallbackAllowed: false,
      requiresTypedUnavailableState: true,
      unavailableReason: "backend_not_implemented",
    });
    expect(resolution.unavailableMessage).toContain("backend workflow");
  });

  it("creates typed unavailable results with audit and evidence requirements", () => {
    const result = createDataModeUnavailableResult({
      feature: "reports",
      classification: "demo-only",
      reason: "no_artifact",
      sourceRef: "report-export-job",
      details: { reportId: "report-1" },
    });

    expect(result).toEqual({
      ok: false,
      data_state: "unavailable",
      state_reason: "no_artifact",
      message:
        "reports data is unavailable because the required artifact does not exist.",
      mode: "api",
      requested_mode: "api",
      mode_source: "feature-flag",
      feature: "reports",
      classification: "demo-only",
      source_ref: "report-export-job",
      details: { reportId: "report-1" },
      contract: {
        permission_scope_required: true,
        tenant_scope_required: true,
        source_evidence_required: true,
        audit_event_required: true,
      },
    });
  });

  it("keeps API-only services off mock data even when global mode is mock", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");

    const resolution = resolveDataModeContract({
      classification: "api-only",
    });

    expect(resolution).toMatchObject({
      mode: "api",
      requestedMode: "mock",
      source: "environment-default",
      classification: "api-only",
      dataState: "live",
      shouldUseApi: true,
      shouldUseMock: false,
      mockFallbackAllowed: false,
      requiresTypedUnavailableState: false,
      unavailableReason: "api_only_feature",
    });
  });

  it("uses environment mode when no override or feature is supplied", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "api");

    expect(resolveDataModeContract()).toMatchObject({
      mode: "api",
      requestedMode: "api",
      source: "environment-default",
      dataState: "live",
      shouldUseApi: true,
      shouldUseMock: false,
    });
  });
});
