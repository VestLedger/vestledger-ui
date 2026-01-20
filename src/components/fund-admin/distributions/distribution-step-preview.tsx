"use client";

import { useEffect } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/ui";
import { SectionHeader } from "@/components/ui";
import {
  getMockDocumentUrl,
} from "@/components/documents/preview";
import { useUIKey } from "@/store/ui";
import type {
  LPProfile,
  StatementBranding,
  StatementTemplate,
  StatementTemplateConfig,
} from "@/types/distribution";
import { formatCurrencyCompact } from "@/utils/formatting";
import { getLabelForType, taxFormTypeLabels } from "@/utils/styling/typeMappers";
import { StatementPreviewModal } from "./statement-preview-modal";
import {
  ILPA_CHECKLIST_ITEMS,
  STATEMENT_TEMPLATE_OPTIONS,
} from "./statement-template-constants";

type PreviewUIState = {
  selectedLPId: string;
  isStatementPreviewOpen: boolean;
};

export interface DistributionStepPreviewProps {
  templates: StatementTemplateConfig[];
  template: StatementTemplate;
  branding?: StatementBranding;
  distributionName: string;
  lpProfiles: LPProfile[];
  emailSubject?: string;
  emailBody?: string;
  errors?: Partial<{
    template: string;
    emailSubject: string;
    emailBody: string;
  }>;
  showErrors?: boolean;
  onChange: (next: {
    template: StatementTemplate;
    branding?: StatementBranding;
    emailSubject?: string;
    emailBody?: string;
  }) => void;
}

