import { ROUTE_PATHS } from '@/config/routes';
import type { UserRole } from '@/types/auth';

export interface RoleOnboardingStep {
  id: string;
  title: string;
  description: string;
  route: string;
  estimatedMinutes: number;
}

export interface RoleOnboardingPlan {
  role: UserRole;
  title: string;
  description: string;
  steps: RoleOnboardingStep[];
}

export const mockRoleOnboardingPlans: Record<UserRole, RoleOnboardingPlan> = {
  superadmin: {
    role: 'superadmin',
    title: 'Superadmin Platform Tour',
    description: 'Review tenant health, invites, and internal controls.',
    steps: [
      {
        id: 'superadmin-console',
        title: 'Open Superadmin Cockpit',
        description: 'Verify tenant lifecycle, invitations, and provisioning queues.',
        route: ROUTE_PATHS.superadmin,
        estimatedMinutes: 6,
      },
    ],
  },
  gp: {
    role: 'gp',
    title: 'GP Launch Checklist',
    description: 'Align pipeline priorities, IC cadence, and LP comms in one pass.',
    steps: [
      {
        id: 'gp-dashboard',
        title: 'Review Dashboard Signals',
        description: 'Check blockers, fund health, and cross-portfolio alerts.',
        route: ROUTE_PATHS.dashboard,
        estimatedMinutes: 4,
      },
      {
        id: 'gp-pipeline',
        title: 'Prioritize Pipeline',
        description: 'Move top opportunities into active due diligence.',
        route: ROUTE_PATHS.pipeline,
        estimatedMinutes: 7,
      },
      {
        id: 'gp-collaboration',
        title: 'Coordinate Team Tasks',
        description: 'Assign owners and confirm IC-prep work items.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 5,
      },
    ],
  },
  analyst: {
    role: 'analyst',
    title: 'Analyst Enablement Path',
    description: 'Run sourcing, diligence, and memo production workflows.',
    steps: [
      {
        id: 'analyst-pipeline',
        title: 'Open Pipeline Board',
        description: 'Validate stage definitions and active deal priorities.',
        route: ROUTE_PATHS.pipeline,
        estimatedMinutes: 5,
      },
      {
        id: 'analyst-deal-intel',
        title: 'Use Deal Intelligence',
        description: 'Collect market and company insights for active deals.',
        route: ROUTE_PATHS.dealIntelligence,
        estimatedMinutes: 8,
      },
      {
        id: 'analyst-collaboration',
        title: 'Post IC Prep Updates',
        description: 'Share memo updates and resolve thread feedback.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
  ops: {
    role: 'ops',
    title: 'Operations Workflow Ramp',
    description: 'Run daily back-office operations with clear handoffs.',
    steps: [
      {
        id: 'ops-fund-admin',
        title: 'Check Fund Admin',
        description: 'Review capital calls, distributions, and status transitions.',
        route: ROUTE_PATHS.fundAdmin,
        estimatedMinutes: 7,
      },
      {
        id: 'ops-compliance',
        title: 'Review Compliance Board',
        description: 'Close overdue obligations and AML review blockers.',
        route: ROUTE_PATHS.compliance,
        estimatedMinutes: 6,
      },
      {
        id: 'ops-collaboration',
        title: 'Assign Operations Tasks',
        description: 'Coordinate follow-ups across ops, IR, and auditors.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 5,
      },
    ],
  },
  ir: {
    role: 'ir',
    title: 'IR Relationship Checklist',
    description: 'Align LP communications and follow-up workstreams.',
    steps: [
      {
        id: 'ir-lp-management',
        title: 'Open LP Management',
        description: 'Review report readiness and distribution statuses.',
        route: ROUTE_PATHS.lpManagement,
        estimatedMinutes: 6,
      },
      {
        id: 'ir-contacts',
        title: 'Refresh Contact Timeline',
        description: 'Track key LP touchpoints and next communications.',
        route: ROUTE_PATHS.contacts,
        estimatedMinutes: 5,
      },
      {
        id: 'ir-collaboration',
        title: 'Resolve Open Collaboration Threads',
        description: 'Close pending responses from ops and finance.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
  researcher: {
    role: 'researcher',
    title: 'Researcher Onboarding Sprint',
    description: 'Set up analytics context and publish research outputs.',
    steps: [
      {
        id: 'researcher-reports',
        title: 'Review Existing Reports',
        description: 'Understand current fund-level reporting packs.',
        route: ROUTE_PATHS.reports,
        estimatedMinutes: 5,
      },
      {
        id: 'researcher-analytics',
        title: 'Run Analytics Deep Dive',
        description: 'Inspect cohort, pacing, and concentration metrics.',
        route: ROUTE_PATHS.analytics,
        estimatedMinutes: 7,
      },
      {
        id: 'researcher-collaboration',
        title: 'Share Research Tasks',
        description: 'Open collaboration tasks for follow-up analyses.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
  lp: {
    role: 'lp',
    title: 'LP Portal Walkthrough',
    description: 'Review portfolio exposure, statements, and elections.',
    steps: [
      {
        id: 'lp-portal',
        title: 'Open LP Portal',
        description: 'Review account snapshot and upcoming distributions.',
        route: ROUTE_PATHS.lpPortal,
        estimatedMinutes: 5,
      },
      {
        id: 'lp-documents',
        title: 'Review Reports',
        description: 'Validate quarterly and tax document availability.',
        route: ROUTE_PATHS.reports,
        estimatedMinutes: 4,
      },
    ],
  },
  auditor: {
    role: 'auditor',
    title: 'Auditor Verification Flow',
    description: 'Trace evidence and reconcile compliance outcomes.',
    steps: [
      {
        id: 'auditor-compliance',
        title: 'Inspect Compliance Queue',
        description: 'Review filings, due dates, and remediation evidence.',
        route: ROUTE_PATHS.compliance,
        estimatedMinutes: 6,
      },
      {
        id: 'auditor-audit-trail',
        title: 'Verify Audit Trail',
        description: 'Confirm cryptographic evidence for key events.',
        route: ROUTE_PATHS.auditTrail,
        estimatedMinutes: 6,
      },
      {
        id: 'auditor-collaboration',
        title: 'Track Open Audit Tasks',
        description: 'Close unresolved requests with operations owners.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
  service_provider: {
    role: 'service_provider',
    title: 'Service Provider Task Ramp',
    description: 'Execute assigned tasks with clear routing and evidence.',
    steps: [
      {
        id: 'provider-fund-admin',
        title: 'Open Assigned Back Office Work',
        description: 'Review current operational assignments and due dates.',
        route: ROUTE_PATHS.fundAdmin,
        estimatedMinutes: 5,
      },
      {
        id: 'provider-collaboration',
        title: 'Review Collaboration Queue',
        description: 'Acknowledge thread assignments and post updates.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
  strategic_partner: {
    role: 'strategic_partner',
    title: 'Strategic Partner Workflow',
    description: 'Review co-investment opportunities and provide deal feedback.',
    steps: [
      {
        id: 'partner-dealflow',
        title: 'Open Dealflow Review',
        description: 'Review memo deck and submit structured feedback.',
        route: ROUTE_PATHS.dealflowReview,
        estimatedMinutes: 6,
      },
      {
        id: 'partner-collaboration',
        title: 'Respond in Collaboration Threads',
        description: 'Resolve pending partner requests and action items.',
        route: ROUTE_PATHS.collaboration,
        estimatedMinutes: 4,
      },
    ],
  },
};
