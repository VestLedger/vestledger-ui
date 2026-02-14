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

function clone<T>(value: T): T {
  return structuredClone(value);
}

function addToBuffer(metric: WebVitalMetric): void {
  webVitalsBuffer.push(clone(metric));
  if (webVitalsBuffer.length > WEB_VITALS_BUFFER_LIMIT) {
    webVitalsBuffer.splice(0, webVitalsBuffer.length - WEB_VITALS_BUFFER_LIMIT);
  }
}

export async function reportWebVitalMetric(metric: WebVitalMetric): Promise<void> {
  addToBuffer(metric);

  if (isMockMode()) {
    if (process.env.NODE_ENV === 'development') {
      logger.info('Captured web-vital metric (mock mode)', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      });
    }
    return;
  }

  try {
    await fetch(WEB_VITALS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
      keepalive: true,
    });
  } catch (error) {
    logger.warn('Failed to deliver web-vitals metric to observability endpoint.', {
      metric: metric.name,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function getWebVitalMetricsBuffer(): WebVitalMetric[] {
  return clone(webVitalsBuffer);
}

export function clearWebVitalMetricsBuffer(): void {
  webVitalsBuffer.splice(0, webVitalsBuffer.length);
}
