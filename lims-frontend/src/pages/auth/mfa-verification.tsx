"use client"

import { useState, useRef, useEffect, type ClipboardEvent, type KeyboardEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mfaVerificationSchema, type MfaVerificationForm } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FlaskRoundIcon as Flask, Loader2, Shield, ArrowLeft, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MfaVerificationPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const methods = useForm<MfaVerificationForm>({
    resolver: zodResolver(mfaVerificationSchema),
    defaultValues: { code: "" },
  })

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    }
    setCanResend(true)
  }, [timer])

  const onSubmit = async (data: MfaVerificationForm) => {
    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)

    if (data.code === "123456") {
      methods.reset()
      navigate("/dashboard", { replace: true })
    } else {
      setError("Invalid verification code. Please try again.")
      methods.setValue("code", "")
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = () => {
    setCanResend(false)
    setTimer(120)
    methods.setValue("code", "")
    setError("")
    inputRefs.current[0]?.focus()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const code = methods.watch("code")

  const handleInputChange = (index: number, digit: string, onChange: (value: string) => void) => {
    if (digit && !/^\d$/.test(digit)) return
    const newCode = code.split("")
    newCode[index] = digit
    onChange(newCode.join(""))
    setError("")
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>, onChange: (value: string) => void) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
            <Flask className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Two-factor authentication</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the verification code from your authenticator app
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Verification code</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {error && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Controller
                  name="code"
                  control={methods.control}
                  render={({ field }) => (
                    <div
                      className="flex items-center justify-center gap-2"
                      onPaste={(e) => handlePaste(e, field.onChange)}
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={code[index] ?? ""}
                          onChange={(e) => handleInputChange(index, e.target.value, field.onChange)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          autoFocus={index === 0}
                          className={cn(
                            "h-12 w-12 text-center text-lg font-bold",
                            error && "border-destructive"
                          )}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                />

                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="font-medium text-primary hover:underline"
                      >
                        Resend code
                      </button>
                    ) : (
                      <>Code expires in {formatTime(timer)}</>
                    )}
                  </span>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
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
