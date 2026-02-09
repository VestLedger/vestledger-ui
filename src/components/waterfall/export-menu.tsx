'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Badge, Button, Card, Checkbox, Input, Modal, Select } from '@/ui';
import type { ExportFormat, ExportTemplate, WaterfallScenario } from '@/types/waterfall';
import { writeToClipboard } from '@/utils/clipboard';
import { formatCurrencyCompact } from '@/utils/formatting';
import { useUIKey } from '@/store/ui';
import { FileText, File, Table, Image as ImageIcon, Printer } from 'lucide-react';
import { SectionHeader } from '@/ui/composites';

type ExportMenuUIState = {
  format: ExportFormat;
  template: ExportTemplate;
  includeCharts: boolean;
  includeTierBreakdown: boolean;
  includeLPAllocations: boolean;
  brandingName: string;
  brandingFooter: string;
  brandingLogoUrl: string;
  isPreviewOpen: boolean;
  copied: boolean;
  lastRequestedAt: string | null;
};

const formatOptions: Array<{ value: ExportFormat; label: string; icon: JSX.Element }> = [
  { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'excel', label: 'Excel', icon: <Table className="h-4 w-4" /> },
  { value: 'csv', label: 'CSV', icon: <File className="h-4 w-4" /> },
  { value: 'pptx', label: 'PPTX', icon: <ImageIcon className="h-4 w-4" /> },
];

const templateOptions: Array<{ value: ExportTemplate; label: string }> = [
  { value: 'executive-summary', label: 'Executive Summary' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'board-presentation', label: 'Board Presentation' },
];

export interface ExportMenuProps {
  scenario: WaterfallScenario | null;
  onPrint?: () => void;
}

export function ExportMenu({ scenario, onPrint }: ExportMenuProps) {
  const { value: ui, patch: patchUI } = useUIKey<ExportMenuUIState>('waterfall-export-menu', {
    format: 'pdf',
    template: 'executive-summary',
    includeCharts: true,
    includeTierBreakdown: true,
    includeLPAllocations: false,
    brandingName: '',
    brandingFooter: '',
    brandingLogoUrl: '',
    isPreviewOpen: false,
    copied: false,
    lastRequestedAt: null,
  });

  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const scenarioParam = scenario?.id ? `?scenario=${scenario.id}` : '';
    return `${origin}/waterfall${scenarioParam}`;
  }, [scenario?.id]);

  const handleCopy = async () => {
    if (!shareLink) return;
    const copied = await writeToClipboard(shareLink);
    patchUI({ copied });
    if (copied) {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        patchUI({ copied: false });
      }, 2000);
    }
  };

  const handleRequest = () => {
    patchUI({
      isPreviewOpen: false,
      lastRequestedAt: new Date().toISOString(),
    });
  };

  const formatBadge = formatOptions.find((option) => option.value === ui.format);

  return (
    <Card padding="lg">
      <SectionHeader
        className="mb-4"
        title="Export Menu"
        description="Prepare export packages for stakeholders and LPs."
        action={formatBadge && (
          <Badge size="sm" variant="flat" className="flex items-center gap-1">
            {formatBadge.icon}
            {formatBadge.label}
          </Badge>
        )}
      />

      <div className="space-y-4">
        <Select
          label="Template"
          selectedKeys={[ui.template]}
          onChange={(event) => patchUI({ template: event.target.value as ExportTemplate })}
          options={templateOptions}
        />

        <div>
          <div className="text-sm font-medium mb-2">Format</div>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={ui.format === option.value ? 'solid' : 'flat'}
                color={ui.format === option.value ? 'primary' : 'default'}
                onPress={() => patchUI({ format: option.value })}
                startContent={option.icon}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Checkbox
            isSelected={ui.includeCharts}
            onValueChange={(value) => patchUI({ includeCharts: value })}
          >
            Include charts
          </Checkbox>
          <Checkbox
            isSelected={ui.includeTierBreakdown}
            onValueChange={(value) => patchUI({ includeTierBreakdown: value })}
          >
            Include tier breakdown
          </Checkbox>
          <Checkbox
            isSelected={ui.includeLPAllocations}
            onValueChange={(value) => patchUI({ includeLPAllocations: value })}
          >
            Include LP allocations
          </Checkbox>
        </div>

        <div className="grid gap-3">
          <Input
            label="Branding name"
            placeholder="VestLedger Capital"
            value={ui.brandingName}
            onChange={(event) => patchUI({ brandingName: event.target.value })}
          />
          <Input
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={ui.brandingLogoUrl}
            onChange={(event) => patchUI({ brandingLogoUrl: event.target.value })}
          />
          <Input
            label="Footer"
            placeholder="Confidential - For internal use only"
            value={ui.brandingFooter}
            onChange={(event) => patchUI({ brandingFooter: event.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            onPress={() => patchUI({ isPreviewOpen: true })}
          >
            Preview Export
          </Button>
          <Button
            variant="bordered"
            onPress={handleCopy}
            isDisabled={!shareLink}
          >
            {ui.copied ? 'Link Copied' : 'Copy Share Link'}
          </Button>
          {onPrint && (
            <Button
              variant="flat"
              onPress={onPrint}
              startContent={<Printer className="h-4 w-4" />}
            >
              Print View
            </Button>
          )}
        </div>

        {ui.lastRequestedAt && (
          <div className="text-xs text-[var(--app-text-muted)]">
            Last request: {new Date(ui.lastRequestedAt).toLocaleString()}
          </div>
        )}
      </div>

      <Modal
        title="Export Preview"
        isOpen={ui.isPreviewOpen}
        onOpenChange={(open) => patchUI({ isPreviewOpen: open })}
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="light" onPress={() => patchUI({ isPreviewOpen: false })}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleRequest}>
              Request Export
            </Button>
          </div>
        )}
      >
        <div className="space-y-3 text-sm text-[var(--app-text-muted)]">
          <div className="font-medium text-[var(--app-text)]">
            {scenario?.name ?? 'Waterfall Scenario'}
          </div>
          {scenario && (
            <div className="flex items-center justify-between gap-2">
              <span>Exit Value</span>
              <span className="font-medium text-[var(--app-text)]">
                {formatCurrencyCompact(scenario.exitValue)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span>Template</span>
            <span className="font-medium text-[var(--app-text)]">
              {templateOptions.find((option) => option.value === ui.template)?.label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Format</span>
            <span className="font-medium text-[var(--app-text)]">{ui.format.toUpperCase()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ui.includeCharts && <Badge size="sm" variant="flat">Charts</Badge>}
            {ui.includeTierBreakdown && <Badge size="sm" variant="flat">Tier Breakdown</Badge>}
            {ui.includeLPAllocations && <Badge size="sm" variant="flat">LP Allocations</Badge>}
          </div>
          {ui.brandingName && (
            <div className="flex items-center justify-between gap-2">
              <span>Branding</span>
              <span className="font-medium text-[var(--app-text)]">{ui.brandingName}</span>
            </div>
          )}
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-xs text-[var(--app-text-muted)]">
            Exports are generated by the backend. This preview is UI-only until service wiring.
          </div>
        </div>
      </Modal>
    </Card>
  );
}
