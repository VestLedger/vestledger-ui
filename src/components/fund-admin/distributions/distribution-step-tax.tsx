"use client";

import { Badge, Button, Card, Input, Switch } from "@/ui";
import { SectionHeader, StatusBadge } from "@/components/ui";
import {
  DocumentPreviewModal,
  getMockDocumentUrl,
  type PreviewDocument,
  useDocumentPreview,
} from "@/components/documents/preview";
import type { LPAllocation, LPProfile } from "@/types/distribution";
import { formatCurrencyCompact, formatPercent } from "@/utils/formatting";
import { getLabelForType, taxFormTypeLabels } from "@/utils/styling/typeMappers";

export interface DistributionStepTaxProps {
  allocations: LPAllocation[];
  lpProfiles: LPProfile[];
  onChange: (allocations: LPAllocation[]) => void;
}

export function DistributionStepTax({
  allocations,
  lpProfiles,
  onChange,
}: DistributionStepTaxProps) {
  const {
    previewDocument,
    previewDocuments,
    currentIndex,
    isOpen,
    openPreview,
    closePreview,
    navigateToDocument,
  } = useDocumentPreview();

  const profileMap = lpProfiles.reduce<Record<string, LPProfile>>((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});

  const totalGross = allocations.reduce((sum, allocation) => sum + allocation.grossAmount, 0);
  const totalNet = allocations.reduce((sum, allocation) => sum + allocation.netAmount, 0);
  const totalWithholding = allocations.reduce(
    (sum, allocation) => sum + allocation.taxWithholdingAmount,
    0
  );
  const overrideCount = allocations.filter((allocation) => allocation.isTaxOverride).length;

  const handleRateChange = (id: string, rate: number) => {
    onChange(
      allocations.map((allocation) => {
        if (allocation.id !== id) return allocation;
        const taxWithholdingRate = rate;
        const taxWithholdingAmount = (allocation.grossAmount * taxWithholdingRate) / 100;
        const netAmount = Math.max(0, allocation.grossAmount - taxWithholdingAmount);
        return {
          ...allocation,
          taxWithholdingRate,
          taxWithholdingAmount,
          netAmount,
          isTaxOverride: true,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleOverrideToggle = (id: string, enabled: boolean) => {
    onChange(
      allocations.map((allocation) => {
        if (allocation.id !== id) return allocation;
        const profile = profileMap[allocation.lpId];
        const defaultRate = profile?.defaultTaxWithholdingRate ?? allocation.taxWithholdingRate;
        const appliedRate = enabled ? allocation.taxWithholdingRate : defaultRate;
        const taxWithholdingAmount = (allocation.grossAmount * appliedRate) / 100;
        const netAmount = Math.max(0, allocation.grossAmount - taxWithholdingAmount);
        return {
          ...allocation,
          taxWithholdingRate: appliedRate,
          taxWithholdingAmount,
          netAmount,
          isTaxOverride: enabled,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const formatTaxFormType = (formType: LPAllocation["taxFormType"]) =>
    getLabelForType(taxFormTypeLabels, formType);

  const getTaxStatus = (allocation: LPAllocation) => {
    if (allocation.grossAmount <= 0) return "draft";
    if (allocation.isTaxOverride) return "review";
    return "ready";
  };

  const buildTaxDocument = (allocation: LPAllocation): PreviewDocument => ({
    id: `tax-${allocation.id}`,
    name: `${allocation.lpName} ${formatTaxFormType(allocation.taxFormType)} Tax Form`,
    type: "pdf",
    url: getMockDocumentUrl("pdf"),
    category: "Tax Form",
    metadata: {
      lpId: allocation.lpId,
      taxFormType: allocation.taxFormType,
    },
  });

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Tax Withholding"
        description="Auto-populated from LP profiles with manual override when required."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm">
          <div className="text-xs text-[var(--app-text-muted)]">Total Gross</div>
          <div className="font-semibold">{formatCurrencyCompact(totalGross)}</div>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm">
          <div className="text-xs text-[var(--app-text-muted)]">Total Withholding</div>
          <div className="font-semibold">{formatCurrencyCompact(totalWithholding)}</div>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm">
          <div className="text-xs text-[var(--app-text-muted)]">Total Net</div>
          <div className="font-semibold">{formatCurrencyCompact(totalNet)}</div>
        </div>
      </div>

      {overrideCount > 0 && (
        <div className="rounded-lg border border-[var(--app-warning)] bg-[var(--app-warning-bg)] px-3 py-2 text-xs text-[var(--app-warning)]">
          {overrideCount} LP{overrideCount === 1 ? "" : "s"} have manual tax overrides. Review before submitting.
        </div>
      )}

      <div className="space-y-2">
        {allocations.map((allocation) => {
          const profile = profileMap[allocation.lpId];
          const status = getTaxStatus(allocation);
          return (
            <div
              key={allocation.id}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{allocation.lpName}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">
                    {profile?.taxJurisdiction ?? allocation.taxJurisdiction}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge size="sm" variant="flat">
                    {formatTaxFormType(allocation.taxFormType)}
                  </Badge>
                  <StatusBadge status={status} domain="tax" size="sm" showIcon />
                  {allocation.isTaxOverride && (
                    <Badge size="sm" variant="flat" color="warning">
                      Override
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                <div>
                  <div className="text-[var(--app-text-muted)]">Default Rate</div>
                  <div className="font-semibold">
                    {formatPercent(
                      profile?.defaultTaxWithholdingRate ?? allocation.taxWithholdingRate,
                      1
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--app-text-muted)]">Override</div>
                  <Switch
                    size="sm"
                    isSelected={allocation.isTaxOverride}
                    onValueChange={(value) => handleOverrideToggle(allocation.id, value)}
                  >
                    {allocation.isTaxOverride ? "On" : "Off"}
                  </Switch>
                </div>
                <div>
                  <div className="text-[var(--app-text-muted)]">Rate</div>
                  <Input
                    type="number"
                    value={allocation.taxWithholdingRate.toString()}
                    onChange={(event) =>
                      handleRateChange(allocation.id, Number(event.target.value) || 0)
                    }
                    isDisabled={!allocation.isTaxOverride}
                  />
                </div>
                <div>
                  <div className="text-[var(--app-text-muted)]">Withholding</div>
                  <div className="font-semibold">
                    {formatCurrencyCompact(allocation.taxWithholdingAmount)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[var(--app-text-muted)]">Gross</div>
                  <div className="font-semibold">{formatCurrencyCompact(allocation.grossAmount)}</div>
                </div>
                <div>
                  <div className="text-[var(--app-text-muted)]">Tax</div>
                  <div className="font-semibold">{formatCurrencyCompact(allocation.taxWithholdingAmount)}</div>
                </div>
                <div>
                  <div className="text-[var(--app-text-muted)]">Net</div>
                  <div className="font-semibold">{formatCurrencyCompact(allocation.netAmount)}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[var(--app-text-muted)]">
                  Tax form preview ({formatTaxFormType(allocation.taxFormType)})
                </div>
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => {
                    const documents = allocations.map(buildTaxDocument);
                    openPreview(buildTaxDocument(allocation), documents);
                  }}
                >
                  Preview Form
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          documents={previewDocuments}
          currentIndex={currentIndex}
          isOpen={isOpen}
          onClose={closePreview}
          onNavigate={navigateToDocument}
        />
      )}
    </Card>
  );
}
