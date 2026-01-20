'use client';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Client-side login button that dynamically determines the app subdomain
 * Works in both development and production without environment variables
 */
export function LoginButton({ children = 'Login', className }: LoginButtonProps) {
  const handleLogin = () => {
    const currentHostname = window.location.hostname;
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = isProduction ? 'https' : 'http';

    let appDomain: string;
    if (isProduction && currentHostname.includes('.')) {
      // Add app. prefix to current domain
      // vestledger.com → app.vestledger.com
      // www.vestledger.com → app.vestledger.com (remove www, add app)
      const baseDomain = currentHostname.replace(/^www\./, '');
      appDomain = `app.${baseDomain}`;
    } else {
      // Use env var if available, otherwise fallback to localhost
      appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.vestledger.local:3000';
    }

    const loginUrl = `${protocol}://${appDomain}/login`;
    window.location.href = loginUrl;
  };

  // Uses btn-secondary from the design system (globals.css)
  const defaultClassName = "btn-secondary btn-sm";

  return (
    <button
      onClick={handleLogin}
      className={className || defaultClassName}
    >
      {children}
    </button>
  );
}
