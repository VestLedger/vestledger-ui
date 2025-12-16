import { isMockMode } from '@/config/data-mode';
import { mockAuditEvents, type AuditEvent } from '@/data/mocks/blockchain/audit-trail';

export type { AuditEvent };

export function getAuditEvents(): AuditEvent[] {
  if (isMockMode()) return mockAuditEvents;
  throw new Error('Audit trail API not implemented yet');
}

