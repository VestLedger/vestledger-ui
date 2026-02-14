const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_WARNING_LEAD_MS = 60 * 1000;
const MIN_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const MIN_WARNING_LEAD_MS = 15 * 1000;

function parsePositiveInt(rawValue: string | undefined, fallbackValue: number): number {
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallbackValue;
  return parsed;
}

const configuredIdleTimeoutMs = parsePositiveInt(
  process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MS,
  DEFAULT_IDLE_TIMEOUT_MS
);

const configuredWarningLeadMs = parsePositiveInt(
  process.env.NEXT_PUBLIC_SESSION_WARNING_LEAD_MS,
  DEFAULT_WARNING_LEAD_MS
);

export const SESSION_IDLE_TIMEOUT_MS = Math.max(configuredIdleTimeoutMs, MIN_IDLE_TIMEOUT_MS);
export const SESSION_WARNING_LEAD_MS = Math.max(
  Math.min(configuredWarningLeadMs, SESSION_IDLE_TIMEOUT_MS - MIN_WARNING_LEAD_MS),
  MIN_WARNING_LEAD_MS
);
