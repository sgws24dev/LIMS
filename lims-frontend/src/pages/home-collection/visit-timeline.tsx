"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Navigation,
  Syringe,
  XCircle,
  Home,
  Camera,
  IndianRupee,
  Calendar,
  Loader2,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getHCVisits, getAgents, updateVisitStatus } from "@/mock/services"
import type { HCVisit, Agent } from "@/types"

const timelineSteps = [
  { key: "scheduled" as const, label: "Scheduled", icon: Calendar },
  { key: "en_route" as const, label: "En Route", icon: Navigation },
  { key: "arrived" as const, label: "Arrived", icon: Home },
  { key: "in_progress" as const, label: "In Progress", icon: Syringe },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2 },
]

const statusOrder: Record<string, number> = {
  scheduled: 0,
  en_route: 1,
  arrived: 2,
  in_progress: 3,
  completed: 4,
  missed: -1,
  cancelled: -1,
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

export default function VisitTimelinePage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visits, setVisits] = useState<HCVisit[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string>("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "Visit Timeline" },
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
        if (v.length > 0) setSelectedVisitId(v[0].id)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load visits")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedVisit = useMemo(() => visits.find((v) => v.id === selectedVisitId), [visits, selectedVisitId])
  const agentName = useMemo(() => agents.find((a) => a.id === selectedVisit?.agentId)?.name ?? "Unknown", [agents, selectedVisit])

  const progressIndex = selectedVisit ? (statusOrder[selectedVisit.status] ?? -1) : -1

  const timeline = useMemo(() => {
    if (!selectedVisit) return []
    const steps = timelineSteps.map((step, i) => ({
      ...step,
      isActive: i <= progressIndex,
      isCurrent: i === progressIndex,
      time: i === 0 ? selectedVisit.scheduledTime :
            i === 1 && selectedVisit.actualDeparture ? selectedVisit.scheduledTime :
            i === 2 ? selectedVisit.actualArrival :
            i === 3 ? selectedVisit.actualArrival :
            i === 4 ? selectedVisit.actualDeparture : undefined,
      notes: i === 4 ? selectedVisit.notes : undefined,
    }))
    return steps
  }, [selectedVisit, progressIndex])

  const handleAdvanceStatus = async () => {
    if (!selectedVisit) return
    const nextStatus = timelineSteps[progressIndex + 1]
    if (!nextStatus) return
    setActionLoading(true)
    try {
      await updateVisitStatus(selectedVisit.id, nextStatus.key)
      const updated = await getHCVisits()
      setVisits(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Visit Timeline" description="View home collection visit history and timeline" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error && !selectedVisit) {
    return (
      <div className="space-y-6">
        <PageHeader title="Visit Timeline" description="View home collection visit history and timeline" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visit Timeline"
        description="View home collection visit history and timeline"
      />

      <div className="flex items-center gap-3">
        <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select a visit" />
          </SelectTrigger>
          <SelectContent>
            {visits.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.patientName} - {formatDate(v.scheduledTime, "short")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedVisit ? (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="No visit selected"
          description="Select a visit to view its timeline"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedVisit.patientName}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right max-w-[200px]">{selectedVisit.patientAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{selectedVisit.patientPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Agent</span>
                  <span>{agentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusBadgeVariant[selectedVisit.status] || "secondary"}>
                    {selectedVisit.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{formatDate(selectedVisit.scheduledTime, "datetime")}</span>
                </div>
                {selectedVisit.actualArrival && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Arrived</span>
                    <span>{formatDate(selectedVisit.actualArrival, "datetime")}</span>
                  </div>
                )}
                {selectedVisit.actualDeparture && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Departed</span>
                    <span>{formatDate(selectedVisit.actualDeparture, "datetime")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Collection Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Samples Collected</span>
                  <span className="font-semibold">{selectedVisit.samplesCollected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Payment</span>
                  <span className={cn("font-semibold", selectedVisit.paymentCollected > 0 ? "text-emerald-600" : "text-muted-foreground")}>
                    {selectedVisit.paymentCollected > 0 ? `₹${selectedVisit.paymentCollected}` : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Camera className="h-3 w-3" /> Photos</span>
                  <Badge variant="outline" className="text-xs">View (3)</Badge>
                </div>
              </CardContent>
            </Card>

            {progressIndex >= 0 && progressIndex < 4 && (
              <Button className="w-full" onClick={handleAdvanceStatus} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Advance to {timelineSteps[progressIndex + 1]?.label}
              </Button>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Visit Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-0">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted-foreground/20" />
                  {timeline.map((step, idx) => {
                    const Icon = step.icon
                    return (
                      <div key={step.key} className="relative pb-8 last:pb-0">
                        <div className={cn(
                          "absolute -left-6 flex h-7 w-7 items-center justify-center rounded-full border-2 z-10",
                          step.isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/20 bg-background text-muted-foreground"
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className={cn(
                          "rounded-lg border p-3 ml-2",
                          step.isCurrent && "ring-2 ring-primary/20 border-primary/30"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-sm font-medium",
                              step.isActive ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </span>
                            {step.time && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(step.time, "datetime")}
                              </span>
                            )}
                          </div>
                          {step.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
