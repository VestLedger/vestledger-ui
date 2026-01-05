type VisualProps = {
  className?: string;
  ariaLabel?: string;
};

export function TriadOrbit({ className, ariaLabel = 'Triad OS visualization' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <circle cx="160" cy="84" r="38" fill="var(--app-primary)" fillOpacity="0.12" stroke="var(--app-primary)" strokeWidth="2" />
      <circle cx="86" cy="220" r="38" fill="var(--app-secondary)" fillOpacity="0.12" stroke="var(--app-secondary)" strokeWidth="2" />
      <circle cx="234" cy="220" r="38" fill="var(--app-accent)" fillOpacity="0.12" stroke="var(--app-accent)" strokeWidth="2" />
      <path d="M160 122 L96 194" stroke="var(--app-border)" strokeWidth="2" />
      <path d="M160 122 L224 194" stroke="var(--app-border)" strokeWidth="2" />
      <path d="M124 220 L196 220" stroke="var(--app-border)" strokeWidth="2" />
    </svg>
  );
}

export function WorkflowFlow({ className, ariaLabel = 'Workflow automation visualization' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 360 160"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <rect x="20" y="50" width="84" height="60" rx="8" fill="var(--app-primary-bg)" stroke="var(--app-primary)" strokeWidth="2" />
      <rect x="138" y="30" width="84" height="60" rx="8" fill="var(--app-secondary-bg)" stroke="var(--app-secondary)" strokeWidth="2" />
      <rect x="256" y="50" width="84" height="60" rx="8" fill="var(--app-accent-bg)" stroke="var(--app-accent)" strokeWidth="2" />
      <path d="M104 80 L138 60" stroke="var(--app-border)" strokeWidth="2" />
      <path d="M222 60 L256 80" stroke="var(--app-border)" strokeWidth="2" />
      <circle cx="62" cy="80" r="6" fill="var(--app-primary)" />
      <circle cx="180" cy="60" r="6" fill="var(--app-secondary)" />
      <circle cx="298" cy="80" r="6" fill="var(--app-accent)" />
    </svg>
  );
}

export function SignalRings({ className, ariaLabel = 'Signal intelligence visualization' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 260 260"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <circle cx="130" cy="130" r="24" fill="var(--app-primary)" fillOpacity="0.18" />
      <circle cx="130" cy="130" r="52" fill="none" stroke="var(--app-secondary)" strokeWidth="2" strokeOpacity="0.6" />
      <circle cx="130" cy="130" r="82" fill="none" stroke="var(--app-accent)" strokeWidth="2" strokeOpacity="0.6" />
      <circle cx="130" cy="130" r="110" fill="none" stroke="var(--app-border)" strokeWidth="2" strokeDasharray="6 8" />
    </svg>
  );
}

export function ShieldMatrix({ className, ariaLabel = 'Security controls visualization' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 280 320"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M140 18 L240 58 L240 146 C240 214 197 270 140 302 C83 270 40 214 40 146 L40 58 Z"
        fill="var(--app-primary-bg)"
        stroke="var(--app-primary)"
        strokeWidth="2"
      />
      <path d="M88 110 L192 110" stroke="var(--app-secondary)" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M88 150 L192 150" stroke="var(--app-secondary)" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M88 190 L192 190" stroke="var(--app-secondary)" strokeWidth="2" strokeOpacity="0.7" />
      <circle cx="140" cy="120" r="6" fill="var(--app-accent)" />
      <circle cx="140" cy="160" r="6" fill="var(--app-accent)" />
      <circle cx="140" cy="200" r="6" fill="var(--app-accent)" />
    </svg>
  );
}