export function DistributionStepPreview({
  templates,
  template,
  branding,
  distributionName,
  lpProfiles,
  emailSubject,
  emailBody,
  errors,
  showErrors = false,
  onChange,
}: DistributionStepPreviewProps) {
  const initialLPId = lpProfiles[0]?.id ?? "";
  const { value: ui, patch: patchUI } = useUIKey<PreviewUIState>(
    "distribution-statement-preview",
    { selectedLPId: initialLPId, isStatementPreviewOpen: false }
  );

  const selectedTemplate = templates.find((item) => item.template === template);
  const templateLabel = selectedTemplate?.name ?? "Statement";
  const fallbackSubject = `${distributionName} Distribution Notice`;
  const fallbackBody = `Hello,\n\nYour ${distributionName} statement is ready for review. Please log in to the LP portal to view details and confirm receipt.\n\nThank you,\nVestLedger Operations`;
  const previewSubject = emailSubject?.trim() || fallbackSubject;
  const previewBody = emailBody?.trim() || fallbackBody;
  const fieldErrors = showErrors ? errors ?? {} : {};

  useEffect(() => {
    if (!ui.selectedLPId && lpProfiles.length > 0) {
      patchUI({ selectedLPId: lpProfiles[0].id });
    }
  }, [lpProfiles, patchUI, ui.selectedLPId]);

  const isStatementPreviewOpen = ui.isStatementPreviewOpen ?? false;
  const selectedLP = lpProfiles.find((lp) => lp.id === ui.selectedLPId) ?? lpProfiles[0] ?? null;
  const statementName = selectedLP
    ? `${selectedLP.name} - ${templateLabel}`
    : `${distributionName} - ${templateLabel}`;
  const statementUrl = getMockDocumentUrl("pdf");

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Statement Preview"
        description="Configure statement templates and preview the LP notification email."
      />

      <Select
        label="Statement template"
        selectedKeys={[template]}
        onChange={(event) =>
          onChange({
            template: event.target.value as StatementTemplate,
            branding,
            emailSubject,
            emailBody,
          })
        }
        options={STATEMENT_TEMPLATE_OPTIONS}
        isInvalid={Boolean(fieldErrors.template)}
        errorMessage={fieldErrors.template}
      />

      {selectedTemplate && (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
          <div className="font-medium">{selectedTemplate.name}</div>
          <div className="text-xs text-[var(--app-text-muted)]">
            {selectedTemplate.description}
          </div>
        </div>
      )}

      {template === "ilpa-compliant" && (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">ILPA Checklist</div>
            <Badge size="sm" variant="flat" color="success">
              ILPA Ready
            </Badge>
          </div>
          <ul className="mt-2 list-disc pl-4 text-xs text-[var(--app-text-muted)] space-y-1">
            {ILPA_CHECKLIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <Select
        label="Preview LP"
        selectedKeys={selectedLP ? [selectedLP.id] : []}
        onChange={(event) => patchUI({ selectedLPId: event.target.value })}
        options={lpProfiles.map((profile) => ({
          value: profile.id,
          label: profile.name,
        }))}
        placeholder="Select LP"
      />

      {selectedLP && (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{selectedLP.name}</div>
              <Badge size="sm" variant="flat">
              {getLabelForType(taxFormTypeLabels, selectedLP.taxFormType)}
              </Badge>
            </div>
          <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
            <div>
              <div className="text-[var(--app-text-muted)]">Jurisdiction</div>
              <div className="font-semibold">{selectedLP.taxJurisdiction}</div>
            </div>
            <div>
              <div className="text-[var(--app-text-muted)]">Commitment</div>
              <div className="font-semibold">{formatCurrencyCompact(selectedLP.totalCommitment)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
        <div className="font-medium">Notification Email</div>
        <div className="text-xs text-[var(--app-text-muted)]">
          Preview the LP notification email that accompanies the statement.
        </div>
      </div>

      <Input
        label="Email subject"
        value={emailSubject ?? ""}
        onChange={(event) =>
          onChange({
            template,
            branding,
            emailSubject: event.target.value,
            emailBody,
          })
        }
        placeholder={fallbackSubject}
        isInvalid={Boolean(fieldErrors.emailSubject)}
        errorMessage={fieldErrors.emailSubject}
      />

      <Textarea
        label="Email body"
        value={emailBody ?? ""}
        onChange={(event) =>
          onChange({
            template,
            branding,
            emailSubject,
            emailBody: event.target.value,
          })
        }
        minRows={5}
        placeholder={fallbackBody}
        isInvalid={Boolean(fieldErrors.emailBody)}
        errorMessage={fieldErrors.emailBody}
      />

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
        <div className="text-xs text-[var(--app-text-muted)]">
          To: {selectedLP ? selectedLP.name : "LPs in selected fund"}
        </div>
        <div className="mt-2 font-semibold">{previewSubject}</div>
        <div className="mt-2 whitespace-pre-wrap text-xs text-[var(--app-text-muted)]">
          {previewBody}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Branding name"
          value={branding?.companyName ?? ""}
          onChange={(event) =>
            onChange({
              template,
              branding: {
                ...branding,
                companyName: event.target.value,
              },
            })
          }
        />
        <Input
          label="Logo URL"
          value={branding?.logo ?? ""}
          onChange={(event) =>
            onChange({
              template,
              branding: {
                ...branding,
                logo: event.target.value,
              },
            })
          }
        />
        <Input
          label="Footer"
          value={branding?.footer ?? ""}
          onChange={(event) =>
            onChange({
              template,
              branding: {
                ...branding,
                footer: event.target.value,
              },
            })
          }
        />
        <Input
          label="Contact info"
          value={branding?.contactInfo ?? ""}
          onChange={(event) =>
            onChange({
              template,
              branding: {
                ...branding,
                contactInfo: event.target.value,
              },
            })
          }
        />
      </div>

      <Button
        variant="bordered"
        onPress={() => patchUI({ isStatementPreviewOpen: true })}
      >
        Preview Statement
      </Button>

      <StatementPreviewModal
        isOpen={isStatementPreviewOpen}
        onOpenChange={(open) => patchUI({ isStatementPreviewOpen: open })}
        template={template}
        branding={branding}
        distributionName={distributionName}
        documentUrl={statementUrl}
        documentName={statementName}
      />
    </Card>
  );
}
