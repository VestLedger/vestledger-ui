import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WebVitals />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
