"use client"

import { type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/shared/ui/page-header"
import { LoadingState } from "@/shared/shared/loading-state"
import { ErrorState } from "@/shared/shared/error-state"
import { EmptyState } from "@/shared/ui/empty-state"

export type PageStatus = "loading" | "error" | "empty" | "success"

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: ReactNode
  status?: PageStatus
  errorMessage?: string
  onRetry?: () => void
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  loadingType?: "card" | "table" | "list" | "detail"
  loadingCount?: number
}

export function PageContainer({
  title,
  description,
  actions,
  status = "success",
  errorMessage,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  loadingType = "table",
  loadingCount,
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <PageHeader title={title} description={description} actions={actions} />

      {status === "loading" && (
        <LoadingState type={loadingType} count={loadingCount} />
      )}

      {status === "error" && (
        <ErrorState
          title="Error"
          message={errorMessage}
          onRetry={onRetry}
        />
      )}

      {status === "empty" && (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle ?? "No data found"}
          description={emptyDescription ?? `No ${title.toLowerCase()} available.`}
          action={emptyAction}
        />
      )}

      {status === "success" && children}
    </div>
  )
}
