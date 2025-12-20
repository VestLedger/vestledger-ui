import { CheckCircle, Clock, AlertTriangle, Bell, type LucideIcon } from 'lucide-react';
import type { StatusDomain } from './statusColors';

/**
 * Get icon component for status
 * @example getStatusIcon('completed') => CheckCircle
 * @example getStatusIcon('overdue') => AlertTriangle
 */
export function getStatusIcon(status: string, domain: StatusDomain = 'general'): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    'completed': CheckCircle,
    'current': CheckCircle,
    'sent': CheckCircle,
    'filed': CheckCircle,
    'published': CheckCircle,
    'paid': CheckCircle,
    'in-progress': Clock,
    'pending': Clock,
    'upcoming': Bell,
    'due-soon': Bell,
    'scheduled': Bell,
    'ready': Bell,
    'draft': Clock,
    'overdue': AlertTriangle,
  };

  return iconMap[status.toLowerCase()] || Bell;
}
