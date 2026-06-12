import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { MOCK_USERS } from '@/mock/data/mock-auth-users'

const SESSION_DURATION = 30 * 60 * 1000

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiry: number | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkSession: () => void
  updateProfile: (data: Partial<User>) => void
}

let sessionCheckInterval: ReturnType<typeof setInterval> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,

      login: async (email, password) => {
        set({ isLoading: true })

        await new Promise((resolve) => setTimeout(resolve, 600))

        const found = MOCK_USERS.find(
          (u) => u.email === email && u.password === password && u.isActive
        )

        if (found) {
          const { password: _pw, ...safeUser } = found
          const expiry = Date.now() + SESSION_DURATION

          if (sessionCheckInterval) clearInterval(sessionCheckInterval)
          sessionCheckInterval = setInterval(() => {
            const { sessionExpiry } = get()
            if (sessionExpiry && Date.now() > sessionExpiry) {
              get().logout()
            }
          }, 30_000)

          set({
            user: safeUser,
            isAuthenticated: true,
            isLoading: false,
            sessionExpiry: expiry,
          })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        if (sessionCheckInterval) {
          clearInterval(sessionCheckInterval)
          sessionCheckInterval = null
        }
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },

      checkSession: () => {
        const { sessionExpiry } = get()
        if (sessionExpiry && Date.now() > sessionExpiry) {
          get().logout()
        }
      },

      updateProfile: (data) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
)
