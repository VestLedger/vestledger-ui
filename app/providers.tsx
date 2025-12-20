'use client'

import { useEffect } from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { AuthProvider } from '@/contexts/auth-context'
import { FundProvider } from '@/contexts/fund-context'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { clientMounted } from '@/store/slices/uiEffectsSlice'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(clientMounted())
  }, [])

  return (
    <Provider store={store}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <FundProvider>
              {children}
            </FundProvider>
          </AuthProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </Provider>
  )
}
