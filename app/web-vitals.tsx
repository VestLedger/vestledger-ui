'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitalMetric } from '@/services/observability/webVitalsService';

export function WebVitals() {
  useReportWebVitals((metric) => {
    void reportWebVitalMetric(metric);
  });

  // Return empty fragment instead of null to avoid hydration warnings
  return <></>;
}
