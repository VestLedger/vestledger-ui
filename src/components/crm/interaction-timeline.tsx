'use client';

import { Card, Button, Badge } from '@/ui';
import { Mail, Phone, Video, MessageSquare, Calendar, Paperclip, Clock, Plus, Edit3, Trash2 } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { SearchToolbar } from '@/components/ui';

export interface TimelineInteraction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  direction?: 'inbound' | 'outbound';
  subject: string;
  description?: string;
  date: Date;
  duration?: number; // minutes
  participants?: string[];
  attachments?: number;
  outcome?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
  linkedDeal?: string;
  isAutoCaptured?: boolean;
}

interface InteractionTimelineProps {
  interactions: TimelineInteraction[];
  contactName?: string;
  onAddInteraction?: (type: TimelineInteraction['type']) => void;
  onEditInteraction?: (id: string) => void;
  onDeleteInteraction?: (id: string) => void;
  onLinkToDeal?: (interactionId: string) => void;
}

export function InteractionTimeline({
  interactions,
  contactName,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onLinkToDeal,
}: InteractionTimelineProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    filterType: string;
    searchQuery: string;
    groupBy: 'date' | 'type';
  }>(`interaction-timeline:${contactName ?? 'all'}`, {
    filterType: 'all',
    searchQuery: '',
    groupBy: 'date',
  });
  const { filterType, searchQuery, groupBy } = ui;

  const getInteractionIcon = (type: TimelineInteraction['type']) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'call':
        return Phone;
      case 'meeting':
        return Video;
      case 'note':
        return MessageSquare;
    }
  };

  const getInteractionColor = (type: TimelineInteraction['type']) => {
    switch (type) {
      case 'email':
        return 'text-[var(--app-primary)]';
      case 'call':
        return 'text-[var(--app-success)]';
      case 'meeting':
        return 'text-[var(--app-info)]';
      case 'note':
        return 'text-[var(--app-warning)]';
    }
  };

  const getOutcomeBadge = (outcome?: TimelineInteraction['outcome']) => {
    if (!outcome) return null;

    switch (outcome) {
      case 'positive':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
            Positive
          </Badge>
        );
      case 'neutral':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
            Neutral
          </Badge>
        );
      case 'negative':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
            Needs Follow-up
          </Badge>
        );
    }
  };

  const filteredInteractions = interactions
    .filter(interaction => {
      const matchesType = filterType === 'all' || interaction.type === filterType;
      const matchesSearch =
        interaction.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group interactions
  const groupedInteractions = filteredInteractions.reduce((groups, interaction) => {
    let key: string;
    if (groupBy === 'date') {
      const date = interaction.date.toDateString();
      key = date;
    } else {
      key = interaction.type;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(interaction);
    return groups;
  }, {} as Record<string, TimelineInteraction[]>);

  const getGroupLabel = (key: string) => {
    if (groupBy === 'date') {
      const date = new Date(key);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return key.charAt(0).toUpperCase() + key.slice(1) + 's';
  };

  const interactionCounts = {
    all: interactions.length,
    email: interactions.filter(i => i.type === 'email').length,
    call: interactions.filter(i => i.type === 'call').length,
    meeting: interactions.filter(i => i.type === 'meeting').length,
    note: interactions.filter(i => i.type === 'note').length,
  };

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">
              Interaction Timeline {contactName && `with ${contactName}`}
            </h3>
          </div>
          <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
            {interactions.length} total
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {([
            { type: 'email', icon: Mail, count: interactionCounts.email },
            { type: 'call', icon: Phone, count: interactionCounts.call },
            { type: 'meeting', icon: Video, count: interactionCounts.meeting },
            { type: 'note', icon: MessageSquare, count: interactionCounts.note },
          ] as Array<{ type: TimelineInteraction['type']; icon: typeof Mail; count: number }>).map(
            ({ type, icon: Icon, count }) => (
            <div
              key={type}
              className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${getInteractionColor(type)}`} />
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-[var(--app-text-muted)] capitalize">{type}s</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search interactions..."
          rightActions={(
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={filterType}
                onChange={(e) => patchUI({ filterType: e.target.value })}
              >
                <option value="all">All Types ({interactionCounts.all})</option>
                <option value="email">Emails ({interactionCounts.email})</option>
                <option value="call">Calls ({interactionCounts.call})</option>
                <option value="meeting">Meetings ({interactionCounts.meeting})</option>
                <option value="note">Notes ({interactionCounts.note})</option>
              </select>
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={groupBy}
                onChange={(e) => patchUI({ groupBy: e.target.value as 'date' | 'type' })}
              >
                <option value="date">Group by Date</option>
                <option value="type">Group by Type</option>
              </select>
            </div>
          )}
        />

        {/* Add Interaction Buttons */}
        {onAddInteraction && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={<Mail className="w-3 h-3" />}
              onPress={() => onAddInteraction('email')}
            >
              Log Email
            </Button>
            <Button
              size="sm"
              variant="flat"
              startContent={<Phone className="w-3 h-3" />}
              onPress={() => onAddInteraction('call')}
            >
              Log Call
            </Button>
            <Button
              size="sm"
              variant="flat"
              startContent={<Video className="w-3 h-3" />}
              onPress={() => onAddInteraction('meeting')}
            >
              Log Meeting
            </Button>
            <Button
              size="sm"
              variant="flat"
              startContent={<MessageSquare className="w-3 h-3" />}
              onPress={() => onAddInteraction('note')}
            >
              Add Note
            </Button>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {Object.keys(groupedInteractions).length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No interactions found</p>
              {onAddInteraction && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="mt-3"
                  startContent={<Plus className="w-3 h-3" />}
                  onPress={() => onAddInteraction('note')}
                >
                  Add First Interaction
                </Button>
              )}
            </div>
          ) : (
            Object.entries(groupedInteractions).map(([groupKey, groupInteractions]) => (
              <div key={groupKey}>
                {/* Group Header */}
                <div className="sticky top-0 bg-[var(--app-surface)] z-10 pb-2">
                  <h4 className="text-sm font-semibold text-[var(--app-text-muted)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getGroupLabel(groupKey)}
                    <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                      {groupInteractions.length}
                    </Badge>
                  </h4>
                </div>

                {/* Interactions in Group */}
                <div className="space-y-2 ml-4 border-l-2 border-[var(--app-border)] pl-4">
                  {groupInteractions.map((interaction) => {
                    const Icon = getInteractionIcon(interaction.type);
                    const colorClass = getInteractionColor(interaction.type);

                    return (
                      <div
                        key={interaction.id}
                        className="relative p-4 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-primary-bg)] transition-colors border border-transparent hover:border-[var(--app-primary)]"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute -left-[29px] top-6 w-4 h-4 rounded-full border-2 border-[var(--app-surface)] ${colorClass.replace('text-', 'bg-')}`} />

                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className={`w-4 h-4 ${colorClass}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-sm font-medium">{interaction.subject}</h5>
                                {interaction.direction && (
                                  <Badge
                                    size="sm"
                                    variant="flat"
                                    className={
                                      interaction.direction === 'inbound'
                                        ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                                        : 'bg-[var(--app-info-bg)] text-[var(--app-info)]'
                                    }
                                  >
                                    {interaction.direction}
                                  </Badge>
                                )}
                                {interaction.isAutoCaptured && (
                                  <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                                    Auto
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                                <span>{interaction.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                {interaction.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {interaction.duration} min
                                  </span>
                                )}
                                {interaction.attachments && interaction.attachments > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Paperclip className="w-3 h-3" />
                                    {interaction.attachments}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {onEditInteraction && (
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onEditInteraction(interaction.id)}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            )}
                            {onDeleteInteraction && (
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onDeleteInteraction(interaction.id)}
                              >
                                <Trash2 className="w-3 h-3 text-[var(--app-danger)]" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {interaction.description && (
                          <p className="text-sm text-[var(--app-text-muted)] mb-2">
                            {interaction.description}
                          </p>
                        )}

                        {interaction.participants && interaction.participants.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-[var(--app-text-subtle)]">With:</span>
                            <div className="flex flex-wrap gap-1">
                              {interaction.participants.map((participant, idx) => (
                                <Badge
                                  key={idx}
                                  size="sm"
                                  variant="flat"
                                  className="bg-[var(--app-surface)] text-[var(--app-text-muted)]"
                                >
                                  {participant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {getOutcomeBadge(interaction.outcome)}

                          {interaction.tags?.map((tag, idx) => (
                            <Badge
                              key={idx}
                              size="sm"
                              variant="flat"
                              className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                            >
                              {tag}
                            </Badge>
                          ))}

                          {interaction.linkedDeal && (
                            <Badge
                              size="sm"
                              variant="flat"
                              className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
                            >
                              🤝 {interaction.linkedDeal}
                            </Badge>
                          )}

                          {!interaction.linkedDeal && onLinkToDeal && (
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => onLinkToDeal(interaction.id)}
                              className="text-xs"
                            >
                              Link to Deal
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {filteredInteractions.length > 0 && (
          <div className="pt-4 border-t border-[var(--app-border)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--app-text-muted)]">
                Showing {filteredInteractions.length} of {interactions.length} interactions
              </span>
              {interactions.length > 0 && (
                <span className="text-[var(--app-text-muted)]">
                  Last interaction:{' '}
                  {interactions.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
