export type UserRole =
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
  // Primary Personas (Internal Team)
  gp: {
    id: 'gp',
    label: 'Strategic Decision Maker (GP)',
    description: 'High-level portfolio performance, deal flow summary, fundraising status.',
    defaultPath: '/dashboard',
    category: 'primary',
  },
  analyst: {
    id: 'analyst',
    label: 'Investment Intelligence Analyst',
    description: 'Deal screening, due diligence data, market research.',
    defaultPath: '/pipeline',
    category: 'primary',
  },
  ops: {
    id: 'ops',
    label: 'Operational Excellence Manager',
    description: 'Fund administration, compliance, back-office tasks.',
    defaultPath: '/fund-admin',
    category: 'primary',
  },
  ir: {
    id: 'ir',
    label: 'Relationship Navigator',
    description: 'LP communications, CRM, contacts.',
    defaultPath: '/lp-management',
    category: 'primary',
  },
  researcher: {
    id: 'researcher',
    label: 'Data-Driven Researcher',
    description: 'Deep dive analytics, market trends, benchmarking.',
    defaultPath: '/reports',
    category: 'primary',
  },
  // Secondary Personas (External Stakeholders)
  lp: {
    id: 'lp',
    label: 'Limited Partner Investor',
    description: 'View fund performance, documents, and capital account.',
    defaultPath: '/lp-portal',
    category: 'secondary',
  },
  auditor: {
    id: 'auditor',
    label: 'Independent Auditor',
    description: 'Access audit trails, compliance records, and reports.',
    defaultPath: '/compliance',
    category: 'secondary',
  },
  service_provider: {
    id: 'service_provider',
    label: 'Service Provider Professional',
    description: 'View assigned tasks, documents, and workflows.',
    defaultPath: '/dashboard',
    category: 'secondary',
  },
  strategic_partner: {
    id: 'strategic_partner',
    label: 'Strategic Partner',
    description: 'Access shared deal flow and co-investment opportunities.',
    defaultPath: '/dealflow-review',
    category: 'secondary',
  },
};

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

