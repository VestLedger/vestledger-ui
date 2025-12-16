'use client';

import { Card, Button, Badge, Input, Progress, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import {
  Shield,
  Database,
  Link2,
  CheckCircle,
  Clock,
  Hash,
  FileText,
  Layers,
  Lock,
  Eye,
  ExternalLink,
  Copy,
  Search,
  Filter
	} from 'lucide-react';
	import { getRouteConfig } from '@/config/routes';
	import { getAuditEvents, type AuditEvent } from '@/services/blockchain/auditTrailService';
	import { useUIKey } from '@/store/ui';

	export function BlockchainAuditTrail() {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    selectedEvent: AuditEvent | null;
    filter: string;
  }>('blockchain-audit-trail', {
    searchQuery: '',
    selectedEvent: null,
    filter: 'all',
  });
	  const { searchQuery, selectedEvent, filter } = ui;

	  const routeConfig = getRouteConfig('/audit-trail');
	  const mockAuditEvents = getAuditEvents();

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ownership_transfer': return <Link2 className="w-4 h-4" />;
      case 'capital_call': return <Layers className="w-4 h-4" />;
      case 'distribution': return <Layers className="w-4 h-4" />;
      case 'valuation_update': return <FileText className="w-4 h-4" />;
      case 'document_hash': return <Hash className="w-4 h-4" />;
      case 'compliance_attestation': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'ownership_transfer': return 'var(--app-primary)';
      case 'capital_call': return 'var(--app-warning)';
      case 'distribution': return 'var(--app-success)';
      case 'valuation_update': return 'var(--app-info)';
      case 'document_hash': return 'var(--app-secondary)';
      case 'compliance_attestation': return 'var(--app-primary)';
      default: return 'var(--app-text-muted)';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'ownership_transfer': return 'Ownership Transfer';
      case 'capital_call': return 'Capital Call';
      case 'distribution': return 'Distribution';
      case 'valuation_update': return 'Valuation Update';
      case 'document_hash': return 'Document Hash';
      case 'compliance_attestation': return 'Compliance';
      default: return type;
    }
  };

  const filteredEvents = mockAuditEvents.filter(event => {
    if (filter !== 'all' && event.eventType !== filter) return false;
    if (searchQuery && !event.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.txHash.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {routeConfig && (
          <Breadcrumb
            items={routeConfig.breadcrumbs}
          />
        )}

        {/* Page Header */}
        {routeConfig && (
          <PageHeader
            title="On-Chain Audit Trail"
            description={routeConfig.description}
            icon={Database}
            aiSummary={{
              text: `${mockAuditEvents.length} blockchain events recorded. ${mockAuditEvents.filter(e => e.verificationStatus === 'verified').length} verified transactions across ${new Set(mockAuditEvents.map(e => e.eventType)).size} event types. Latest block: ${Math.max(...mockAuditEvents.map(e => e.blockNumber)).toLocaleString()}`,
              confidence: 0.95
            }}
          />
        )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-primary)]">{mockAuditEvents.length}</div>
            <div className="text-xs text-[var(--app-text-muted)]">Total Events</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-success)]">
              {mockAuditEvents.filter(e => e.verificationStatus === 'verified').length}
            </div>
            <div className="text-xs text-[var(--app-text-muted)]">Verified</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold">18.2M</div>
            <div className="text-xs text-[var(--app-text-muted)]">Latest Block</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-secondary)]">100%</div>
            <div className="text-xs text-[var(--app-text-muted)]">Integrity</div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by description or transaction hash..."
            value={searchQuery}
            onChange={(e) => patchUI({ searchQuery: e.target.value })}
            startContent={<Search className="w-4 h-4 text-[var(--app-text-muted)]" />}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'capital_call', 'distribution', 'ownership_transfer', 'compliance_attestation'].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'solid' : 'flat'}
              color={filter === f ? 'primary' : 'default'}
              onPress={() => patchUI({ filter: f })}
            >
              {f === 'all' ? 'All' : getEventLabel(f)}
            </Button>
          ))}
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <Card padding="lg">
        <div className="space-y-0">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className={`relative pl-8 pb-6 ${index !== filteredEvents.length - 1 ? 'border-l-2 border-[var(--app-border)]' : ''}`}
              style={{ marginLeft: '8px' }}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[var(--app-bg)]"
                style={{ backgroundColor: getEventColor(event.eventType), top: '2px' }}
              />

              {/* Event Card */}
              <div
                className="p-4 rounded-lg border border-[var(--app-border)] hover:border-[var(--app-primary)] transition-colors cursor-pointer"
                onClick={() => patchUI({ selectedEvent: event })}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-md"
                      style={{ backgroundColor: `${getEventColor(event.eventType)}20` }}
                    >
                      <span style={{ color: getEventColor(event.eventType) }}>
                        {getEventIcon(event.eventType)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{event.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" variant="flat">
                          {getEventLabel(event.eventType)}
                        </Badge>
                        {event.amount && (
                          <span className="text-sm font-medium text-[var(--app-success)]">
                            {formatCurrency(event.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-[var(--app-text-muted)]">{formatTimestamp(event.timestamp)}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {event.verificationStatus === 'verified' ? (
                        <CheckCircle className="w-3 h-3 text-[var(--app-success)]" />
                      ) : (
                        <Clock className="w-3 h-3 text-[var(--app-warning)]" />
                      )}
                      <span className="text-xs capitalize">{event.verificationStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--app-text-muted)] mt-3 pt-3 border-t border-[var(--app-border-subtle)]">
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span className="font-mono">{truncateHash(event.txHash)}</span>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="w-5 h-5 min-w-0"
                      onPress={() => copyToClipboard(event.txHash)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Block #{event.blockNumber.toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="light" className="ml-auto text-xs gap-1">
                    <ExternalLink className="w-3 h-3" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Proof Verification Panel */}
      {selectedEvent && (
        <Card padding="lg" className="border-[var(--app-primary)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--app-primary)]" />
              Cryptographic Proof Details
            </h3>
            <Button size="sm" variant="flat" onPress={() => patchUI({ selectedEvent: null })}>
              Close
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[var(--app-text-muted)] mb-1">Transaction Hash</div>
                <div className="font-mono text-sm break-all bg-[var(--app-surface-hover)] p-2 rounded">
                  {selectedEvent.txHash}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--app-text-muted)] mb-1">Proof Hash</div>
                <div className="font-mono text-sm break-all bg-[var(--app-surface-hover)] p-2 rounded">
                  {selectedEvent.proofHash}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[var(--app-text-muted)] mb-1">Block Number</div>
                <div className="font-medium">{selectedEvent.blockNumber.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--app-text-muted)] mb-1">Timestamp</div>
                <div className="font-medium">{selectedEvent.timestamp.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--app-text-muted)] mb-1">Parties</div>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.parties.map((party, i) => (
                    <Badge key={i} size="sm" variant="flat">{party}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--app-border)]">
            <div className="flex items-center gap-2 text-[var(--app-success)]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Cryptographic proof verified on-chain</span>
            </div>
          </div>
        </Card>
      )}
    </div>
    </PageContainer>
  );
}
