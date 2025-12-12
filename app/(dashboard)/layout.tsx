'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { NavigationProvider } from '@/contexts/navigation-context'
import { SidebarGrouped } from '@/components/sidebar-grouped'
import { AICopilotSidebar, AICopilotProvider } from '@/components/ai-copilot-sidebar'
import { Topbar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <NavigationProvider>
      <AICopilotProvider>
        <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
          <SidebarGrouped />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          {/* AI Copilot Sidebar - Fixed right panel */}
          <div className="w-96 border-l border-[var(--app-border)] bg-[var(--app-surface)] flex flex-col">
            <AICopilotSidebar />
          </div>
          <CommandPalette />
        </div>
      </AICopilotProvider>
    </NavigationProvider>
  )
}
