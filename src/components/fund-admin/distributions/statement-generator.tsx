"use client";

import { useMemo } from "react";
import { Badge, Button, Card, Checkbox, Input, Select } from "@/ui";
import { AsyncStateRenderer } from '@/ui/async-states';
import { ListItemCard, SectionHeader } from '@/ui/composites';
import { StatementPreviewModal } from "./statement-preview-modal";
import { useUIKey } from "@/store/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  statementTemplatesRequested,
  statementTemplatesSelectors,
} from "@/store/slices/distributionSlice";
import type {
  Distribution,
  StatementBranding,
  StatementTemplate,
} from "@/types/distribution";
import {
  DocumentPreviewModal,
  getMockDocumentUrl,
  useDocumentPreview,
  type PreviewDocument,
} from "@/components/documents/preview";
import { Download, FileText, Mail, Printer, ShieldCheck, Upload } from "lucide-react";
import {
  ILPA_CHECKLIST_ITEMS,
  STATEMENT_TEMPLATE_OPTIONS,
  type IlpaChecklistItem,
} from "./statement-template-constants";

type StatementGeneratorUIState = {
  template: StatementTemplate;
  branding: StatementBranding;
  isPreviewOpen: boolean;
  ilpaChecklist: Record<IlpaChecklistItem, boolean>;
};

export interface StatementGeneratorProps {
  distribution: Distribution;
}

const mergeBranding = (current: StatementBranding, next?: StatementBranding) => ({
  companyName: current.companyName || next?.companyName || "",
  logo: current.logo || next?.logo || "",
  footer: current.footer || next?.footer || "",
  contactInfo: current.contactInfo || next?.contactInfo || "",
});

