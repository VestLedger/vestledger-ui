import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCollaborationSnapshot } from '@/data/mocks/collaboration';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('collaborationService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized collaboration snapshot in mock mode', async () => {
    const service = await import('@/services/collaboration/collaborationService');
    const snapshot = await service.getCollaborationSnapshot();
    expect(snapshot).toEqual(mockCollaborationSnapshot);
  });

  it('supports adding messages and task status updates in cache', async () => {
    const service = await import('@/services/collaboration/collaborationService');
    await service.getCollaborationSnapshot();

    const message = await service.addCollaborationMessage({
      threadId: mockCollaborationSnapshot.threads[0].id,
      authorName: 'QA User',
      authorRole: 'analyst',
      message: 'Testing thread update',
    });
    expect(message.threadId).toBe(mockCollaborationSnapshot.threads[0].id);

    const task = await service.updateCollaborationTaskStatus(
      mockCollaborationSnapshot.tasks[0].id,
      'done'
    );
    expect(task.status).toBe('done');
  });

  it('returns an empty snapshot in API mode when endpoints fail before any API data is cached', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/collaboration/collaborationService');
    const snapshot = await service.getCollaborationSnapshot();
    expect(snapshot).toEqual({
      threads: [],
      messages: [],
      tasks: [],
    });
  });

  it('rejects live collaboration mutations instead of fabricating local records', async () => {
    isMockMode.mockReturnValue(false);

    const service = await import('@/services/collaboration/collaborationService');

    await expect(
      service.addCollaborationMessage({
        threadId: 'thread-1',
        authorName: 'QA User',
        authorRole: 'analyst',
        message: 'Testing thread update',
      })
    ).rejects.toThrow('Adding collaboration messages in live mode requires an API implementation.');
  });
});
