"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { DepartmentDashboard, Sample } from "@/types"
import { getDepartmentDashboard, getSamplesExtended, getWorkloadMetrics } from "@/mock/services"
import { formatDate, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Building2,
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  TrendingUp,
  UserCheck,
} from "lucide-react"
import type { WorkloadMetrics } from "@/types"

const DEPARTMENTS = [
  "Biochemistry",
  "Hematology",
  "Microbiology",
  "Immunology",
  "Molecular Biology",
  "Histopathology",
  "Clinical Pathology",
]

export default function DepartmentDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDept, setSelectedDept] = useState("Biochemistry")
  const [dashboard, setDashboard] = useState<DepartmentDashboard | null>(null)
  const [workload, setWorkload] = useState<WorkloadMetrics | null>(null)
  const [pendingSamples, setPendingSamples] = useState<Sample[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Lab Ops", href: "/lab-ops" },
      { label: "Department Dashboard" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [deptData, sampleResult, metrics] = await Promise.all([
        getDepartmentDashboard(selectedDept),
        getSamplesExtended({ department: selectedDept }),
        getWorkloadMetrics(),
      ])
      setDashboard(deptData ?? null)
      setPendingSamples(sampleResult.data.filter((s) => s.status !== "approved" && s.status !== "delivered" && s.status !== "rejected" && s.status !== "disposed"))
      setWorkload(metrics.find((m) => m.department === selectedDept) ?? null)
    } catch {
      setError("Failed to load department data.")
    } finally {
      setLoading(false)
    }
  }, [selectedDept])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept)
    setLoading(true)
  }

  const groupedByPriority = useMemo(() => {
    const groups: Record<string, Sample[]> = {}
    pendingSamples.forEach((s) => {
      const key = s.priority || "routine"
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    return groups
  }, [pendingSamples])

  const priorityOrder = ["stat", "urgent", "today", "routine"]
  const priorityColors: Record<string, string> = {
    stat: "bg-destructive/10 text-destructive border-destructive/20",
    urgent: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    today: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300",
    routine: "bg-muted text-muted-foreground border-border/50",
  }

  if (loading && !dashboard) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Department Dashboard" description="Deep-dive into department performance" />
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Department Dashboard" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Department Dashboard"
        description="Deep-dive into department performance"
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedDept} onValueChange={handleDeptChange}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="mr-2 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        }
      />

      {dashboard && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<FlaskConical className="h-5 w-5" />} label="Tests Today" value={dashboard.testsToday} />
            <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={dashboard.pendingTests} />
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={dashboard.completedTests} />
            <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={dashboard.criticalCount} trend={dashboard.criticalCount > 0 ? { value: dashboard.criticalCount, positive: false } : undefined} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Turnaround Time</span>
                      <span className="font-semibold">{dashboard.avgTAT} min</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("transition-all", dashboard.avgTAT > 300 ? "bg-destructive" : dashboard.avgTAT > 180 ? "bg-amber-400" : "bg-emerald-500")}
                        style={{ width: `${Math.min((dashboard.avgTAT / 1440) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Staff Online</span>
                    </div>
                    <span className="font-semibold">{dashboard.staffOnline} / {dashboard.staffTotal}</span>
                  </div>

                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(dashboard.staffOnline / (dashboard.staffTotal || 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">
                      {dashboard.testsToday > 0
                        ? `${Math.round((dashboard.completedTests / dashboard.testsToday) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Pending Samples by Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSamples.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">No pending samples</div>
                ) : (
                  <div className="space-y-2">
                    {priorityOrder.map((priority) => {
                      const items = groupedByPriority[priority] || []
                      if (items.length === 0) return null
                      return (
                        <div key={priority} className="rounded-lg border p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize", priorityColors[priority])}>
                              {priority}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                          </div>
                          <div className="space-y-1">
                            {items.slice(0, 5).map((s) => (
                              <div key={s.id} className="flex items-center justify-between text-[11px]">
                                <span className="truncate max-w-[180px]">{s.patientName}</span>
                                <StatusBadge status={s.status} />
                              </div>
                            ))}
                            {items.length > 5 && (
                              <div className="text-[10px] text-muted-foreground text-center pt-1">
                                +{items.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {workload && workload.technicianLoad.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Technician Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workload.technicianLoad.map((tech, idx) => (
                    <div key={idx}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{tech.name}</span>
                        <span className="text-xs text-muted-foreground">{tech.assigned} assigned · {tech.completed} done · {tech.pending} pending</span>
                      </div>
                      <div className="flex h-4 w-full overflow-hidden rounded-md bg-muted">
                        <div className="bg-emerald-500 transition-all" style={{ width: `${(tech.completed / (workload.totalSamples || 1)) * 100}%` }} />
                        <div className="bg-amber-400 transition-all" style={{ width: `${(tech.pending / (workload.totalSamples || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                All Pending Samples
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSamples.length === 0 ? (
                <EmptyState icon={<CheckCircle2 className="h-8 w-8" />} title="All caught up" description="No pending samples in this department." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Patient</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Test</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Barcode</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Priority</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSamples.map((s) => (
                        <tr key={s.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-2 font-medium">{s.patientName}</td>
                          <td className="p-2 text-muted-foreground">{s.testName}</td>
                          <td className="p-2 font-mono text-xs text-muted-foreground">{s.barcode}</td>
                          <td className="p-2"><StatusBadge status={s.status} /></td>
                          <td className="p-2">
                            <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize", priorityColors[s.priority || "routine"])}>
                              {s.priority || "routine"}
                            </span>
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">{s.collectedAt ? formatDate(s.collectedAt, "datetime") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
