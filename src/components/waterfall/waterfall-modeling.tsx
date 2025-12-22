'use client';

import { Card, Button, Badge, Input, Progress } from '@/ui';
import { TrendingDown, DollarSign, TrendingUp, PieChart, Trash2, Play, Layers, ArrowRight, Globe, Flag, Calculator } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { formatCurrencyCompact } from '@/utils/formatting';
import { PageScaffold } from '@/components/ui';

type WaterfallModel = 'european' | 'american';

interface InvestorClass {
  id: string;
  name: string;
  type: 'common' | 'preferred' | 'participating-preferred';
  investedAmount: number;
  ownership: number;
  liquidationPreference: number;
  participationCap?: number;
  color: string;
}

interface Scenario {
  id: string;
  name: string;
  exitValue: number;
  model: WaterfallModel;
  results: { classId: string; distribution: number; multiple: number; carry?: number }[];
  gpCarry: number;
}

const defaultInvestorClasses: InvestorClass[] = [
  {
    id: 'class-a',
    name: 'Class A Common',
    type: 'common',
    investedAmount: 3_000_000,
    ownership: 25,
    liquidationPreference: 0,
    color: 'var(--app-info)'
  },
  {
    id: 'class-b',
    name: 'Class B Common',
    type: 'common',
    investedAmount: 2_000_000,
    ownership: 15,
    liquidationPreference: 0,
    color: 'var(--app-accent)'
  },
  {
    id: 'series-a',
    name: 'Series A Preferred',
    type: 'preferred',
    investedAmount: 10_000_000,
    ownership: 35,
    liquidationPreference: 1,
    color: 'var(--app-primary)'
  },
  {
    id: 'series-b',
    name: 'Series B Preferred',
    type: 'participating-preferred',
    investedAmount: 20_000_000,
    ownership: 25,
    liquidationPreference: 1.5,
    participationCap: 3,
    color: 'var(--app-secondary)'
  },
];

