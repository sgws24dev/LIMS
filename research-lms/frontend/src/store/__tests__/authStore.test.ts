import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '@/types'

const mockUser: User = {
  id: '1',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  fullName: 'Admin User',
  phone: '+911234567890',
  role: ['institution_admin'],
  isActive: true,
  isMfaEnabled: false,
  tenantId: 'tenant-1',
  createdAt: '2025-01-01T00:00:00Z',
}

const mockLoginResponse = {
  user: mockUser,
  accessToken: 'access-123',
  refreshToken: 'refresh-123',
}

const mockRefreshResponse = {
  accessToken: 'access-456',
  refreshToken: 'refresh-456',
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    refreshToken: null,
  })
})

describe('authStore', () => {
  it('should have correct initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  describe('login', () => {
    it('should update store on successful login', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLoginResponse),
      })

      const result = await useAuthStore.getState().login('admin@test.com', 'password')
      expect(result).toBe(true)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.accessToken).toBe('access-123')
      expect(state.refreshToken).toBe('refresh-123')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should remain in initial state on failed login', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      })

      const result = await useAuthStore.getState().login('admin@test.com', 'wrong')
      expect(result).toBe(false)

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear all state on logout', () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      })

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should update user correctly', () => {
      useAuthStore.getState().setUser(mockUser)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('refreshAuth', () => {
    it('should call refresh endpoint and update tokens', async () => {
      useAuthStore.setState({
        refreshToken: 'refresh-123',
      })

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse),
      })

      const result = await useAuthStore.getState().refreshAuth()
      expect(result).toBe(true)

      const state = useAuthStore.getState()
      expect(state.accessToken).toBe('access-456')
      expect(state.refreshToken).toBe('refresh-456')

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'refresh-123' }),
      })
    })

    it('should return false when no refresh token exists', async () => {
      useAuthStore.setState({ refreshToken: null })
      const result = await useAuthStore.getState().refreshAuth()
      expect(result).toBe(false)
    })

    it('should return false on failed refresh', async () => {
      useAuthStore.setState({ refreshToken: 'refresh-123' })
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })

      const result = await useAuthStore.getState().refreshAuth()
      expect(result).toBe(false)
    })
  })
})
