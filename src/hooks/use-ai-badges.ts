'use client'

import { useUIKey } from '@/store/ui';
import type { BadgeData } from '@/services/ai/aiBadgesService';

export function useAIBadges(): BadgeData {
  const { value: badges } = useUIKey<BadgeData>('ai-badges', {});
  return badges;
}
