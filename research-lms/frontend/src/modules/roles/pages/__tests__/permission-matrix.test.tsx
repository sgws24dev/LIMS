import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import PermissionMatrix from "../permission-matrix"

vi.mock("@/services/api/roles", () => ({
  getRoles: vi.fn(),
}))

import { getRoles } from "@/services/api/roles"

describe("PermissionMatrix", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading state initially", () => {
    vi.mocked(getRoles).mockReturnValue(new Promise(() => {}))
    render(<BrowserRouter><PermissionMatrix /></BrowserRouter>)
    expect(screen.getByRole("status")).toBeDefined()
  })

  it("renders roles and modules when data loads", async () => {
    vi.mocked(getRoles).mockResolvedValue([
      { id: "1", name: "Admin", description: "Admin role", permissions: [{ module: "Users", canView: true, canCreate: true, canEdit: true, canDelete: true }], isSystem: true, userCount: 1 },
    ])
    render(<BrowserRouter><PermissionMatrix /></BrowserRouter>)
    expect(await screen.findByText("Roles & Permissions")).toBeDefined()
    expect(screen.getByText("Admin")).toBeDefined()
    expect(screen.getByText("Users")).toBeDefined()
  })

  it("shows error state on fetch failure", async () => {
    vi.mocked(getRoles).mockRejectedValue(new Error("API Error"))
    render(<BrowserRouter><PermissionMatrix /></BrowserRouter>)
    expect(await screen.findByText("Failed to load roles.")).toBeDefined()
  })
})
