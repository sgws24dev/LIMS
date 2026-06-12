import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  roles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ roles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles && user && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
