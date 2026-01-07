'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      const { name, value, rating, delta, id, navigationType } = metric;
      console.log(
        `[web-vitals] ${name} value=${value} delta=${delta} rating=${rating} id=${id} nav=${navigationType}`
      );
    }
  });

  // Return empty fragment instead of null to avoid hydration warnings
  return <></>;
}
