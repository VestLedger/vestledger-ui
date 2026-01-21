'use client'

import { Card, Button, Badge } from '@/ui';
import { Mail, Phone, Building2, MapPin, Calendar, Tag, Edit3, Trash2, Star, MessageSquare, Video, Send, ExternalLink, Briefcase, Users } from 'lucide-react';
import { getRouteConfig } from '@/config/routes';
import { SideDrawer } from '@/components/side-drawer';
import { RelationshipScore, calculateRelationshipScore, type RelationshipMetrics } from '@/components/crm/relationship-score';
import { SmartLists, type SmartList } from '@/components/crm/smart-lists';
import { EmailIntegration, type EmailAccount } from '@/components/crm/email-integration';
import { InteractionTimeline } from '@/components/crm/interaction-timeline';
import { NetworkGraph } from './network-graph';
import { useUIKey } from '@/store/ui';
import { crmDataRequested, crmSelectors } from '@/store/slices/crmSlice';
import type { Contact } from '@/services/crm/contactsService';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';
import { MetricsGrid, PageScaffold, SearchToolbar } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';

interface ContactsUIState {
  contacts: Contact[];
  selectedContact: Contact | null;
  searchQuery: string;
  filterRole: string;
  isDrawerOpen: boolean;
  smartLists: SmartList[];
  activeSmartList: SmartList | null;
  emailAccounts: EmailAccount[];
  activeTab: 'overview' | 'timeline' | 'email';
  showNetworkGraph: boolean;
}

