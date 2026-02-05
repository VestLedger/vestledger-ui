import { isMockMode } from '@/config/data-mode';
import {
  calculateAIBadges,
  type BadgeData,
} from '@/data/mocks/hooks/ai-badges';

export type { BadgeData };

export function calculateBadges(): BadgeData {
  if (isMockMode()) return calculateAIBadges();
  // TODO: Replace with API-backed badges when available.
  return {};
}
