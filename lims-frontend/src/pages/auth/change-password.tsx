"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePasswordSchema, type ChangePasswordForm } from "@/lib/validations"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { FlaskRoundIcon as Flask, Loader2, Eye, EyeOff, Save, ArrowLeft } from "lucide-react"

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const methods = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = methods.watch("newPassword")

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)

    toast({
      title: "Password changed successfully",
      description: "Your password has been updated.",
      variant: "success",
    })
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change password</h1>
          <p className="text-sm text-muted-foreground">
            Update your account password
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Flask className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Account security</CardTitle>
              <CardDescription>
                {user?.name} &middot; {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
              <div className="relative">
                <FormInput
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Separator />

              <div className="relative">
                <FormInput
                  name="newPassword"
                  label="New Password"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <FormInput
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing password...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Change password
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
