export interface ComplianceItem {
  id: string;
  title: string;
  type: 'filing' | 'report' | 'certification' | 'audit';
  dueDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  relatedFund?: string;
}

export interface RegulatoryFiling {
  id: string;
  filingType: string;
  regulator: string;
  frequency: string;
  lastFiled: string;
  nextDue: string;
  status: 'current' | 'due-soon' | 'overdue';
  fundName: string;
}

export interface AuditSchedule {
  id: string;
  auditType: string;
  auditor: string;
  year: number;
  startDate: string;
  completionDate: string | null;
  status: 'scheduled' | 'in-progress' | 'completed';
  fundName: string;
}

export const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    title: 'Form ADV Annual Update',
    type: 'filing',
    dueDate: '2025-03-30',
    status: 'upcoming',
    assignedTo: 'Compliance Team',
    priority: 'high',
    description: 'Annual amendment to Form ADV with SEC',
    relatedFund: 'All Funds',
  },
  {
    id: '2',
    title: 'Q4 2024 LP Report',
    type: 'report',
    dueDate: '2025-01-15',
    status: 'in-progress',
    assignedTo: 'Sarah Johnson',
    priority: 'high',
    description: 'Quarterly performance report for Limited Partners',
    relatedFund: 'Acme Ventures Fund II',
  },
  {
    id: '3',
    title: 'Annual Compliance Certification',
    type: 'certification',
    dueDate: '2024-12-31',
    status: 'overdue',
    assignedTo: 'Michael Chen',
    priority: 'high',
    description: 'Code of Ethics and Compliance Manual certification',
    relatedFund: 'All Funds',
  },
  {
    id: '4',
    title: 'Form PF Filing - Large Hedge Fund',
    type: 'filing',
    dueDate: '2025-02-28',
    status: 'upcoming',
    assignedTo: 'Compliance Team',
    priority: 'medium',
    description: 'Private Fund reporting to SEC',
    relatedFund: 'Acme Ventures Fund III',
  },
  {
    id: '5',
    title: 'AML/KYC Review',
    type: 'audit',
    dueDate: '2024-12-20',
    status: 'completed',
    assignedTo: 'Emily Rodriguez',
    priority: 'medium',
    description: 'Annual Anti-Money Laundering review',
    relatedFund: 'All Funds',
  },
];

export const mockRegulatoryFilings: RegulatoryFiling[] = [
  {
    id: '1',
    filingType: 'Form ADV',
    regulator: 'SEC',
    frequency: 'Annual',
    lastFiled: '2024-03-25',
    nextDue: '2025-03-30',
    status: 'current',
    fundName: 'All Funds',
  },
  {
    id: '2',
    filingType: 'Form PF',
    regulator: 'SEC',
    frequency: 'Quarterly',
    lastFiled: '2024-11-15',
    nextDue: '2025-02-28',
    status: 'current',
    fundName: 'Acme Ventures Fund III',
  },
  {
    id: '3',
    filingType: 'Form D',
    regulator: 'SEC',
    frequency: 'As Needed',
    lastFiled: '2024-06-10',
    nextDue: 'N/A',
    status: 'current',
    fundName: 'Acme Ventures Fund II',
  },
  {
    id: '4',
    filingType: 'State Registration',
    regulator: 'State Securities',
    frequency: 'Annual',
    lastFiled: '2024-01-15',
    nextDue: '2025-01-15',
    status: 'due-soon',
    fundName: 'All Funds',
  },
];

export const mockAuditSchedule: AuditSchedule[] = [
  {
    id: '1',
    auditType: 'Financial Audit',
    auditor: 'KPMG',
    year: 2024,
    startDate: '2025-01-15',
    completionDate: null,
    status: 'scheduled',
    fundName: 'Acme Ventures Fund II',
  },
  {
    id: '2',
    auditType: 'Compliance Audit',
    auditor: 'Deloitte',
    year: 2024,
    startDate: '2024-11-01',
    completionDate: '2024-11-30',
    status: 'completed',
    fundName: 'All Funds',
  },
  {
    id: '3',
    auditType: 'IT Security Audit',
    auditor: 'PwC',
    year: 2024,
    startDate: '2024-12-01',
    completionDate: null,
    status: 'in-progress',
    fundName: 'All Funds',
  },
];

