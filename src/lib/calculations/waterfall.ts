/**
 * Waterfall Calculation Engine
 *
 * Frontend calculation engine for real-time waterfall modeling
 * Supports both European and American waterfall models
 */

import type {
  WaterfallScenario,
  InvestorClass,
  WaterfallTier,
  WaterfallModel,
  WaterfallResults,
  InvestorClassResult,
  TierBreakdown,
  TierAllocation,
  SensitivityDataPoint,
  SensitivityAnalysis,
  BlendedWaterfallConfig,
  TierTimelineEntry,
} from '@/types/waterfall';

type InvestedBasis = 'commitment' | 'capitalCalled';

type WaterfallCalculationOptions = {
  includeCatchUp: boolean;
  investedBasis: InvestedBasis;
};

const getInvestedAmount = (investorClass: InvestorClass, basis: InvestedBasis) =>
  basis === 'capitalCalled' ? investorClass.capitalCalled : investorClass.commitment;

const resolveTotalInvested = (
  investorClasses: InvestorClass[],
  scenarioTotalInvested: number,
  options: WaterfallCalculationOptions
) => {
  if (options.investedBasis === 'capitalCalled') {
    const capitalCalledTotal = investorClasses.reduce(
      (sum, investorClass) => sum + investorClass.capitalCalled,
      0
    );
    return capitalCalledTotal > 0 ? capitalCalledTotal : scenarioTotalInvested;
  }
  return scenarioTotalInvested;
};

const normalizeBlendConfig = (
  config?: BlendedWaterfallConfig
): { weights: BlendedWaterfallConfig; european: number; american: number } => {
  const europeanWeight = Math.max(0, config?.europeanWeight ?? 50);
  const americanWeight = Math.max(0, config?.americanWeight ?? 50);
  const total = europeanWeight + americanWeight || 100;
  return {
    weights: {
      europeanWeight,
      americanWeight,
    },
    european: europeanWeight / total,
    american: americanWeight / total,
  };
};

const buildTierTimeline = (
  scenario: WaterfallScenario,
  results: WaterfallResults
): TierTimelineEntry[] => {
  const baseDate = scenario.createdAt ? new Date(scenario.createdAt) : new Date();
  const tiers = results.tierBreakdown ?? [];
  const periodMonths = Math.max(1, Math.round(12 / Math.max(tiers.length, 1)));

  let cumulativeDistributed = 0;
  return tiers.map((tier, index) => {
    cumulativeDistributed += tier.totalAmount;
    const reachedAt = new Date(baseDate);
    reachedAt.setMonth(reachedAt.getMonth() + periodMonths * index);
    return {
      tierId: tier.tierId,
      tierName: tier.tierName,
      reachedAt: reachedAt.toISOString(),
      exitValue: tier.cumulativeAmount,
      cumulativeDistributed,
    };
  });
};

const buildClawbackSummary = (
  scenario: WaterfallScenario,
  results: WaterfallResults
): WaterfallResults['clawback'] => {
  const provision = scenario.clawbackProvision;
  if (!provision?.enabled) return undefined;

  const requiredReturn =
    results.totalInvested * (1 + (provision.hurdleRate / 100) * provision.distributionLifeYears);
  const shortfall = Math.max(0, requiredReturn - results.lpTotalReturn);
  const clawbackDue = Math.min(
    results.gpCarry,
    shortfall * (provision.clawbackRate / 100)
  );
  const netCarryAfterClawback = Math.max(0, results.gpCarry - clawbackDue);
  const status =
    clawbackDue > 0 ? 'triggered' : shortfall > 0 ? 'at-risk' : 'clear';

  return {
    totalCarryPaid: results.gpCarry,
    requiredReturn,
    shortfall,
    clawbackDue,
    netCarryAfterClawback,
    status,
  };
};

