import { isMockMode } from '@/config/data-mode';
import {
  calculateAIBadges,
  type BadgeData,
} from '@/data/mocks/hooks/ai-badges';
import { requestJson } from '@/services/shared/httpClient';

export type { BadgeData };

export async function calculateBadges(): Promise<BadgeData> {
  if (isMockMode()) return calculateAIBadges();
  try {
    const data = await requestJson<BadgeData>('/ai/badges', {
      fallbackMessage: 'Failed to load AI badges',
    });
    return data ?? {};
  } catch {
    return {};
  }
}
