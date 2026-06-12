"use client"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, FlaskConical, FileCheck, Package, Syringe, XCircle, Trash2, Truck, RotateCcw } from "lucide-react"

export interface TimelineEvent {
  status: string
  timestamp: string
  performedBy: string
  notes?: string
}

export interface SampleTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const statusIcons: Record<string, typeof Clock> = {
  registered: Circle,
  collected: Syringe,
  received: Package,
  processing: FlaskConical,
  testing: FlaskConical,
  validation: FileCheck,
  approved: CheckCircle2,
  delivered: Truck,
  rejected: XCircle,
  disposed: Trash2,
  re_testing: RotateCcw,
  transferred: Truck,
}

const statusColors: Record<string, string> = {
  registered: "text-muted-foreground",
  collected: "text-blue-500",
  received: "text-purple-500",
  processing: "text-amber-500",
  testing: "text-orange-500",
  validation: "text-sky-500",
  approved: "text-emerald-500",
  delivered: "text-emerald-600",
  rejected: "text-destructive",
  disposed: "text-muted-foreground",
  re_testing: "text-amber-600",
  transferred: "text-indigo-500",
}

const statusLabels: Record<string, string> = {
  registered: "Registered",
  collected: "Collected",
  received: "Received",
  processing: "Processing",
  testing: "Testing",
  validation: "Validation",
  approved: "Approved",
  delivered: "Delivered",
  rejected: "Rejected",
  disposed: "Disposed",
  re_testing: "Retesting",
  transferred: "Transferred",
}

export function SampleTimeline({ events, className }: SampleTimelineProps) {
  if (events.length === 0) return null

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, idx) => {
        const Icon = statusIcons[event.status] || Circle
        const color = statusColors[event.status] || "text-muted-foreground"
        const label = statusLabels[event.status] || event.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        const isLast = idx === events.length - 1

        return (
          <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-[13px] top-7 h-full w-0.5 bg-border" />
            )}
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 bg-background",
                color.replace("text-", "border-"),
                event.status === "approved" || event.status === "delivered"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                  : event.status === "rejected" || event.status === "disposed"
                    ? "border-destructive bg-destructive/5"
                    : "bg-background"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", color)} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(event.timestamp, "datetime")}
                </span>
              </div>
              {event.performedBy && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  by {event.performedBy}
                </p>
              )}
              {event.notes && (
                <p className="mt-1 text-xs text-muted-foreground/70 bg-muted/50 rounded-md px-2 py-1">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
