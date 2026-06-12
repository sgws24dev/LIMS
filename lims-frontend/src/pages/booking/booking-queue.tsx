"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Booking } from "@/types"
import { bookings as allBookings } from "@/mock/data/bookings"
import { tests } from "@/mock/data/tests"
import { formatDate, cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import {
  Search,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Users,
  ChevronDown,
} from "lucide-react"

const statusColumns: { key: Booking["status"]; label: string; color: string }[] = [
  { key: "pending", label: "Pending", color: "bg-amber-500" },
  { key: "registered", label: "Registered", color: "bg-blue-500" },
  { key: "sample_collected", label: "Sample Collected", color: "bg-purple-500" },
  { key: "in_progress", label: "In Progress", color: "bg-indigo-500" },
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
]

const nextStatuses: Record<Booking["status"], Booking["status"][]> = {
  pending: ["registered", "cancelled"],
  registered: ["sample_collected", "cancelled"],
  sample_collected: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function BookingQueuePage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [search, setSearch] = useState("")

  useEffect(() => {
    setBreadcrumbs([{ label: "Bookings", href: "/bookings" }, { label: "Queue" }])
  }, [])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 15000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const filtered = useMemo(() => {
    let data = [...allBookings]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((b) => b.patientName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q))
    }
    return data
  }, [search, refreshKey])

  const grouped = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    statusColumns.forEach((col) => {
      map[col.key] = filtered.filter((b) => b.status === col.key)
    })
    return map
  }, [filtered])

  const moveStatus = (bookingId: string, newStatus: Booking["status"]) => {
    toast({
      title: "Status Updated",
      description: `Booking ${bookingId} moved to ${newStatus.replace(/_/g, " ")}.`,
      variant: "success",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Booking Queue"
        description="Real-time view of all booking statuses"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", autoRefresh && "animate-spin")} />
            {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statusColumns.map((col) => {
          const items = grouped[col.key] ?? []
          return (
            <div key={col.key} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
                <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                <span>{col.label}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
              </div>
              <ScrollArea className="flex-1" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="space-y-2 pr-1">
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      No {col.label.toLowerCase()} bookings
                    </div>
                  ) : (
                    items.map((booking) => (
                      <QueueCard
                        key={booking.id}
                        booking={booking}
                        nextStatuses={nextStatuses[booking.status]}
                        onMoveStatus={(newStatus) => moveStatus(booking.id, newStatus)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QueueCard({
  booking,
  nextStatuses,
  onMoveStatus,
}: {
  booking: Booking
  nextStatuses: Booking["status"][]
  onMoveStatus: (status: Booking["status"]) => void
}) {
  const navigate = useNavigate()
  const getTestName = (id: string) => tests.find((t) => t.id === id)?.name ?? id
  const initials = getInitials(booking.patientName)

  return (
    <Card className="group cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="font-medium text-sm truncate">{booking.patientName}</div>
              {nextStatuses.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {nextStatuses.map((s) => (
                      <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); onMoveStatus(s) }}>
                        Move to {s.replace(/_/g, " ")}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {booking.tests.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                  {getTestName(t).length > 20 ? getTestName(t).slice(0, 20) + "..." : getTestName(t)}
                </Badge>
              ))}
              {booking.tests.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{booking.tests.length - 3}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getTimeSince(booking.createdAt)}</span>
              <span>•</span>
              <Badge variant="outline" className="text-[10px] px-1">{booking.type}</Badge>
              {booking.collectionType === "home" && (
                <Badge variant="secondary" className="text-[10px] px-1">Home</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
