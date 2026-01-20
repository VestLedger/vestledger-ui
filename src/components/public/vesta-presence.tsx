import { Bot } from 'lucide-react';

interface VestaPresenceProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  md: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  lg: { container: 'w-24 h-24', icon: 'w-12 h-12' },
  xl: { container: 'w-32 h-32', icon: 'w-16 h-16' },
};

export function VestaPresence({ size = 'md', animate = true, className = '' }: VestaPresenceProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={`
        relative ${sizes.container} rounded-full
        bg-gradient-to-br from-[#047857] via-[#0d9488] to-[#10b981]
        flex items-center justify-center
        ${animate ? 'animate-float' : ''}
        ${className}
      `}
      style={{
        boxShadow: 'var(--vesta-glow)',
      }}
    >
      {/* Pulse ring */}
      {animate && (
        <div
          className="absolute inset-0 rounded-full border-2 border-[#10b981] animate-pulse-glow"
          style={{ animationDelay: '0.5s' }}
        />
      )}

      {/* Inner glow */}
      <div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
      />

      {/* Bot icon */}
      <Bot className={`${sizes.icon} text-white relative z-10`} />
    </div>
  );
}

// Static version for SSR (no animations that require client)
export function VestaPresenceStatic({ size = 'md', className = '' }: Omit<VestaPresenceProps, 'animate'>) {
  const sizes = sizeMap[size];

  return (
    <div
      className={`
        relative ${sizes.container} rounded-full
        bg-gradient-to-br from-[#047857] via-[#0d9488] to-[#10b981]
        flex items-center justify-center
        shadow-[0_0_60px_rgba(16,185,129,0.3)]
        ${className}
      `}
    >
      {/* Inner glow */}
      <div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
      />

      {/* Bot icon */}
      <Bot className={`${sizes.icon} text-white relative z-10`} />
    </div>
  );
}
