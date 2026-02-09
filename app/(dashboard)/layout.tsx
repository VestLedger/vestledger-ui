'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardProviders } from '../providers-dashboard'
import { useAuth } from '@/contexts/auth-context'
import { useRouteSagas } from '@/hooks/use-route-sagas'
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context'
import { SidebarGrouped } from '@/components/sidebar-grouped'
import { Topbar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { LoadingState } from '@/ui/async-states'
import { useUIKey } from '@/store/ui'
import { UI_STATE_KEYS, UI_STATE_DEFAULTS } from '@/store/constants/uiStateKeys'
import { DashboardDensityProvider } from '@/contexts/dashboard-density-context'
import { DASHBOARD_DENSITY, resolveDashboardDensityMode } from '@/config/dashboard-density'
import { buildAppLoginUrl } from '@/config/env'

const AICopilotSidebar = dynamic(
  () => import('@/components/ai-copilot-sidebar').then((mod) => mod.AICopilotSidebar),
  {
    ssr: false,
    loading: () => <div className="flex-1" />,
  }
)

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarState, toggleLeftSidebar, toggleRightSidebar } = useNavigation()
  const { value: dashboardDensityUI } = useUIKey(
    UI_STATE_KEYS.DASHBOARD_DENSITY,
    UI_STATE_DEFAULTS.dashboardDensity
  )
  const [copilotReady, setCopilotReady] = useState(false)
  const [enableSidebarMotion, setEnableSidebarMotion] = useState(false)
  const densityMode = resolveDashboardDensityMode(dashboardDensityUI.mode)
  const density = DASHBOARD_DENSITY[densityMode]

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
    <DashboardDensityProvider mode={densityMode}>
      <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)]" data-dashboard-density={densityMode}>
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
            width: sidebarState.rightCollapsed ? '0px' : `${density.shell.rightSidebarWidthPx}px`,
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
    </DashboardDensityProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Login page is in the (dashboard) route group but should NOT be protected
  const isLoginPage = pathname === '/login'

  // Always call hooks (rules of hooks) - but only use auth for protected pages
  const { hydrated, isAuthenticated } = useAuth()
  const sagasReady = useRouteSagas({ enabled: !isLoginPage })

  useEffect(() => {
    // Check if logout is in progress
    const isLoggingOut = typeof window !== 'undefined' && sessionStorage.getItem('isLoggingOut') === 'true';

    // Only redirect if NOT on login page, user is not authenticated, AND not logging out
    if (!isLoginPage && hydrated && !isAuthenticated && !isLoggingOut) {
      // Set redirecting state to prevent further rendering
      setIsRedirecting(true)

      // Redirect to app subdomain login page (cross-domain requires full page navigation)
      window.location.href = buildAppLoginUrl(window.location.hostname);
    }
  }, [isLoginPage, hydrated, isAuthenticated])

  // For login page, skip auth check and render directly
  if (isLoginPage) {
    return children
  }

  // Show nothing while redirecting or not authenticated
  if (!hydrated || !isAuthenticated || isRedirecting) {
    return null
  }

  const resolvedChildren = sagasReady ? children : (
    <div className="p-4">
      <LoadingState message="Loading modules…" fullHeight={false} />
    </div>
  )

  return (
    <NavigationProvider>
      <DashboardLayoutInner>{resolvedChildren}</DashboardLayoutInner>
    </NavigationProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProviders>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProviders>
  )
}
