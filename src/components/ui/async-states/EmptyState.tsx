import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center text-[var(--app-text-muted)] max-w-sm">
        <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {message && <p className="text-sm mb-4">{message}</p>}
        {action}
      </div>
    </div>
  );
}
