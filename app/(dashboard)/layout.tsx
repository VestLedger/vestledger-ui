'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context'
import { SidebarGrouped } from '@/components/sidebar-grouped'
import { AICopilotSidebar } from '@/components/ai-copilot-sidebar'
import { Topbar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarState, toggleLeftSidebar, toggleRightSidebar } = useNavigation()

  // Keyboard shortcuts
  // Cmd+B for left sidebar
  useKeyboardShortcut(
    { key: 'b', metaKey: true },
    toggleLeftSidebar,
    []
  )

  // Cmd+/ for right sidebar
  useKeyboardShortcut(
    { key: '/', metaKey: true },
    toggleRightSidebar,
    []
  )

  return (
    <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <SidebarGrouped />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      {/* AI Copilot Sidebar - Animated right panel */}
      <motion.div
        animate={{
          width: sidebarState.rightCollapsed ? '0px' : '384px',
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="border-l border-[var(--app-border)] bg-[var(--app-surface)] flex flex-col overflow-hidden"
        style={{ willChange: 'width' }}
      >
        <AICopilotSidebar />
      </motion.div>
      <CommandPalette />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { hydrated, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/')
    }
  }, [hydrated, isAuthenticated, router])

  if (!hydrated || !isAuthenticated) {
    return null
  }

  return (
    <NavigationProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </NavigationProvider>
  )
}
