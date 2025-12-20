import type { EmailAccount } from '@/components/crm/email-integration';
import type { TimelineInteraction } from '@/components/crm/interaction-timeline';

export interface Contact {
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
  responseRate?: number; // 0-100
  interactionFrequency?: number; // interactions per month
}

export interface Interaction {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  date: string;
  notes?: string;
}

export const mockContacts: Contact[] = [
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
    interactions: 12,
    responseRate: 85,
    interactionFrequency: 3,
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
    interactions: 8,
    responseRate: 70,
    interactionFrequency: 2,
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
    interactions: 15,
    responseRate: 95,
    interactionFrequency: 5,
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
    interactions: 5,
    responseRate: 60,
    interactionFrequency: 1,
  },
];

export const mockInteractions: Interaction[] = [
  {
    id: '1',
    contactId: '1',
    type: 'meeting',
    subject: 'Due diligence follow-up meeting',
    date: '2024-11-25',
    notes: 'Discussed product roadmap and go-to-market strategy. Very positive.',
  },
  {
    id: '2',
    contactId: '1',
    type: 'email',
    subject: 'Introduction to portfolio company',
    date: '2024-11-20',
    notes: 'Connected with CloudScale team for potential partnership.',
  },
  {
    id: '3',
    contactId: '2',
    type: 'call',
    subject: 'Reference call',
    date: '2024-11-20',
    notes: 'Spoke with former colleague at Medtronic. Strong recommendation.',
  },
];

export const mockEmailAccounts: EmailAccount[] = [
  {
    id: '1',
    email: 'investor@vestledger.com',
    provider: 'gmail',
    status: 'connected',
    lastSync: new Date('2024-12-10T10:30:00'),
    syncedEmails: 1247,
    autoCapture: true,
  },
];

export const mockTimelineInteractions: TimelineInteraction[] = [
  {
    id: '1',
    type: 'email',
    direction: 'outbound',
    subject: 'Introduction to Quantum AI opportunity',
    description: 'Sent initial pitch deck and investment thesis.',
    date: new Date('2024-11-28T14:30:00'),
    isAutoCaptured: true,
    tags: ['pitch', 'Series A'],
    outcome: 'positive',
  },
  {
    id: '2',
    type: 'call',
    direction: 'inbound',
    subject: 'Follow-up call on investment terms',
    description: 'Discussed valuation, allocation, and board seat requirements.',
    date: new Date('2024-11-25T10:00:00'),
    duration: 45,
    participants: ['Sarah Chen', 'Co-founder Alex'],
    outcome: 'positive',
    linkedDeal: 'Quantum AI - Series A',
  },
  {
    id: '3',
    type: 'meeting',
    direction: 'inbound',
    subject: 'Due diligence presentation',
    description: 'Deep dive into technology architecture, team background, and market opportunity.',
    date: new Date('2024-11-20T15:00:00'),
    duration: 90,
    participants: ['Sarah Chen', 'CTO Mike'],
    attachments: 3,
    outcome: 'positive',
    tags: ['due diligence', 'technical'],
    linkedDeal: 'Quantum AI - Series A',
  },
  {
    id: '4',
    type: 'email',
    direction: 'inbound',
    subject: 'Financial projections and unit economics',
    description: 'Received updated financial model with 5-year projections.',
    date: new Date('2024-11-18T09:15:00'),
    attachments: 2,
    isAutoCaptured: true,
    tags: ['financials'],
  },
  {
    id: '5',
    type: 'note',
    subject: 'First meeting notes',
    description:
      'Great first impression. Strong technical team with deep AI expertise. Product has clear PMF with Fortune 500 customers.',
    date: new Date('2024-11-15T16:45:00'),
    tags: ['first meeting', 'notes'],
    outcome: 'positive',
  },
];

