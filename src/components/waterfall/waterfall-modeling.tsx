'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Input, Select } from '@/ui';
import {
  TrendingDown,
  Play,
  Printer,
  BarChart3,
  Layers,
  Users,
  Globe,
  Flag,
  Shuffle,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatCurrencyCompact } from '@/utils/formatting';
import { PageScaffold, SectionHeader } from '@/ui/composites';
import { AsyncStateRenderer } from '@/ui/async-states';
import { InvestorClassManager } from '@/components/waterfall/investor-class-manager';
import { WaterfallBarChart } from '@/components/waterfall/charts/waterfall-bar-chart';
import { ScenarioStackedChart } from '@/components/waterfall/charts/scenario-stacked-chart';
import { LPWaterfallDetail } from '@/components/waterfall/charts/lp-waterfall-detail';
import { TierBreakdownTable } from '@/components/waterfall/tier-breakdown-table';
import { TierTimeline } from '@/components/waterfall/tier-timeline';
import { ClawbackCalculator } from '@/components/waterfall/clawback-calculator';
import { LookbackTracker } from '@/components/waterfall/lookback-tracker';
import { SensitivityPanel } from '@/components/waterfall/sensitivity-panel';
import { ScenarioManager } from '@/components/waterfall/scenario-manager';
import { ExportMenu } from '@/components/waterfall/export-menu';
import { CustomTierBuilder } from '@/components/waterfall/custom-tier-builder';
import { calculateWaterfall } from '@/lib/calculations/waterfall';
import type {
  InvestorClass,
  WaterfallTemplate,
  WaterfallModel,
  WaterfallResults,
  WaterfallScenario,
  WaterfallTier,
} from '@/types/waterfall';
import {
  addComparisonScenario,
  clearComparisonScenarios,
  createScenarioRequested,
  deleteScenarioRequested,
  duplicateScenarioRequested,
  removeComparisonScenario,
  scenariosRequested,
  scenariosSelectors,
  setSelectedScenario,
  templatesRequested,
  templatesSelectors,
  toggleFavoriteRequested,
  updateScenarioRequested,
  waterfallUISelectors,
} from '@/store/slices/waterfallSlice';
import {
  distributionsRequested,
  distributionsSelectors,
} from '@/store/slices/distributionSlice';
import { useAsyncData } from '@/hooks/useAsyncData';
import { mockInvestorClasses, mockWaterfallTemplates } from '@/data/mocks/analytics/waterfall';

const chartOptions = [
  { id: 'waterfall', label: 'Waterfall Flow', icon: BarChart3 },
  { id: 'scenario', label: 'Scenario Comparison', icon: Layers },
  { id: 'lp', label: 'LP Detail', icon: Users },
] as const;

type ChartOptionId = typeof chartOptions[number]['id'];

type WaterfallUIState = {
  exitValueInput: number;
  activeChart: ChartOptionId;
  printMode: boolean;
  selectedLpId: string | null;
  pendingScenarioSelection: boolean;
};

const computeTotalInvested = (classes: InvestorClass[]) =>
  classes.reduce((sum, investorClass) => sum + investorClass.commitment, 0);

const getModelLabel = (model: WaterfallModel) =>
  model === 'european' ? 'European' : model === 'american' ? 'American' : 'Blended';

const getModelShortLabel = (model: WaterfallModel) =>
  model === 'european' ? 'EU' : model === 'american' ? 'US' : 'Blend';

const buildScenarioName = (scenario: WaterfallScenario, exitValue: number) =>
  `${formatCurrencyCompact(exitValue)} Exit (${getModelShortLabel(scenario.model)})`;

const buildStarterScenario = (
  template?: WaterfallTemplate
): Omit<WaterfallScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'> => {
  const baseTemplate = template ?? mockWaterfallTemplates[0];
  const now = new Date().toISOString();
  const seed = Date.now();
  const investorClasses = mockInvestorClasses.map((investorClass, index) => ({
    ...investorClass,
    id: `ic-${seed}-${index}`,
    createdAt: now,
    updatedAt: now,
  }));
  const tiers = (baseTemplate?.tiers ?? []).map((tier, index) => ({
    ...tier,
    id: `tier-${seed}-${index}`,
    order: tier.order ?? index,
  }));

  return {
    name: 'Starter Scenario',
    description: 'Auto-generated starter scenario',
    model: baseTemplate?.model ?? 'european',
    investorClasses,
    tiers,
    exitValue: 200_000_000,
    totalInvested: computeTotalInvested(investorClasses),
    managementFees: 5_000_000,
    isFavorite: false,
    isTemplate: false,
    createdBy: 'Ops Team',
    tags: ['starter'],
  };
};

