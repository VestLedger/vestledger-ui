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

  it('falls back to cached mock snapshot in API mode when endpoints fail', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/collaboration/collaborationService');
    const snapshot = await service.getCollaborationSnapshot();
    expect(snapshot.threads.length).toBeGreaterThan(0);
    expect(snapshot.tasks.length).toBeGreaterThan(0);
  });
});
