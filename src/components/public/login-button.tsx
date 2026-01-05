'use client';

import { StaticButton } from '@/ui/static';

export function LoginButton() {
  const handleLogin = () => {
    // Use environment variable for dashboard URL, fallback to constructing from current host
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;

    if (dashboardUrl) {
      window.location.href = `${dashboardUrl}/login`;
    } else {
      // Fallback: construct app subdomain from current host
      const currentHost = window.location.host;
      const protocol = window.location.protocol;

      // If already on app subdomain, just go to /login
      if (currentHost.startsWith('app.')) {
        window.location.href = '/login';
      } else {
        // Add 'app.' prefix to current domain
        window.location.href = `${protocol}//app.${currentHost}/login`;
      }
    }
  };

  return (
    <StaticButton variant="light" onClick={handleLogin}>
      Login
    </StaticButton>
  );
}
