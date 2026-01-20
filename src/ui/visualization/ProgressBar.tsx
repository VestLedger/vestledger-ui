import { motion } from 'framer-motion';

export interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'success' | 'primary' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

export function ProgressBar({
  value,
  variant = 'primary',
  size = 'md',
  animated = true,
  showLabel = false,
  label,
  className = '',
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    success: 'bg-app-success dark:bg-app-dark-success',
    primary: 'bg-app-primary dark:bg-app-dark-primary',
    warning: 'bg-app-warning dark:bg-app-dark-warning',
    danger: 'bg-app-danger dark:bg-app-dark-danger',
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={className}>
      <div
        className={`w-full bg-app-surface-hover dark:bg-app-dark-surface-hover rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `Progress ${Math.round(clampedValue)}%`}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`${sizeClasses[size]} rounded-full ${colorClasses[variant]}`}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full ${colorClasses[variant]}`}
            style={{ width: `${clampedValue}%` }}
          />
        )}
      </div>

      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          {label && (
            <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
              {label}
            </span>
          )}
          <span className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
}