const buildLookbackSummary = (
  scenario: WaterfallScenario,
  results: WaterfallResults
): WaterfallResults['lookback'] => {
  const provision = scenario.lookbackProvision;
  if (!provision?.enabled) return undefined;

  const lossesToRecover = Math.max(0, provision.lossCarryForward);
  const carryAtRisk = results.gpCarry * (provision.carryAtRiskRate / 100);
  const carryReleased = Math.max(0, results.gpCarry - carryAtRisk);
  const status = lossesToRecover > 0 ? (carryAtRisk > 0 ? 'at-risk' : 'monitor') : 'cleared';

  return {
    lookbackYears: provision.lookbackYears,
    lossesToRecover,
    carryAtRisk,
    carryReleased,
    status,
  };
};

const applyPhase6Enhancements = (
  scenario: WaterfallScenario,
  results: WaterfallResults,
  blendedConfig?: BlendedWaterfallConfig
): WaterfallResults => ({
  ...results,
  tierTimeline: buildTierTimeline(scenario, results),
  clawback: buildClawbackSummary(scenario, results),
  lookback: buildLookbackSummary(scenario, results),
  blendedBreakdown: blendedConfig,
});

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate MOIC (Multiple on Invested Capital)
 */
export function calculateMOIC(invested: number, distributed: number): number {
  if (invested === 0) return 0;
  return distributed / invested;
}

/**
 * Calculate IRR (Internal Rate of Return)
 * Simplified IRR calculation using Newton-Raphson method
 * For production, consider using a library like 'node-irr' or 'financial'
 *
 * @param cashflows - Array of cash flows (negative for investments, positive for returns)
 * @param dates - Array of dates corresponding to each cash flow
 * @returns IRR as a percentage
 */
export function calculateIRR(cashflows: number[], dates: Date[]): number {
  if (cashflows.length !== dates.length || cashflows.length < 2) {
    return 0;
  }

  // Convert dates to years from first date
  const startDate = dates[0].getTime();
  const periods = dates.map((date) => (date.getTime() - startDate) / (365.25 * 24 * 60 * 60 * 1000));

  // Newton-Raphson method to find IRR
  let guess = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashflows.length; j++) {
      const period = periods[j];
      npv += cashflows[j] / Math.pow(1 + guess, period);
      dnpv += (-period * cashflows[j]) / Math.pow(1 + guess, period + 1);
    }

    const newGuess = guess - npv / dnpv;

    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100; // Convert to percentage
    }

    guess = newGuess;
  }

  return guess * 100;
}

/**
 * Calculate preferred return amount based on hurdle rate
 */
export function calculatePreferredReturn(
  invested: number,
  hurdleRate: number,
  years: number
): number {
  // Simple interest calculation
  // For compound interest: invested * Math.pow(1 + hurdleRate / 100, years) - invested
  return invested * (hurdleRate / 100) * years;
}

/**
 * Calculate tier allocations for a given exit value and tier structure
 * Uses the full waterfall calculation to keep results consistent
 */
export function calculateTierAllocations(
  exitValue: number,
  tiers: WaterfallTier[],
  investorClasses: InvestorClass[],
  model: WaterfallModel = 'european'
): TierBreakdown[] {
  const totalInvested = investorClasses.reduce(
    (sum, investorClass) => sum + investorClass.capitalCalled,
    0
  );

  const scenario: WaterfallScenario = {
    id: 'temp-scenario',
    name: 'Temporary Scenario',
    model,
    ...(model === 'blended'
      ? { blendedConfig: { europeanWeight: 50, americanWeight: 50 } }
      : {}),
    investorClasses,
    tiers,
    exitValue,
    totalInvested,
    managementFees: 0,
    isFavorite: false,
    isTemplate: false,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  };

  return calculateWaterfall(scenario).tierBreakdown;
}

// ============================================================================
// European Waterfall Model
// ============================================================================

/**
 * Calculate European waterfall distribution
 * European model: All distributions go through waterfall at fund level
 *
 * Typical structure:
 * 1. Return of Capital (100% to LPs)
 * 2. Preferred Return (100% to LPs until hurdle met)
 * 3. GP Catch-Up (100% to GP until GP has earned target carry %)
 * 4. Remaining Carry (Split between LP and GP, e.g., 80/20)
 */
