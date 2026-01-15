"use client";

import { useEffect } from "react";
import { Button, Card, Input } from "@/ui";
import { SectionHeader } from "@/components/ui";
import { useUIKey } from "@/store/ui";
import type { DistributionImpact } from "@/types/distribution";
import { formatCurrencyCompact } from "@/utils/formatting";
import { ImpactPreviewPanel } from "./impact-preview-panel";

type ImpactWhatIfUIState = {
  distributionAmount: number;
  hasCustomAmount: boolean;
};

export interface DistributionStepImpactProps {
  impact: DistributionImpact;
  totalDistributed: number;
  onChange: (impact: DistributionImpact) => void;
  onRecalculate?: (distributionAmount: number) => void;
}

export function DistributionStepImpact({
  impact,
  totalDistributed,
  onChange,
  onRecalculate,
}: DistributionStepImpactProps) {
  const { value: ui, patch: patchUI } = useUIKey<ImpactWhatIfUIState>(
    "distribution-impact-whatif",
    {
      distributionAmount: totalDistributed,
      hasCustomAmount: false,
    }
  );

  useEffect(() => {
    if (!ui.hasCustomAmount && ui.distributionAmount !== totalDistributed) {
      patchUI({ distributionAmount: totalDistributed });
    }
  }, [patchUI, totalDistributed, ui.distributionAmount, ui.hasCustomAmount]);

  const handleApplyWhatIf = () => {
    if (onRecalculate) {
      onRecalculate(ui.distributionAmount);
    }
  };

  const handleResetWhatIf = () => {
    patchUI({ distributionAmount: totalDistributed, hasCustomAmount: false });
    if (onRecalculate) {
      onRecalculate(totalDistributed);
    }
  };

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Impact Preview"
        description="Preview NAV, DPI, and TVPI changes before finalizing the distribution."
      />

      <Card padding="md" className="space-y-3">
        <div>
          <div className="text-sm font-semibold">What-if Calculator</div>
          <p className="text-xs text-[var(--app-text-muted)]">
            Adjust the projected distribution amount to simulate impact changes.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Input
            label="Distribution Amount"
            type="number"
            value={ui.distributionAmount.toString()}
            onChange={(event) =>
              patchUI({
                distributionAmount: Number(event.target.value) || 0,
                hasCustomAmount: true,
              })
            }
            placeholder={formatCurrencyCompact(totalDistributed)}
          />
          <Button variant="bordered" onPress={handleApplyWhatIf}>
            Apply
          </Button>
          <Button variant="light" onPress={handleResetWhatIf}>
            Reset
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Projected NAV After"
          type="number"
          value={impact.navAfter.toString()}
          onChange={(event) =>
            onChange({
              ...impact,
              navAfter: Number(event.target.value) || 0,
              navChange: (Number(event.target.value) || 0) - impact.navBefore,
            })
          }
        />
        <Input
          label="Projected DPI After"
          type="number"
          value={impact.dpiAfter.toString()}
          onChange={(event) =>
            onChange({
              ...impact,
              dpiAfter: Number(event.target.value) || 0,
              dpiChange: (Number(event.target.value) || 0) - impact.dpiBefore,
            })
          }
        />
        <Input
          label="Projected TVPI After"
          type="number"
          value={impact.tvpiAfter.toString()}
          onChange={(event) =>
            onChange({
              ...impact,
              tvpiAfter: Number(event.target.value) || 0,
              tvpiChange: (Number(event.target.value) || 0) - impact.tvpiBefore,
            })
          }
        />
        <Input
          label="Projected Undrawn After"
          type="number"
          value={impact.undrawnCapitalAfter.toString()}
          onChange={(event) =>
            onChange({
              ...impact,
              undrawnCapitalAfter: Number(event.target.value) || 0,
              undrawnCapitalChange:
                (Number(event.target.value) || 0) - impact.undrawnCapitalBefore,
            })
          }
        />
      </div>

      <ImpactPreviewPanel impact={impact} />
    </Card>
  );
}
