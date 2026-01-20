import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles = {
  info: {
    bg: 'bg-app-info/10 dark:bg-app-dark-info/15',
    border: 'border-app-info dark:border-app-dark-info',
    text: 'text-app-info dark:text-app-dark-info',
    icon: Info,
  },
  success: {
    bg: 'bg-app-success/10 dark:bg-app-dark-success/15',
    border: 'border-app-success dark:border-app-dark-success',
    text: 'text-app-success dark:text-app-dark-success',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-app-warning/10 dark:bg-app-dark-warning/15',
    border: 'border-app-warning dark:border-app-dark-warning',
    text: 'text-app-warning dark:text-app-dark-warning',
    icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-app-danger/10 dark:bg-app-dark-danger/15',
    border: 'border-app-danger dark:border-app-dark-danger',
    text: 'text-app-danger dark:text-app-dark-danger',
    icon: AlertCircle,
  },
};

export function Alert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <div className={`font-medium mb-1 ${styles.text}`}>{title}</div>
          )}
          <div className="text-sm text-app-text dark:text-app-dark-text">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.text} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
