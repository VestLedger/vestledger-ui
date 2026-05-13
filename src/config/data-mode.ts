import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";

export type DataMode = "mock" | "api";

export type DataModeSource =
  | "stored-override"
  | "cookie-override"
  | "feature-flag"
  | "environment-default";

export type FeatureName =
  | "auth"
  | "funds"
  | "alerts"
  | "search"
  | "reports"
  | "analytics"
  | "documents"
  | "portfolio"
  | "pipeline"
  | "dashboards"
  | "dealflow"
  | "backOffice"
  | "ai"
  | "dealIntelligence"
  | "crm"
  | "integrations"
  | "lpPortal"
  | "auditTrail"
  | "companySearch"
  | "collaboration"
  | "onboarding";

export type DataModeClassification =
  | "api-only"
  | "demo-only"
  | "hybrid-with-explicit-state";

export type DataModeDataState = "live" | "demo" | "unavailable";

export type DataModeUnavailableReason =
  | "demo_only_feature"
  | "api_only_feature"
  | "mock_fallback_blocked"
  | "backend_not_implemented"
  | "provider_unavailable"
  | "connector_missing"
  | "no_artifact"
  | "no_permission"
  | "source_unavailable";

export interface DataModeContractOptions {
  feature?: FeatureName;
  classification?: DataModeClassification;
  unavailableReason?: DataModeUnavailableReason;
  unavailableMessage?: string;
}

export interface DataModeResolution {
  mode: DataMode;
  requestedMode: DataMode;
  source: DataModeSource;
  feature?: FeatureName;
  classification: DataModeClassification;
  dataState: DataModeDataState;
  shouldUseApi: boolean;
  shouldUseMock: boolean;
  mockFallbackAllowed: boolean;
  requiresTypedUnavailableState: boolean;
  unavailableReason?: DataModeUnavailableReason;
  unavailableMessage?: string;
}

export interface DataModeUnavailableResult {
  ok: false;
  data_state: "unavailable";
  state_reason: DataModeUnavailableReason;
  message: string;
  mode: DataMode;
  requested_mode: DataMode;
  mode_source: DataModeSource;
  feature?: FeatureName;
  classification: DataModeClassification;
  source_ref?: string;
  details?: Record<string, unknown>;
  contract: {
    permission_scope_required: true;
    tenant_scope_required: true;
    source_evidence_required: true;
    audit_event_required: true;
  };
}

export interface CreateDataModeUnavailableResultOptions {
  feature?: FeatureName;
  classification?: DataModeClassification;
  reason?: DataModeUnavailableReason;
  message?: string;
  sourceRef?: string;
  details?: Record<string, unknown>;
}

/**
 * Audited features where mock fallback should be blocked while running in API mode.
 * This supports the UI-to-API wiring initiative.
 */
export const AUDITED_NO_MOCK_FEATURES: readonly FeatureName[] = [
  "auth",
  "funds",
  "alerts",
  "search",
  "reports",
  "analytics",
  "documents",
  "portfolio",
  "pipeline",
  "dashboards",
  "dealflow",
  "backOffice",
  "ai",
  "dealIntelligence",
  "crm",
  "integrations",
  "lpPortal",
  "auditTrail",
  "companySearch",
  "collaboration",
  "onboarding",
] as const;

export const DATA_MODE_CLASSIFICATIONS: Record<
  FeatureName,
  DataModeClassification
> = {
  auth: "hybrid-with-explicit-state",
  funds: "hybrid-with-explicit-state",
  alerts: "hybrid-with-explicit-state",
  search: "hybrid-with-explicit-state",
  reports: "hybrid-with-explicit-state",
  analytics: "hybrid-with-explicit-state",
  documents: "hybrid-with-explicit-state",
  portfolio: "hybrid-with-explicit-state",
  pipeline: "hybrid-with-explicit-state",
  dashboards: "hybrid-with-explicit-state",
  dealflow: "hybrid-with-explicit-state",
  backOffice: "hybrid-with-explicit-state",
  ai: "hybrid-with-explicit-state",
  dealIntelligence: "hybrid-with-explicit-state",
  crm: "hybrid-with-explicit-state",
  integrations: "hybrid-with-explicit-state",
  lpPortal: "hybrid-with-explicit-state",
  auditTrail: "hybrid-with-explicit-state",
  companySearch: "hybrid-with-explicit-state",
  collaboration: "hybrid-with-explicit-state",
  onboarding: "hybrid-with-explicit-state",
};

