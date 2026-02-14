import { isMockMode } from '@/config/data-mode';
import {
  mockCollaborationSnapshot,
  type CollaborationMessage,
  type CollaborationSnapshot,
  type CollaborationTask,
  type CollaborationTaskPriority,
  type CollaborationTaskStatus,
  type CollaborationThread,
} from '@/data/mocks/collaboration';
import type { UserRole } from '@/types/auth';
import { requestJson } from '@/services/shared/httpClient';

export type {
  CollaborationMessage,
  CollaborationSnapshot,
  CollaborationTask,
  CollaborationTaskPriority,
  CollaborationTaskStatus,
  CollaborationThread,
} from '@/data/mocks/collaboration';

type ApiListResponse<TItem> =
  | {
      data?: TItem[];
      meta?: unknown;
    }
  | TItem[];

type ApiThreadRecord = {
  id?: string;
  title?: string;
  contextLabel?: string;
  participants?: UserRole[];
  status?: CollaborationThread['status'];
  unreadCount?: number;
  lastMessageAt?: string;
};

type ApiMessageRecord = {
  id?: string;
  threadId?: string;
  authorName?: string;
  authorRole?: UserRole;
  message?: string;
  createdAt?: string;
};

type ApiTaskRecord = {
  id?: string;
  title?: string;
  description?: string;
  ownerRole?: UserRole;
  contributorRoles?: UserRole[];
  priority?: CollaborationTaskPriority;
  status?: CollaborationTaskStatus;
  dueDate?: string;
  route?: string;
};

export interface CreateCollaborationTaskInput {
  title: string;
  description: string;
  ownerRole: UserRole;
  contributorRoles: UserRole[];
  priority: CollaborationTaskPriority;
  dueDate: string;
  route: string;
}

export interface CreateCollaborationMessageInput {
  threadId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
}

const clone = <T>(value: T): T => structuredClone(value);

let collaborationCache: CollaborationSnapshot | null = null;

function getBaseMockSnapshot(): CollaborationSnapshot {
  return clone(mockCollaborationSnapshot);
}

function setCachedSnapshot(snapshot: CollaborationSnapshot): void {
  collaborationCache = clone(snapshot);
}

function getCachedOrMockSnapshot(): CollaborationSnapshot {
  return clone(collaborationCache ?? getBaseMockSnapshot());
}

function extractApiList<TItem>(response: ApiListResponse<TItem>): TItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function asDateIso(value?: string): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function mapApiThread(record: ApiThreadRecord, index: number): CollaborationThread {
  return {
    id: record.id ?? `thread-${index + 1}`,
    title: record.title ?? `Collaboration thread ${index + 1}`,
    contextLabel: record.contextLabel ?? 'General',
    participants: Array.isArray(record.participants) ? record.participants : ['gp', 'analyst'],
    status: record.status ?? 'active',
    unreadCount: typeof record.unreadCount === 'number' ? record.unreadCount : 0,
    lastMessageAt: asDateIso(record.lastMessageAt),
  };
}

function mapApiMessage(record: ApiMessageRecord, index: number): CollaborationMessage {
  return {
    id: record.id ?? `message-${index + 1}`,
    threadId: record.threadId ?? 'thread-1',
    authorName: record.authorName ?? 'VestLedger User',
    authorRole: record.authorRole ?? 'gp',
    message: record.message ?? 'Message imported from API.',
    createdAt: asDateIso(record.createdAt),
  };
}

function mapApiTask(record: ApiTaskRecord, index: number): CollaborationTask {
  return {
    id: record.id ?? `task-${index + 1}`,
    title: record.title ?? `Collaboration task ${index + 1}`,
    description: record.description ?? 'Task imported from API.',
    ownerRole: record.ownerRole ?? 'gp',
    contributorRoles:
      Array.isArray(record.contributorRoles) && record.contributorRoles.length > 0
        ? record.contributorRoles
        : ['analyst'],
    priority: record.priority ?? 'medium',
    status: record.status ?? 'todo',
    dueDate: record.dueDate ?? new Date().toISOString().slice(0, 10),
    route: record.route ?? '/home',
  };
}

