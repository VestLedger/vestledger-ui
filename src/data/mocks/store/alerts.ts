import type { Alert } from '@/store/slices/alertsSlice';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'deal',
    title: 'New deal added to pipeline',
    message: 'Quantum AI - Series A',
    time: '5m ago',
    unread: true,
  },
  {
    id: '2',
    type: 'report',
    title: 'Q3 Report uploaded',
    message: 'DataSync Pro submitted quarterly report',
    time: '2h ago',
    unread: true,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Due diligence deadline',
    message: 'NeuroLink DD checklist due in 2 days',
    time: '1d ago',
    unread: false,
  },
  {
    id: '4',
    type: 'system',
    title: 'System update',
    message: 'New analytics features available',
    time: '3d ago',
    unread: false,
  },
];

