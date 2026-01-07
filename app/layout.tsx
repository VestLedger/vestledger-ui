import type { Metadata, Viewport } from 'next'
import { RootProviders } from './providers-root'
import { WebVitals } from './web-vitals'
import './globals.css'

export const metadata: Metadata = {
  title: 'VestLedger - VC Workflow Management System',
  description: 'The next-generation workflow management system designed for venture capitalists.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f63c7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // RootProviders: Shared providers for all routes (NextUI + Theme)
  // Route-specific providers added in route group layouts:
  // - (dashboard)/layout.tsx adds DashboardProviders (Redux + Auth + Fund)
  // - (public)/layout.tsx has no additional providers
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WebVitals />
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
