import { LucideIcon } from 'lucide-react';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  className?: string;
  variant?: 'primary' | 'gold';
}

export function CapabilityCard({
  icon: Icon,
  title,
  description,
  features,
  className = '',
  variant = 'primary',
}: CapabilityCardProps) {
  const iconStyles = variant === 'gold'
    ? 'icon-gold'
    : 'bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent';

  const checkColor = variant === 'gold'
    ? 'text-app-secondary dark:text-app-dark-secondary'
    : 'text-app-primary dark:text-app-dark-primary';

  return (
    <div
      className={`
        card-vesta p-6 sm:p-8
        hover:transform hover:-translate-y-1
        ${className}
      `}
    >
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg ${iconStyles}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-app-text dark:text-app-dark-text mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-app-text-muted dark:text-app-dark-text-muted leading-relaxed mb-4">
        {description}
      </p>

      {/* Features list */}
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <span className={`${checkColor} mt-1`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Simpler version for homepage grid
export function CapabilityCardCompact({
  icon: Icon,
  title,
  description,
  className = '',
  variant = 'primary',
}: Omit<CapabilityCardProps, 'features'>) {
  const iconBgStyles = variant === 'gold'
    ? 'bg-app-secondary/10 dark:bg-app-dark-secondary/15'
    : 'bg-app-primary/10 dark:bg-app-dark-primary/15';

  const iconColorStyles = variant === 'gold'
    ? 'text-app-secondary dark:text-app-dark-secondary'
    : 'text-app-primary dark:text-app-dark-primary';

  return (
    <div
      className={`
        card-elevated p-6
        hover:transform hover:-translate-y-1
        ${className}
      `}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconBgStyles}`}>
        <Icon className={`w-6 h-6 ${iconColorStyles}`} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-app-text dark:text-app-dark-text mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
