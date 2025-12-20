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
    success: 'bg-[var(--app-success)]',
    primary: 'bg-[var(--app-primary)]',
    warning: 'bg-[var(--app-warning)]',
    danger: 'bg-[var(--app-danger)]',
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={className}>
      <div
        className={`w-full bg-[var(--app-surface-hover)] rounded-full overflow-hidden ${sizeClasses[size]}`}
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
            <span className="text-xs text-[var(--app-text-subtle)]">
              {label}
            </span>
          )}
          <span className="text-xs font-medium text-[var(--app-text-muted)]">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
}
