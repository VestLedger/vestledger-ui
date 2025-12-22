import { CheckCircle, Clock, AlertTriangle, Bell, type LucideIcon } from 'lucide-react';
import type { StatusDomain } from './statusColors';

/**
 * Get icon component for status
 * @example getStatusIcon('completed') => CheckCircle
 * @example getStatusIcon('overdue') => AlertTriangle
 */
export function getStatusIcon(status: string, _domain: StatusDomain = 'general'): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    'completed': CheckCircle,
    'current': CheckCircle,
    'active': CheckCircle,
    'sent': CheckCircle,
    'filed': CheckCircle,
    'published': CheckCircle,
    'paid': CheckCircle,
    'approved': CheckCircle,
    'connected': CheckCircle,
    'received': CheckCircle,
    'in-progress': Clock,
    'pending': Clock,
    'pending-review': Clock,
    'queued': Clock,
    'processing': Clock,
    'running': Clock,
    'syncing': Clock,
    'review': Clock,
    'upcoming': Bell,
    'due-soon': Bell,
    'expiring-soon': Clock,
    'scheduled': Bell,
    'ready': Bell,
    'available': Bell,
    'coming-soon': Bell,
    'optional': Bell,
    'draft': Clock,
    'awaiting-upload': Clock,
    'partial': Clock,
    'under-review': Clock,
    'ready-for-ic': CheckCircle,
    'dd-in-progress': Clock,
    'overdue': AlertTriangle,
    'docs-overdue': AlertTriangle,
    'failed': AlertTriangle,
    'error': AlertTriangle,
    'rejected': AlertTriangle,
    'blocked': AlertTriangle,
    'expired': AlertTriangle,
    'cancelled': AlertTriangle,
    'disconnected': AlertTriangle,
    'at-risk': AlertTriangle,
    'exited': Bell,
    'exercised': CheckCircle,
    'calculated': CheckCircle,
    'reviewed': CheckCircle,
    'distributed': CheckCircle,
    'amended': AlertTriangle,
    'pending-gp-approval': Clock,
    'pending-legal-review': Clock,
    'pending-buyer-funding': Clock,
  };

  return iconMap[status.toLowerCase()] || Bell;
}
