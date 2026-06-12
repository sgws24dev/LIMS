"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/lib/validations"
import { FormInput } from "@/components/forms/form-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRoundIcon as Flask, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const methods = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setSubmittedEmail(data.email)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-xl">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{submittedEmail}</strong>
              </p>
              <p className="mb-6 text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setIsSubmitted(false)}
                >
                  try again
                </button>
              </p>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
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
          <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No worries, we'll send you a reset link
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter the email address associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative">
                  <FormInput
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="name@lifsyslab.com"
                    autoComplete="email"
                    autoFocus
                  />
                  <Mail className="absolute right-3 top-9 h-4 w-4 text-muted-foreground" />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
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
