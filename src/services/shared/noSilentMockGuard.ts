import {
  createDataModeUnavailableResult,
  resolveDataModeContract,
  type DataModeClassification,
  type DataModeUnavailableReason,
  type DataModeUnavailableResult,
  type FeatureName,
} from "@/config/data-mode";

export type NoSilentMockGuardMode = "return" | "throw";

export interface NoSilentMockGuardOptions {
  feature?: FeatureName;
  classification?: DataModeClassification;
  reason?: DataModeUnavailableReason;
  message?: string;
  sourceRef?: string;
  details?: Record<string, unknown>;
  mode?: NoSilentMockGuardMode;
}

export class NoSilentMockFallbackError extends Error {
  readonly code = "NO_SILENT_MOCK_FALLBACK";
  readonly unavailable: DataModeUnavailableResult;

  constructor(unavailable: DataModeUnavailableResult) {
    super(unavailable.message);
    this.name = "NoSilentMockFallbackError";
    this.unavailable = unavailable;
  }
}

export function isNoSilentMockFallbackError(
  error: unknown,
): error is NoSilentMockFallbackError {
  return error instanceof NoSilentMockFallbackError;
}

export function shouldBlockMockFallback(
  options: Pick<NoSilentMockGuardOptions, "feature" | "classification"> = {},
): boolean {
  const resolution = resolveDataModeContract({
    feature: options.feature,
    classification: options.classification,
  });

  return (
    !resolution.mockFallbackAllowed &&
    (resolution.mode === "api" || resolution.requestedMode === "api")
  );
}

export function createNoSilentMockUnavailableResult(
  options: NoSilentMockGuardOptions = {},
): DataModeUnavailableResult {
  return createDataModeUnavailableResult({
    feature: options.feature,
    classification: options.classification,
    reason: options.reason,
    message: options.message,
    sourceRef: options.sourceRef,
    details: options.details,
  });
}

export function resolveNoSilentMockFallback(
  options: NoSilentMockGuardOptions = {},
): DataModeUnavailableResult | null {
  if (!shouldBlockMockFallback(options)) {
    return null;
  }

  return createNoSilentMockUnavailableResult(options);
}

export function guardNoSilentMockFallback(
  options: NoSilentMockGuardOptions = {},
): DataModeUnavailableResult | null {
  const unavailable = resolveNoSilentMockFallback(options);
  if (!unavailable) return null;

  if (options.mode === "throw") {
    throw new NoSilentMockFallbackError(unavailable);
  }

  return unavailable;
}

export function assertNoSilentMockFallback(
  options: NoSilentMockGuardOptions = {},
): void {
  const unavailable = resolveNoSilentMockFallback(options);
  if (unavailable) {
    throw new NoSilentMockFallbackError(unavailable);
  }
}
