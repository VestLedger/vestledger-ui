'use client';

import { Badge, Button, Card } from '@/ui';
import { formatCurrency } from '@/utils/formatting';
import type { Fund } from '@/types/fund';
import { SectionHeader } from '@/ui/composites';

export interface FundSetupDetailProps {
  fund: Fund | null;
  isArchived: boolean;
  canMutate: boolean;
  onEdit: () => void;
  onCloseFund: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}

export function FundSetupDetail({
  fund,
  isArchived,
  canMutate,
  onEdit,
  onCloseFund,
  onArchive,
  onUnarchive,
}: FundSetupDetailProps) {
  if (!fund) {
    return (
      <Card padding="md">
        <div className="text-sm text-[var(--app-text-muted)]">Select a fund to view details.</div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <SectionHeader
        className="mb-3"
        title={fund.name}
        description={fund.description || 'No description provided.'}
        action={(
          <div className="flex items-center gap-2">
            {isArchived && <Badge color="warning">Archived</Badge>}
            <Badge variant="flat">{fund.status}</Badge>
            <Badge variant="flat">{fund.strategy}</Badge>
            {canMutate && (
              <>
                <Button size="sm" variant="bordered" onPress={onEdit}>
                  Edit
                </Button>
                {fund.status !== 'closed' && (
                  <Button size="sm" variant="flat" color="warning" onPress={onCloseFund}>
                    Close Fund
                  </Button>
                )}
                {!isArchived ? (
                  <Button size="sm" variant="flat" color="warning" onPress={onArchive}>
                    Archive
                  </Button>
                ) : (
                  <Button size="sm" variant="flat" color="success" onPress={onUnarchive}>
                    Unarchive
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="text-xs text-[var(--app-text-muted)]">Commitment</div>
          <div className="text-lg font-semibold">{formatCurrency(fund.totalCommitment)}</div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="text-xs text-[var(--app-text-muted)]">Deployed</div>
          <div className="text-lg font-semibold">{formatCurrency(fund.deployedCapital)}</div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
          <div className="text-xs text-[var(--app-text-muted)]">Available</div>
          <div className="text-lg font-semibold">{formatCurrency(fund.availableCapital)}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[var(--app-text-muted)]">Vintage</div>
          <div>{fund.vintage}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Fund Term</div>
          <div>{fund.fundTerm} years</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Start Date</div>
          <div>{fund.startDate}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">End Date</div>
          <div>{fund.endDate || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Target Sectors</div>
          <div>{fund.targetSectors.join(', ') || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Target Stages</div>
          <div>{fund.targetStages.join(', ') || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Managers</div>
          <div>{fund.managers.join(', ') || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Performance</div>
          <div>
            IRR {fund.irr.toFixed(2)}% | TVPI {fund.tvpi.toFixed(2)}x | DPI {fund.dpi.toFixed(2)}x
          </div>
        </div>
      </div>
    </Card>
  );
}
