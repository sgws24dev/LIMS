"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled"
  | "paid"
  | "unpaid"
  | "partial"
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "collected"
  | "received"
  | "processing"
  | "rejected"
  | "online"
  | "offline"
  | "maintenance"
  | "error"
  | "sent"
  | "failed"
  | "registered"
  | "sample_collected"
  | "in_progress"
  | "success"
  | "warning"
  | "info"

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  active: "success",
  inactive: "secondary",
  pending: "warning",
  completed: "success",
  cancelled: "destructive",
  paid: "success",
  unpaid: "warning",
  partial: "warning",
  draft: "secondary",
  review: "warning",
  approved: "success",
  published: "success",
  collected: "secondary",
  received: "secondary",
  processing: "warning",
  rejected: "destructive",
  online: "success",
  offline: "secondary",
  maintenance: "warning",
  error: "destructive",
  sent: "success",
  failed: "destructive",
  registered: "secondary",
  sample_collected: "secondary",
  in_progress: "warning",
  success: "success",
  warning: "warning",
  info: "info",
}

export interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? "secondary"
  const label = status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
