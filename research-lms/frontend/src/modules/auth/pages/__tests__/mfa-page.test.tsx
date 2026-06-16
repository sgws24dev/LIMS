import { render, screen, fireEvent } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import MfaPage from "../mfa-page"

describe("MfaPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the MFA heading", () => {
    render(<BrowserRouter><MfaPage /></BrowserRouter>)
    expect(screen.getByText("Two-Factor Authentication")).toBeDefined()
  })

  it("renders 6-digit input fields", () => {
    render(<BrowserRouter><MfaPage /></BrowserRouter>)
    const inputs = screen.getAllByRole("textbox")
    expect(inputs).toHaveLength(6)
  })

  it("shows error on empty submit", async () => {
    render(<BrowserRouter><MfaPage /></BrowserRouter>)
    fireEvent.click(screen.getByText("Verify"))
    expect(await screen.findByText("Please enter the complete 6-digit code.")).toBeDefined()
  })

  it("renders back to login link", () => {
    render(<BrowserRouter><MfaPage /></BrowserRouter>)
    expect(screen.getByText("Back to login")).toBeDefined()
  })
})
