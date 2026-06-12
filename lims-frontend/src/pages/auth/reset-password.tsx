"use client"

import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordForm } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRoundIcon as Flask, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || "mock-token-123"
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid] = useState(true)

  const methods = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSuccess(true)
  }

  const newPassword = methods.watch("newPassword")

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Invalid or expired link</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This password reset link is no longer valid. Please request a new one.
            </p>
            <Button variant="outline" asChild>
              <Link to="/forgot-password">Request new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Password reset successful</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button asChild>
              <Link to="/login">Sign in with new password</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
            <Flask className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="relative">
                  <FormInput
                    name="newPassword"
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <FormInput
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="space-y-0.5">
                    <li className={newPassword?.length >= 8 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword ?? "") ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      At least one uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword ?? "") ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      At least one lowercase letter
                    </li>
                    <li className={/[0-9]/.test(newPassword ?? "") ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      At least one number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword ?? "") ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      At least one special character
                    </li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            </FormProvider>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <Button variant="link" size="sm" asChild>
              <Link to="/login">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
