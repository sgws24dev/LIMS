"use client"

import { type HTMLAttributes } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content. Please try again.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 p-12 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
