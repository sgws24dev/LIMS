"use client"

import { useState, useEffect, useMemo } from "react"
import {
  User,
  Bike,
  Car,
  Phone,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
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
import { Progress } from "@/components/ui/progress"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { getAgents, getHCVisits, assignAgent } from "@/mock/services"
import type { Agent, HCVisit } from "@/types"

const statusVariant: Record<string, "success" | "warning" | "info" | "secondary" | "destructive"> = {
  available: "success",
  on_route: "warning",
  on_site: "info",
  break: "secondary",
  offline: "destructive",
}

const vehicleIcon: Record<string, typeof Bike | typeof Car> = {
  bike: Bike,
  car: Car,
  van: Car,
}

export default function AgentAssignmentPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [unassignedVisits, setUnassignedVisits] = useState<HCVisit[]>([])
  const [assigningMap, setAssigningMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "Agents" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [a, v] = await Promise.all([
          getAgents(),
          getHCVisits(),
        ])
        setAgents(a)
        setUnassignedVisits(v.filter((vi) => !vi.agentId || vi.status === "scheduled"))
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAssign = async (visitId: string, agentId: string) => {
    if (!agentId) return
    setAssigningMap((prev) => ({ ...prev, [visitId]: true }))
    try {
      await assignAgent(visitId, agentId)
      const agent = agents.find((a) => a.id === agentId)
      toast({
        title: "Agent Assigned",
        description: `${agent?.name ?? "Agent"} assigned to visit`,
        variant: "success",
      })
      const [updatedAgents, updatedVisits] = await Promise.all([getAgents(), getHCVisits()])
      setAgents(updatedAgents)
      setUnassignedVisits(updatedVisits.filter((vi) => !vi.agentId || vi.status === "scheduled"))
    } catch (e) {
      toast({
        title: "Assignment Failed",
        description: e instanceof Error ? e.message : "Failed to assign agent",
        variant: "destructive",
      })
    } finally {
      setAssigningMap((prev) => ({ ...prev, [visitId]: false }))
    }
  }

  const availableAgents = useMemo(() => agents.filter((a) => a.status !== "offline"), [agents])

  const workloadPercent = (agent: Agent) => {
    if (agent.todayAssigned === 0) return 0
    return Math.round((agent.todayCompleted / agent.todayAssigned) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Agent Assignment" description="Assign home collection agents to bookings" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Agent Assignment" description="Assign home collection agents to bookings" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Assignment"
        description="Assign home collection agents to bookings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Available Agents ({availableAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableAgents.length === 0 ? (
              <EmptyState title="No agents available" description="All agents are currently offline" />
            ) : (
              availableAgents.map((agent) => {
                const VehicleIcon = vehicleIcon[agent.vehicleType] || Bike
                return (
                  <div key={agent.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
                          agent.status === "available" ? "bg-emerald-100 text-emerald-600" :
                          agent.status === "on_route" ? "bg-amber-100 text-amber-600" :
                          agent.status === "on_site" ? "bg-blue-100 text-blue-600" :
                          agent.status === "break" ? "bg-gray-100 text-gray-600" :
                          "bg-red-100 text-red-600"
                        )}>
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <VehicleIcon className="h-3 w-3" />
                            {agent.vehicleType}
                            <span>&middot;</span>
                            <Phone className="h-3 w-3" />
                            {agent.phone}
                          </div>
                        </div>
                      </div>
                      <Badge variant={statusVariant[agent.status] || "secondary"}>
                        {agent.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{agent.todayCompleted} done</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{agent.todayAssigned} assigned</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{agent.rating}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Workload</span>
                        <span>{workloadPercent(agent)}%</span>
                      </div>
                      <Progress value={workloadPercent(agent)} className="h-1.5" />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Unassigned Visits ({unassignedVisits.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unassignedVisits.length === 0 ? (
              <EmptyState title="No unassigned visits" description="All visits have been assigned to agents" />
            ) : (
              unassignedVisits.map((visit) => (
                <div key={visit.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{visit.patientName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {visit.patientAddress}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {visit.patientPhone}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Select
                      onValueChange={(val) => handleAssign(visit.id, val)}
                      disabled={assigningMap[visit.id]}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Assign agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} ({a.todayCompleted}/{a.todayAssigned})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assigningMap[visit.id] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
