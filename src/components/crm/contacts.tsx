'use client'

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/ui';
import { User, Mail, Phone, Building2, MapPin, Calendar, Tag, Search, Filter, Plus, Edit3, Trash2, Star, MessageSquare, Video, Send, ExternalLink, Briefcase, Users } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'founder' | 'co-founder' | 'ceo' | 'cto' | 'investor' | 'advisor' | 'other';
  company?: string;
  location?: string;
  tags: string[];
  lastContact?: string;
  nextFollowUp?: string;
  linkedCompanies: string[];
  notes?: string;
  linkedin?: string;
  twitter?: string;
  starred: boolean;
  deals: string[];
  interactions: number;
}

interface Interaction {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  date: string;
  notes?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@quantumai.com',
    phone: '+1 (555) 123-4567',
    role: 'founder',
    company: 'Quantum AI',
    location: 'San Francisco, CA',
    tags: ['AI/ML', 'Enterprise SaaS', 'Series A'],
    lastContact: '2024-11-25',
    nextFollowUp: '2024-12-10',
    linkedCompanies: ['Quantum AI'],
    notes: 'Strong technical background. Stanford PhD. Previously led AI team at Google.',
    linkedin: 'https://linkedin.com/in/sarahchen',
    starred: true,
    deals: ['Quantum AI - Series A'],
    interactions: 12
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael@neurolink.io',
    phone: '+1 (555) 234-5678',
    role: 'ceo',
    company: 'NeuroLink',
    location: 'Boston, MA',
    tags: ['HealthTech', 'Medical Devices', 'Seed'],
    lastContact: '2024-11-20',
    nextFollowUp: '2024-12-05',
    linkedCompanies: ['NeuroLink'],
    notes: 'Ex-Medtronic executive. Deep healthcare connections.',
    linkedin: 'https://linkedin.com/in/mrodriguez',
    starred: false,
    deals: ['NeuroLink - Seed'],
    interactions: 8
  },
  {
    id: '3',
    name: 'Emily Zhang',
    email: 'emily@cloudscale.com',
    phone: '+1 (555) 345-6789',
    role: 'co-founder',
    company: 'CloudScale',
    location: 'Austin, TX',
    tags: ['DevTools', 'Infrastructure', 'Series B'],
    lastContact: '2024-11-28',
    nextFollowUp: '2024-12-15',
    linkedCompanies: ['CloudScale'],
    notes: 'CTO background. Built engineering teams at Stripe and AWS.',
    starred: true,
    deals: ['CloudScale - Series B'],
    interactions: 15
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@venturelab.com',
    role: 'investor',
    company: 'VentureLab Partners',
    location: 'New York, NY',
    tags: ['Co-investor', 'FinTech Focus'],
    lastContact: '2024-11-15',
    linkedCompanies: [],
    starred: false,
    deals: [],
    interactions: 5
  }
];

