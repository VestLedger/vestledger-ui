export const DISTRIBUTION_IMPACT_DEFAULTS = {
  navBefore: 320_000_000,
  dpiBefore: 1.25,
  dpiDenominator: 200_000_000,
  tvpiBefore: 1.85,
  tvpiDenominator: 300_000_000,
  undrawnBefore: 85_000_000,
  undrawnReductionRate: 0.2,
} as const;

export const WATERFALL_STARTER_SCENARIO_DEFAULTS = {
  exitValue: 200_000_000,
  managementFees: 5_000_000,
} as const;

export const WATERFALL_QUICK_SCENARIO_VALUES = [
  50_000_000,
  100_000_000,
  250_000_000,
  500_000_000,
] as const;

export const WATERFALL_SENSITIVITY_DEFAULTS = {
  baseExitValue: 100_000_000,
  minRangeMultiplier: 0.25,
  defaultMinMultiplier: 0.5,
  defaultMaxMultiplier: 1.5,
  maxRangeMultiplier: 2,
  minRangeSpan: 10_000_000,
  minStep: 1_000_000,
  stepMultiplier: 0.05,
  defaultSteps: 20,
  stepOptions: [10, 20, 30, 40] as const,
} as const;