export function WaterfallModeling() {
  const dispatch = useAppDispatch();
  const selectedScenarioId = useAppSelector(waterfallUISelectors.selectSelectedScenarioId);
  const comparisonScenarioIds = useAppSelector(waterfallUISelectors.selectComparisonScenarioIds);
  const { data: scenariosData, isLoading, error, refetch } = useAsyncData(
    scenariosRequested,
    scenariosSelectors.selectState
  );
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useAsyncData(
    templatesRequested,
    templatesSelectors.selectState
  );
  const {
    data: distributionsData,
    isLoading: distributionsLoading,
    error: distributionsError,
    refetch: refetchDistributions,
  } = useAsyncData(
    distributionsRequested,
    distributionsSelectors.selectState
  );

  const scenarios = useMemo(() => scenariosData?.scenarios ?? [], [scenariosData?.scenarios]);
  const templates = useMemo(() => templatesData?.templates ?? [], [templatesData?.templates]);
  const distributions = useMemo(
    () => distributionsData?.distributions ?? [],
    [distributionsData?.distributions]
  );

  const { value: ui, patch: patchUI } = useUIKey<WaterfallUIState>('waterfall-modeling', {
    exitValueInput: 0,
    activeChart: 'waterfall',
    printMode: false,
    selectedLpId: null,
    pendingScenarioSelection: false,
  });
  const {
    exitValueInput,
    activeChart,
    printMode,
    selectedLpId = null,
    pendingScenarioSelection,
  } = ui;

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0] ?? null;

  const [activeScenario, setActiveScenario] = useState<WaterfallScenario | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const lastValidResultsRef = useRef<WaterfallResults | null>(null);

  useEffect(() => {
    if (!selectedScenario) {
      setActiveScenario(null);
      setCalculationError(null);
      return;
    }

    const totalInvested = computeTotalInvested(selectedScenario.investorClasses);
    const needsPreview =
      exitValueInput !== selectedScenario.exitValue || !selectedScenario.results;

    if (!needsPreview) {
      setActiveScenario(selectedScenario);
      if (selectedScenario.results) {
        lastValidResultsRef.current = selectedScenario.results;
      }
      setCalculationError(null);
      return;
    }

    const previewScenario: WaterfallScenario = {
      ...selectedScenario,
      exitValue: exitValueInput,
      totalInvested,
    };

    try {
      const results = calculateWaterfall(previewScenario);
      lastValidResultsRef.current = results;
      setCalculationError(null);
      setActiveScenario({ ...previewScenario, results });
    } catch (error) {
      console.error("Waterfall calculation failed", error);
      setCalculationError("Calculation failed. Showing the last valid results.");
      const fallbackResults = lastValidResultsRef.current ?? selectedScenario.results ?? null;
      setActiveScenario({ ...previewScenario, results: fallbackResults ?? undefined });
    }
  }, [exitValueInput, selectedScenario]);

  const defaultTiersByModel = useMemo<Record<WaterfallModel, WaterfallTier[]>>(() => ({
    european: scenarios.find((scenario) => scenario.model === 'european')?.tiers ?? [],
    american: scenarios.find((scenario) => scenario.model === 'american')?.tiers ?? [],
    blended:
      scenarios.find((scenario) => scenario.model === 'blended')?.tiers ??
      scenarios.find((scenario) => scenario.model === 'european')?.tiers ??
      [],
  }), [scenarios]);

  const scenarioOptions = scenarios.map((scenario) => ({
    value: scenario.id,
    label: scenario.name,
  }));

  const scenarioResults = activeScenario?.results;
  const totalInvested = activeScenario?.totalInvested ?? 0;
  const comparisonScenario = useMemo<WaterfallScenario | null>(() => {
    if (!selectedScenario) return null;
    let targetModel: WaterfallModel =
      selectedScenario.model === 'american' ? 'european' : 'american';
    if (selectedScenario.model === 'blended') {
      targetModel = 'european';
    }
    const templateTiers = defaultTiersByModel[targetModel];
    if (!templateTiers.length) return null;
    return {
      ...selectedScenario,
      model: targetModel,
      tiers: templateTiers.map((tier) => ({ ...tier })),
    };
  }, [defaultTiersByModel, selectedScenario]);
  const comparisonScenarios = useMemo(() => {
    if (!activeScenario || !selectedScenario) return scenarios;
    const baseList = comparisonScenarioIds.length > 0
      ? scenarios.filter((scenario) => comparisonScenarioIds.includes(scenario.id))
      : scenarios;
    const withActive = baseList.some((scenario) => scenario.id === selectedScenario.id)
      ? baseList.map((scenario) => (scenario.id === selectedScenario.id ? activeScenario : scenario))
      : [activeScenario, ...baseList];
    return withActive;
  }, [activeScenario, comparisonScenarioIds, scenarios, selectedScenario]);

  const scenarioDistributions = useMemo(() => {
    if (!selectedScenario) return [];
    return distributions.filter(
      (distribution) => distribution.waterfallScenarioId === selectedScenario.id
    );
  }, [distributions, selectedScenario]);

  const selectedDistribution = useMemo(() => {
    if (scenarioDistributions.length === 0) return null;
    return scenarioDistributions.reduce((latest, current) => {
      if (!latest) return current;
      const latestDate = Date.parse(latest.eventDate || latest.updatedAt);
      const currentDate = Date.parse(current.eventDate || current.updatedAt);
      const latestValue = Number.isNaN(latestDate) ? 0 : latestDate;
      const currentValue = Number.isNaN(currentDate) ? 0 : currentDate;
      return currentValue > latestValue ? current : latest;
    }, null as (typeof scenarioDistributions)[number] | null);
  }, [scenarioDistributions]);

  const lpAllocations = selectedDistribution?.lpAllocations ?? [];

  const runCalculation = (scenario: WaterfallScenario) => {
    try {
      const results = calculateWaterfall(scenario);
      lastValidResultsRef.current = results;
      setCalculationError(null);
      return results;
    } catch (error) {
      console.error("Waterfall calculation failed", error);
      setCalculationError("Calculation failed. Showing the last valid results.");
      return lastValidResultsRef.current ?? scenario.results ?? null;
    }
  };

  const updateScenario = (nextScenario: WaterfallScenario) => {
    dispatch(updateScenarioRequested({ id: nextScenario.id, data: nextScenario }));
  };

  const handleScenarioPatch = (patch: Partial<WaterfallScenario>) => {
    if (!selectedScenario) return;
    const updatedScenario: WaterfallScenario = {
      ...selectedScenario,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    updateScenario({
      ...updatedScenario,
      results: runCalculation(updatedScenario) ?? undefined,
    });
  };

  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavoriteRequested(id));
  };

  const handleDuplicateScenario = (id: string) => {
    dispatch(duplicateScenarioRequested({ id }));
  };

  const handleDeleteScenario = (id: string) => {
    dispatch(deleteScenarioRequested(id));
  };

  const handleToggleComparison = (id: string) => {
    if (comparisonScenarioIds.includes(id)) {
      dispatch(removeComparisonScenario(id));
    } else {
      dispatch(addComparisonScenario(id));
    }
  };

  const handleClearComparison = () => {
    dispatch(clearComparisonScenarios());
  };

  const handleInvestorClassesChange = (nextClasses: InvestorClass[]) => {
    if (!selectedScenario) return;

    const totalInvested = computeTotalInvested(nextClasses);
    const updatedScenario: WaterfallScenario = {
      ...selectedScenario,
      investorClasses: nextClasses,
      totalInvested,
      updatedAt: new Date().toISOString(),
    };

    updateScenario({
      ...updatedScenario,
      results: runCalculation(updatedScenario) ?? undefined,
    });
  };

  const handleModelChange = (model: WaterfallModel) => {
    if (!selectedScenario || selectedScenario.model === model) return;

    const templateTiers = defaultTiersByModel[model];
    const nextTiers =
      templateTiers.length > 0 ? templateTiers.map((tier) => ({ ...tier })) : selectedScenario.tiers;
    const blendedConfig =
      model === 'blended'
        ? selectedScenario.blendedConfig ?? { europeanWeight: 60, americanWeight: 40 }
        : selectedScenario.blendedConfig;

    const updatedScenario: WaterfallScenario = {
      ...selectedScenario,
      model,
      tiers: nextTiers,
      blendedConfig,
      updatedAt: new Date().toISOString(),
    };

    updateScenario({
      ...updatedScenario,
      results: runCalculation(updatedScenario) ?? undefined,
    });
  };

  const handleRunScenario = () => {
    if (!selectedScenario) return;

    const now = new Date().toISOString();
    const scenarioDraft: WaterfallScenario = {
      ...selectedScenario,
      id: 'draft',
      name: buildScenarioName(selectedScenario, exitValueInput),
      exitValue: exitValueInput,
      totalInvested: computeTotalInvested(selectedScenario.investorClasses),
      createdAt: now,
      updatedAt: now,
      version: 1,
      isFavorite: false,
      isTemplate: false,
    };

    const scenarioWithResults = {
      ...scenarioDraft,
      results: runCalculation(scenarioDraft) ?? undefined,
    };

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, version: _version, ...payload } = scenarioWithResults;
    dispatch(createScenarioRequested(payload));
    patchUI({ pendingScenarioSelection: true });
  };

  const handleCreateStarterScenario = () => {
    const template = templates[0] ?? mockWaterfallTemplates[0];
    const payload = buildStarterScenario(template);
    dispatch(createScenarioRequested(payload));
    patchUI({ pendingScenarioSelection: true });
  };

  const handlePrint = () => {
    patchUI({ printMode: true });
    if (typeof window !== 'undefined') {
      window.setTimeout(() => window.print(), 200);
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = scenarios.find((item) => item.id === scenarioId) ?? null;
    dispatch(setSelectedScenario(scenarioId));
    patchUI({
      exitValueInput: scenario?.exitValue ?? 0,
      selectedLpId: null,
    });
  };

  useEffect(() => {
    if (!selectedScenarioId && scenarios.length > 0) {
      dispatch(setSelectedScenario(scenarios[0].id));
    }
  }, [dispatch, scenarios, selectedScenarioId]);

  useEffect(() => {
    if (!selectedScenario) return;
    patchUI({
      exitValueInput: selectedScenario.exitValue,
      selectedLpId: null,
    });
  }, [patchUI, selectedScenario]);

  const previousScenarioCount = useRef(0);

  useEffect(() => {
    const previousCount = previousScenarioCount.current;
    previousScenarioCount.current = scenarios.length;

    if (!pendingScenarioSelection || scenarios.length <= previousCount) return;

    const latestScenario = scenarios.reduce<WaterfallScenario | null>((latest, scenario) => {
      if (!latest) return scenario;
      return new Date(scenario.createdAt).getTime() > new Date(latest.createdAt).getTime()
        ? scenario
        : latest;
    }, null);

    if (latestScenario) {
      dispatch(setSelectedScenario(latestScenario.id));
      patchUI({
        exitValueInput: latestScenario.exitValue,
        selectedLpId: null,
        pendingScenarioSelection: false,
      });
    } else {
      patchUI({ pendingScenarioSelection: false });
    }
  }, [dispatch, patchUI, pendingScenarioSelection, scenarios]);

  useEffect(() => {
    const handleAfterPrint = () => {
      patchUI({ printMode: false });
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [patchUI]);

  const waterfallSteps = selectedScenario?.model === 'american'
    ? [
        {
          title: 'Return of Capital',
          description: 'Return invested capital to LPs before carry is applied.',
        },
        {
          title: 'Preferred Return',
          description: 'Deliver preferred return to LPs based on hurdle rate.',
        },
        {
          title: 'Carry on Remaining',
          description: 'Split remaining proceeds per deal-by-deal carry structure.',
        },
      ]
    : selectedScenario?.model === 'blended'
      ? [
          {
            title: 'Return of Capital',
            description: 'Blend fund-level and deal-level return of capital rules.',
          },
          {
            title: 'Preferred Return',
            description: 'Preferred return applied with hybrid hurdle assumptions.',
          },
          {
            title: 'GP Catch-Up (EU)',
            description: 'Include European-style catch-up where applicable.',
          },
          {
            title: 'Deal-Level Carry (US)',
            description: 'Apply deal-level carry to remaining proceeds.',
          },
          {
            title: 'Final Split',
            description: 'Finalize blended carry split across LPs and GP.',
          },
        ]
      : [
          {
            title: 'Return of Capital',
            description: 'Return invested capital to LPs before carry is applied.',
          },
          {
            title: 'Preferred Return',
            description: 'Deliver preferred return to LPs based on hurdle rate.',
          },
          {
            title: 'GP Catch-Up',
            description: 'Catch up the GP to the agreed carry percentage.',
          },
          {
            title: 'Final Split',
            description: 'Split remaining proceeds according to carry terms.',
          },
        ];

  const modelSummary = selectedScenario
    ? selectedScenario.model === 'european'
      ? 'European (whole-fund)'
      : selectedScenario.model === 'american'
        ? 'American (deal-by-deal)'
        : 'Blended (hybrid EU/US)'
    : null;

  const blendedConfig = selectedScenario?.blendedConfig ?? { europeanWeight: 50, americanWeight: 50 };

  const handleBlendWeightChange = (value: number) => {
    if (!selectedScenario) return;
    const europeanWeight = Math.min(100, Math.max(0, value));
    const americanWeight = Math.max(0, 100 - europeanWeight);
    handleScenarioPatch({
      blendedConfig: {
        europeanWeight,
        americanWeight,
      },
    });
  };

  return (
    <PageScaffold
      routePath="/waterfall"
      header={{
        title: 'Waterfall Modeling',
        description: 'Model exit scenarios and visualize distribution waterfalls',
        icon: TrendingDown,
        aiSummary: {
          text: selectedScenario
            ? `${selectedScenario.investorClasses.length} classes, ${formatCurrencyCompact(totalInvested)} invested. ${scenarios.length} scenarios modeled. Current model: ${modelSummary} waterfall.`
            : 'No active scenario selected.',
          confidence: 0.9,
        },
        secondaryActions: [
          {
            label: 'Export PDF',
            onClick: handlePrint,
          },
        ],
      }}
    >
      <AsyncStateRenderer
        data={scenariosData}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyIcon={FolderOpen}
        emptyTitle="No waterfall scenarios yet"
        emptyAction={{ label: "Create your first scenario", onClick: handleCreateStarterScenario }}
        isEmpty={(data) => !data?.scenarios?.length}
      >
        {() => (
          <div className={`mt-6 grid gap-6 ${printMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
            <div className={`space-y-4 ${printMode ? '' : 'lg:col-span-2'}`}>
              {!printMode && (
                <InvestorClassManager
                  classes={selectedScenario?.investorClasses ?? []}
                  onChange={handleInvestorClassesChange}
                />
              )}

              <Card padding="lg">
                <SectionHeader
                  className="mb-4"
                  title="Waterfall Visualizations"
                  description="Switch between waterfall flow, scenario comparison, and LP drill-down views."
                  action={(
                    <Button
                      size="sm"
                      variant={printMode ? 'solid' : 'bordered'}
                      className="print:hidden"
                      onPress={() => patchUI({ printMode: !printMode })}
                      startContent={<Printer className="h-4 w-4" />}
                    >
                      {printMode ? 'Print Mode' : 'Print View'}
                    </Button>
                  )}
                />

                <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                  {chartOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = activeChart === option.id;
                    return (
                      <Button
                        key={option.id}
                        size="sm"
                        variant={isActive ? 'solid' : 'flat'}
                        color={isActive ? 'primary' : 'default'}
                        onPress={() => patchUI({ activeChart: option.id })}
                        startContent={<Icon className="h-4 w-4" />}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                {activeChart === 'waterfall' && (
                  <WaterfallBarChart scenario={activeScenario} printMode={printMode} />
                )}
                {activeChart === 'scenario' && (
                  <ScenarioStackedChart
                    scenarios={comparisonScenarios}
                    legendClasses={activeScenario?.investorClasses}
                    printMode={printMode}
                  />
                )}
                {activeChart === 'lp' && (
                  <LPWaterfallDetail
                    scenario={activeScenario}
                    lpAllocations={lpAllocations}
                    isLoading={distributionsLoading}
                    error={distributionsError}
                    onRetry={refetchDistributions}
                    selectedLpId={selectedLpId}
                    sourceDistribution={selectedDistribution}
                    onSelectLp={(id) => patchUI({ selectedLpId: id })}
                    printMode={printMode}
                  />
                )}
                {calculationError && (
                  <div className="mt-4 rounded-lg border border-[var(--app-warning)] bg-[var(--app-warning-bg)] px-4 py-3 text-sm text-[var(--app-warning)]">
                    {calculationError}
                  </div>
                )}
              </Card>

              {!printMode && (
                <div>
                  <SectionHeader title="Tier Breakdown" className="mb-3" />
                  <TierBreakdownTable scenario={activeScenario} />
                </div>
              )}

              {!printMode && activeScenario && (
                <div className="space-y-4">
                  <TierTimeline scenario={activeScenario} />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ClawbackCalculator scenario={activeScenario} />
                    <LookbackTracker scenario={activeScenario} />
                  </div>
                </div>
              )}

              {!printMode && activeScenario && (
                <SensitivityPanel
                  scenario={activeScenario}
                  comparisonScenario={comparisonScenario}
                  printMode={printMode}
                />
              )}

              {!printMode && selectedScenario && (
                <CustomTierBuilder
                  scenario={selectedScenario}
                  templates={templates}
                  isLoading={templatesLoading}
                  error={templatesError}
                  onRetry={refetchTemplates}
                  onScenarioChange={handleScenarioPatch}
                />
              )}
            </div>

            {!printMode && (
              <div className="space-y-4">
                <Card padding="lg">
                  <SectionHeader
                    className="mb-4"
                    title="Scenario Builder"
                    action={
                      selectedScenario ? (
                        <Badge size="sm" variant="flat">
                          {getModelLabel(selectedScenario.model)}
                        </Badge>
                      ) : null
                    }
                  />

                  <div className="space-y-4">
                    <Select
                      label="Scenario"
                      options={scenarioOptions}
                      selectedKeys={selectedScenario ? [selectedScenario.id] : []}
                      onChange={(event) => handleScenarioSelect(event.target.value)}
                      disallowEmptySelection
                    />

                    <div>
                      <div className="text-sm font-medium mb-2">Waterfall Model</div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Waterfall model selection">
                        <button
                          type="button"
                          onClick={() => handleModelChange('european')}
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            selectedScenario?.model === 'european'
                              ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                              : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)]'
                          }`}
                          role="radio"
                          aria-checked={selectedScenario?.model === 'european'}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-[var(--app-primary)]" aria-hidden="true" />
                            <span className="font-medium">European</span>
                          </div>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            Whole-fund waterfall with GP carry after LP capital return.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModelChange('american')}
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            selectedScenario?.model === 'american'
                              ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                              : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)]'
                          }`}
                          role="radio"
                          aria-checked={selectedScenario?.model === 'american'}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Flag className="h-5 w-5 text-[var(--app-secondary)]" aria-hidden="true" />
                            <span className="font-medium">American</span>
                          </div>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            Deal-by-deal waterfall with carry on individual exits.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModelChange('blended')}
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            selectedScenario?.model === 'blended'
                              ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                              : 'border-[var(--app-border)] hover:border-[var(--app-border-subtle)]'
                          }`}
                          role="radio"
                          aria-checked={selectedScenario?.model === 'blended'}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Shuffle className="h-5 w-5 text-[var(--app-accent)]" aria-hidden="true" />
                            <span className="font-medium">Blended</span>
                          </div>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            Hybrid waterfall blending European and American carry.
                          </p>
                        </button>
                      </div>
                      {selectedScenario?.model === 'blended' && (
                        <div className="mt-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                          <div className="text-xs font-semibold text-[var(--app-text-muted)] mb-2">
                            Blend Weights
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              label="European weight (%)"
                              type="number"
                              value={blendedConfig.europeanWeight.toString()}
                              onChange={(event) => handleBlendWeightChange(Number(event.target.value) || 0)}
                            />
                            <Input
                              label="American weight (%)"
                              type="number"
                              value={blendedConfig.americanWeight.toString()}
                              isReadOnly
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="exit-value" className="text-sm font-medium mb-2 block">
                        Exit Value
                      </label>
                      <Input
                        id="exit-value"
                        type="number"
                        value={exitValueInput.toString()}
                        onChange={(event) => patchUI({ exitValueInput: Number(event.target.value) || 0 })}
                        placeholder="100000000"
                        aria-label="Exit value in dollars"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Quick Scenarios</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[50_000_000, 100_000_000, 250_000_000, 500_000_000].map((value) => (
                          <Button
                            key={value}
                            size="sm"
                            variant={exitValueInput === value ? 'solid' : 'flat'}
                            color={exitValueInput === value ? 'primary' : 'default'}
                            onPress={() => patchUI({ exitValueInput: value })}
                          >
                            {formatCurrencyCompact(value)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      color="primary"
                      className="w-full"
                      size="lg"
                      startContent={<Play className="h-4 w-4" />}
                      onPress={handleRunScenario}
                    >
                      Calculate Distribution
                    </Button>
                  </div>
                </Card>

                <Card padding="lg">
                  <SectionHeader title="Scenario Summary" className="mb-4" />
                  {activeScenario && scenarioResults ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[var(--app-text-muted)]">Exit Value</div>
                        <div className="font-semibold">{formatCurrencyCompact(activeScenario.exitValue)}</div>
                      </div>
                      <div>
                        <div className="text-[var(--app-text-muted)]">Total Invested</div>
                        <div className="font-semibold">{formatCurrencyCompact(totalInvested)}</div>
                      </div>
                      <div>
                        <div className="text-[var(--app-text-muted)]">LP Return</div>
                        <div className="font-semibold">{formatCurrencyCompact(scenarioResults.lpTotalReturn)}</div>
                      </div>
                      <div>
                        <div className="text-[var(--app-text-muted)]">GP Carry</div>
                        <div className="font-semibold">{formatCurrencyCompact(scenarioResults.gpCarry)}</div>
                      </div>
                      <div>
                        <div className="text-[var(--app-text-muted)]">LP Avg Multiple</div>
                        <div className="font-semibold">{scenarioResults.lpAverageMultiple.toFixed(2)}x</div>
                      </div>
                      <div>
                        <div className="text-[var(--app-text-muted)]">Carry %</div>
                        <div className="font-semibold">{scenarioResults.gpCarryPercentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--app-text-muted)]">
                      Select a scenario to view summary metrics.
                    </p>
                  )}
                </Card>

                <Card padding="lg">
                  <SectionHeader title="Waterfall Steps" className="mb-4" />
                  <div className="space-y-3 text-sm">
                    {waterfallSteps.map((step, index) => (
                      <div key={step.title} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary-bg)] text-[var(--app-primary)] text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.title}</div>
                            <div className="text-[var(--app-text-muted)]">{step.description}</div>
                          </div>
                        </div>
                        {index < waterfallSteps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-[var(--app-text-muted)] ml-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card padding="lg">
                  <ScenarioManager
                    scenarios={scenarios}
                    selectedScenarioId={selectedScenario?.id ?? null}
                    comparisonScenarioIds={comparisonScenarioIds}
                    onSelectScenario={handleScenarioSelect}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicateScenario={handleDuplicateScenario}
                    onDeleteScenario={handleDeleteScenario}
                    onToggleComparison={handleToggleComparison}
                    onClearComparison={handleClearComparison}
                  />
                </Card>

                <ExportMenu
                  scenario={selectedScenario}
                  onPrint={handlePrint}
                />
              </div>
            )}
          </div>
        )}
      </AsyncStateRenderer>
    </PageScaffold>
  );
}
