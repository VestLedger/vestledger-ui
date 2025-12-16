import { isMockMode } from '@/config/data-mode';
import {
  mockHistory,
  mockStrikePrices,
  mockValuations,
} from '@/data/mocks/back-office/valuation-409a';

export function getValuations409a() {
  if (isMockMode()) return mockValuations;
  throw new Error('409A API not implemented yet');
}

export function getStrikePrices() {
  if (isMockMode()) return mockStrikePrices;
  throw new Error('409A API not implemented yet');
}

export function getValuationHistory() {
  if (isMockMode()) return mockHistory;
  throw new Error('409A API not implemented yet');
}

