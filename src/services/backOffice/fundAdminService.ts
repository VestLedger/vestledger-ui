import { isMockMode } from '@/config/data-mode';
import {
  mockCapitalCalls,
  mockDistributions,
  mockLPResponses,
} from '@/data/mocks/back-office/fund-admin';

export function getCapitalCalls() {
  if (isMockMode()) return mockCapitalCalls;
  throw new Error('Fund admin API not implemented yet');
}

export function getDistributions() {
  if (isMockMode()) return mockDistributions;
  throw new Error('Fund admin API not implemented yet');
}

export function getLPResponses() {
  if (isMockMode()) return mockLPResponses;
  throw new Error('Fund admin API not implemented yet');
}

