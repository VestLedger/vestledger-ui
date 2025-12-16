import type { Fund } from '@/types/fund';
import { isMockMode } from '@/config/data-mode';
import { mockFunds } from '@/data/mocks/funds';

export async function fetchFunds(): Promise<Fund[]> {
  if (isMockMode()) {
    return mockFunds;
  }

  throw new Error('Funds API not implemented yet');
}

