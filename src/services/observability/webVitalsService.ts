import { isMockMode } from '@/config/data-mode';
import { logger } from '@/lib/logger';

type MetricRating = 'good' | 'needs-improvement' | 'poor';
type MetricNavigationType = 'navigate' | 'reload' | 'back-forward' | 'prerender' | string;

export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: MetricRating;
  navigationType: MetricNavigationType;
}

const WEB_VITALS_ENDPOINT = '/api/observability/web-vitals';
const WEB_VITALS_BUFFER_LIMIT = 200;
const webVitalsBuffer: WebVitalMetric[] = [];

function asFiniteNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSerializableMetric(metric: WebVitalMetric): WebVitalMetric {
  // next/web-vitals provides additional fields like `entries` that may contain
  // non-cloneable Performance* objects. Keep only the contract fields.
  return {
    id: String(metric.id),
    name: String(metric.name),
    value: asFiniteNumber(metric.value),
    delta: asFiniteNumber(metric.delta),
    rating: metric.rating,
    navigationType: String(metric.navigationType),
  };
}

function addToBuffer(metric: WebVitalMetric): void {
  webVitalsBuffer.push(toSerializableMetric(metric));
  if (webVitalsBuffer.length > WEB_VITALS_BUFFER_LIMIT) {
    webVitalsBuffer.splice(0, webVitalsBuffer.length - WEB_VITALS_BUFFER_LIMIT);
  }
}

function isDevelopmentRuntime(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function reportWebVitalMetric(metric: WebVitalMetric): Promise<void> {
  const payload = toSerializableMetric(metric);
  addToBuffer(payload);

  if (isDevelopmentRuntime()) {
    return;
  }

  if (isMockMode()) {
    logger.info('Captured web-vital metric (mock mode)', {
      metric: payload.name,
      value: payload.value,
      rating: payload.rating,
      navigationType: payload.navigationType,
    });
    return;
  }

  try {
    await fetch(WEB_VITALS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    logger.warn('Failed to deliver web-vitals metric to observability endpoint.', {
      metric: payload.name,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function getWebVitalMetricsBuffer(): WebVitalMetric[] {
  return webVitalsBuffer.map((metric) => ({ ...metric }));
}

export function clearWebVitalMetricsBuffer(): void {
  webVitalsBuffer.splice(0, webVitalsBuffer.length);
}
