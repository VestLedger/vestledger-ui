import type { Metadata } from 'next'
import { Providers } from './providers'
import { WebVitals } from './web-vitals'
import './globals.css'

export const metadata: Metadata = {
  title: 'VestLedger - VC Workflow Management System',
  description: 'The next-generation workflow management system designed for venture capitalists.',
  icons: {
    icon: '/logo/Print_Transparent.svg',
  },
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
