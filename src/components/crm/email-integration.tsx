'use client';

import { Card, Button, Badge } from '@/ui';
import { Mail, RefreshCw, X, AlertCircle, Calendar, Paperclip, ExternalLink, ChevronDown, ChevronUp, Users, Briefcase } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { SearchToolbar, StatusBadge } from '@/components/ui';

export interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'other';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: Date;
  syncedEmails?: number;
  autoCapture: boolean;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessageDate: Date;
  messageCount: number;
  hasAttachments: boolean;
  labels?: string[];
  contactId?: string;
  dealId?: string;
  snippet?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  date: Date;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    url?: string;
  }>;
  isRead: boolean;
}

interface EmailIntegrationProps {
  accounts: EmailAccount[];
  onConnect: (provider: 'gmail' | 'outlook') => void;
  onDisconnect: (accountId: string) => void;
  onSync: (accountId: string) => void;
  onToggleAutoCapture: (accountId: string, enabled: boolean) => void;
}

export function EmailIntegration({
  accounts,
  onConnect,
  onDisconnect,
  onSync,
  onToggleAutoCapture,
}: EmailIntegrationProps) {
  const { value: ui, patch: patchUI } = useUIKey('crm-email-integration', { isExpanded: true });
  const { isExpanded } = ui;

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return '📧'; // Could be replaced with actual Gmail logo
      case 'outlook':
        return '📨'; // Could be replaced with actual Outlook logo
      default:
        return '✉️';
    }
  };

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => patchUI({ isExpanded: !isExpanded })}
            className="flex items-center gap-2 hover:text-[var(--app-primary)] transition-colors"
          >
            <Mail className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Email Integration</h3>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
            {accounts.filter(a => a.status === 'connected').length} connected
          </Badge>
        </div>

        {isExpanded && (
          <>
            {/* Description */}
            <p className="text-sm text-[var(--app-text-muted)]">
              Automatically capture emails and sync interactions with your contacts. Connect your email accounts to enable automatic tracking.
            </p>

            {/* Connected Accounts */}
            {accounts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Connected Accounts</h4>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getProviderLogo(account.provider)}</div>
                        <div>
                          <p className="font-medium">{account.email}</p>
                          <p className="text-xs text-[var(--app-text-muted)] capitalize">
                            {account.provider}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={account.status} domain="crm" size="sm" showIcon />
                    </div>

                    {/* Sync Info */}
                    {account.lastSync && (
                      <div className="flex items-center gap-4 mb-3 text-xs text-[var(--app-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last sync: {account.lastSync.toLocaleString()}
                        </span>
                        {account.syncedEmails !== undefined && (
                          <span>{account.syncedEmails.toLocaleString()} emails synced</span>
                        )}
                      </div>
                    )}

                    {/* Auto-capture Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-surface)] mb-3">
                      <div>
                        <p className="text-sm font-medium">Auto-capture emails</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          Automatically log emails to matching contacts
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleAutoCapture(account.id, !account.autoCapture)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          account.autoCapture
                            ? 'bg-[var(--app-success)]'
                            : 'bg-[var(--app-text-muted)]/30'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            account.autoCapture ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<RefreshCw className="w-3 h-3" />}
                        onPress={() => onSync(account.id)}
                        isDisabled={account.status === 'syncing'}
                      >
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        startContent={<X className="w-3 h-3" />}
                        onPress={() => onDisconnect(account.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Connect New Account */}
            <div className="pt-4 border-t border-[var(--app-border)]">
              <h4 className="text-sm font-medium mb-3">Connect Email Account</h4>
              <div className="flex items-center gap-3">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<span className="text-lg">📧</span>}
                  onPress={() => onConnect('gmail')}
                >
                  Connect Gmail
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<span className="text-lg">📨</span>}
                  onPress={() => onConnect('outlook')}
                >
                  Connect Outlook
                </Button>
              </div>
              <p className="text-xs text-[var(--app-text-muted)] mt-3">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                We&apos;ll redirect you to authenticate with your email provider. We only read emails, never send on your behalf.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// Email Thread Viewer Component
interface EmailThreadViewerProps {
  threads: EmailThread[];
  onThreadSelect: (thread: EmailThread) => void;
  selectedThreadId?: string;
  contactName?: string;
}

