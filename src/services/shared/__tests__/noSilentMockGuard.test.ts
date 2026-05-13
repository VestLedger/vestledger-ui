import { beforeEach, describe, expect, it, vi } from "vitest";
import { DATA_MODE_OVERRIDE_KEY } from "@/config/data-mode";
import {
  assertNoSilentMockFallback,
  guardNoSilentMockFallback,
  isNoSilentMockFallbackError,
  NoSilentMockFallbackError,
  resolveNoSilentMockFallback,
  shouldBlockMockFallback,
} from "@/services/shared/noSilentMockGuard";

function clearDataModeCookie() {
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

describe("noSilentMockGuard", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDataModeCookie();
    vi.unstubAllEnvs();
  });

  it("returns typed unavailable in API mode instead of allowing mock fallback", () => {
    const result = resolveNoSilentMockFallback({
      feature: "reports",
      classification: "hybrid-with-explicit-state",
      sourceRef: "reports/export-jobs",
      details: { endpoint: "/reports/export-jobs" },
    });

    expect(result).toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "mock_fallback_blocked",
      mode: "api",
      requested_mode: "api",
      mode_source: "feature-flag",
      feature: "reports",
      classification: "hybrid-with-explicit-state",
      source_ref: "reports/export-jobs",
      details: { endpoint: "/reports/export-jobs" },
      contract: {
        permission_scope_required: true,
        tenant_scope_required: true,
        source_evidence_required: true,
        audit_event_required: true,
      },
    });
  });

  it("does not block explicit demo mode", () => {
    localStorage.setItem(DATA_MODE_OVERRIDE_KEY, "mock");

    expect(
      shouldBlockMockFallback({
        feature: "documents",
        classification: "hybrid-with-explicit-state",
      }),
    ).toBe(false);
    expect(
      resolveNoSilentMockFallback({
        feature: "documents",
        classification: "hybrid-with-explicit-state",
      }),
    ).toBeNull();
  });

  it("supports demo-only unavailable reasons for unimplemented live workflows", () => {
    const result = guardNoSilentMockFallback({
      feature: "ai",
      classification: "demo-only",
      reason: "backend_not_implemented",
      message: "AI chat is unavailable until backend retrieval is implemented.",
    });

    expect(result).toMatchObject({
      state_reason: "backend_not_implemented",
      message: "AI chat is unavailable until backend retrieval is implemented.",
      feature: "ai",
      classification: "demo-only",
    });
  });

  it("preserves contract reasons when a more specific reason is available", () => {
    const result = guardNoSilentMockFallback({
      feature: "search",
      classification: "demo-only",
    });

    expect(result).toMatchObject({
      state_reason: "demo_only_feature",
      feature: "search",
      classification: "demo-only",
    });
  });

  it("throws a typed error when configured for throw mode", () => {
    expect(() =>
      guardNoSilentMockFallback({
        feature: "lpPortal",
        classification: "demo-only",
        reason: "backend_not_implemented",
        mode: "throw",
      }),
    ).toThrow(NoSilentMockFallbackError);

    try {
      guardNoSilentMockFallback({
        feature: "lpPortal",
        classification: "demo-only",
        reason: "backend_not_implemented",
        mode: "throw",
      });
    } catch (error) {
      expect(isNoSilentMockFallbackError(error)).toBe(true);
      expect(error).toMatchObject({
        code: "NO_SILENT_MOCK_FALLBACK",
        unavailable: {
          state_reason: "backend_not_implemented",
          feature: "lpPortal",
        },
      });
    }
  });

  it("assert helper throws when API-only code would otherwise fall back to demo", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");

    expect(() =>
      assertNoSilentMockFallback({
        classification: "api-only",
      }),
    ).toThrow(NoSilentMockFallbackError);
  });
});
