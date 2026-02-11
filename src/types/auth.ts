import { ROUTE_PATHS } from '@/config/routes';

export type UserRole =
  | 'superadmin'
  | 'gp'
  | 'analyst'
  | 'ops'
  | 'ir'
  | 'researcher'
  | 'lp'
  | 'auditor'
  | 'service_provider'
  | 'strategic_partner';

export interface PersonaConfig {
  id: UserRole;
  label: string;
  description: string;
  defaultPath: string;
  category: 'primary' | 'secondary';
}

export const PERSONA_CONFIG: Record<UserRole, PersonaConfig> = {
  superadmin: {
    id: 'superadmin',
    label: 'Platform Superadmin',
    description: 'Internal VestLedger tenant management and platform operations.',
    defaultPath: ROUTE_PATHS.superadmin,
    category: 'primary',
  },
  // Primary Personas (Internal Team)
  gp: {
    id: 'gp',
    label: 'Strategic Decision Maker (GP)',
    description: 'High-level portfolio performance, deal flow summary, fundraising status.',
    defaultPath: ROUTE_PATHS.dashboard,
    category: 'primary',
  },
  analyst: {
    id: 'analyst',
    label: 'Investment Intelligence Analyst',
    description: 'Deal screening, due diligence data, market research.',
    defaultPath: ROUTE_PATHS.pipeline,
    category: 'primary',
  },
  ops: {
    id: 'ops',
    label: 'Operational Excellence Manager',
    description: 'Fund administration, compliance, back-office tasks.',
    defaultPath: ROUTE_PATHS.fundAdmin,
    category: 'primary',
  },
  ir: {
    id: 'ir',
    label: 'Relationship Navigator',
    description: 'LP communications, CRM, contacts.',
    defaultPath: ROUTE_PATHS.lpManagement,
    category: 'primary',
  },
  researcher: {
    id: 'researcher',
    label: 'Data-Driven Researcher',
    description: 'Deep dive analytics, market trends, benchmarking.',
    defaultPath: ROUTE_PATHS.reports,
    category: 'primary',
  },
  // Secondary Personas (External Stakeholders)
  lp: {
    id: 'lp',
    label: 'Limited Partner Investor',
    description: 'View fund performance, documents, and capital account.',
    defaultPath: ROUTE_PATHS.lpPortal,
    category: 'secondary',
  },
  auditor: {
    id: 'auditor',
    label: 'Independent Auditor',
    description: 'Access audit trails, compliance records, and reports.',
    defaultPath: ROUTE_PATHS.compliance,
    category: 'secondary',
  },
  service_provider: {
    id: 'service_provider',
    label: 'Service Provider Professional',
    description: 'View assigned tasks, documents, and workflows.',
    defaultPath: ROUTE_PATHS.dashboard,
    category: 'secondary',
  },
  strategic_partner: {
    id: 'strategic_partner',
    label: 'Strategic Partner',
    description: 'Access shared deal flow and co-investment opportunities.',
    defaultPath: ROUTE_PATHS.dealflowReview,
    category: 'secondary',
  },
};

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
  organizationRole?: 'org_admin' | 'member';
  isPlatformAdmin?: boolean;
}
