import type { Notification } from '@/types/notification';

const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z').getTime();

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    category: 'deal',
    title: 'Deal Review Pending',
    message: 'CloudScale Series B requires IC review by Dec 15',
    timestamp: new Date(MOCK_NOW - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    actionLabel: 'Review Deal',
    actionUrl: '/pipeline',
  },
  {
    id: '2',
    type: 'success',
    category: 'lp',
    title: 'Capital Call Funded',
    message: 'Acme Ventures committed $5M to Fund III',
    timestamp: new Date(MOCK_NOW - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'info',
    category: 'document',
    title: 'New Document Available',
    message: 'Q4 2024 LP Report is ready for review',
    timestamp: new Date(MOCK_NOW - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    actionLabel: 'View Report',
  },
  {
    id: '4',
    type: 'error',
    category: 'alert',
    title: 'Compliance Deadline',
    message: 'Form ADV filing due in 7 days',
    timestamp: new Date(MOCK_NOW - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
    actionLabel: 'File Now',
  },
];
