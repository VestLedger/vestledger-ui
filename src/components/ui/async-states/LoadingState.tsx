interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  fullHeight = true
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${fullHeight ? 'min-h-[400px]' : 'py-8'}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--app-border)] border-t-[var(--app-primary)] mb-4" />
        <p className="text-[var(--app-text-muted)]">{message}</p>
      </div>
    </div>
  );
}
