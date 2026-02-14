import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isMockMode: vi.fn(),
  loggerInfo: vi.fn(),
  loggerWarn: vi.fn(),
}));

vi.mock('@/config/data-mode', () => ({
  isMockMode: mocks.isMockMode,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mocks.loggerInfo,
    warn: mocks.loggerWarn,
  },
}));

import {
  clearWebVitalMetricsBuffer,
  getWebVitalMetricsBuffer,
  reportWebVitalMetric,
  type WebVitalMetric,
} from '@/services/observability/webVitalsService';

const SAMPLE_METRIC: WebVitalMetric = {
  id: 'vital-1',
  name: 'LCP',
  value: 1234,
  delta: 1234,
  rating: 'good',
  navigationType: 'navigate',
};

describe('webVitalsService', () => {
  beforeEach(() => {
    clearWebVitalMetricsBuffer();
    mocks.isMockMode.mockReset();
    mocks.loggerInfo.mockReset();
    mocks.loggerWarn.mockReset();
    vi.restoreAllMocks();
  });

  it('stores metric in buffer and skips network in mock mode', async () => {
    mocks.isMockMode.mockReturnValue(true);
    const fetchSpy = vi.spyOn(global, 'fetch');

    await reportWebVitalMetric(SAMPLE_METRIC);

    expect(getWebVitalMetricsBuffer()).toEqual([SAMPLE_METRIC]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts metric to observability endpoint in api mode', async () => {
    mocks.isMockMode.mockReturnValue(false);
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    await reportWebVitalMetric(SAMPLE_METRIC);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/observability/web-vitals',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      })
    );
    expect(getWebVitalMetricsBuffer()).toEqual([SAMPLE_METRIC]);
  });

  it('logs warning when metric submission fails in api mode', async () => {
    mocks.isMockMode.mockReturnValue(false);
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network-error'));

    await reportWebVitalMetric(SAMPLE_METRIC);

    expect(mocks.loggerWarn).toHaveBeenCalledWith(
      'Failed to deliver web-vitals metric to observability endpoint.',
      expect.objectContaining({
        metric: 'LCP',
      })
    );
  });
});
