"use client"

import { useState } from "react"
import {
  UserPlus, CalendarPlus, Beaker, ClipboardList, ListTodo,
  Pin, PinOff, Clock, Zap, ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/components/shared/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ActionItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut: string
  color: string
  pinned: boolean
}

const defaultActions: ActionItem[] = [
  { id: "new-patient", label: "New Patient", icon: <UserPlus className="h-5 w-5" />, shortcut: "Alt+N", color: "bg-blue-500/10 text-blue-600", pinned: true },
  { id: "new-booking", label: "New Booking", icon: <CalendarPlus className="h-5 w-5" />, shortcut: "Alt+B", color: "bg-emerald-500/10 text-emerald-600", pinned: true },
  { id: "register-sample", label: "Register Sample", icon: <Beaker className="h-5 w-5" />, shortcut: "Alt+R", color: "bg-violet-500/10 text-violet-600", pinned: true },
  { id: "enter-results", label: "Enter Results", icon: <ClipboardList className="h-5 w-5" />, shortcut: "Alt+E", color: "bg-amber-500/10 text-amber-600", pinned: true },
  { id: "view-queue", label: "View Queue", icon: <ListTodo className="h-5 w-5" />, shortcut: "Alt+Q", color: "bg-rose-500/10 text-rose-600", pinned: true },
  { id: "sample-tracking", label: "Sample Tracking", icon: <Beaker className="h-5 w-5" />, shortcut: "Alt+T", color: "bg-cyan-500/10 text-cyan-600", pinned: false },
  { id: "reports", label: "View Reports", icon: <ClipboardList className="h-5 w-5" />, shortcut: "Alt+P", color: "bg-indigo-500/10 text-indigo-600", pinned: false },
  { id: "inventory", label: "Check Inventory", icon: <Beaker className="h-5 w-5" />, shortcut: "Alt+I", color: "bg-orange-500/10 text-orange-600", pinned: false },
]

const recentActions = [
  { action: "Registered sample SMP-0421", time: "2 min ago" },
  { action: "Created booking for Patient #1092", time: "15 min ago" },
  { action: "Entered results for Lipid Profile", time: "32 min ago" },
  { action: "Viewed pending queue", time: "1 hr ago" },
  { action: "Added new patient: Sunita Verma", time: "2 hrs ago" },
]

export default function QuickActionsPage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [actions, setActions] = useState<ActionItem[]>(
    defaultActions.map((a) => ({ ...a, icon: a.icon }))
  )

  useState(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Premium" },
      { label: "Quick Actions" },
    ])
  })

  const pinnedActions = actions.filter((a) => a.pinned)
  const unpinnedActions = actions.filter((a) => !a.pinned)

  const handleAction = (action: ActionItem) => {
    showToast({ type: "info", title: action.label, message: `"${action.label}" action triggered` })
  }

  const togglePin = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    )
    const action = actions.find((a) => a.id === id)
    if (action) {
      showToast({
        type: "success",
        title: action.pinned ? "Unpinned" : "Pinned",
        message: `"${action.label}" ${action.pinned ? "removed from" : "added to"} favorites`,
      })
    }
  }

  return (
    <PageContainer
      title="Quick Actions"
      description="Configurable shortcuts for common lab tasks"
      status="success"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pinned Actions</CardTitle>
            <Badge variant="secondary">{pinnedActions.length} pinned</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {pinnedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-card-hover hover:-translate-y-0.5",
                  action.color
                )}
              >
                <div className="rounded-lg bg-background p-2.5 shadow-sm">{action.icon}</div>
                <div className="text-center">
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{action.shortcut}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(action.id) }}
                  className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <PinOff className="h-3 w-3 text-muted-foreground/60" />
                </button>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {unpinnedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
              >
                <div className={cn("rounded-lg p-2", action.color)}>{action.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">Shortcut: {action.shortcut}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleAction(action)}>
                  Run <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => togglePin(action.id)}>
                  <Pin className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActions.map((ra, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground/60" />
                <span className="flex-1">{ra.action}</span>
                <span className="text-xs text-muted-foreground">{ra.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