function calculateWaterfallModel(
  scenario: WaterfallScenario,
  options: WaterfallCalculationOptions
): WaterfallResults {
  const {
    investorClasses,
    tiers,
    exitValue,
    totalInvested: scenarioTotalInvested,
    managementFees,
  } = scenario;
  const totalInvested = resolveTotalInvested(
    investorClasses,
    scenarioTotalInvested,
    options
  );

  // Sort tiers by order
  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  let remainingProceeds = exitValue;
  const tierBreakdowns: TierBreakdown[] = [];
  const investorClassResults: InvestorClassResult[] = [];

  // Initialize investor class results
  const classResultsMap = new Map<string, InvestorClassResult>();
  investorClasses.forEach((ic) => {
    classResultsMap.set(ic.id, {
      investorClassId: ic.id,
      investorClassName: ic.name,
      invested: getInvestedAmount(ic, options.investedBasis),
      returned: 0,
      multiple: 0,
      irr: 0,
      carry: 0,
      netReturn: 0,
      profit: 0,
      allocations: [],
    });
  });

  let cumulativeAmount = 0;

  // Process each tier
  for (const tier of sortedTiers) {
    if (remainingProceeds <= 0) break;

    let tierAmount = 0;
    let gpAmount = 0;
    let lpAmount = 0;
    const allocations: TierAllocation[] = [];

    if (tier.type === 'catch-up' && !options.includeCatchUp) {
      tierBreakdowns.push({
        tierId: tier.id,
        tierName: tier.name,
        tierType: tier.type,
        totalAmount: 0,
        gpAmount: 0,
        lpAmount: 0,
        percentage: 0,
        cumulativeAmount,
        allocations,
      });
      continue;
    }

    switch (tier.type) {
      case 'roc': {
        // Return of Capital - 100% to LPs pro-rata
        tierAmount = Math.min(remainingProceeds, totalInvested);
        lpAmount = tierAmount;
        gpAmount = 0;

        // Distribute to LPs based on ownership
        const lpClasses = investorClasses.filter((ic) => ic.type === 'lp');
        const totalLPOwnership = lpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        lpClasses.forEach((ic) => {
          const allocation = (tierAmount * ic.ownershipPercentage) / totalLPOwnership;
          allocations.push({
            tierId: tier.id,
            tierName: tier.name,
            investorClassId: ic.id,
            investorClassName: ic.name,
            amount: allocation,
            percentage: (allocation / tierAmount) * 100,
            cumulativeAmount: cumulativeAmount + allocation,
          });

          const result = classResultsMap.get(ic.id)!;
          result.returned += allocation;
          result.allocations.push(allocations[allocations.length - 1]);
        });
        break;
      }

      case 'preferred-return': {
        // Preferred Return - 100% to LPs until hurdle met
        const hurdleRate = tier.hurdleRate || 8;
        const years = 3; // Simplified - should calculate from actual dates
        const preferredAmount = calculatePreferredReturn(totalInvested, hurdleRate, years);
        tierAmount = Math.min(remainingProceeds, preferredAmount);
        lpAmount = tierAmount;
        gpAmount = 0;

        // Distribute to LPs based on ownership
        const lpClasses = investorClasses.filter((ic) => ic.type === 'lp');
        const totalLPOwnership = lpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        lpClasses.forEach((ic) => {
          const allocation = (tierAmount * ic.ownershipPercentage) / totalLPOwnership;
          allocations.push({
            tierId: tier.id,
            tierName: tier.name,
            investorClassId: ic.id,
            investorClassName: ic.name,
            amount: allocation,
            percentage: (allocation / tierAmount) * 100,
            cumulativeAmount: cumulativeAmount + allocation,
          });

          const result = classResultsMap.get(ic.id)!;
          result.returned += allocation;
          result.allocations.push(allocations[allocations.length - 1]);
        });
        break;
      }

      case 'catch-up': {
        // GP Catch-Up - 100% to GP until GP has target carry %
        const targetCarryPct = tier.gpCarryPercentage || 20;
        const distributedSoFar = cumulativeAmount;
        const targetGPAmount = (distributedSoFar * targetCarryPct) / (100 - targetCarryPct);
        const currentGPAmount = Array.from(classResultsMap.values())
          .filter((r) => {
            const ic = investorClasses.find((c) => c.id === r.investorClassId);
            return ic?.type === 'gp';
          })
          .reduce((sum, r) => sum + r.returned, 0);

        const catchUpNeeded = Math.max(0, targetGPAmount - currentGPAmount);
        tierAmount = Math.min(remainingProceeds, catchUpNeeded);
        gpAmount = tierAmount;
        lpAmount = 0;

        // Distribute to GPs
        const gpClasses = investorClasses.filter((ic) => ic.type === 'gp');
        const totalGPOwnership = gpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        gpClasses.forEach((ic) => {
          const allocation = (tierAmount * ic.ownershipPercentage) / totalGPOwnership;
          allocations.push({
            tierId: tier.id,
            tierName: tier.name,
            investorClassId: ic.id,
            investorClassName: ic.name,
            amount: allocation,
            percentage: (allocation / tierAmount) * 100,
            cumulativeAmount: cumulativeAmount + allocation,
          });

          const result = classResultsMap.get(ic.id)!;
          result.returned += allocation;
          result.carry += allocation;
          result.allocations.push(allocations[allocations.length - 1]);
        });
        break;
      }

      case 'carry': {
        // Remaining Carry - Split between LP and GP
        tierAmount = remainingProceeds;
        const gpCarryPct = tier.gpCarryPercentage || 20;
        const lpPct = tier.lpPercentage || 80;

        gpAmount = (tierAmount * gpCarryPct) / 100;
        lpAmount = (tierAmount * lpPct) / 100;

        // Distribute to LPs
        const lpClasses = investorClasses.filter((ic) => ic.type === 'lp');
        const totalLPOwnership = lpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        lpClasses.forEach((ic) => {
          const allocation = (lpAmount * ic.ownershipPercentage) / totalLPOwnership;
          allocations.push({
            tierId: tier.id,
            tierName: tier.name,
            investorClassId: ic.id,
            investorClassName: ic.name,
            amount: allocation,
            percentage: (allocation / tierAmount) * 100,
            cumulativeAmount: cumulativeAmount + allocation,
          });

          const result = classResultsMap.get(ic.id)!;
          result.returned += allocation;
          result.allocations.push(allocations[allocations.length - 1]);
        });

        // Distribute to GPs
        const gpClasses = investorClasses.filter((ic) => ic.type === 'gp');
        const totalGPOwnership = gpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        gpClasses.forEach((ic) => {
          const allocation = (gpAmount * ic.ownershipPercentage) / totalGPOwnership;
          allocations.push({
            tierId: tier.id,
            tierName: tier.name,
            investorClassId: ic.id,
            investorClassName: ic.name,
            amount: allocation,
            percentage: (allocation / tierAmount) * 100,
            cumulativeAmount: cumulativeAmount + allocation,
          });

          const result = classResultsMap.get(ic.id)!;
          result.returned += allocation;
          result.carry += allocation;
          result.allocations.push(allocations[allocations.length - 1]);
        });
        break;
      }

      case 'custom': {
        // Custom tier - use defined split percentages
        tierAmount = tier.threshold ? Math.min(remainingProceeds, tier.threshold) : remainingProceeds;
        const gpCarryPct = tier.gpCarryPercentage || 0;
        const lpPct = tier.lpPercentage || 100;

        gpAmount = (tierAmount * gpCarryPct) / 100;
        lpAmount = (tierAmount * lpPct) / 100;

        // Similar distribution logic as carry tier
        const lpClasses = investorClasses.filter((ic) => ic.type === 'lp');
        const totalLPOwnership = lpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        if (totalLPOwnership > 0) {
          lpClasses.forEach((ic) => {
            const allocation = (lpAmount * ic.ownershipPercentage) / totalLPOwnership;
            allocations.push({
              tierId: tier.id,
              tierName: tier.name,
              investorClassId: ic.id,
              investorClassName: ic.name,
              amount: allocation,
              percentage: (allocation / tierAmount) * 100,
              cumulativeAmount: cumulativeAmount + allocation,
            });

            const result = classResultsMap.get(ic.id)!;
            result.returned += allocation;
            result.allocations.push(allocations[allocations.length - 1]);
          });
        }

        const gpClasses = investorClasses.filter((ic) => ic.type === 'gp');
        const totalGPOwnership = gpClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);

        if (totalGPOwnership > 0) {
          gpClasses.forEach((ic) => {
            const allocation = (gpAmount * ic.ownershipPercentage) / totalGPOwnership;
            allocations.push({
              tierId: tier.id,
              tierName: tier.name,
              investorClassId: ic.id,
              investorClassName: ic.name,
              amount: allocation,
              percentage: (allocation / tierAmount) * 100,
              cumulativeAmount: cumulativeAmount + allocation,
            });

            const result = classResultsMap.get(ic.id)!;
            result.returned += allocation;
            result.carry += allocation;
            result.allocations.push(allocations[allocations.length - 1]);
          });
        }
        break;
      }
    }

    cumulativeAmount += tierAmount;
    remainingProceeds -= tierAmount;

    tierBreakdowns.push({
      tierId: tier.id,
      tierName: tier.name,
      tierType: tier.type,
      totalAmount: tierAmount,
      gpAmount,
      lpAmount,
      percentage: exitValue > 0 ? (tierAmount / exitValue) * 100 : 0,
      cumulativeAmount,
      allocations,
    });
  }

  // Finalize investor class results
  Array.from(classResultsMap.values()).forEach((result) => {
    result.multiple = calculateMOIC(result.invested, result.returned);
    result.netReturn = result.returned - result.invested;
    result.profit = result.netReturn;

    // Simplified IRR calculation (would need actual cash flow dates in production)
    const cashflows = [-result.invested, result.returned];
    const dates = [new Date('2021-01-01'), new Date()];
    result.irr = calculateIRR(cashflows, dates);

    investorClassResults.push(result);
  });

  // Calculate aggregate metrics
  const gpResults = investorClassResults.filter((r) => {
    const ic = investorClasses.find((c) => c.id === r.investorClassId);
    return ic?.type === 'gp';
  });

  const lpResults = investorClassResults.filter((r) => {
    const ic = investorClasses.find((c) => c.id === r.investorClassId);
    return ic?.type === 'lp';
  });

  const gpCarry = gpResults.reduce((sum, r) => sum + r.carry, 0);
  const gpTotalReturn = gpResults.reduce((sum, r) => sum + r.returned, 0);
  const lpTotalReturn = lpResults.reduce((sum, r) => sum + r.returned, 0);
  const lpAverageMultiple = lpResults.length > 0
    ? lpResults.reduce((sum, r) => sum + r.multiple, 0) / lpResults.length
    : 0;

  return {
    totalExitValue: exitValue,
    totalInvested,
    totalReturned: exitValue,
    gpCarry,
    gpCarryPercentage: (gpCarry / exitValue) * 100,
    gpManagementFees: managementFees,
    gpTotalReturn,
    lpTotalReturn,
    lpAverageMultiple,
    investorClassResults,
    tierBreakdown: tierBreakdowns,
  };
}

