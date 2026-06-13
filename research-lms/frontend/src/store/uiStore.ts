import { create } from 'zustand'

interface Breadcrumb {
  label: string
  href?: string
}

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  breadcrumbs: Breadcrumb[]
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  breadcrumbs: [],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}))
