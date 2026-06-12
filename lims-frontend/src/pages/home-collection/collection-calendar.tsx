"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getHCVisits, getAgents } from "@/mock/services"
import type { HCVisit, Agent } from "@/types"

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500",
  scheduled: "bg-blue-500",
  missed: "bg-red-500",
  en_route: "bg-amber-500",
  arrived: "bg-violet-500",
  in_progress: "bg-cyan-500",
  cancelled: "bg-gray-400",
}

const statusBadgeVariant: Record<string, "success" | "info" | "destructive" | "warning" | "default" | "secondary"> = {
  completed: "success",
  scheduled: "info",
  missed: "destructive",
  en_route: "warning",
  arrived: "info",
  in_progress: "default",
  cancelled: "secondary",
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function CollectionCalendarPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visits, setVisits] = useState<HCVisit[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedVisit, setSelectedVisit] = useState<HCVisit | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "Calendar" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [v, a] = await Promise.all([getHCVisits(), getAgents()])
        setVisits(v)
        setAgents(a)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }, [currentDate])

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    while (days.length % 7 !== 0) {
      days.push(null)
    }
    return days
  }, [currentDate])

  const dayVisits = useMemo(() => {
    const dateStr = currentDate.toISOString().slice(0, 10)
    return visits.filter((v) => v.scheduledTime.startsWith(dateStr))
  }, [visits, currentDate])

  const weekVisits = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return visits.filter((v) => {
      const d = new Date(v.scheduledTime)
      return d >= start && d <= end
    })
  }, [visits, currentDate])

  const visitCountByDate = useMemo(() => {
    const map: Record<string, { total: number; completed: number; missed: number }> = {}
    visits.forEach((v) => {
      const key = v.scheduledTime.slice(0, 10)
      if (!map[key]) map[key] = { total: 0, completed: 0, missed: 0 }
      map[key].total++
      if (v.status === "completed") map[key].completed++
      if (v.status === "missed") map[key].missed++
    })
    return map
  }, [visits])

  const navigate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (viewMode === "month") {
        d.setMonth(d.getMonth() + (direction === "next" ? 1 : -1))
      } else if (viewMode === "week") {
        d.setDate(d.getDate() + (direction === "next" ? 7 : -7))
      } else {
        d.setDate(d.getDate() + (direction === "next" ? 1 : -1))
      }
      return d
    })
  }

  const getAgentName = (agentId?: string) => {
    if (!agentId) return "Unassigned"
    return agents.find((a) => a.id === agentId)?.name ?? "Unknown"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Collection Calendar" description="View scheduled home collections in calendar format" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Collection Calendar" description="View scheduled home collections in calendar format" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Calendar"
        description="View scheduled home collections in calendar format"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => navigate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base">
                {viewMode === "day"
                  ? currentDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : viewMode === "week"
                    ? `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => navigate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "week" | "month")}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Scheduled</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Missed</span>
          </div>

          {viewMode === "month" && (
            <div>
              <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted overflow-hidden text-center text-xs font-medium text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="bg-background p-2">{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="bg-background/50 p-2" />
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const counts = visitCountByDate[dateStr]
                  const isToday = dateStr === todayStr
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        "bg-background p-2 min-h-[90px] cursor-pointer transition-colors hover:bg-accent/50",
                        isToday && "ring-2 ring-primary/30 ring-inset"
                      )}
                      onClick={() => {
                        setCurrentDate(new Date(dateStr))
                        setViewMode("day")
                      }}
                    >
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {day}
                      </span>
                      {counts && (
                        <div className="mt-1 space-y-0.5">
                          {counts.completed > 0 && <div className="flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="h-2.5 w-2.5" />{counts.completed}</div>}
                          {counts.total - counts.completed - counts.missed > 0 && <div className="flex items-center gap-1 text-[10px] text-blue-600"><Clock className="h-2.5 w-2.5" />{counts.total - counts.completed - counts.missed}</div>}
                          {counts.missed > 0 && <div className="flex items-center gap-1 text-[10px] text-red-600"><AlertCircle className="h-2.5 w-2.5" />{counts.missed}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === "week" && (
            <div className="space-y-2">
              {weekVisits.length === 0 ? (
                <EmptyState title="No visits" description="No visits scheduled for this week" />
              ) : (
                weekVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedVisit(v)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusColors[v.status] || "bg-gray-400")} />
                      <div>
                        <p className="text-sm font-medium">{v.patientName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(v.scheduledTime, "time")} &middot; {v.patientAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant[v.status] || "secondary"} className="text-xs">
                        {v.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {viewMode === "day" && (
            <div className="space-y-2">
              {dayVisits.length === 0 ? (
                <EmptyState title="No visits" description="No visits scheduled for this day" />
              ) : (
                dayVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedVisit(v)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusColors[v.status] || "bg-gray-400")} />
                      <div>
                        <p className="text-sm font-medium">{v.patientName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(v.scheduledTime, "time")}
                          <MapPin className="h-3 w-3 ml-1" />
                          {v.patientAddress}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" />
                          {getAgentName(v.agentId)}
                          <Phone className="h-3 w-3 ml-1" />
                          {v.patientPhone}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant[v.status] || "secondary"}>{v.status.replace(/_/g, " ")}</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedVisit} onOpenChange={(o) => { if (!o) setSelectedVisit(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
            <DialogDescription>Home collection visit information</DialogDescription>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedVisit.patientName}</span>
                <Badge variant={statusBadgeVariant[selectedVisit.status] || "secondary"}>
                  {selectedVisit.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedVisit.patientAddress}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {selectedVisit.patientPhone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Scheduled: {formatDate(selectedVisit.scheduledTime, "datetime")}
                </div>
                {selectedVisit.actualArrival && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    Arrived: {formatDate(selectedVisit.actualArrival, "datetime")}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Agent: {getAgentName(selectedVisit.agentId)}
                </div>
              </div>
              <div className="flex gap-4 pt-2 border-t text-sm">
                <div>
                  <span className="text-muted-foreground">Samples</span>
                  <p className="font-semibold">{selectedVisit.samplesCollected}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment</span>
                  <p className="font-semibold">₹{selectedVisit.paymentCollected}</p>
                </div>
              </div>
              {selectedVisit.notes && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p>{selectedVisit.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