/**
 * Feature flags for per-feature mock/API mode control.
 * Set a feature to true to use real API, false to use mock data.
 * If not specified, falls back to global DATA_MODE.
 */
const featureFlags: Partial<Record<FeatureName, boolean>> = {
  auth: true,
  funds: true,
  alerts: true,
  search: true,
  reports: true,
  analytics: true,
  documents: true,
  portfolio: true,
  pipeline: true,
  dashboards: true,
  dealflow: true,
  backOffice: true,
  ai: true,
  dealIntelligence: true,
  crm: true,
  integrations: true,
  lpPortal: true,
  auditTrail: true,
  companySearch: true,
  collaboration: true,
  onboarding: true,
};

export const DATA_MODE_OVERRIDE_KEY = "dataModeOverride";

export function parseDataMode(value?: string | null): DataMode | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "mock" || normalized === "api") {
    return normalized;
  }
  return null;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const entries = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const match = entries.find((entry) => entry.startsWith(`${name}=`));
  if (!match) return null;
  return match.slice(name.length + 1);
}

export function getDataModeOverrideFromCookieHeader(
  cookieHeader?: string | null,
): DataMode | null {
  if (!cookieHeader) return null;
  const raw = getCookieValue(cookieHeader, DATA_MODE_OVERRIDE_KEY);
  return parseDataMode(raw);
}

function getStoredDataModeOverride(): {
  mode: DataMode;
  source: DataModeSource;
} | null {
  const fromStorage = parseDataMode(
    safeLocalStorage.getItem(DATA_MODE_OVERRIDE_KEY),
  );
  if (fromStorage) {
    return { mode: fromStorage, source: "stored-override" };
  }

  if (typeof document !== "undefined") {
    const fromCookie = getDataModeOverrideFromCookieHeader(document.cookie);
    if (fromCookie) {
      return { mode: fromCookie, source: "cookie-override" };
    }
  }

  return null;
}

function getEnvironmentDataMode(): DataMode {
  const raw = process.env.NEXT_PUBLIC_DATA_MODE?.toLowerCase();
  if (raw === "api") return "api";
  return "mock";
}

function getFeatureFlagMode(feature?: FeatureName): DataMode | null {
  if (feature !== undefined && feature in featureFlags) {
    return featureFlags[feature] ? "api" : "mock";
  }

  return null;
}

function resolveRuntimeDataMode(feature?: FeatureName): {
  mode: DataMode;
  source: DataModeSource;
} {
  const override = getStoredDataModeOverride();
  if (override) return override;

  const featureMode = getFeatureFlagMode(feature);
  if (featureMode) {
    return { mode: featureMode, source: "feature-flag" };
  }

  return { mode: getEnvironmentDataMode(), source: "environment-default" };
}

export function getDataMode(): DataMode {
  return resolveRuntimeDataMode().mode;
}

function getClassification(
  feature?: FeatureName,
  classification?: DataModeClassification,
): DataModeClassification {
  if (classification) return classification;
  if (feature) return DATA_MODE_CLASSIFICATIONS[feature];
  return "hybrid-with-explicit-state";
}

function buildUnavailableMessage(
  reason: DataModeUnavailableReason,
  feature?: FeatureName,
): string {
  const target = feature ? `${feature} data` : "This data";

  switch (reason) {
    case "demo_only_feature":
      return `${target} is demo-only and unavailable in API mode.`;
    case "api_only_feature":
      return `${target} is API-only and has no demo data provider.`;
    case "mock_fallback_blocked":
      return `${target} is unavailable because API mode blocks mock fallback data.`;
    case "backend_not_implemented":
      return `${target} is unavailable until the backend workflow is implemented.`;
    case "provider_unavailable":
      return `${target} is unavailable because the provider is unavailable.`;
    case "connector_missing":
      return `${target} is unavailable because the connector is not configured.`;
    case "no_artifact":
      return `${target} is unavailable because the required artifact does not exist.`;
    case "no_permission":
      return `${target} is unavailable for the current permission scope.`;
    case "source_unavailable":
      return `${target} is unavailable because the source evidence is unavailable.`;
  }
}

