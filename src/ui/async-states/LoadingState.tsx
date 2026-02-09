import { BrandLogo } from '@/components/brand-logo';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  fullHeight = true
}: LoadingStateProps) {
  const logoSize = fullHeight ? 48 : 36;

  return (
    <div className={`flex items-center justify-center ${fullHeight ? 'min-h-[400px]' : 'py-8'}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BrandLogo
            width={logoSize}
            height={logoSize}
            className="animate-spin text-[var(--app-primary)]"
          />
        </div>
        <p className="text-[var(--app-text-muted)]">{message}</p>
      </div>
    </div>
  );
}
