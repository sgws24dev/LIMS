import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../protected-route'
import { useAuthStore } from '@/store/authStore'

function TestPage() {
  return <div>Protected Content</div>
}

function LoginPage() {
  return <div>Login Page</div>
}

function DashboardPage() {
  return <div>Dashboard Page</div>
}

function renderProtected(initialEntries: string[] = ['/protected'], roles?: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/protected" element={<TestPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
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

describe('ProtectedRoute', () => {
  it('should redirect unauthenticated users to /login', () => {
    renderProtected()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render outlet for authenticated users', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
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
      },
    })

    renderProtected()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show spinner during loading state', () => {
    useAuthStore.setState({ isLoading: true })
    renderProtected()

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('should redirect to /dashboard when user lacks required role', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'researcher@test.com',
        firstName: 'Researcher',
        lastName: 'User',
        fullName: 'Researcher User',
        phone: '+911234567890',
        role: ['researcher'],
        isActive: true,
        isMfaEnabled: false,
        tenantId: 'tenant-1',
        createdAt: '2025-01-01T00:00:00Z',
      },
    })

    renderProtected(['/protected'], ['super_admin'])
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
