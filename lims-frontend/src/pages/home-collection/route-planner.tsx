"use client"

import { useState, useEffect, useMemo } from "react"
import {
  MapPin,
  GripVertical,
  Clock,
  Ruler,
  Truck,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2,
  XCircle,
  Navigation,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getHCRoutesExtended, getAgents, getHCVisits, assignAgent } from "@/mock/services"
import type { HCRoute, Agent, HCVisit } from "@/types"

export default function RoutePlannerPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<HCRoute[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [visits, setVisits] = useState<HCVisit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "Route Planner" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [r, a, v] = await Promise.all([
          getHCRoutesExtended({ date: selectedDate }),
          getAgents(),
          getHCVisits({ date: selectedDate }),
        ])
        setRoutes(r)
        setAgents(a)
        setVisits(v)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load routes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedDate])

  const dateOptions = useMemo(() => {
    const dates = new Set<string>()
    const allRoutes = [...routes]
    allRoutes.forEach((r) => dates.add(r.date))
    return Array.from(dates).sort()
  }, [])

  const getVisitForBooking = (bookingId: string): HCVisit | undefined => {
    return visits.find((v) => v.bookingId === bookingId)
  }

  const handleAssignAgent = async (routeId: string, agentId: string) => {
    setAssigning(true)
    try {
      const route = routes.find((r) => r.id === routeId)
      if (!route) return
      for (const bookingId of route.bookings) {
        const visit = getVisitForBooking(bookingId)
        if (visit) {
          await assignAgent(visit.id, agentId)
        }
      }
      toast({ title: "Agent Assigned", variant: "success" })
      const updated = await getHCRoutesExtended({ date: selectedDate })
      setRoutes(updated)
    } catch (e) {
      toast({ title: "Failed to assign agent", variant: "destructive", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setAssigning(false)
    }
  }

  const getAgentName = (agentId: string) => {
    return agents.find((a) => a.id === agentId)?.name ?? "Unknown"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Route Planner" description="Plan and manage home collection routes" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Route Planner" description="Plan and manage home collection routes" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Planner"
        description="Plan and manage home collection routes"
      />

      <div className="flex items-center gap-3">
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.length > 0
              ? dateOptions.map((d) => (
                  <SelectItem key={d} value={d}>{formatDate(d, "short")}</SelectItem>
                ))
              : <SelectItem value={selectedDate}>{formatDate(selectedDate, "short")}</SelectItem>}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {routes.length} route{routes.length !== 1 ? "s" : ""} for {formatDate(selectedDate, "short")}
        </span>
      </div>

      {routes.length === 0 ? (
        <EmptyState
          icon={<Navigation className="h-12 w-12" />}
          title="No routes found"
          description={`No routes planned for ${formatDate(selectedDate, "short")}`}
        />
      ) : (
        <div className="space-y-4">
          {routes.map((route) => {
            const isExpanded = expandedRoute === route.id
            const routeAgent = agents.find((a) => a.id === route.agentId)
            const completedStops = route.stops.filter((s) => s.status === "visited").length
            return (
              <Card key={route.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        route.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                        route.status === "in_progress" ? "bg-amber-100 text-amber-600" :
                        "bg-blue-100 text-blue-600"
                      )}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          Route for {getAgentName(route.agentId)}
                          <Badge variant={
                            route.status === "completed" ? "success" :
                            route.status === "in_progress" ? "warning" : "info"
                          }>
                            {route.status.replace(/_/g, " ")}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{route.totalDistance} km</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{route.startTime} - {route.estimatedEndTime}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{route.stops.length} stops</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={route.agentId}
                        onValueChange={(val) => handleAssignAgent(route.id, val)}
                        disabled={assigning}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.filter((a) => a.status !== "offline").map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon-sm" onClick={() => setExpandedRoute(isExpanded ? null : route.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-1">
                      {route.stops.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No stops assigned to this route</p>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted-foreground/20" />
                          {route.stops.map((stop, idx) => {
                            const visit = getVisitForBooking(stop.bookingId)
                            return (
                              <div key={stop.bookingId} className="relative flex items-start gap-3 py-2">
                                <div className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 z-10 text-[10px] font-bold",
                                  stop.status === "visited"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                    : stop.status === "missed"
                                      ? "border-red-500 bg-red-50 text-red-600"
                                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                                )}>
                                  {stop.status === "visited" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                                   stop.status === "missed" ? <XCircle className="h-3.5 w-3.5" /> : idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                                      <span className="text-sm font-medium">{visit?.patientName || `Booking ${stop.bookingId}`}</span>
                                    </div>
                                    <Badge variant={
                                      stop.status === "visited" ? "success" :
                                      stop.status === "missed" ? "destructive" : "secondary"
                                    } className="text-[10px]">
                                      {stop.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 ml-5">
                                    <MapPin className="h-3 w-3" />
                                    {stop.address}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {route.stops.length > 0 && (
                        <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground border-t">
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{completedStops} completed</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" />{route.stops.length - completedStops} pending</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{getAgentName(route.agentId)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Route Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Routes</p>
              <p className="text-xl font-semibold">{routes.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Stops</p>
              <p className="text-xl font-semibold">{routes.reduce((s, r) => s + r.stops.length, 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Distance</p>
              <p className="text-xl font-semibold">{routes.reduce((s, r) => s + r.totalDistance, 0)} km</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Duration</p>
              <p className="text-xl font-semibold">
                {routes.reduce((s, r) => {
                  const [h, m] = r.estimatedEndTime.split(":").map(Number)
                  const [sh, sm] = r.startTime.split(":").map(Number)
                  return s + (h * 60 + m - sh * 60 - sm)
                }, 0)} min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