export function StatementGenerator({ distribution }: StatementGeneratorProps) {
  const { data: templatesData, isLoading, error, refetch, status } = useAsyncData(
    statementTemplatesRequested,
    statementTemplatesSelectors.selectState
  );
  const isTemplatesLoading = isLoading || status === "idle";

  const templateConfigs = useMemo(
    () => templatesData?.templates ?? [],
    [templatesData?.templates]
  );

  const initialTemplate = distribution.statements?.[0]?.template ?? "standard";
  const initialBranding =
    distribution.statements?.[0]?.customBranding ??
    templateConfigs.find((item) => item.template === initialTemplate)?.defaultBranding ??
    {};

  const { value: ui, patch: patchUI } = useUIKey<StatementGeneratorUIState>(
    `statement-generator-${distribution.id}`,
    {
      template: initialTemplate,
      branding: {
        companyName: initialBranding.companyName ?? "",
        logo: initialBranding.logo ?? "",
        footer: initialBranding.footer ?? "",
        contactInfo: initialBranding.contactInfo ?? "",
      },
      isPreviewOpen: false,
      ilpaChecklist: ILPA_CHECKLIST_ITEMS.reduce(
        (acc, item) => {
          acc[item] = false;
          return acc;
        },
        {} as Record<IlpaChecklistItem, boolean>
      ),
    }
  );

  const selectedTemplate = templateConfigs.find((item) => item.template === ui.template);
  const mergedBranding = mergeBranding(ui.branding, selectedTemplate?.defaultBranding);

  const isIlpaTemplate = ui.template === "ilpa-compliant";
  const ilpaComplete = ILPA_CHECKLIST_ITEMS.every((item) => ui.ilpaChecklist[item]);
  const canGenerate = !isIlpaTemplate || ilpaComplete;

  const firstLPName =
    distribution.statements?.[0]?.lpName ||
    distribution.lpAllocations?.[0]?.lpName ||
    "First LP";
  const statementName = `${firstLPName} - ${selectedTemplate?.name ?? "Statement"}`;
  const statementUrl = getMockDocumentUrl("pdf");

  const taxFormDocs = useMemo<PreviewDocument[]>(
    () => [
      {
        id: "tax-k1",
        name: "K-1 Preview",
        type: "pdf",
        url: getMockDocumentUrl("pdf"),
        category: "Tax Form",
      },
      {
        id: "tax-1099",
        name: "1099 Preview",
        type: "pdf",
        url: getMockDocumentUrl("pdf"),
        category: "Tax Form",
      },
    ],
    []
  );

  const { previewDocument, isOpen, openPreview, closePreview, navigateToDocument } =
    useDocumentPreview();

  const handleTemplateChange = (value: StatementTemplate) => {
    const templateConfig = templateConfigs.find((item) => item.template === value);
    patchUI({
      template: value,
      branding: mergeBranding(ui.branding, templateConfig?.defaultBranding),
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    patchUI({ branding: { ...mergedBranding, logo: file?.name ?? "" } });
  };

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Statement Generator"
        description="Configure templates, branding, and tax forms before generating statements."
        action={(
          <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
            {distribution.statementsGenerated ? "Generated" : "Ready"}
          </Badge>
        )}
      />

      <AsyncStateRenderer
        data={templatesData}
        isLoading={isTemplatesLoading}
        error={error}
        onRetry={refetch}
        loadingMessage="Loading statement templates..."
        loadingFullHeight={false}
        emptyTitle="No statement templates"
        emptyMessage="Add templates to enable statement generation."
        isEmpty={(data) => !data || data.templates.length === 0}
      >
        {() => (
          <>
            <Select
              label="Statement template"
              selectedKeys={[ui.template]}
              onChange={(event) => handleTemplateChange(event.target.value as StatementTemplate)}
              options={STATEMENT_TEMPLATE_OPTIONS}
            />

            {selectedTemplate && (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-xs text-[var(--app-text-muted)]">
                  {selectedTemplate.description}
                </div>
              </div>
            )}

            {isIlpaTemplate && (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">ILPA Checklist</div>
                  <Badge size="sm" variant="flat" className={ilpaComplete ? "bg-[var(--app-success-bg)] text-[var(--app-success)]" : "bg-[var(--app-warning-bg)] text-[var(--app-warning)]"}>
                    {ilpaComplete ? "ILPA ready" : "Complete checklist"}
                  </Badge>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-[var(--app-text-muted)]">
                  {ILPA_CHECKLIST_ITEMS.map((item) => (
                    <Checkbox
                      key={item}
                      isSelected={ui.ilpaChecklist[item]}
                      onValueChange={(value) =>
                        patchUI({
                          ilpaChecklist: { ...ui.ilpaChecklist, [item]: value },
                        })
                      }
                    >
                      {item}
                    </Checkbox>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Organization name"
                value={mergedBranding.companyName ?? ""}
                onChange={(event) =>
                  patchUI({ branding: { ...mergedBranding, companyName: event.target.value } })
                }
              />
              <Input
                label="Logo upload"
                type="file"
                startContent={<Upload className="h-4 w-4" />}
                onChange={handleLogoChange}
              />
              <Input
                label="Footer text"
                value={mergedBranding.footer ?? ""}
                onChange={(event) =>
                  patchUI({ branding: { ...mergedBranding, footer: event.target.value } })
                }
              />
              <Input
                label="Contact info"
                value={mergedBranding.contactInfo ?? ""}
                onChange={(event) =>
                  patchUI({ branding: { ...mergedBranding, contactInfo: event.target.value } })
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="bordered" onPress={() => patchUI({ isPreviewOpen: true })}>
                Preview statement
              </Button>
              <Button color="primary" isDisabled={!canGenerate}>
                Generate Statements
              </Button>
              {!canGenerate && (
                <div className="text-xs text-[var(--app-warning)]">
                  Complete the ILPA checklist to enable generation.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">Bulk Actions</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="bordered" startContent={<Download className="h-4 w-4" />}>
                    Request Download All
                  </Button>
                  <Button size="sm" variant="bordered" startContent={<Mail className="h-4 w-4" />}>
                    Email All
                  </Button>
                  <Button size="sm" variant="bordered" startContent={<Printer className="h-4 w-4" />}>
                    Print All
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">Tax Forms</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                    K-1 and 1099
                  </Badge>
                  <Button size="sm" variant="bordered" startContent={<Download className="h-4 w-4" />}>
                    Download All Tax Forms
                  </Button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {taxFormDocs.map((doc) => (
                  <ListItemCard
                    key={doc.id}
                    icon={<FileText className="h-4 w-4 text-[var(--app-primary)]" />}
                    title={doc.name}
                    description="Backend generated"
                    padding="sm"
                    actions={(
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="flat" onPress={() => openPreview(doc, taxFormDocs)}>
                          Preview
                        </Button>
                        <Button size="sm" variant="bordered">
                          Download
                        </Button>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <ShieldCheck className="h-3 w-3 text-[var(--app-success)]" />
              Statements are stored for audit and compliance review.
            </div>

            <StatementPreviewModal
              isOpen={ui.isPreviewOpen}
              onOpenChange={(open) => patchUI({ isPreviewOpen: open })}
              template={ui.template}
              branding={mergedBranding}
              distributionName={distribution.name}
              documentUrl={statementUrl}
              documentName={statementName}
            />

            {previewDocument && (
              <DocumentPreviewModal
                document={previewDocument}
                documents={taxFormDocs}
                currentIndex={Math.max(0, taxFormDocs.findIndex((doc) => doc.id === previewDocument.id))}
                isOpen={isOpen}
                onClose={closePreview}
                onNavigate={navigateToDocument}
              />
            )}
          </>
        )}
      </AsyncStateRenderer>
    </Card>
  );
}
