import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useAuthStore } from "@/store/authStore"
import DashboardRouter from "../dashboard-router"

describe("DashboardRouter", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  it("renders researcher dashboard for researcher role", () => {
    useAuthStore.setState({
      user: { id: "1", email: "test@test.com", firstName: "Test", lastName: "User", fullName: "Test User", phone: "", role: ["researcher"], roleName: "Researcher", isActive: true, isMfaEnabled: false, tenantId: "1", createdAt: new Date().toISOString() },
      isAuthenticated: true,
    })
    render(<BrowserRouter><DashboardRouter /></BrowserRouter>)
    expect(screen.getByText("Your research dashboard")).toBeDefined()
  })

  it("renders facility admin dashboard for facility admin", () => {
    useAuthStore.setState({
      user: { id: "2", email: "admin@test.com", firstName: "Facility", lastName: "Admin", fullName: "Facility Admin", phone: "", role: ["facility_admin"], roleName: "Facility Admin", isActive: true, isMfaEnabled: false, tenantId: "1", createdAt: new Date().toISOString() },
      isAuthenticated: true,
    })
    render(<BrowserRouter><DashboardRouter /></BrowserRouter>)
    expect(screen.getByText("Facility Dashboard")).toBeDefined()
  })
})