const mockInteractions: Interaction[] = [
  {
    id: '1',
    contactId: '1',
    type: 'meeting',
    subject: 'Due diligence follow-up meeting',
    date: '2024-11-25',
    notes: 'Discussed product roadmap and go-to-market strategy. Very positive.'
  },
  {
    id: '2',
    contactId: '1',
    type: 'email',
    subject: 'Introduction to portfolio company',
    date: '2024-11-20',
    notes: 'Connected with CloudScale team for potential partnership.'
  },
  {
    id: '3',
    contactId: '2',
    type: 'call',
    subject: 'Reference call',
    date: '2024-11-20',
    notes: 'Spoke with former colleague at Medtronic. Strong recommendation.'
  }
];

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddContact, setShowAddContact] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || contact.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const toggleStar = (contactId: string) => {
    setContacts(prev => prev.map(c =>
      c.id === contactId ? { ...c, starred: !c.starred } : c
    ));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder': return 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]';
      case 'ceo': return 'bg-[var(--app-secondary)] text-white';
      case 'investor': return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contacts & CRM</h2>
          <p className="text-sm text-[var(--app-text-muted)] mt-1">
            Manage relationships with founders, investors, and advisors
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => setShowAddContact(true)}
        >
          Add Contact
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-primary-bg)]">
              <Users className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contacts.length}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Total Contacts</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-warning-bg)]">
              <Building2 className="w-5 h-5 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contacts.filter(c => c.role === 'founder' || c.role === 'ceo').length}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Founders</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-success-bg)]">
              <Star className="w-5 h-5 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contacts.filter(c => c.starred).length}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Starred</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-info-bg)]">
              <Calendar className="w-5 h-5 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contacts.filter(c => c.nextFollowUp).length}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Follow-ups Due</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="lg:col-span-1">
          <Card padding="none">
            <div className="p-4 border-b border-[var(--app-border)]">
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                className="mb-3"
              />
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="founder">Founders</option>
                  <option value="ceo">CEOs</option>
                  <option value="investor">Investors</option>
                  <option value="advisor">Advisors</option>
                </select>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-[var(--app-border)] cursor-pointer transition-colors hover:bg-[var(--app-surface-hover)] ${
                    selectedContact?.id === contact.id ? 'bg-[var(--app-primary-bg)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white font-semibold">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {contact.name}
                          {contact.starred && <Star className="w-3 h-3 fill-[var(--app-warning)] text-[var(--app-warning)]" />}
                        </p>
                        <p className="text-xs text-[var(--app-text-muted)]">{contact.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge size="sm" className={getRoleBadgeColor(contact.role)}>
                      {contact.role}
                    </Badge>
                    {contact.location && (
                      <span className="text-xs text-[var(--app-text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {contact.location.split(',')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                    <span>{contact.interactions} interactions</span>
                    {contact.lastContact && (
                      <span>Last: {new Date(contact.lastContact).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Contact Detail */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <Card padding="lg">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white text-2xl font-semibold">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedContact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeColor(selectedContact.role)}>
                          {selectedContact.role}
                        </Badge>
                        {selectedContact.company && (
                          <span className="text-sm text-[var(--app-text-muted)]">
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
                    >
                      <Star className={`w-4 h-4 ${selectedContact.starred ? 'fill-[var(--app-warning)] text-[var(--app-warning)]' : ''}`} />
                    </Button>
                    <Button size="sm" variant="flat" isIconOnly>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="flat" isIconOnly color="danger">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <Mail className="w-4 h-4 text-[var(--app-primary)]" />
                    <div>
                      <p className="text-xs text-[var(--app-text-muted)]">Email</p>
                      <a href={`mailto:${selectedContact.email}`} className="text-sm hover:text-[var(--app-primary)]">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--app-surface-hover)]">
                      <Phone className="w-4 h-4 text-[var(--app-primary)]" />
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Phone</p>
                        <a href={`tel:${selectedContact.phone}`} className="text-sm hover:text-[var(--app-primary)]">
                          {selectedContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedContact.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--app-surface-hover)]">
                      <MapPin className="w-4 h-4 text-[var(--app-primary)]" />
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Location</p>
                        <p className="text-sm">{selectedContact.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.linkedin && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--app-surface-hover)]">
                      <ExternalLink className="w-4 h-4 text-[var(--app-primary)]" />
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">LinkedIn</p>
                        <a href={selectedContact.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[var(--app-primary)]">
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
                        <Badge key={idx} size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
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
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--app-surface-hover)]">
                          <Briefcase className="w-4 h-4 text-[var(--app-primary)]" />
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
                    <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-sm">
                      {selectedContact.notes}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {selectedContact.nextFollowUp && (
                  <div className="p-4 rounded-lg bg-[var(--app-warning-bg)] border border-[var(--app-warning)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--app-warning)]" />
                      <span className="text-sm font-medium text-[var(--app-warning)]">
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
                        <div key={interaction.id} className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {interaction.type === 'email' && <Mail className="w-4 h-4 text-[var(--app-primary)]" />}
                              {interaction.type === 'call' && <Phone className="w-4 h-4 text-[var(--app-success)]" />}
                              {interaction.type === 'meeting' && <Video className="w-4 h-4 text-[var(--app-info)]" />}
                              <span className="text-sm font-medium">{interaction.subject}</span>
                            </div>
                            <span className="text-xs text-[var(--app-text-subtle)]">
                              {new Date(interaction.date).toLocaleDateString()}
                            </span>
                          </div>
                          {interaction.notes && (
                            <p className="text-xs text-[var(--app-text-muted)] mt-1">{interaction.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg" className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-[var(--app-text-subtle)] mx-auto mb-4" />
                <p className="text-lg font-medium text-[var(--app-text-muted)]">
                  Select a contact to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
