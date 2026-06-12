"use client"

import { Outlet, Navigate } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { sidebarCollapsed } = useAppStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
