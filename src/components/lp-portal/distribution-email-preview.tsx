"use client";

import { Badge, Card } from "@/ui";
import type { LPEmailPreview } from "@/data/mocks/lp-portal/lp-investor-portal";
import { Mail } from "lucide-react";

export interface DistributionEmailPreviewProps {
  preview: LPEmailPreview;
}

export function DistributionEmailPreview({ preview }: DistributionEmailPreviewProps) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Preview the notification sent when statements are published.
          </p>
        </div>
        <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
          <Mail className="h-3 w-3 mr-1" />
          Preview
        </Badge>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-3 text-sm">
        <div className="text-xs text-[var(--app-text-muted)]">Subject</div>
        <div className="font-semibold">{preview.subject}</div>
        <div className="mt-3 text-xs text-[var(--app-text-muted)]">Message</div>
        <pre className="whitespace-pre-wrap text-sm text-[var(--app-text)]">
          {preview.body}
        </pre>
        <div className="mt-3 text-xs text-[var(--app-text-muted)]">{preview.footer}</div>
      </div>
    </Card>
  );
}
