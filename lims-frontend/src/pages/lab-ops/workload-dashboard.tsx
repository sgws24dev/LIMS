"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { WorkloadMetrics } from "@/types"
import { getWorkloadMetrics } from "@/mock/services"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  BarChart3,
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react"

const departmentIcons: Record<string, string> = {
  Biochemistry: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Hematology: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  Microbiology: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Immunology: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Molecular Biology": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  Histopathology: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Clinical Pathology": "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
}

export default function WorkloadDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<WorkloadMetrics[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Lab Ops", href: "/lab-ops" },
      { label: "Workload Dashboard" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWorkloadMetrics()
      setMetrics(data)
    } catch {
      setError("Failed to load workload data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totals = useMemo(() => {
    let total = 0, pending = 0, completed = 0, critical = 0
    metrics.forEach((m) => {
      total += m.totalSamples
      pending += m.pendingSamples
      completed += m.completedSamples
      critical += m.criticalSamples
    })
    return { total, pending, completed, critical }
  }, [metrics])

  const avgTAT = useMemo(() => {
    if (metrics.length === 0) return 0
    return Math.round(metrics.reduce((s, m) => s + m.avgTurnaroundMinutes, 0) / metrics.length)
  }, [metrics])

  const maxLoad = useMemo(() => {
    let max = 0
    metrics.forEach((m) => m.technicianLoad.forEach((t) => { if (t.assigned > max) max = t.assigned }))
    return max || 1
  }, [metrics])

  const allTechnicians = useMemo(() => {
    const techs: { name: string; dept: string; assigned: number; completed: number; pending: number }[] = []
    metrics.forEach((m) => m.technicianLoad.forEach((t) => techs.push({ ...t, dept: m.department })))
    return techs
  }, [metrics])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Workload Dashboard" description="Department and technician workload overview" />
        <LoadingState count={6} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Workload Dashboard" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  if (metrics.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Workload Dashboard" description="Department and technician workload overview" />
        <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No workload data" description="No metrics available at this time." />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Workload Dashboard"
        description="Department and technician workload overview"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Activity className="h-5 w-5" />} label="Total Samples" value={totals.total} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={totals.pending} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={totals.completed} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={totals.critical} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Avg TAT" value={`${avgTAT}m`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((dept) => (
          <Card key={dept.department}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold", departmentIcons[dept.department] || "bg-muted text-muted-foreground")}>
                  {dept.department[0]}
                </div>
                {dept.department}
                {dept.criticalSamples > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">{dept.criticalSamples} critical</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[11px] text-muted-foreground">Total</span>
                  <p className="font-semibold">{dept.totalSamples}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Pending</span>
                  <p className="font-semibold">{dept.pendingSamples}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Completed</span>
                  <p className="font-semibold">{dept.completedSamples}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Avg TAT</span>
                  <p className="font-semibold">{dept.avgTurnaroundMinutes}m</p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Pending vs Completed</span>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  {dept.completedSamples > 0 && (
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(dept.completedSamples / dept.totalSamples) * 100}%` }}
                    />
                  )}
                  {dept.pendingSamples > 0 && (
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${(dept.pendingSamples / dept.totalSamples) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed {Math.round((dept.completedSamples / dept.totalSamples) * 100)}%</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Pending {Math.round((dept.pendingSamples / dept.totalSamples) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Technician Load Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allTechnicians.map((tech, idx) => (
              <div key={`${tech.name}-${idx}`}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tech.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{tech.dept}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Assigned: {tech.assigned}</span>
                    <span>Completed: {tech.completed}</span>
                    <span>Pending: {tech.pending}</span>
                  </div>
                </div>
                <div className="flex h-5 w-full overflow-hidden rounded-md bg-muted">
                  <div
                    className="bg-emerald-500 transition-all flex items-center justify-center text-[9px] font-medium text-white"
                    style={{ width: `${(tech.completed / (maxLoad || 1)) * 100}%`, minWidth: tech.completed > 0 ? "24px" : "0" }}
                  >
                    {tech.completed > 2 ? tech.completed : ""}
                  </div>
                  <div
                    className="bg-amber-400 transition-all flex items-center justify-center text-[9px] font-medium text-white"
                    style={{ width: `${(tech.pending / (maxLoad || 1)) * 100}%`, minWidth: tech.pending > 0 ? "24px" : "0" }}
                  >
                    {tech.pending > 2 ? tech.pending : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
