import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
  refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          if (!response.ok) { set({ isLoading: false }); return false }
          const data = await response.json()
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch {
          set({ isLoading: false })
          return false
        }
      },
      logout: () => set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
      setUser: (user) => set({ user }),
      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
          if (!response.ok) { return false }
          const data = await response.json()
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    { name: 'research-lms-auth' }
  )
)