export function WaterfallModeling() {
  const { value: ui, patch: patchUI } = useUIKey<{
    investorClasses: InvestorClass[];
    exitValue: number;
    scenarios: Scenario[];
    showAddClass: boolean;
    waterfallModel: WaterfallModel;
    hurdleRate: number;
    carryPercentage: number;
  }>('waterfall-modeling', {
    investorClasses: defaultInvestorClasses,
    exitValue: 100_000_000,
    scenarios: [],
    showAddClass: false,
    waterfallModel: 'european',
    hurdleRate: 8,
    carryPercentage: 20,
  });
  const { investorClasses, exitValue, scenarios, waterfallModel, hurdleRate, carryPercentage } = ui;

  const totalInvested = investorClasses.reduce((sum, ic) => sum + ic.investedAmount, 0);

  const calculateWaterfall = (exitVal: number, model: WaterfallModel): { results: { classId: string; distribution: number; multiple: number }[]; gpCarry: number } => {
    let remaining = exitVal;
    const results: { classId: string; distribution: number; multiple: number }[] = [];
    let gpCarry = 0;

    // Sort by liquidation preference (highest first)
    const sortedClasses = [...investorClasses].sort((a, b) => b.liquidationPreference - a.liquidationPreference);

    if (model === 'european') {
      // EUROPEAN (WHOLE-FUND) WATERFALL
      // 1. Return all contributed capital to LPs first
      // 2. Pay hurdle/preferred return on entire fund
      // 3. GP catch-up (if applicable)
      // 4. Remaining profit split (80/20)

      // Step 1: Return of Capital
      const totalCapital = totalInvested;
      const capitalReturn = Math.min(totalCapital, remaining);
      remaining -= capitalReturn;

      // Distribute capital return proportionally
      for (const ic of investorClasses) {
        const share = (ic.investedAmount / totalCapital) * capitalReturn;
        results.push({ classId: ic.id, distribution: share, multiple: share / ic.investedAmount });
      }

      // Step 2: Preferred Return (hurdle)
      const hurdleAmount = totalCapital * (hurdleRate / 100);
      const hurdlePayment = Math.min(hurdleAmount, remaining);
      remaining -= hurdlePayment;

      // Add hurdle to LP distributions
      for (const ic of investorClasses) {
        const hurdleShare = (ic.investedAmount / totalCapital) * hurdlePayment;
        const existing = results.find(r => r.classId === ic.id)!;
        existing.distribution += hurdleShare;
        existing.multiple = existing.distribution / ic.investedAmount;
      }

      // Step 3: GP Catch-up (20% of hurdle to equalize)
      const catchUp = Math.min(remaining, hurdlePayment * (carryPercentage / (100 - carryPercentage)));
      gpCarry += catchUp;
      remaining -= catchUp;

      // Step 4: Profit split (80/20)
      const lpProfitShare = remaining * ((100 - carryPercentage) / 100);
      gpCarry += remaining * (carryPercentage / 100);

      for (const ic of investorClasses) {
        const profitShare = (ic.investedAmount / totalCapital) * lpProfitShare;
        const existing = results.find(r => r.classId === ic.id)!;
        existing.distribution += profitShare;
        existing.multiple = existing.distribution / ic.investedAmount;
      }

    } else {
      // AMERICAN (DEAL-BY-DEAL) WATERFALL
      // 1. Pay liquidation preferences first
      // 2. GP can take carry on profitable deals immediately
      // 3. Remaining distributed pro-rata

      // Step 1: Pay liquidation preferences
      for (const ic of sortedClasses) {
        if (ic.liquidationPreference > 0) {
          const prefAmount = ic.investedAmount * ic.liquidationPreference;
          const payout = Math.min(prefAmount, remaining);
          results.push({ classId: ic.id, distribution: payout, multiple: payout / ic.investedAmount });
          remaining -= payout;
        }
      }

      // Step 2: Calculate GP carry on profits above capital
      if (remaining > 0) {
        const profits = remaining;
        gpCarry = profits * (carryPercentage / 100);
        const lpShare = profits * ((100 - carryPercentage) / 100);
        remaining = lpShare;
      }

      // Step 3: Distribute remaining pro-rata
      if (remaining > 0) {
        for (const ic of investorClasses) {
          const proRataShare = (ic.ownership / 100) * remaining;
          const existingResult = results.find(r => r.classId === ic.id);
          if (existingResult) {
            existingResult.distribution += proRataShare;
            existingResult.multiple = existingResult.distribution / ic.investedAmount;
          } else {
            results.push({
              classId: ic.id,
              distribution: proRataShare,
              multiple: proRataShare / ic.investedAmount
            });
          }
        }
      }
    }

    // Ensure all classes have a result
    for (const ic of investorClasses) {
      if (!results.find(r => r.classId === ic.id)) {
        results.push({ classId: ic.id, distribution: 0, multiple: 0 });
      }
    }

    return { results, gpCarry };
  };

  const runScenario = () => {
    const { results, gpCarry } = calculateWaterfall(exitValue, waterfallModel);
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `${formatCurrencyCompact(exitValue)} Exit (${waterfallModel === 'european' ? 'EU' : 'US'})`,
      exitValue,
      model: waterfallModel,
      results,
      gpCarry
    };
    patchUI({ scenarios: [...scenarios, newScenario] });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'common': return 'Common';
      case 'preferred': return 'Non-Participating Preferred';
      case 'participating-preferred': return 'Participating Preferred';
      default: return type;
    }
  };

  return (
    <PageScaffold
      routePath="/waterfall"
      header={{
        title: 'Waterfall Modeling',
        description: 'Model exit scenarios and distribution waterfalls',
        icon: TrendingDown,
        aiSummary: {
          text: `${investorClasses.length} investor classes totaling ${formatCurrencyCompact(totalInvested)} invested. ${scenarios.length} scenario${scenarios.length !== 1 ? 's' : ''} modeled. Current model: ${waterfallModel === 'european' ? 'European (whole-fund)' : 'American (deal-by-deal)'} waterfall.`,
          confidence: 0.91,
        },
        secondaryActions: [
          {
            label: 'Export',
            onClick: () => console.log('Export waterfall models'),
          },
        ],
        primaryAction: {
          label: 'Add Class',
          onClick: () => patchUI({ showAddClass: true }),
        },
      }}
    >
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Investor Classes */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--app-primary)]" />
              Investor Classes
            </h3>
            <div className="space-y-3">
              {investorClasses.map((ic) => (
                <div
                  key={ic.id}
                  className="p-4 rounded-lg border border-[var(--app-border)] hover:border-[var(--app-primary)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ic.color }}
                      />
                      <div>
                        <h4 className="font-medium">{ic.name}</h4>
                        <Badge size="sm" variant="flat" className="mt-1">
                          {getTypeLabel(ic.type)}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="light" isIconOnly className="text-[var(--app-text-muted)]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-[var(--app-text-muted)] mb-1">Invested</div>
                      <div className="font-medium">{formatCurrencyCompact(ic.investedAmount)}</div>
                    </div>
                    <div>
                      <div className="text-[var(--app-text-muted)] mb-1">Ownership</div>
                      <div className="font-medium">{ic.ownership}%</div>
                    </div>
                    <div>
                      <div className="text-[var(--app-text-muted)] mb-1">Liq. Pref</div>
                      <div className="font-medium">{ic.liquidationPreference}x</div>
                    </div>
                    {ic.participationCap && (
                      <div>
                        <div className="text-[var(--app-text-muted)] mb-1">Cap</div>
                        <div className="font-medium">{ic.participationCap}x</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--app-border)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--app-text-muted)]">Total Invested</span>
                <span className="font-semibold">{formatCurrencyCompact(totalInvested)}</span>
              </div>
            </div>
          </Card>

          {/* Scenario Results */}
          {scenarios.length > 0 && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--app-success)]" />
                Scenario Results
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--app-border)]">
                      <th className="text-left py-3 px-2 font-medium text-[var(--app-text-muted)]">Scenario</th>
                      {investorClasses.map((ic) => (
                        <th key={ic.id} className="text-right py-3 px-2 font-medium text-[var(--app-text-muted)]">
                          {ic.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario) => (
                      <tr key={scenario.id} className="border-b border-[var(--app-border-subtle)]">
                        <td className="py-3 px-2">
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-xs text-[var(--app-text-muted)]">
                            {formatCurrencyCompact(scenario.exitValue)} exit
                          </div>
                        </td>
                        {investorClasses.map((ic) => {
                          const result = scenario.results.find(r => r.classId === ic.id);
                          return (
                            <td key={ic.id} className="text-right py-3 px-2">
                              <div className="font-medium">{formatCurrencyCompact(result?.distribution || 0)}</div>
                              <div className={`text-xs ${(result?.multiple || 0) >= 1 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
                                {(result?.multiple || 0).toFixed(2)}x
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Scenario Builder */}
        <div className="space-y-4">
          {/* Waterfall Model Selector */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--app-primary)]" />
              Waterfall Model
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => patchUI({ waterfallModel: 'european' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  waterfallModel === 'european'
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                    : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-[var(--app-primary)]" />
                  <span className="font-medium">European</span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Whole-fund waterfall. GP receives carry only after all LP capital returned.
                </p>
              </button>
              <button
                onClick={() => patchUI({ waterfallModel: 'american' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  waterfallModel === 'american'
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                    : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-5 h-5 text-[var(--app-secondary)]" />
                  <span className="font-medium">American</span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Deal-by-deal waterfall. GP can receive carry on individual profitable exits.
                </p>
              </button>
            </div>

            {/* Hurdle Rate & Carry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Hurdle Rate</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={hurdleRate.toString()}
                    onChange={(e) => patchUI({ hurdleRate: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-[var(--app-text-muted)]">%</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">GP Carry</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={carryPercentage.toString()}
                    onChange={(e) => patchUI({ carryPercentage: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-[var(--app-text-muted)]">%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-[var(--app-primary)]" />
              Run Scenario
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Exit Value</label>
                <Input
                  type="number"
                  value={exitValue.toString()}
                  onChange={(e) => patchUI({ exitValue: Number(e.target.value) })}
                  startContent={<DollarSign className="w-4 h-4 text-[var(--app-text-muted)]" />}
                  placeholder="100000000"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Scenarios</label>
                <div className="grid grid-cols-2 gap-2">
                  {[50_000_000, 100_000_000, 250_000_000, 500_000_000].map((val) => (
                    <Button
                      key={val}
                      size="sm"
                      variant={exitValue === val ? 'solid' : 'flat'}
                      color={exitValue === val ? 'primary' : 'default'}
                      onPress={() => patchUI({ exitValue: val })}
                    >
                      {formatCurrencyCompact(val)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                color="primary"
                className="w-full"
                size="lg"
                startContent={<Play className="w-4 h-4" />}
                onPress={runScenario}
              >
                Calculate Distribution
              </Button>
            </div>
          </Card>

          {/* Waterfall Visualization */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[var(--app-secondary)]" />
              Distribution Preview
            </h3>

            {scenarios.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const latestScenario = scenarios[scenarios.length - 1];
                  return investorClasses.map((ic) => {
                    const result = latestScenario.results.find(r => r.classId === ic.id);
                    const percentage = ((result?.distribution || 0) / latestScenario.exitValue) * 100;
                    return (
                      <div key={ic.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ic.color }} />
                            {ic.name}
                          </span>
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={percentage}
                          maxValue={100}
                          className="h-2"
                          aria-label={`${ic.name} distribution ${percentage.toFixed(1)}%`}
                          style={{ ['--progress-color' as string]: ic.color }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--app-text-muted)]">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Run a scenario to see distribution</p>
              </div>
            )}
          </Card>

          {/* Waterfall Steps */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4">Waterfall Steps</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Liquidation Preferences</div>
                  <div className="text-[var(--app-text-muted)]">Pay preferred shareholders their preferences first</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--app-text-muted)] ml-1" />
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Participation</div>
                  <div className="text-[var(--app-text-muted)]">Participating preferred shares in remaining proceeds</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--app-text-muted)] ml-1" />
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="font-medium">Pro-Rata Distribution</div>
                  <div className="text-[var(--app-text-muted)]">Remaining proceeds distributed by ownership</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}
