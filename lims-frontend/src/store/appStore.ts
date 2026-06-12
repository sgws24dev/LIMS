import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tenant } from '@/types'

export interface Breadcrumb {
  label: string
  href?: string
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('app-storage') : null
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    if (parsed.state?.theme) {
      applyTheme(parsed.state.theme)
    }
  } catch { /* ignore */ }
}

interface AppState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  currentTenant: Tenant | null
  breadcrumbs: Breadcrumb[]

  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  setCurrentTenant: (tenant: Tenant | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      currentTenant: null,
      breadcrumbs: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        currentTenant: state.currentTenant,
      }),
    }
  )
)
