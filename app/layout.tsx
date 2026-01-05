import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { DashboardProviders } from './providers-client'
import { WebVitals } from './web-vitals'
import './globals.css'

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

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
  themeColor: '#2a3445',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyFont.variable}>
        <WebVitals />
        <DashboardProviders>
          {children}
        </DashboardProviders>
      </body>
    </html>
  )
}