export function Contacts() {
  const routeConfig = getRouteConfig('/contacts');
  const { data, isLoading, error, refetch } = useAsyncData(crmDataRequested, crmSelectors.selectState, { params: {} });

  const mockContacts = data?.contacts || [];
  const mockEmailAccounts = data?.emailAccounts || [];
  const mockInteractions = data?.interactions || [];
  const mockTimelineInteractions = data?.timelineInteractions || [];

  // UI state MUST be called before any early returns (Rules of Hooks)
  const { value: ui, patch: patchUI } = useUIKey<Omit<ContactsUIState, 'contacts' | 'emailAccounts'>>('crm-contacts', {
    selectedContact: null,
    searchQuery: '',
    filterRole: 'all',
    isDrawerOpen: false,
    smartLists: [],
    activeSmartList: null,
    activeTab: 'overview',
    showNetworkGraph: false,
  });

  const {
    selectedContact,
    searchQuery,
    filterRole,
    isDrawerOpen,
    smartLists,
    activeSmartList,
    activeTab,
    showNetworkGraph,
  } = ui;

  // Use contacts directly from Redux, not from UI state
  const contacts = mockContacts;
  const emailAccounts = mockEmailAccounts;

  if (isLoading) return <LoadingState message="Loading contacts…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load contacts"
        onRetry={refetch}
      />
    );
  }

  if (mockContacts.length === 0) {
    return (
      <PageScaffold
        breadcrumbs={routeConfig?.breadcrumbs}
        aiSuggestion={routeConfig?.aiSuggestion}
        containerProps={{ className: 'space-y-6' }}
        header={{
          title: 'Contacts & CRM',
          description: 'Manage relationships and track communications',
          icon: Users,
        }}
      >
        <EmptyState icon={Users} title="No contacts yet" message="Create a contact to get started." />
      </PageScaffold>
    );
  }

  // Helper to get relationship metrics for a contact
  const getRelationshipMetrics = (contact: Contact): RelationshipMetrics => {
    const daysSinceLastContact = contact.lastContact
      ? Math.floor((new Date().getTime() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    return calculateRelationshipScore(
      contact.interactions,
      daysSinceLastContact,
      contact.responseRate || 50,
      contact.interactionFrequency || 1
    );
  };

  // Apply smart list filters
  const applySmartListFilters = (contact: Contact): boolean => {
    if (!activeSmartList || activeSmartList.conditions.length === 0) return true;

    return activeSmartList.conditions.every(condition => {
      const metrics = getRelationshipMetrics(contact);

      switch (condition.field) {
        case 'role':
          return condition.operator === 'equals'
            ? contact.role === condition.value
            : contact.role.includes(String(condition.value));
        case 'tags':
          return contact.tags.some(tag => tag.toLowerCase().includes(String(condition.value).toLowerCase()));
        case 'location':
          return contact.location?.toLowerCase().includes(String(condition.value).toLowerCase()) || false;
        case 'relationshipScore':
          if (condition.operator === 'greaterThan') return metrics.score > Number(condition.value);
          if (condition.operator === 'lessThan') return metrics.score < Number(condition.value);
          return false;
        case 'lastContact':
          const days = parseInt(String(condition.value));
          if (condition.operator === 'inLast') return metrics.daysSinceLastContact <= days;
          if (condition.operator === 'notInLast') return metrics.daysSinceLastContact > days;
          return false;
        case 'deals':
          return condition.operator === 'greaterThan'
            ? contact.deals.length > Number(condition.value)
            : false;
        case 'starred':
          return contact.starred === Boolean(condition.value);
        default:
          return true;
      }
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || contact.role === filterRole;
    const matchesSmartList = applySmartListFilters(contact);
    return matchesSearch && matchesRole && matchesSmartList;
  });

  const handleListSave = (list: SmartList) => {
    const exists = smartLists.find((storedList) => storedList.id === list.id);
    patchUI({
      smartLists: exists
        ? smartLists.map((storedList) => (storedList.id === list.id ? list : storedList))
        : [...smartLists, { ...list, id: `list-${Date.now()}` }],
    });
  };

  const handleListDelete = (listId: string) => {
    patchUI({
      smartLists: smartLists.filter((list) => list.id !== listId),
      activeSmartList: activeSmartList?.id === listId ? null : activeSmartList,
    });
  };

  const handleListSelect = (list: SmartList) => {
    patchUI({ activeSmartList: list });
  };

  const toggleStar = (contactId: string) => {
    // TODO: Dispatch action to update contact star status
    // For now, this is read-only from Redux state
    console.log('Toggle star for contact:', contactId);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder': return 'bg-app-primary-bg dark:bg-app-dark-primary-bg text-app-primary dark:text-app-dark-primary';
      case 'ceo': return 'bg-app-secondary dark:bg-app-dark-secondary text-white';
      case 'investor': return 'bg-app-info-bg dark:bg-app-dark-info-bg text-app-info dark:text-app-dark-info';
      default: return 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text-muted dark:text-app-dark-text-muted';
    }
  };

  const summaryCards: MetricsGridItem[] = [
    {
      type: 'stats',
      props: {
        title: 'Total Contacts',
        value: contacts.length,
        icon: Users,
        variant: 'primary',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Founders',
        value: contacts.filter(c => c.role === 'founder' || c.role === 'ceo').length,
        icon: Building2,
        variant: 'warning',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Starred',
        value: contacts.filter(c => c.starred).length,
        icon: Star,
        variant: 'success',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Follow-ups Due',
        value: contacts.filter(c => c.nextFollowUp).length,
        icon: Calendar,
        variant: 'primary',
      },
    },
  ];

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      containerProps={{ className: 'space-y-6' }}
      header={{
        title: 'Contacts & CRM',
        description: 'Manage relationships with founders, investors, and advisors',
        icon: Users,
        aiSummary: {
          text: `${contacts.length} total contacts. ${contacts.filter(c => c.starred).length} starred. ${contacts.filter(c => c.nextFollowUp).length} pending follow-ups.`,
          confidence: 0.91,
        },
        primaryAction: {
          label: 'Add Contact',
          onClick: () => console.log('Add contact clicked'),
        },
        secondaryActions: [
          {
            label: 'Network View',
            onClick: () => patchUI({ showNetworkGraph: true }),
          },
        ],
      }}
    >

      {/* Stats Overview */}
      <MetricsGrid items={summaryCards} columns={{ base: 1, md: 2, lg: 4 }} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Smart Lists Sidebar */}
        <div className="lg:col-span-1">
          <SmartLists
            lists={smartLists}
            onListSelect={handleListSelect}
            onListSave={handleListSave}
            onListDelete={handleListDelete}
            selectedListId={activeSmartList?.id}
          />
        </div>

        {/* Contact List */}
        <div className="lg:col-span-3">
          <Card padding="none">
            <div className="p-4 border-b border-app-border dark:border-app-dark-border">
              {activeSmartList && (
                <div className="mb-3 p-3 rounded-lg bg-app-primary-bg dark:bg-app-dark-primary-bg border border-app-primary dark:border-app-dark-primary flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge size="sm" variant="flat" className="bg-app-primary dark:bg-app-dark-primary text-white">
                      Active Filter
                    </Badge>
                    <span className="text-sm font-medium">{activeSmartList.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => patchUI({ activeSmartList: null })}
                  >
                    Clear
                  </Button>
                </div>
              )}
              <SearchToolbar
                searchValue={searchQuery}
                onSearchChange={(value) => patchUI({ searchQuery: value })}
                searchPlaceholder="Search contacts..."
                dropdown={{
                  label: 'Role',
                  selectedValue: filterRole,
                  onChange: (value) => patchUI({ filterRole: value }),
                  options: [
                    { value: 'all', label: 'All Roles' },
                    { value: 'founder', label: 'Founders' },
                    { value: 'ceo', label: 'CEOs' },
                    { value: 'investor', label: 'Investors' },
                    { value: 'advisor', label: 'Advisors' },
                  ],
                }}
              />
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    patchUI({ selectedContact: contact, isDrawerOpen: true });
                  }}
                  className={`p-4 border-b border-app-border dark:border-app-dark-border cursor-pointer transition-colors hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover ${
                    selectedContact?.id === contact.id ? 'bg-app-primary-bg dark:bg-app-dark-primary-bg' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent flex items-center justify-center text-white font-semibold">
                        {contact.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {contact.name}
                          {contact.starred && <Star className="w-3 h-3 fill-app-warning dark:fill-app-dark-warning text-app-warning dark:text-app-dark-warning" />}
                        </p>
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">{contact.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge size="sm" className={getRoleBadgeColor(contact.role)}>
                      {contact.role}
                    </Badge>
                    {contact.location && (
                      <span className="text-xs text-app-text-muted dark:text-app-dark-text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {contact.location.split(',')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-app-text-subtle dark:text-app-dark-text-subtle">{contact.interactions} interactions</span>
                    <RelationshipScore metrics={getRelationshipMetrics(contact)} compact />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Contact Detail SideDrawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => patchUI({ isDrawerOpen: false })}
        title={selectedContact?.name}
        subtitle={selectedContact?.company}
        width="lg"
      >
        {selectedContact && (
          <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-app-border dark:border-app-dark-border">
                <button
                  onClick={() => patchUI({ activeTab: 'overview' })}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-app-primary dark:border-app-dark-primary text-app-primary dark:text-app-dark-primary'
                      : 'border-transparent text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => patchUI({ activeTab: 'timeline' })}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'timeline'
                      ? 'border-app-primary dark:border-app-dark-primary text-app-primary dark:text-app-dark-primary'
                      : 'border-transparent text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => patchUI({ activeTab: 'email' })}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'email'
                      ? 'border-app-primary dark:border-app-dark-primary text-app-primary dark:text-app-dark-primary'
                      : 'border-transparent text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text'
                  }`}
                >
                  Email Settings
                </button>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent flex items-center justify-center text-white text-2xl font-semibold">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedContact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeColor(selectedContact.role)}>
                          {selectedContact.role}
                        </Badge>
                        {selectedContact.company && (
                          <span className="text-sm text-app-text-muted dark:text-app-dark-text-muted">
                            at {selectedContact.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={() => toggleStar(selectedContact.id)}
                      aria-label={selectedContact.starred ? 'Unstar contact' : 'Star contact'}
                    >
                      <Star className={`w-4 h-4 ${selectedContact.starred ? 'fill-app-warning dark:fill-app-dark-warning text-app-warning dark:text-app-dark-warning' : ''}`} />
                    </Button>
                    <Button size="sm" variant="flat" isIconOnly aria-label="Edit contact">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="flat" isIconOnly color="danger" aria-label="Delete contact">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Relationship Health Score */}
                <RelationshipScore metrics={getRelationshipMetrics(selectedContact)} />

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                    <Mail className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">Email</p>
                      <a href={`mailto:${selectedContact.email}`} className="text-sm hover:text-app-primary dark:hover:text-app-dark-primary">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                      <Phone className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                      <div>
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">Phone</p>
                        <a href={`tel:${selectedContact.phone}`} className="text-sm hover:text-app-primary dark:hover:text-app-dark-primary">
                          {selectedContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedContact.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                      <MapPin className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                      <div>
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">Location</p>
                        <p className="text-sm">{selectedContact.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.linkedin && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                      <ExternalLink className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                      <div>
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">LinkedIn</p>
                        <a href={selectedContact.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-app-primary dark:hover:text-app-dark-primary">
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button color="primary" startContent={<Send className="w-4 h-4" />}>
                    Send Email
                  </Button>
                  <Button variant="flat" startContent={<Phone className="w-4 h-4" />}>
                    Call
                  </Button>
                  <Button variant="flat" startContent={<Video className="w-4 h-4" />}>
                    Schedule Meeting
                  </Button>
                  <Button variant="flat" startContent={<MessageSquare className="w-4 h-4" />}>
                    Add Note
                  </Button>
                </div>

                {/* Tags */}
                {selectedContact.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag, idx) => (
                        <Badge key={idx} size="sm" variant="flat" className="bg-app-surface-hover dark:bg-app-dark-surface-hover">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Deals */}
                {selectedContact.deals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Associated Deals</p>
                    <div className="space-y-2">
                      {selectedContact.deals.map((deal, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                          <Briefcase className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                          <span className="text-sm">{deal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedContact.notes && (
                  <div>
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover text-sm">
                      {selectedContact.notes}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {selectedContact.nextFollowUp && (
                  <div className="p-4 rounded-lg bg-app-warning-bg dark:bg-app-dark-warning-bg border border-app-warning dark:border-app-dark-warning">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-app-warning dark:text-app-dark-warning" />
                      <span className="text-sm font-medium text-app-warning dark:text-app-dark-warning">
                        Follow-up scheduled: {new Date(selectedContact.nextFollowUp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Recent Interactions */}
                <div>
                  <p className="text-sm font-medium mb-3">Recent Interactions</p>
                  <div className="space-y-3">
                    {mockInteractions
                      .filter(i => i.contactId === selectedContact.id)
                      .map((interaction) => (
                        <div key={interaction.id} className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {interaction.type === 'email' && <Mail className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />}
                              {interaction.type === 'call' && <Phone className="w-4 h-4 text-app-success dark:text-app-dark-success" />}
                              {interaction.type === 'meeting' && <Video className="w-4 h-4 text-app-info dark:text-app-dark-info" />}
                              <span className="text-sm font-medium">{interaction.subject}</span>
                            </div>
                            <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
                              {new Date(interaction.date).toLocaleDateString()}
                            </span>
                          </div>
                          {interaction.notes && (
                            <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mt-1">{interaction.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <InteractionTimeline
                  interactions={mockTimelineInteractions}
                  contactName={selectedContact.name}
                  onAddInteraction={(type) => console.log('Add interaction:', type)}
                  onEditInteraction={(id) => console.log('Edit interaction:', id)}
                  onDeleteInteraction={(id) => console.log('Delete interaction:', id)}
                  onLinkToDeal={(id) => console.log('Link to deal:', id)}
                />
              )}

              {/* Email Settings Tab */}
              {activeTab === 'email' && (
                <EmailIntegration
                  accounts={emailAccounts}
                  onConnect={(provider) => console.log('Connect:', provider)}
                  onDisconnect={(id) => console.log('Disconnect:', id)}
                  onSync={(id) => console.log('Sync:', id)}
                  onToggleAutoCapture={(id, enabled) => {
                    // TODO: Dispatch action to update email account auto-capture
                    // For now, this is read-only from Redux state
                    console.log('Toggle auto-capture for account:', id, enabled);
                  }}
                />
              )}
            </div>
        )}
      </SideDrawer>

      {/* Network Graph Modal */}
      {showNetworkGraph && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-background dark:bg-app-dark-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-app-border dark:border-app-dark-border">
              <h2 className="text-xl font-semibold">Network Graph</h2>
              <Button
                variant="flat"
                size="sm"
                onClick={() => patchUI({ showNetworkGraph: false })}
              >
                Close
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <NetworkGraph
                centralNode={{ id: '1', name: 'Your Network', type: 'contact' }}
                nodes={[]}
                connections={[]}
                onNodeClick={(node) => console.log('Node clicked:', node)}
              />
            </div>
          </div>
        </div>
      )}
    </PageScaffold>
  );
}
