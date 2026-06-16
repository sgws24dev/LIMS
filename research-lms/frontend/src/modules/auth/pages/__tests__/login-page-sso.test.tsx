import { render, screen, fireEvent } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import LoginPage from "../login-page"

describe("LoginPage - SSO", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders SSO button", () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>)
    expect(screen.getByText("Sign in with Institution SSO")).toBeDefined()
  })

  it("renders OR separator", () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>)
    expect(screen.getByText("OR")).toBeDefined()
  })

  it("redirects to SSO URL on SSO button click", () => {
    const originalLocation = window.location
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    })

    render(<BrowserRouter><LoginPage /></BrowserRouter>)
    fireEvent.click(screen.getByText("Sign in with Institution SSO"))
    expect(window.location.href).toContain("/api/v1/auth/sso/entra-id")

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })
})
