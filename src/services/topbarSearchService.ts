import { isMockMode } from '@/config/data-mode';
import {
  getMockTopbarSearchResults,
  type TopbarSearchResult,
} from '@/data/mocks/topbar/search';

export function searchTopbar(query: string): TopbarSearchResult[] {
  if (isMockMode()) {
    return getMockTopbarSearchResults(query);
  }

  throw new Error('Topbar search API not implemented yet');
}

export type { TopbarSearchResult };

