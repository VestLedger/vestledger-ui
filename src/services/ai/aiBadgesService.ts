import { isMockMode } from '@/config/data-mode';
import {
  calculateAIBadges,
  type BadgeData,
} from '@/data/mocks/hooks/ai-badges';

export type { BadgeData };

export function calculateBadges(): BadgeData {
  if (isMockMode()) return calculateAIBadges();
  throw new Error('AI badges API not implemented yet');
}

