import { isMockMode } from '@/config/data-mode';
import {
  mockCapitalCalls,
  mockDistributions,
  mockLPs,
  mockReports,
} from '@/data/mocks/lp-portal/lp-management';

export type {
  CapitalCall,
  Distribution,
  LP,
  Report,
} from '@/data/mocks/lp-portal/lp-management';

export function getLPs() {
  if (isMockMode()) return mockLPs;
  throw new Error('LP management API not implemented yet');
}

export function getLPReports() {
  if (isMockMode()) return mockReports;
  throw new Error('LP management API not implemented yet');
}

export function getLPCapitalCalls() {
  if (isMockMode()) return mockCapitalCalls;
  throw new Error('LP management API not implemented yet');
}

export function getLPDistributions() {
  if (isMockMode()) return mockDistributions;
  throw new Error('LP management API not implemented yet');
}
