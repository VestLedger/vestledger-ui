import { isMockMode } from '@/config/data-mode';
import * as data from '@/data/mocks/deal-intelligence/deal-intelligence';

export type {
  ActiveDeal,
  DocumentCategory,
  DocumentStatus,
  ICStatus,
} from '@/data/mocks/deal-intelligence/deal-intelligence';

export function getDealIntelligenceData() {
  if (isMockMode()) return data;
  throw new Error('Deal intelligence API not implemented yet');
}