export function EmailThreadViewer({
  threads,
  onThreadSelect,
  selectedThreadId,
  contactName,
}: EmailThreadViewerProps) {
  const { value: ui, patch: patchUI } = useUIKey(`crm-email-thread-viewer:${contactName ?? 'all'}`, {
    searchQuery: '',
    filterLabel: 'all',
  });
  const { searchQuery, filterLabel } = ui;

  const filteredThreads = threads.filter(thread => {
    const matchesSearch =
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterLabel === 'all' || thread.labels?.includes(filterLabel);
    return matchesSearch && matchesFilter;
  });

  const allLabels = Array.from(new Set(threads.flatMap(t => t.labels || [])));

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">
              Email History {contactName && `with ${contactName}`}
            </h3>
          </div>
          <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
            {threads.length} threads
          </Badge>
        </div>

        {/* Search & Filter */}
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search emails..."
          rightActions={(
            <select
              className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
              value={filterLabel}
              onChange={(e) => patchUI({ filterLabel: e.target.value })}
            >
              <option value="all">All Labels</option>
              {allLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          )}
        />

        {/* Thread List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No email threads found</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onThreadSelect(thread)}
                className={`w-full p-4 rounded-lg text-left transition-colors border ${
                  thread.id === selectedThreadId
                    ? 'bg-[var(--app-primary-bg)] border-[var(--app-primary)]'
                    : 'bg-[var(--app-surface-hover)] border-transparent hover:border-[var(--app-border)]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium truncate flex-1">{thread.subject}</h4>
                  <div className="flex items-center gap-2 ml-2">
                    {thread.hasAttachments && (
                      <Paperclip className="w-3 h-3 text-[var(--app-text-muted)]" />
                    )}
                    <span className="text-xs text-[var(--app-text-subtle)]">
                      {thread.lastMessageDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-[var(--app-text-muted)] truncate">
                    {thread.participants.join(', ')}
                  </p>
                  <Badge size="sm" variant="flat" className="bg-[var(--app-surface)] text-[var(--app-text-muted)]">
                    {thread.messageCount}
                  </Badge>
                </div>

                {thread.snippet && (
                  <p className="text-xs text-[var(--app-text-subtle)] line-clamp-2">
                    {thread.snippet}
                  </p>
                )}

                {thread.labels && thread.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {thread.labels.map((label, idx) => (
                      <Badge
                        key={idx}
                        size="sm"
                        variant="flat"
                        className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

// Email Message Detail Component
interface EmailMessageDetailProps {
  message: EmailMessage;
  onLinkToContact?: () => void;
  onLinkToDeal?: () => void;
}

export function EmailMessageDetail({
  message,
  onLinkToContact,
  onLinkToDeal,
}: EmailMessageDetailProps) {
  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="pb-4 border-b border-[var(--app-border)]">
          <h3 className="text-lg font-semibold mb-3">{message.subject}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-[var(--app-text-muted)] min-w-[60px]">From:</span>
              <span className="font-medium">{message.from}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--app-text-muted)] min-w-[60px]">To:</span>
              <span>{message.to.join(', ')}</span>
            </div>
            {message.cc && message.cc.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[var(--app-text-muted)] min-w-[60px]">CC:</span>
                <span className="text-[var(--app-text-muted)]">{message.cc.join(', ')}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-[var(--app-text-muted)] min-w-[60px]">Date:</span>
              <span className="text-[var(--app-text-muted)]">
                {message.date.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onLinkToContact && (
            <Button
              size="sm"
              variant="flat"
              startContent={<Users className="w-3 h-3" />}
              onPress={onLinkToContact}
            >
              Link to Contact
            </Button>
          )}
          {onLinkToDeal && (
            <Button
              size="sm"
              variant="flat"
              startContent={<Briefcase className="w-3 h-3" />}
              onPress={onLinkToDeal}
            >
              Link to Deal
            </Button>
          )}
          <Button
            size="sm"
            variant="flat"
            startContent={<ExternalLink className="w-3 h-3" />}
            as="a"
            href={`mailto:${message.from}`}
          >
            Reply
          </Button>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none">
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: message.body }}
          />
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="pt-4 border-t border-[var(--app-border)]">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({message.attachments.length})
            </h4>
            <div className="space-y-2">
              {message.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-surface-hover)]"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-[var(--app-text-muted)]" />
                    <div>
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                      </p>
                    </div>
                  </div>
                  {attachment.url && (
                    <Button
                      size="sm"
                      variant="light"
                      as="a"
                      href={attachment.url}
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
