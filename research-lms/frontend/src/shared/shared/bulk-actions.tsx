"use client"

import { Trash2, Download, XCircle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

export interface BulkAction {
  label: string
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary"
  onClick: () => void
}

export interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  actions?: BulkAction[]
  className?: string
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  actions,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  const defaultActions: BulkAction[] = [
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      onClick: () => {},
    },
    {
      label: "Export Selected",
      icon: <Download className="h-4 w-4" />,
      variant: "outline",
      onClick: () => {},
    },
  ]

  const items = actions ?? defaultActions

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2",
        className
      )}
    >
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="ml-auto flex items-center gap-1">
        {items.map((action, i) => (
          <Button
            key={i}
            size="sm"
            variant={action.variant ?? "outline"}
            onClick={action.onClick}
            className="h-8"
          >
            {action.icon}
            <span className="ml-1.5 hidden sm:inline">{action.label}</span>
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-8"
        >
          <XCircle className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  )
}
