"use client"

import { useState, useEffect, useMemo } from "react"
import {
  MapPin,
  Clock,
  Navigation,
  Bike,
  Car,
  Phone,
  Star,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getAgents, getHCVisits } from "@/mock/services"
import type { Agent, HCVisit } from "@/types"

const statusConfig: Record<string, { label: string; dot: string; badge: "success" | "warning" | "info" | "secondary" | "destructive" }> = {
  available: { label: "Available", dot: "bg-emerald-500", badge: "success" },
  on_route: { label: "On Route", dot: "bg-amber-500", badge: "warning" },
  on_site: { label: "On Site", dot: "bg-blue-500", badge: "info" },
  break: { label: "On Break", dot: "bg-gray-400", badge: "secondary" },
  offline: { label: "Offline", dot: "bg-red-500", badge: "destructive" },
}

const vehicleIcon: Record<string, typeof Bike | typeof Car> = {
  bike: Bike,
  car: Car,
  van: Car,
}

export default function GPSTrackingPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [visits, setVisits] = useState<HCVisit[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "GPS Tracking" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [a, v] = await Promise.all([getAgents(), getHCVisits()])
      setAgents(a)
      setVisits(v)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tracking data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const agentVisits = useMemo(() => {
    if (!selectedAgent) return []
    return visits.filter((v) => v.agentId === selectedAgent.id)
  }, [visits, selectedAgent])

  const activeAgents = useMemo(() => agents.filter((a) => a.status !== "offline"), [agents])

  const getTimeSince = (timestamp?: string): string => {
    if (!timestamp) return "N/A"
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="GPS Tracking"
          description="Real-time GPS tracking of home collection agents"
          actions={
            <Button variant="outline" size="sm" disabled><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          }
        />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="GPS Tracking" description="Real-time GPS tracking of home collection agents" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS Tracking"
        description="Real-time GPS tracking of home collection agents"
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-medium text-muted-foreground">Active Agents ({activeAgents.length})</h3>
          {activeAgents.length === 0 ? (
            <EmptyState title="No active agents" description="All agents are currently offline" />
          ) : (
            activeAgents.map((agent) => {
              const cfg = statusConfig[agent.status] || statusConfig.offline
              const VehicleIcon = vehicleIcon[agent.vehicleType] || Bike
              return (
                <div
                  key={agent.id}
                  className={cn(
                    "rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent/50",
                    selectedAgent?.id === agent.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <VehicleIcon className="h-3 w-3" />
                        <span>{agent.vehicleNumber}</span>
                        <span>&middot;</span>
                        <Badge variant={cfg.badge} className="text-[10px] px-1 py-0">{cfg.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{agent.currentLatitude?.toFixed(4)}, {agent.currentLongitude?.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{getTimeSince(agent.agentId ? undefined : undefined)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Map View</CardTitle>
              <CardDescription>GPS positions are approximated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 overflow-hidden rounded-lg border bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-gray-950/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground/60 font-medium">GPS Map View</p>
                    <p className="text-xs text-muted-foreground/40">Live tracking with route visualization</p>
                  </div>
                </div>
                {activeAgents.map((agent, i) => {
                  const VehicleIcon = vehicleIcon[agent.vehicleType] || Bike
                  const positions = [
                    { top: "15%", left: "20%" },
                    { top: "25%", left: "65%" },
                    { top: "50%", left: "30%" },
                    { top: "60%", left: "75%" },
                    { top: "35%", left: "80%" },
                    { top: "70%", left: "40%" },
                    { top: "45%", left: "50%" },
                    { top: "80%", left: "60%" },
                    { top: "20%", left: "45%" },
                  ]
                  const pos = positions[i % positions.length]
                  return (
                    <div
                      key={agent.id}
                      className="absolute z-10 flex flex-col items-center cursor-pointer"
                      style={{ top: pos.top, left: pos.left }}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="relative">
                        {agent.status === "on_route" && (
                          <div className="absolute -inset-2 animate-ping rounded-full bg-amber-400/30" />
                        )}
                        <div className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full shadow-lg border-2 border-white",
                          agent.status === "available" ? "bg-emerald-500" :
                          agent.status === "on_route" ? "bg-amber-500" :
                          agent.status === "on_site" ? "bg-blue-500" :
                          "bg-gray-400"
                        )}>
                          <VehicleIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <span className="mt-1 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur">
                        {agent.name} ({agent.todayCompleted})
                      </span>
                    </div>
                  )
                })}
                <div className="absolute bottom-3 left-3 rounded-lg bg-background/90 p-2 text-xs shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {activeAgents.length} agents live
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedAgent && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedAgent.name}
                    <Badge variant={statusConfig[selectedAgent.status]?.badge || "secondary"}>
                      {selectedAgent.status.replace(/_/g, " ")}
                    </Badge>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />{selectedAgent.rating}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p>{selectedAgent.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p>{selectedAgent.vehicleType} - {selectedAgent.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed Today</p>
                    <p className="font-semibold">{selectedAgent.todayCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Today</p>
                    <p className="font-semibold">{selectedAgent.todayAssigned}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Stops</p>
                  {agentVisits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No visits assigned</p>
                  ) : (
                    <div className="space-y-1">
                      {agentVisits.map((v) => (
                        <div key={v.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              v.status === "completed" ? "bg-emerald-500" :
                              v.status === "missed" ? "bg-red-500" :
                              v.status === "en_route" ? "bg-amber-500" :
                              v.status === "arrived" ? "bg-blue-500" : "bg-gray-400"
                            )} />
                            <span className="font-medium">{v.patientName}</span>
                            <span className="text-muted-foreground">{v.patientAddress.slice(0, 30)}...</span>
                          </div>
                          <Badge variant={
                            v.status === "completed" ? "success" :
                            v.status === "missed" ? "destructive" :
                            v.status === "en_route" ? "warning" : "secondary"
                          } className="text-[10px]">
                            {v.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
