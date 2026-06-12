"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  AlertCircle,
  Activity,
  Clock,
  Phone,
  Stethoscope,
  CheckCircle2,
  Filter,
  ChevronDown,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, generateId } from "@/lib/utils"
import type { Result, ResultParameter } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { useAppStore } from "@/store/appStore"

interface CriticalAlert {
  id: string
  resultId: string
  patientName: string
  testName: string
  param: ResultParameter
  value: string
  referenceRange: string
  timestamp: string
  status: "new" | "acknowledged" | "resolved"
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  severity: "high" | "very_high" | "low" | "very_low"
}

const severityConfig = {
  very_high: { label: "Very High", badge: "destructive" as const, color: "text-red-600 bg-red-50 dark:bg-red-950/20" },
  high: { label: "High", badge: "destructive" as const, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20" },
  low: { label: "Low", badge: "warning" as const, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
  very_low: { label: "Very Low", badge: "warning" as const, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" },
}

const statusConfig = {
  new: { label: "New", variant: "destructive" as const },
  acknowledged: { label: "Acknowledged", variant: "warning" as const },
  resolved: { label: "Resolved", variant: "success" as const },
}

function evaluateSeverity(param: ResultParameter): CriticalAlert["severity"] {
  const numVal = parseFloat(param.value)
  if (isNaN(numVal)) return "high"

  const rangeStr = param.referenceRange
  if (rangeStr.includes(" - ")) {
    const parts = rangeStr.split(" - ")
    const lower = parseFloat(parts[0])
    const upper = parseFloat(parts[1])
    if (numVal > upper * 2) return "very_high"
    if (numVal > upper) return "high"
    if (numVal < lower * 0.5) return "very_low"
    if (numVal < lower) return "low"
  } else if (rangeStr.startsWith("< ")) {
    const upper = parseFloat(rangeStr.replace("< ", ""))
    if (numVal > upper * 2) return "very_high"
    if (numVal > upper) return "high"
  } else if (rangeStr.startsWith("> ")) {
    const lower = parseFloat(rangeStr.replace("> ", ""))
    if (numVal < lower * 0.5) return "very_low"
    if (numVal < lower) return "low"
  }
  return "high"
}

const mockAlerts: CriticalAlert[] = mockResults
  .filter((r) => r.isCritical)
  .flatMap((r) =>
    r.parameters
      .filter((p) => p.isCritical)
      .map((p, idx) => ({
        id: `AL-${r.id}-${idx}`,
        resultId: r.id,
        patientName: r.patientName,
        testName: r.testName,
        param: p,
        value: p.value,
        referenceRange: p.referenceRange,
        timestamp: r.enteredAt,
        status: (idx === 0 ? "new" : idx === 1 ? "acknowledged" : "resolved") as CriticalAlert["status"],
        acknowledgedBy: idx >= 1 ? "Dr. Priya Sharma" : undefined,
        acknowledgedAt: idx >= 1 ? "2026-06-03T11:30:00Z" : undefined,
        resolvedAt: idx >= 2 ? "2026-06-03T12:00:00Z" : undefined,
        severity: evaluateSeverity(p),
      }))
  )

export default function CriticalAlertsPage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [alerts, setAlerts] = useState<CriticalAlert[]>(mockAlerts)
  const [callDoctorAlert, setCallDoctorAlert] = useState<CriticalAlert | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Results", href: "/results" }, { label: "Critical Alerts" }])
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredAlerts = useMemo(
    () => (statusFilter === "all" ? alerts : alerts.filter((a) => a.status === statusFilter)),
    [alerts, statusFilter]
  )

  const stats = useMemo(() => {
    const active = alerts.filter((a) => a.status === "new").length
    const resolvedToday = alerts.filter(
      (a) => a.status === "resolved" && a.resolvedAt?.startsWith("2026-06-03")
    ).length
    return { active, resolvedToday, avgResponseTime: "12 min" }
  }, [alerts])

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: "acknowledged" as const, acknowledgedBy: "Current User", acknowledgedAt: new Date().toISOString() }
          : a
      )
    )
    toast({ title: "Alert acknowledged", variant: "success" })
  }

  const handleResolve = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: "resolved" as const, resolvedAt: new Date().toISOString() }
          : a
      )
    )
    toast({ title: "Alert resolved", variant: "success" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Critical Alerts" description="Monitor and manage critical value alerts" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Critical Alerts"
        description="Monitor and manage critical value alerts"
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Active Alerts"
          value={stats.active}
          trend={stats.active > 0 ? { value: stats.active, positive: false } : undefined}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Resolved Today"
          value={stats.resolvedToday}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Response Time"
          value={stats.avgResponseTime}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Alert Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-12 w-12" />}
              title="No alerts"
              description={statusFilter === "all" ? "No critical value alerts at this time." : `No ${statusFilter} alerts found.`}
            />
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const sev = severityConfig[alert.severity]
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      alert.status === "new" && "border-destructive/50 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className={cn("h-4 w-4", sev.color.split(" ")[0])} />
                          <span className="font-medium">{alert.patientName}</span>
                          <Badge variant={sev.badge}>{sev.label}</Badge>
                          <Badge variant={statusConfig[alert.status].variant}>
                            {statusConfig[alert.status].label}
                          </Badge>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Test</span>
                            <p className="text-sm">{alert.testName}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Parameter</span>
                            <p className="text-sm">{alert.param.parameterName}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Value</span>
                            <p className={cn("text-lg font-bold", sev.color.split(" ")[0])}>
                              {alert.value} {alert.param.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Reference Range</span>
                            <p className="text-sm">{alert.referenceRange}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(alert.timestamp, "datetime")}</span>
                          {alert.acknowledgedBy && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span>Acknowledged by {alert.acknowledgedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {alert.status !== "resolved" && (
                      <div className="mt-3 flex items-center gap-2 border-t pt-3">
                        {alert.status === "new" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              Acknowledge
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCallDoctorAlert(alert)}>
                              <Phone className="mr-1.5 h-3.5 w-3.5" />
                              Call Doctor
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleResolve(alert.id)}>
                              <Activity className="mr-1.5 h-3.5 w-3.5" />
                              Review
                            </Button>
                          </>
                        )}
                        {alert.status === "acknowledged" && (
                          <Button size="sm" onClick={() => handleResolve(alert.id)}>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!callDoctorAlert} onOpenChange={() => setCallDoctorAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Referring Physician
            </DialogTitle>
            <DialogDescription>
              Notify the doctor about the critical value for {callDoctorAlert?.patientName}
            </DialogDescription>
          </DialogHeader>
          {callDoctorAlert && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Dr. Amit Verma</span>
                    <Badge variant="secondary">Referring Physician</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Phone: +91 98765 43210</p>
                    <p>Email: dramit.verma@hospital.com</p>
                    <p>Hospital: City Medical Centre</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <p className="text-sm font-medium">Critical Value</p>
                <p className="mt-1 text-lg font-bold text-destructive">
                  {callDoctorAlert.param.parameterName}: {callDoctorAlert.value} {callDoctorAlert.param.unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reference Range: {callDoctorAlert.referenceRange}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCallDoctorAlert(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCallDoctorAlert(null)
                handleAcknowledge(callDoctorAlert!.id)
                toast({ title: "Doctor notified", description: "Critical value has been communicated to Dr. Amit Verma.", variant: "warning" })
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Confirm Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
