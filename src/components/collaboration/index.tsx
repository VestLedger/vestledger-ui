'use client';

import { useMemo } from 'react';
import { MessageSquare, Send, CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge, Input, Select, Textarea, useToast } from '@/ui';
import { AsyncStateRenderer } from '@/ui/async-states';
import { PageScaffold, SearchToolbar, SectionHeader } from '@/ui/composites';
import { ROUTE_PATHS } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { collaborationRequested, collaborationSelectors } from '@/store/slices/miscSlice';
import { useUIKey } from '@/store/ui';
import {
  addCollaborationMessage,
  createCollaborationTask,
  updateCollaborationTaskStatus,
  type CollaborationMessage,
  type CollaborationTask,
  type CollaborationTaskStatus,
  type CollaborationThread,
} from '@/services/collaboration/collaborationService';
import { useAuth } from '@/contexts/auth-context';

type CollaborationUIState = {
  searchQuery: string;
  selectedThreadId: string | null;
  taskStatusFilter: 'all' | CollaborationTaskStatus;
  messageDraft: string;
  taskTitleDraft: string;
  taskDescriptionDraft: string;
};

const EMPTY_THREADS: CollaborationThread[] = [];
const EMPTY_TASKS: CollaborationTask[] = [];
const EMPTY_MESSAGES: CollaborationMessage[] = [];