export function resolveDataModeContract(
  options: DataModeContractOptions = {},
): DataModeResolution {
  const runtime = resolveRuntimeDataMode(options.feature);
  const classification = getClassification(
    options.feature,
    options.classification,
  );

  if (classification === "api-only") {
    const unavailableReason =
      runtime.mode === "mock" ? "api_only_feature" : undefined;
    return {
      mode: "api",
      requestedMode: runtime.mode,
      source: runtime.source,
      feature: options.feature,
      classification,
      dataState: "live",
      shouldUseApi: true,
      shouldUseMock: false,
      mockFallbackAllowed: false,
      requiresTypedUnavailableState: false,
      unavailableReason,
      unavailableMessage: unavailableReason
        ? (options.unavailableMessage ??
          buildUnavailableMessage(unavailableReason, options.feature))
        : undefined,
    };
  }

  if (classification === "demo-only") {
    if (runtime.mode === "api") {
      const unavailableReason =
        options.unavailableReason ?? "demo_only_feature";
      return {
        mode: runtime.mode,
        requestedMode: runtime.mode,
        source: runtime.source,
        feature: options.feature,
        classification,
        dataState: "unavailable",
        shouldUseApi: false,
        shouldUseMock: false,
        mockFallbackAllowed: false,
        requiresTypedUnavailableState: true,
        unavailableReason,
        unavailableMessage:
          options.unavailableMessage ??
          buildUnavailableMessage(unavailableReason, options.feature),
      };
    }

    return {
      mode: runtime.mode,
      requestedMode: runtime.mode,
      source: runtime.source,
      feature: options.feature,
      classification,
      dataState: "demo",
      shouldUseApi: false,
      shouldUseMock: true,
      mockFallbackAllowed: true,
      requiresTypedUnavailableState: false,
    };
  }

  if (runtime.mode === "mock") {
    return {
      mode: runtime.mode,
      requestedMode: runtime.mode,
      source: runtime.source,
      feature: options.feature,
      classification,
      dataState: "demo",
      shouldUseApi: false,
      shouldUseMock: true,
      mockFallbackAllowed: true,
      requiresTypedUnavailableState: false,
    };
  }

  return {
    mode: runtime.mode,
    requestedMode: runtime.mode,
    source: runtime.source,
    feature: options.feature,
    classification,
    dataState: "live",
    shouldUseApi: true,
    shouldUseMock: false,
    mockFallbackAllowed: false,
    requiresTypedUnavailableState: false,
  };
}

export function createDataModeUnavailableResult(
  options: CreateDataModeUnavailableResultOptions,
): DataModeUnavailableResult {
  const resolution = resolveDataModeContract({
    feature: options.feature,
    classification: options.classification,
    unavailableReason: options.reason,
    unavailableMessage: options.message,
  });
  const reason =
    options.reason ??
    resolution.unavailableReason ??
    (resolution.mode === "api" ? "mock_fallback_blocked" : "api_only_feature");

  return {
    ok: false,
    data_state: "unavailable",
    state_reason: reason,
    message:
      options.message ??
      resolution.unavailableMessage ??
      buildUnavailableMessage(reason, options.feature),
    mode: resolution.mode,
    requested_mode: resolution.requestedMode,
    mode_source: resolution.source,
    feature: options.feature,
    classification: resolution.classification,
    source_ref: options.sourceRef,
    details: options.details,
    contract: {
      permission_scope_required: true,
      tenant_scope_required: true,
      source_evidence_required: true,
      audit_event_required: true,
    },
  };
}

/**
 * Check if a feature should use mock data.
 * @param feature - Optional feature name to check feature-specific flag
 * @returns true if mock mode should be used, false if API mode
 */
export function isMockMode(feature?: FeatureName): boolean {
  return resolveDataModeContract({ feature }).shouldUseMock;
}

/**
 * Whether this runtime should disallow mock fallbacks for a feature.
 * In API mode, audited features should not silently fall back to bundled mock data.
 */
export function isAuditedNoMockRuntime(feature?: FeatureName): boolean {
  const resolution = resolveDataModeContract({ feature });
  if (resolution.requestedMode !== "api" && resolution.mode !== "api") {
    return false;
  }

  if (!feature) {
    return true;
  }

  return AUDITED_NO_MOCK_FEATURES.includes(feature);
}
