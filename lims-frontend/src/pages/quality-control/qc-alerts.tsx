"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const severityConfig: Record<string, { label: string; dot: string; badge: "destructive" | "warning" | "info" | "default" }> = {
  critical: { label: "Critical", dot: "bg-red-500", badge: "destructive" },
  high: { label: "High", dot: "bg-orange-500", badge: "warning" },
  medium: { label: "Medium", dot: "bg-amber-500", badge: "default" },
  low: { label: "Low", dot: "bg-blue-500", badge: "info" },
}

interface QCAlertItem {
  id: string
  testName: string
  rule: string
  severity: string
  description: string
  detectedAt: string
  status: string
  assignedTo: string
  resolvedAt?: string
}

const mockAlerts: QCAlertItem[] = [
  { id: "QCA001", testName: "Sodium", rule: "10x", severity: "critical", description: "Systematic bias detected on ISE module - sodium readings consistently below mean for 10 runs", detectedAt: "2026-06-09T06:30:00Z", status: "open", assignedTo: "Ananya Gupta" },
  { id: "QCA002", testName: "ALT (SGPT)", rule: "1-3s", severity: "high", description: "ALT value exceeded 3SD limit - random error suspected", detectedAt: "2026-06-05T07:00:00Z", status: "resolved", assignedTo: "Ananya Gupta", resolvedAt: "2026-06-05T09:00:00Z" },
  { id: "QCA003", testName: "PT/INR", rule: "1-3s", severity: "critical", description: "PT/INR out of control - instrument cooling system issue affecting results", detectedAt: "2026-06-09T08:00:00Z", status: "open", assignedTo: "Manoj Tiwari" },
  { id: "QCA004", testName: "Creatinine", rule: "2-2s", severity: "high", description: "Two consecutive creatinine QC failures - reagent degradation suspected", detectedAt: "2026-06-06T07:30:00Z", status: "resolved", assignedTo: "Ananya Gupta", resolvedAt: "2026-06-06T09:00:00Z" },
  { id: "QCA005", testName: "HbA1c", rule: "4-1s", severity: "medium", description: "Four consecutive HbA1c QC values on same side of mean - column degradation", detectedAt: "2026-06-06T06:00:00Z", status: "resolved", assignedTo: "Rohan Deshmukh", resolvedAt: "2026-06-06T08:00:00Z" },
  { id: "QCA006", testName: "Glucose (FBS)", rule: "1-2s", severity: "low", description: "Glucose QC at 2SD warning limit - routine monitoring", detectedAt: "2026-06-05T06:00:00Z", status: "resolved", assignedTo: "Ananya Gupta", resolvedAt: "2026-06-05T06:30:00Z" },
  { id: "QCA007", testName: "Hemoglobin", rule: "R-4s", severity: "medium", description: "Range between two QC levels exceeded 4SD - potential calibrator issue", detectedAt: "2026-06-05T08:00:00Z", status: "resolved", assignedTo: "Rohan Deshmukh", resolvedAt: "2026-06-05T08:30:00Z" },
  { id: "QCA008", testName: "Hemoglobin", rule: "Trend", severity: "medium", description: "Hemoglobin trending downward - possible calibrator degradation", detectedAt: "2026-06-08T08:00:00Z", status: "open", assignedTo: "Rohan Deshmukh" },
]

export default function QCAlertsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<QCAlertItem[]>([])
  const [tab, setTab] = useState("open")
  const [resolveLoading, setResolveLoading] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Alerts" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        await new Promise((r) => setTimeout(r, 300))
        setAlerts(mockAlerts)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load alerts")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredAlerts = useMemo(() => {
    if (tab === "open") return alerts.filter((a) => a.status === "open")
    if (tab === "resolved") return alerts.filter((a) => a.status === "resolved")
    return alerts
  }, [alerts, tab])

  const handleResolve = async (alertId: string) => {
    setResolveLoading(alertId)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "resolved", resolvedAt: new Date().toISOString() } : a
        )
      )
      toast({ title: "Alert Resolved", variant: "success" })
    } catch {
      toast({ title: "Failed to resolve", variant: "destructive" })
    } finally {
      setResolveLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="QC Alerts" description="Quality control alerts center" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="QC Alerts" description="Quality control alerts center" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="QC Alerts" description="Quality control alerts center" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({alerts.filter((a) => a.status === "open").length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({alerts.filter((a) => a.status === "resolved").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filteredAlerts.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-12 w-12" />}
              title="No alerts"
              description={tab === "open" ? "No open alerts" : "No resolved alerts"}
            />
          ) : (
            <div className="space-y-2">
              {filteredAlerts.map((alert) => {
                const sev = severityConfig[alert.severity] || severityConfig.low
                return (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className={cn("mt-1 h-3 w-3 rounded-full shrink-0", sev.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{alert.testName}</span>
                              <Badge variant="outline" className="text-xs">{alert.rule}</Badge>
                              <Badge variant={sev.badge} className="text-[10px]">{sev.label}</Badge>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {alert.status === "open" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolve(alert.id)}
                                  disabled={resolveLoading === alert.id}
                                >
                                  {resolveLoading === alert.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  Resolve
                                </Button>
                              )}
                              {alert.status === "resolved" && (
                                <Badge variant="success" className="text-[10px]">Resolved</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(alert.detectedAt, "datetime")}</span>
                            <span>Assigned: {alert.assignedTo}</span>
                            {alert.resolvedAt && <span>Resolved: {formatDate(alert.resolvedAt, "datetime")}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
