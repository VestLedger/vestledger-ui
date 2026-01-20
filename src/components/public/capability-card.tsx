import { LucideIcon } from 'lucide-react';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  className?: string;
}

export function CapabilityCard({
  icon: Icon,
  title,
  description,
  features,
  className = '',
}: CapabilityCardProps) {
  return (
    <div
      className={`
        card-vesta p-6 sm:p-8
        hover:transform hover:-translate-y-1
        ${className}
      `}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#047857] to-[#10b981] flex items-center justify-center mb-5 shadow-lg">
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-[var(--app-text)] mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[var(--app-text-muted)] leading-relaxed mb-4">
        {description}
      </p>

      {/* Features list */}
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-[var(--app-text-muted)]">
              <span className="text-[var(--app-primary)] mt-1">
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
}: Omit<CapabilityCardProps, 'features'>) {
  return (
    <div
      className={`
        card-elevated p-6
        hover:transform hover:-translate-y-1
        ${className}
      `}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-[var(--app-primary-bg)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--app-primary)]" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--app-text-muted)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