export function calculateEuropeanWaterfall(scenario: WaterfallScenario): WaterfallResults {
  const results = calculateWaterfallModel(scenario, {
    includeCatchUp: true,
    investedBasis: 'commitment',
  });
  return applyPhase6Enhancements(scenario, results);
}

// ============================================================================
// American Waterfall Model
// ============================================================================

/**
 * Calculate American waterfall distribution
 * American model: Deal-by-deal carry calculation
 *
 * Typical structure:
 * 1. Return of Capital (100% to LPs)
 * 2. Preferred Return (100% to LPs until hurdle met)
 * 3. Carry on All Proceeds (Split on all remaining proceeds, e.g., 80/20)
 */
export function calculateAmericanWaterfall(scenario: WaterfallScenario): WaterfallResults {
  // American model approximated as deal-by-deal carry using capital-called basis.
  // Catch-up tiers are skipped to reflect standard American structures.
  const results = calculateWaterfallModel(scenario, {
    includeCatchUp: false,
    investedBasis: 'capitalCalled',
  });
  return applyPhase6Enhancements(scenario, results);
}

// ============================================================================
// Blended Waterfall Model
// ============================================================================

const blendNumber = (a: number, b: number, weightA: number, weightB: number) =>
  a * weightA + b * weightB;

const blendAllocations = (
  european: TierAllocation[],
  american: TierAllocation[],
  weightEuropean: number,
  weightAmerican: number
): TierAllocation[] => {
  const map = new Map<string, TierAllocation>();
  european.forEach((allocation) => {
    map.set(`${allocation.tierId}-${allocation.investorClassId}`, allocation);
  });
  american.forEach((allocation) => {
    const key = `${allocation.tierId}-${allocation.investorClassId}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, allocation);
    } else {
      map.set(key, {
        ...existing,
        amount: blendNumber(existing.amount, allocation.amount, weightEuropean, weightAmerican),
        percentage: blendNumber(
          existing.percentage,
          allocation.percentage,
          weightEuropean,
          weightAmerican
        ),
        cumulativeAmount: blendNumber(
          existing.cumulativeAmount,
          allocation.cumulativeAmount,
          weightEuropean,
          weightAmerican
        ),
      });
    }
  });
  return Array.from(map.values());
};

const blendInvestorResults = (
  european: InvestorClassResult[],
  american: InvestorClassResult[],
  weightEuropean: number,
  weightAmerican: number
): InvestorClassResult[] => {
  const americanMap = new Map(american.map((result) => [result.investorClassId, result]));
  return european.map((result) => {
    const match = americanMap.get(result.investorClassId);
    if (!match) return result;
    return {
      ...result,
      invested: blendNumber(result.invested, match.invested, weightEuropean, weightAmerican),
      returned: blendNumber(result.returned, match.returned, weightEuropean, weightAmerican),
      multiple: blendNumber(result.multiple, match.multiple, weightEuropean, weightAmerican),
      irr: blendNumber(result.irr, match.irr, weightEuropean, weightAmerican),
      carry: blendNumber(result.carry, match.carry, weightEuropean, weightAmerican),
      netReturn: blendNumber(result.netReturn, match.netReturn, weightEuropean, weightAmerican),
      profit: blendNumber(result.profit, match.profit, weightEuropean, weightAmerican),
      allocations: blendAllocations(
        result.allocations,
        match.allocations,
        weightEuropean,
        weightAmerican
      ),
    };
  });
};

const blendTierBreakdown = (
  european: TierBreakdown[],
  american: TierBreakdown[],
  exitValue: number,
  weightEuropean: number,
  weightAmerican: number
): TierBreakdown[] => {
  const americanMap = new Map(american.map((tier) => [tier.tierId, tier]));
  let cumulativeAmount = 0;
  return european.map((tier) => {
    const match = americanMap.get(tier.tierId);
    const totalAmount = match
      ? blendNumber(tier.totalAmount, match.totalAmount, weightEuropean, weightAmerican)
      : tier.totalAmount;
    const gpAmount = match
      ? blendNumber(tier.gpAmount, match.gpAmount, weightEuropean, weightAmerican)
      : tier.gpAmount;
    const lpAmount = match
      ? blendNumber(tier.lpAmount, match.lpAmount, weightEuropean, weightAmerican)
      : tier.lpAmount;
    cumulativeAmount += totalAmount;
    return {
      ...tier,
      totalAmount,
      gpAmount,
      lpAmount,
      percentage: exitValue > 0 ? (totalAmount / exitValue) * 100 : 0,
      cumulativeAmount,
      allocations: match
        ? blendAllocations(tier.allocations, match.allocations, weightEuropean, weightAmerican)
        : tier.allocations,
    };
  });
};

export function calculateBlendedWaterfall(scenario: WaterfallScenario): WaterfallResults {
  const { weights, european, american } = normalizeBlendConfig(scenario.blendedConfig);
  const europeanResults = calculateEuropeanWaterfall({ ...scenario, model: 'european' });
  const americanResults = calculateAmericanWaterfall({ ...scenario, model: 'american' });

  const blendedResults: WaterfallResults = {
    totalExitValue: scenario.exitValue,
    totalInvested: scenario.totalInvested,
    totalReturned: blendNumber(
      europeanResults.totalReturned,
      americanResults.totalReturned,
      european,
      american
    ),
    gpCarry: blendNumber(europeanResults.gpCarry, americanResults.gpCarry, european, american),
    gpCarryPercentage: blendNumber(
      europeanResults.gpCarryPercentage,
      americanResults.gpCarryPercentage,
      european,
      american
    ),
    gpManagementFees: blendNumber(
      europeanResults.gpManagementFees,
      americanResults.gpManagementFees,
      european,
      american
    ),
    gpTotalReturn: blendNumber(
      europeanResults.gpTotalReturn,
      americanResults.gpTotalReturn,
      european,
      american
    ),
    lpTotalReturn: blendNumber(
      europeanResults.lpTotalReturn,
      americanResults.lpTotalReturn,
      european,
      american
    ),
    lpAverageMultiple: blendNumber(
      europeanResults.lpAverageMultiple,
      americanResults.lpAverageMultiple,
      european,
      american
    ),
    investorClassResults: blendInvestorResults(
      europeanResults.investorClassResults,
      americanResults.investorClassResults,
      european,
      american
    ),
    tierBreakdown: blendTierBreakdown(
      europeanResults.tierBreakdown,
      americanResults.tierBreakdown,
      scenario.exitValue,
      european,
      american
    ),
  };

  return applyPhase6Enhancements(scenario, blendedResults, weights);
}

// ============================================================================
// Main Calculation Entry Point
// ============================================================================

/**
 * Calculate waterfall based on scenario model type
 */
export function calculateWaterfall(scenario: WaterfallScenario): WaterfallResults {
  switch (scenario.model) {
    case 'european':
      return calculateEuropeanWaterfall(scenario);
    case 'american':
      return calculateAmericanWaterfall(scenario);
    case 'blended':
      return calculateBlendedWaterfall(scenario);
    default:
      throw new Error(`Unsupported waterfall model: ${scenario.model}`);
  }
}

// ============================================================================
// Sensitivity Analysis
// ============================================================================

/**
 * Calculate sensitivity analysis across a range of exit values
 */
export function calculateSensitivityAnalysis(
  scenario: WaterfallScenario,
  minExitValue: number,
  maxExitValue: number,
  steps: number = 20
): SensitivityAnalysis {
  const step = (maxExitValue - minExitValue) / steps;
  const dataPoints: SensitivityDataPoint[] = [];
  const breakEvenPoints: { tierName: string; exitValue: number }[] = [];
  const activatedTiers = new Set<string>();
  let previousResults: WaterfallResults | null = null;

  for (let i = 0; i <= steps; i++) {
    const exitValue = minExitValue + step * i;
    const testScenario = { ...scenario, exitValue };
    const results = calculateWaterfall(testScenario);

    const lpResults = results.investorClassResults.filter((r) => {
      const ic = scenario.investorClasses.find((c) => c.id === r.investorClassId);
      return ic?.type === 'lp';
    });

    const lpReturn = lpResults.reduce((sum, r) => sum + r.returned, 0);
    const lpMultiple = lpResults.length > 0
      ? lpResults.reduce((sum, r) => sum + r.multiple, 0) / lpResults.length
      : 0;

    dataPoints.push({
      exitValue,
      gpCarry: results.gpCarry,
      gpCarryPercentage: results.gpCarryPercentage,
      lpReturn,
      lpMultiple,
      totalMultiple: calculateMOIC(scenario.totalInvested, exitValue),
    });

    // Detect break-even points (tier activations)
    if (previousResults) {
      const previousTotals = new Map(
        previousResults.tierBreakdown.map((tier) => [tier.tierId, tier.totalAmount])
      );
      results.tierBreakdown.forEach((tier) => {
        const prevAmount = previousTotals.get(tier.tierId) ?? 0;
        if (prevAmount <= 0 && tier.totalAmount > 0 && !activatedTiers.has(tier.tierId)) {
          activatedTiers.add(tier.tierId);
          breakEvenPoints.push({
            tierName: tier.tierName,
            exitValue,
          });
        }
      });
    } else {
      results.tierBreakdown.forEach((tier) => {
        if (tier.totalAmount > 0) {
          activatedTiers.add(tier.tierId);
        }
      });
    }

    previousResults = results;
  }

  return {
    scenarioId: scenario.id,
    minExitValue,
    maxExitValue,
    step,
    dataPoints,
    breakEvenPoints,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format multiple (MOIC) for display
 */
export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}