export function CollaborationWorkspace() {
  const toast = useToast();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useAsyncData(
    collaborationRequested,
    collaborationSelectors.selectState
  );
  const { value: ui, patch: patchUI } = useUIKey<CollaborationUIState>('collaboration-workspace', {
    searchQuery: '',
    selectedThreadId: null,
    taskStatusFilter: 'all',
    messageDraft: '',
    taskTitleDraft: '',
    taskDescriptionDraft: '',
  });

  const threads = data?.threads ?? EMPTY_THREADS;
  const tasks = data?.tasks ?? EMPTY_TASKS;
  const messages = data?.messages ?? EMPTY_MESSAGES;

  const filteredThreads = useMemo(() => {
    if (!ui.searchQuery.trim()) return threads;
    const query = ui.searchQuery.toLowerCase();
    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.contextLabel.toLowerCase().includes(query)
    );
  }, [threads, ui.searchQuery]);

  const filteredTasks = useMemo(() => {
    if (ui.taskStatusFilter === 'all') return tasks;
    return tasks.filter((task) => task.status === ui.taskStatusFilter);
  }, [tasks, ui.taskStatusFilter]);

  const selectedThread =
    filteredThreads.find((thread) => thread.id === ui.selectedThreadId) ?? filteredThreads[0] ?? null;
  const threadMessages = selectedThread
    ? messages
        .filter((message) => message.threadId === selectedThread.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const openTasksCount = tasks.filter((task) => task.status !== 'done').length;
  const blockedTasksCount = tasks.filter((task) => task.status === 'blocked').length;
  const unreadThreadsCount = threads.filter((thread) => thread.unreadCount > 0).length;

  const submitMessage = async () => {
    if (!selectedThread || !user) return;
    const message = ui.messageDraft.trim();
    if (!message) {
      toast.warning('Enter a message before posting.');
      return;
    }

    try {
      await addCollaborationMessage({
        threadId: selectedThread.id,
        authorName: user.name,
        authorRole: user.role,
        message,
      });
      patchUI({ messageDraft: '' });
      toast.success('Comment posted to collaboration thread.', 'Comment Added');
      refetch();
    } catch {
      toast.error('Unable to post comment.');
    }
  };

  const createTask = async () => {
    if (!user) return;
    const title = ui.taskTitleDraft.trim();
    const description = ui.taskDescriptionDraft.trim();

    if (!title || !description) {
      toast.warning('Task title and description are required.');
      return;
    }

    try {
      await createCollaborationTask({
        title,
        description,
        ownerRole: user.role,
        contributorRoles: [user.role],
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        route: ROUTE_PATHS.collaboration,
      });
      patchUI({ taskTitleDraft: '', taskDescriptionDraft: '' });
      toast.success('Collaboration task created.', 'Task Added');
      refetch();
    } catch {
      toast.error('Unable to create collaboration task.');
    }
  };

  const setTaskStatus = async (taskId: string, status: CollaborationTaskStatus) => {
    try {
      await updateCollaborationTaskStatus(taskId, status);
      toast.success(`Task moved to ${status}.`);
      refetch();
    } catch {
      toast.error('Unable to update task status.');
    }
  };

  return (
    <AsyncStateRenderer
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      loadingMessage="Loading collaboration workspace…"
      errorTitle="Failed to load collaboration workspace"
      isEmpty={() => false}
    >
      {() => (
        <PageScaffold
          routePath={ROUTE_PATHS.collaboration}
          header={{
            title: 'Collaboration Workspace',
            description: 'Coordinate cross-persona threads, comments, and task handoffs.',
            icon: MessageSquare,
            aiSummary: {
              text: `${unreadThreadsCount} threads need review and ${openTasksCount} tasks are still open. ${blockedTasksCount} tasks are blocked and should be escalated first.`,
              confidence: 0.9,
            },
            tabs: [
              { id: 'threads', label: 'Threads', count: threads.length },
              { id: 'tasks', label: 'Tasks', count: tasks.length },
            ],
            activeTab: 'threads',
          }}
        >
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <Card padding="md">
                <SearchToolbar
                  searchValue={ui.searchQuery}
                  onSearchChange={(value) => patchUI({ searchQuery: value })}
                  searchPlaceholder="Search threads by title or context..."
                  rightActions={
                    <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                      {unreadThreadsCount} unread
                    </Badge>
                  }
                />
              </Card>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <Card padding="md">
                  <SectionHeader title="Active Threads" className="mb-3" />
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <button
                        type="button"
                        key={thread.id}
                        onClick={() => patchUI({ selectedThreadId: thread.id })}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                          selectedThread?.id === thread.id
                            ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                            : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)]'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{thread.title}</p>
                          {thread.unreadCount > 0 && (
                            <Badge size="sm" className="bg-[var(--app-danger)] text-white">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--app-text-muted)]">{thread.contextLabel}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card padding="md">
                  <SectionHeader
                    title={selectedThread?.title ?? 'Thread Conversation'}
                    description={selectedThread?.contextLabel}
                    className="mb-3"
                  />

                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {threadMessages.map((message) => (
                      <div key={message.id} className="rounded-lg bg-[var(--app-surface-hover)] px-3 py-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold">
                            {message.authorName} ({message.authorRole})
                          </p>
                          <span className="text-xs text-[var(--app-text-muted)]">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-end gap-2">
                    <Textarea
                      value={ui.messageDraft}
                      onChange={(event) => patchUI({ messageDraft: event.target.value })}
                      placeholder="Add a comment to this thread..."
                      minRows={2}
                      className="flex-1"
                    />
                    <Button onPress={submitMessage} startContent={<Send className="w-4 h-4" />}>
                      Post
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <Card padding="md">
                <SectionHeader
                  title="Task Handoffs"
                  description={`${openTasksCount} open · ${blockedTasksCount} blocked`}
                  className="mb-3"
                />

                <div className="mb-3 flex items-center gap-2">
                  <Select
                    size="sm"
                    aria-label="Task status filter"
                    selectedKeys={[ui.taskStatusFilter]}
                    onChange={(event) =>
                      patchUI({ taskStatusFilter: event.target.value as CollaborationUIState['taskStatusFilter'] })
                    }
                    options={[
                      { value: 'all', label: 'All statuses' },
                      { value: 'todo', label: 'Todo' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'blocked', label: 'Blocked' },
                      { value: 'done', label: 'Done' },
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge
                          size="sm"
                          variant="flat"
                          className={
                            task.status === 'done'
                              ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                              : task.status === 'blocked'
                                ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]'
                                : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <p className="mb-2 text-xs text-[var(--app-text-muted)]">{task.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<CircleDashed className="w-3 h-3" />}
                          onPress={() => setTaskStatus(task.id, 'in-progress')}
                        >
                          In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<CheckCircle2 className="w-3 h-3" />}
                          onPress={() => setTaskStatus(task.id, 'done')}
                        >
                          Done
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<AlertTriangle className="w-3 h-3" />}
                          onPress={() => setTaskStatus(task.id, 'blocked')}
                        >
                          Blocked
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="md">
                <SectionHeader title="Create Task" className="mb-3" />
                <div className="space-y-2">
                  <Input
                    value={ui.taskTitleDraft}
                    onChange={(event) => patchUI({ taskTitleDraft: event.target.value })}
                    placeholder="Task title"
                  />
                  <Textarea
                    value={ui.taskDescriptionDraft}
                    onChange={(event) => patchUI({ taskDescriptionDraft: event.target.value })}
                    placeholder="Task description"
                    minRows={3}
                  />
                  <Button onPress={createTask}>Add Collaboration Task</Button>
                </div>
              </Card>
            </div>
          </div>
        </PageScaffold>
      )}
    </AsyncStateRenderer>
  );
}
