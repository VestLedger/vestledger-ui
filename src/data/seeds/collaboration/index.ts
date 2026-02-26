import { ROUTE_PATHS } from '@/config/routes';
import type { UserRole } from '@/types/auth';

export type CollaborationThreadStatus = 'active' | 'awaiting-response' | 'resolved';
export type CollaborationTaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type CollaborationTaskPriority = 'low' | 'medium' | 'high';

export interface CollaborationThread {
  id: string;
  title: string;
  contextLabel: string;
  participants: UserRole[];
  status: CollaborationThreadStatus;
  unreadCount: number;
  lastMessageAt: string;
}

export interface CollaborationMessage {
  id: string;
  threadId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
}

export interface CollaborationTask {
  id: string;
  title: string;
  description: string;
  ownerRole: UserRole;
  contributorRoles: UserRole[];
  priority: CollaborationTaskPriority;
  status: CollaborationTaskStatus;
  dueDate: string;
  route: string;
}

export interface CollaborationSnapshot {
  threads: CollaborationThread[];
  messages: CollaborationMessage[];
  tasks: CollaborationTask[];
}

const MOCK_NOW = new Date('2026-02-14T15:00:00.000Z').getTime();

export const mockCollaborationThreads: CollaborationThread[] = [
  {
    id: 'thread-ic-1',
    title: 'CloudScale IC memo feedback',
    contextLabel: 'Dealflow Review',
    participants: ['gp', 'analyst', 'strategic_partner'],
    status: 'active',
    unreadCount: 3,
    lastMessageAt: new Date(MOCK_NOW - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-tax-1',
    title: 'K-1 distribution escalation',
    contextLabel: 'Tax Center',
    participants: ['ops', 'ir', 'auditor'],
    status: 'awaiting-response',
    unreadCount: 1,
    lastMessageAt: new Date(MOCK_NOW - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-aml-1',
    title: 'High-risk AML review package',
    contextLabel: 'Compliance',
    participants: ['ops', 'auditor', 'service_provider'],
    status: 'resolved',
    unreadCount: 0,
    lastMessageAt: new Date(MOCK_NOW - 28 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockCollaborationMessages: CollaborationMessage[] = [
  {
    id: 'msg-1',
    threadId: 'thread-ic-1',
    authorName: 'Avery Chen',
    authorRole: 'analyst',
    message: 'Uploaded updated TAM model. Need GP review before committee packet lock.',
    createdAt: new Date(MOCK_NOW - 70 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    threadId: 'thread-ic-1',
    authorName: 'Maya Patel',
    authorRole: 'gp',
    message: 'Please add downside sensitivity and a short note on competitive moat.',
    createdAt: new Date(MOCK_NOW - 62 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    threadId: 'thread-tax-1',
    authorName: 'Jordan Rivera',
    authorRole: 'ops',
    message: 'Two LP recipients still missing signed delivery confirmations.',
    createdAt: new Date(MOCK_NOW - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-4',
    threadId: 'thread-aml-1',
    authorName: 'Nina Brooks',
    authorRole: 'auditor',
    message: 'EDD packet accepted. Closing this review thread.',
    createdAt: new Date(MOCK_NOW - 28 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockCollaborationTasks: CollaborationTask[] = [
  {
    id: 'task-ic-1',
    title: 'Finalize CloudScale IC packet',
    description: 'Incorporate memo feedback and lock packet for Monday committee.',
    ownerRole: 'analyst',
    contributorRoles: ['gp', 'strategic_partner'],
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-02-16',
    route: ROUTE_PATHS.dealflowReview,
  },
  {
    id: 'task-tax-1',
    title: 'Resolve pending K-1 acknowledgements',
    description: 'Follow up with LP operations contacts and confirm portal downloads.',
    ownerRole: 'ir',
    contributorRoles: ['ops'],
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-02-18',
    route: ROUTE_PATHS.taxCenter,
  },
  {
    id: 'task-aml-1',
    title: 'Attach sanctions evidence to audit trail',
    description: 'Link latest sanctions run output in compliance evidence folder.',
    ownerRole: 'service_provider',
    contributorRoles: ['ops', 'auditor'],
    priority: 'medium',
    status: 'done',
    dueDate: '2026-02-13',
    route: ROUTE_PATHS.compliance,
  },
];

export const mockCollaborationSnapshot: CollaborationSnapshot = {
  threads: mockCollaborationThreads,
  messages: mockCollaborationMessages,
  tasks: mockCollaborationTasks,
};
