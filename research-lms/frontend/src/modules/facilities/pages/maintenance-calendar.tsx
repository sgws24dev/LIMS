"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { getMaintenanceCalendar, getMaintenanceById, type MaintenanceCalendarEvent, type MaintenanceRecord } from "@/services/api/facilities"

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-500",
  InProgress: "bg-amber-500",
  Completed: "bg-green-500",
  Overdue: "bg-red-500",
  Cancelled: "bg-gray-400",
}

const STATUS_BG: Record<string, string> = {
  Scheduled: "bg-blue-50 border-blue-200",
  InProgress: "bg-amber-50 border-amber-200",
  Completed: "bg-green-50 border-green-200",
  Overdue: "bg-red-50 border-red-200",
  Cancelled: "bg-gray-50 border-gray-200",
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function MaintenanceCalendarPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<MaintenanceCalendarEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceCalendarEvent | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<MaintenanceRecord | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Maintenance" }])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMaintenanceCalendar(currentMonth, currentYear)
      setEvents(data)
    } catch {
      setError("Failed to load maintenance data.")
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => { fetchData() }, [fetchData])

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) week.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

  const prevMonth = () => { if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1) } else setCurrentMonth(currentMonth - 1) }
  const nextMonth = () => { if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1) } else setCurrentMonth(currentMonth + 1) }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((e) => e.scheduledDate === dateStr)
  }

  const handleEventClick = async (event: MaintenanceCalendarEvent) => {
    setSelectedEvent(event)
    setDetailLoading(true)
    try {
      const detail = await getMaintenanceById(event.id)
      setDetailData(detail)
    } catch {
      setDetailData(null)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <PageContainer
      title="Maintenance Calendar"
      description="Schedule and track equipment maintenance"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      actions={
        <Button size="sm" onClick={() => navigate("/facilities/assets")}>
          <Plus className="mr-1 h-4 w-4" /> Schedule Maintenance
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{MONTHS[currentMonth - 1]} {currentYear}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date().getMonth() + 1); setCurrentYear(new Date().getFullYear()) }}>Today</Button>
              <Button variant="outline" size="icon-sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {DAYS.map((d) => (
                <div key={d} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {weeks.flat().map((day, idx) => (
                <div key={idx} className={`bg-background min-h-[80px] p-1 ${day ? "cursor-pointer hover:bg-accent/50" : ""}`}>
                  {day && (
                    <>
                      <p className={`text-xs font-medium mb-1 ${new Date(currentYear, currentMonth - 1, day).toDateString() === new Date().toDateString() ? "text-primary" : ""}`}>{day}</p>
                      <div className="space-y-0.5">
                        {getEventsForDay(day).map((evt) => (
                          <div
                            key={evt.id}
                            className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${STATUS_BG[evt.status] || "bg-blue-50"}`}
                            onClick={(e) => { e.stopPropagation(); handleEventClick(evt) }}
                          >
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {status}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) { setSelectedEvent(null); setDetailData(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Maintenance record details</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : detailData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline">{detailData.status}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium">{detailData.type}</p></div>
                <div><p className="text-xs text-muted-foreground">Scheduled</p><p className="text-sm font-medium">{detailData.scheduledDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-sm font-medium">{detailData.completedDate || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Technician</p><p className="text-sm font-medium">{detailData.technicianName || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Cost</p><p className="text-sm font-medium">{detailData.cost != null ? `$${detailData.cost.toFixed(2)}` : "—"}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/assets/${detailData.assetId}`)}>View Asset</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load details.</p>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
