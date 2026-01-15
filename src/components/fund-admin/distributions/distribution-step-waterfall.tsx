"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/ui";
import { SectionHeader } from "@/components/ui";
import { useUIKey } from "@/store/ui";
import type { WaterfallScenario, WaterfallResults } from "@/types/waterfall";
import { formatCurrencyCompact } from "@/utils/formatting";
import { performWaterfallCalculation } from "@/services/analytics/waterfallService";
import { ExternalLink } from "lucide-react";

type WaterfallPreviewUIState = {
  scenarioId: string;
  exitValue: number;
  totalInvested: number;
  managementFees: number;
};

const getModelLabel = (model: WaterfallScenario["model"]) =>
  model === "european" ? "European" : model === "american" ? "American" : "Blended";

export interface DistributionStepWaterfallProps {
  scenarios: WaterfallScenario[];
  selectedScenarioId?: string;
  grossProceeds?: number;
  previewResults?: WaterfallResults | null;
  onChange: (scenarioId: string | undefined) => void;
  onPreview?: (payload: {
    results: WaterfallResults;
    previewExitValue: number;
    previewTotalInvested: number;
    previewManagementFees: number;
  }) => void;
}

export function DistributionStepWaterfall({
  scenarios,
  selectedScenarioId,
  grossProceeds,
  previewResults,
  onChange,
  onPreview,
}: DistributionStepWaterfallProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const scenarioOptions = useMemo(
    () =>
      scenarios.map((scenario) => ({
        value: scenario.id,
        label: scenario.name,
      })),
    [scenarios]
  );

  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null;
  const results = previewResults ?? selectedScenario?.results ?? null;

  const { value: ui, patch: patchUI } = useUIKey<WaterfallPreviewUIState>(
    "distribution-waterfall-preview",
    {
      scenarioId: selectedScenario?.id ?? "",
      exitValue: selectedScenario?.exitValue ?? grossProceeds ?? 0,
      totalInvested: selectedScenario?.totalInvested ?? 0,
      managementFees: selectedScenario?.managementFees ?? 0,
    }
  );

  useEffect(() => {
    if (selectedScenario && ui.scenarioId !== selectedScenario.id) {
      patchUI({
        scenarioId: selectedScenario.id,
        exitValue: selectedScenario.exitValue,
        totalInvested: selectedScenario.totalInvested,
        managementFees: selectedScenario.managementFees,
      });
    }
  }, [patchUI, selectedScenario, ui.scenarioId]);

  useEffect(() => {
    if (!selectedScenario && grossProceeds && ui.exitValue === 0) {
      patchUI({ exitValue: grossProceeds });
    }
  }, [grossProceeds, patchUI, selectedScenario, ui.exitValue]);

  const handleRunPreview = async () => {
    if (!selectedScenario || !onPreview) return;
    setIsPreviewing(true);
    setPreviewError(null);
    try {
      const previewScenario: WaterfallScenario = {
        ...selectedScenario,
        exitValue: ui.exitValue,
        totalInvested: ui.totalInvested,
        managementFees: ui.managementFees,
      };
      const results = await performWaterfallCalculation({ scenario: previewScenario });
      onPreview({
        results,
        previewExitValue: ui.exitValue,
        previewTotalInvested: ui.totalInvested,
        previewManagementFees: ui.managementFees,
      });
    } catch (error) {
      console.error("Failed to preview waterfall", error);
      setPreviewError("Unable to calculate preview results.");
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Waterfall Integration"
        description="Select a modeled waterfall scenario to drive allocations and carry."
        action={(
          <Button
            size="sm"
            variant="bordered"
            startContent={<ExternalLink className="h-4 w-4" />}
            onPress={() => window.open("/waterfall", "_blank", "noopener")}
          >
            Open Waterfall Modeling
          </Button>
        )}
      />

      <Select
        label="Waterfall Scenario"
        selectedKeys={selectedScenarioId ? [selectedScenarioId] : []}
        onChange={(event) => onChange(event.target.value || undefined)}
        options={scenarioOptions}
        placeholder="Choose a scenario"
      />

      {selectedScenario ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-sm">
            <div className="flex items-center gap-2 mb-3">
              <Badge size="sm" variant="flat">
                {getModelLabel(selectedScenario.model)}
              </Badge>
              <span className="text-[var(--app-text-muted)]">
                {selectedScenario.investorClasses.length} classes
              </span>
              {previewResults ? (
                <Badge size="sm" variant="flat" color="warning">
                  Preview
                </Badge>
              ) : (
                <Badge size="sm" variant="flat">
                  Saved
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[var(--app-text-muted)]">Exit Value</div>
                <div className="font-semibold">
                  {formatCurrencyCompact(selectedScenario.exitValue)}
                </div>
              </div>
              <div>
                <div className="text-[var(--app-text-muted)]">Total Invested</div>
                <div className="font-semibold">
                  {formatCurrencyCompact(selectedScenario.totalInvested)}
                </div>
              </div>
              {results && (
                <>
                  <div>
                    <div className="text-[var(--app-text-muted)]">GP Carry</div>
                    <div className="font-semibold">
                      {formatCurrencyCompact(results.gpCarry)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--app-text-muted)]">LP Return</div>
                    <div className="font-semibold">
                      {formatCurrencyCompact(results.lpTotalReturn)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Card padding="md" className="space-y-3">
            <div>
              <div className="text-sm font-semibold">Quick Preview</div>
              <p className="text-xs text-[var(--app-text-muted)]">
                Run a frontend preview with adjusted inputs before saving a scenario.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="Exit Value"
                type="number"
                value={ui.exitValue.toString()}
                onChange={(event) => patchUI({ exitValue: Number(event.target.value) || 0 })}
              />
              <Input
                label="Total Invested"
                type="number"
                value={ui.totalInvested.toString()}
                onChange={(event) => patchUI({ totalInvested: Number(event.target.value) || 0 })}
              />
              <Input
                label="Management Fees"
                type="number"
                value={ui.managementFees.toString()}
                onChange={(event) => patchUI({ managementFees: Number(event.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {grossProceeds !== undefined && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => patchUI({ exitValue: grossProceeds })}
                >
                  Use Gross Proceeds
                </Button>
              )}
              <Button
                size="sm"
                color="primary"
                onPress={handleRunPreview}
                isDisabled={isPreviewing}
              >
                {isPreviewing ? "Running..." : "Run Preview"}
              </Button>
              {previewError && (
                <span className="text-xs text-[var(--app-danger)]">{previewError}</span>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
          Pick a waterfall scenario to preview distribution splits and carry.
        </div>
      )}
    </Card>
  );
}
