"use client"

import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginForm } from "@/lib/validations"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormCheckbox } from "@/components/forms/form-checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRoundIcon as Flask, Eye, EyeOff, AlertCircle, Loader2, Microscope } from "lucide-react"
import { useState } from "react"

const DEMO_CREDENTIALS = [
  { role: "Super Admin", email: "admin@lims.com", password: "admin123" },
  { role: "Lab Admin", email: "lab@lims.com", password: "lab123" },
  { role: "Technician", email: "technician@lims.com", password: "tech123" },
  { role: "Doctor", email: "doctor@lims.com", password: "doc123" },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useAppStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [showDemo, setShowDemo] = useState(false)

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered-email")
    if (savedEmail) {
      methods.setValue("email", savedEmail)
      methods.setValue("rememberMe", true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginForm) => {
    setError("")

    if (data.rememberMe) {
      localStorage.setItem("remembered-email", data.email)
    } else {
      localStorage.removeItem("remembered-email")
    }

    const success = await login(data.email, data.password)
    if (success) {
      navigate("/dashboard", { replace: true })
    } else {
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-60 w-60 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
            <Flask className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LifSys LIMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Laboratory Information Management System
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="name@lifsyslab.com"
                  autoComplete="email"
                  autoFocus
                />

                <div className="space-y-1">
                  <div className="relative">
                    <FormInput
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <FormCheckbox name="rememberMe" label="Remember me" />
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </FormProvider>

            <div className="mt-4 text-center">
              <Link
                to="/mfa-verification"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Use multi-factor authentication instead
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-0">
            <Separator />
            <div className="w-full">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Microscope className="h-3 w-3" />
                {showDemo ? "Hide" : "Show"} demo credentials
              </button>
              {showDemo && (
                <div className="mt-3 space-y-1.5 rounded-lg bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Use these credentials to sign in:
                  </p>
                  {DEMO_CREDENTIALS.map((cred) => (
                    <div
                      key={cred.role}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted"
                      onClick={() => {
                        methods.setValue("email", cred.email)
                        methods.setValue("password", cred.password)
                        methods.clearErrors()
                        setError("")
                      }}
                    >
                      <span className="font-medium text-foreground">{cred.role}</span>
                      <span className="text-muted-foreground">
                        {cred.email} / {cred.password}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} LifSys Diagnostics. All rights reserved.
        </p>
      </div>
    </div>
  )
}