async function fetchSnapshotFromApi(previous: CollaborationSnapshot): Promise<CollaborationSnapshot> {
  const [threadsResult, messagesResult, tasksResult] = await Promise.allSettled([
    requestJson<ApiListResponse<ApiThreadRecord>>('/collaboration/threads', {
      method: 'GET',
      fallbackMessage: 'Failed to fetch collaboration threads',
    }),
    requestJson<ApiListResponse<ApiMessageRecord>>('/collaboration/messages', {
      method: 'GET',
      fallbackMessage: 'Failed to fetch collaboration messages',
    }),
    requestJson<ApiListResponse<ApiTaskRecord>>('/collaboration/tasks', {
      method: 'GET',
      fallbackMessage: 'Failed to fetch collaboration tasks',
    }),
  ]);

  return {
    threads:
      threadsResult.status === 'fulfilled'
        ? extractApiList(threadsResult.value).map(mapApiThread)
        : previous.threads,
    messages:
      messagesResult.status === 'fulfilled'
        ? extractApiList(messagesResult.value).map(mapApiMessage)
        : previous.messages,
    tasks:
      tasksResult.status === 'fulfilled'
        ? extractApiList(tasksResult.value).map(mapApiTask)
        : previous.tasks,
  };
}

export async function getCollaborationSnapshot(): Promise<CollaborationSnapshot> {
  if (isMockMode('collaboration')) {
    if (!collaborationCache) {
      setCachedSnapshot(getBaseMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  const previous = getCachedOrMockSnapshot();
  try {
    const snapshot = await fetchSnapshotFromApi(previous);
    setCachedSnapshot(snapshot);
    return clone(snapshot);
  } catch {
    return previous;
  }
}

export async function addCollaborationMessage(
  input: CreateCollaborationMessageInput
): Promise<CollaborationMessage> {
  const snapshot = getCachedOrMockSnapshot();
  const nextMessage: CollaborationMessage = {
    id: `message-${Date.now()}`,
    threadId: input.threadId,
    authorName: input.authorName,
    authorRole: input.authorRole,
    message: input.message,
    createdAt: new Date().toISOString(),
  };

  snapshot.messages.unshift(nextMessage);
  snapshot.threads = snapshot.threads.map((thread) =>
    thread.id === input.threadId
      ? {
          ...thread,
          status: 'active',
          unreadCount: 0,
          lastMessageAt: nextMessage.createdAt,
        }
      : thread
  );

  setCachedSnapshot(snapshot);
  return clone(nextMessage);
}

export async function createCollaborationTask(
  input: CreateCollaborationTaskInput
): Promise<CollaborationTask> {
  const snapshot = getCachedOrMockSnapshot();
  const task: CollaborationTask = {
    id: `task-${Date.now()}`,
    title: input.title,
    description: input.description,
    ownerRole: input.ownerRole,
    contributorRoles: input.contributorRoles,
    priority: input.priority,
    status: 'todo',
    dueDate: input.dueDate,
    route: input.route,
  };

  snapshot.tasks.unshift(task);
  setCachedSnapshot(snapshot);
  return clone(task);
}

export async function updateCollaborationTaskStatus(
  taskId: string,
  status: CollaborationTaskStatus
): Promise<CollaborationTask> {
  const snapshot = getCachedOrMockSnapshot();
  const index = snapshot.tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    throw new Error(`Collaboration task not found: ${taskId}`);
  }

  snapshot.tasks[index] = {
    ...snapshot.tasks[index],
    status,
  };
  setCachedSnapshot(snapshot);
  return clone(snapshot.tasks[index]);
}

export function clearCollaborationSnapshotCache(): void {
  collaborationCache = null;
}
