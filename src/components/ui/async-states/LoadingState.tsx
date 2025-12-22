import Image from 'next/image';

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
          <Image
            src="/logo/Print_Transparent.svg"
            alt="VestLedger logo"
            width={logoSize}
            height={logoSize}
            className="animate-spin"
          />
        </div>
        <p className="text-[var(--app-text-muted)]">{message}</p>
      </div>
    </div>
  );
}
