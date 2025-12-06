'use client';

import { useState } from 'react';
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

interface AuditEvent {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  eventType: 'ownership_transfer' | 'capital_call' | 'distribution' | 'valuation_update' | 'document_hash' | 'compliance_attestation';
  description: string;
  parties: string[];
  amount?: number;
  verificationStatus: 'verified' | 'pending' | 'failed';
  proofHash: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    txHash: '0x7f9a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    blockNumber: 18234567,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    eventType: 'capital_call',
    description: 'Capital Call #8 - Fund II initiated',
    parties: ['Quantum Ventures Fund II', '12 LPs'],
    amount: 15000000,
    verificationStatus: 'verified',
    proofHash: '0xproof1234567890abcdef'
  },
  {
    id: '2',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    blockNumber: 18234520,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    eventType: 'ownership_transfer',
    description: 'Series B shares transferred to CloudScale Holdings',
    parties: ['CloudScale Inc.', 'Quantum Ventures Fund II'],
    amount: 5000000,
    verificationStatus: 'verified',
    proofHash: '0xproof2345678901bcdef0'
  },
  {
    id: '3',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    blockNumber: 18234450,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    eventType: 'distribution',
    description: 'Distribution #5 - CloudScale exit proceeds',
    parties: ['Quantum Ventures Fund II', '12 LPs'],
    amount: 8500000,
    verificationStatus: 'verified',
    proofHash: '0xproof3456789012cdef01'
  },
  {
    id: '4',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    blockNumber: 18234400,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    eventType: 'valuation_update',
    description: 'Q4 2024 NAV update recorded',
    parties: ['Quantum Ventures Fund II'],
    verificationStatus: 'verified',
    proofHash: '0xproof4567890123def012'
  },
  {
    id: '5',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    blockNumber: 18234350,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    eventType: 'document_hash',
    description: 'LPA Amendment v2.1 hash recorded',
    parties: ['Quantum Ventures GP LLC'],
    verificationStatus: 'verified',
    proofHash: '0xproof5678901234ef0123'
  },
  {
    id: '6',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    blockNumber: 18234300,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    eventType: 'compliance_attestation',
    description: 'Annual compliance certification recorded',
    parties: ['Independent Auditor LLC', 'Quantum Ventures Fund II'],
    verificationStatus: 'verified',
    proofHash: '0xproof6789012345f01234'
  },
];

export function BlockchainAuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const routeConfig = getRouteConfig('/audit-trail');

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
            onChange={(e) => setSearchQuery(e.target.value)}
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
              onPress={() => setFilter(f)}
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
                onClick={() => setSelectedEvent(event)}
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
            <Button size="sm" variant="flat" onPress={() => setSelectedEvent(null)}>
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
