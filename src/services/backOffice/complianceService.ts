import { isMockMode } from '@/config/data-mode';
import {
  mockAuditSchedule,
  mockComplianceItems,
  mockRegulatoryFilings,
} from '@/data/mocks/back-office/compliance';

export function getComplianceItems() {
  if (isMockMode()) return mockComplianceItems;
  throw new Error('Compliance API not implemented yet');
}

export function getRegulatoryFilings() {
  if (isMockMode()) return mockRegulatoryFilings;
  throw new Error('Compliance API not implemented yet');
}

export function getAuditSchedule() {
  if (isMockMode()) return mockAuditSchedule;
  throw new Error('Compliance API not implemented yet');
}

