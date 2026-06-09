export const CHART_SERIES_COLORS = [
  "var(--app-chart-1)",
  "var(--app-chart-2)",
  "var(--app-chart-3)",
  "var(--app-chart-4)",
  "var(--app-chart-5)",
] as const;

export function getChartSeriesColor(index: number) {
  return CHART_SERIES_COLORS[Math.abs(index) % CHART_SERIES_COLORS.length];
}
