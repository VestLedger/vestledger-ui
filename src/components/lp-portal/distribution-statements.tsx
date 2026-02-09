"use client";

import { useMemo } from "react";
import { Badge, Button, Card } from "@/ui";
import { ListItemCard, SectionHeader, StatusBadge } from '@/ui/composites';
import type { LPDistributionStatement } from "@/data/mocks/lp-portal/lp-investor-portal";
import { formatCurrency, formatDate } from "@/utils/formatting";
import { getLabelForType, taxFormTypeLabels } from "@/utils/styling/typeMappers";
import { getStatementTemplateLabel } from "@/components/fund-admin/distributions/statement-template-constants";
import {
  DocumentPreviewModal,
  getMockDocumentUrl,
  useDocumentPreview,
  type PreviewDocument,
} from "@/components/documents/preview";
import { Download, Mail, Printer, FileText } from "lucide-react";

export interface DistributionStatementsProps {
  statements: LPDistributionStatement[];
}

export function DistributionStatements({ statements }: DistributionStatementsProps) {
  const resolveStatementUrl = (statement: LPDistributionStatement) => {
    const url = statement.pdfUrl;
    return url && url !== "#" ? url : getMockDocumentUrl("pdf");
  };

  const previewDocs = useMemo<PreviewDocument[]>(
    () =>
      statements
        .filter((statement) => statement.status === "available")
        .map((statement) => ({
          id: statement.id,
          name: statement.distributionName,
          type: "pdf",
          url: resolveStatementUrl(statement),
          category: "Distribution Statement",
        })),
    [statements]
  );

  const { previewDocument, isOpen, openPreview, closePreview, navigateToDocument } =
    useDocumentPreview();

  const handlePreview = (statement: LPDistributionStatement) => {
    const doc = previewDocs.find((item) => item.id === statement.id);
    if (!doc) return;
    openPreview(doc, previewDocs);
  };

  return (
    <Card padding="lg">
      <SectionHeader
        title="Distribution Statements"
        description="Download statements and tax documents once generated."
        action={(
          <>
            <Button size="sm" variant="bordered" startContent={<Download className="h-4 w-4" />}>
              Download All
            </Button>
            <Button size="sm" variant="bordered" startContent={<Mail className="h-4 w-4" />}>
              Email All
            </Button>
            <Button size="sm" variant="bordered" startContent={<Printer className="h-4 w-4" />}>
              Print All
            </Button>
          </>
        )}
        actionClassName="flex-wrap"
      />

      <div className="mt-4 space-y-3">
        {statements.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No statements available yet.
          </div>
        ) : (
          statements.map((statement) => (
            <ListItemCard
              key={statement.id}
              title={statement.distributionName}
              description={`Statement date ${formatDate(statement.statementDate)} - ${formatCurrency(statement.amount)}`}
              meta={`Tax forms: ${statement.taxForms
                .map((form) => `${getLabelForType(taxFormTypeLabels, form.type)} ${form.generated ? "ready" : "pending"}`)
                .join(", ")}`}
              padding="sm"
              badges={(
                <div className="flex items-center gap-2">
                  <Badge size="sm" variant="flat">
                    {getStatementTemplateLabel(statement.template)}
                  </Badge>
                  <StatusBadge status={statement.status} size="sm" />
                </div>
              )}
              actions={(
                <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<FileText className="h-4 w-4" />}
                    onPress={() => handlePreview(statement)}
                    isDisabled={statement.status !== "available"}
                  >
                    Preview
                  </Button>
                  <Button size="sm" variant="bordered" isDisabled={statement.status !== "available"}>
                    Download
                  </Button>
                </div>
              )}
            />
          ))
        )}
      </div>

      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          documents={previewDocs}
          currentIndex={Math.max(0, previewDocs.findIndex((doc) => doc.id === previewDocument.id))}
          isOpen={isOpen}
          onClose={closePreview}
          onNavigate={navigateToDocument}
        />
      )}
    </Card>
  );
}
