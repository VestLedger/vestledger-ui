'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context'
import { SidebarGrouped } from '@/components/sidebar-grouped'
import { Topbar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

const AICopilotSidebar = dynamic(
  () => import('@/components/ai-copilot-sidebar').then((mod) => mod.AICopilotSidebar),
  {
    ssr: false,
    loading: () => <div className="flex-1" />,
  }
)

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarState, toggleLeftSidebar, toggleRightSidebar } = useNavigation()
  const [copilotReady, setCopilotReady] = useState(false)
  const [enableSidebarMotion, setEnableSidebarMotion] = useState(false)

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

  useEffect(() => {
    const timer = window.setTimeout(() => setCopilotReady(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setEnableSidebarMotion(true)
  }, [])

  const shouldRenderCopilot = sidebarState.rightCollapsed || copilotReady

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
        initial={false}
        animate={{
          width: sidebarState.rightCollapsed ? '0px' : '384px',
        }}
        transition={enableSidebarMotion ? { duration: 0.2, ease: 'easeInOut' } : { duration: 0 }}
        className="border-l border-[var(--app-border)] bg-[var(--app-surface)] flex flex-col overflow-hidden"
        style={{ willChange: 'width' }}
      >
        {shouldRenderCopilot ? (
          <AICopilotSidebar />
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}
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
