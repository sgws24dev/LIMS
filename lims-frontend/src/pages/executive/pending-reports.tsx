"use client"

import { useState, useEffect, useMemo } from "react"
import { FileText, AlertTriangle, Clock, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getPendingReports } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface PendingReportData {
  totalPending: number
  withinTAT: number
  exceededTAT: number
  byDepartment: { department: string; pending: number; exceededTAT: number }[]
  byPriority: { priority: string; count: number; avgDelayMinutes: number }[]
  oldestPending: { testName: string; patientName: string; bookedAt: string; elapsedHours: number; department: string }[]
}

export default function PendingReportsPage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useState<PendingReportData | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Pending Reports" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPendingReports()
      setReports(result)
    } catch {
      setError("Failed to load pending report data")
      showToast({ type: "error", title: "Error", message: "Failed to load pending reports" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const overduePct = reports
    ? Math.round((reports.exceededTAT / Math.max(1, reports.totalPending)) * 100)
    : 0

  const avgDelay = reports
    ? Math.round(reports.oldestPending.reduce((s, r) => s + r.elapsedHours, 0) / Math.max(1, reports.oldestPending.length))
    : 0

  const deptChartData = reports?.byDepartment.map((d) => ({
    label: d.department,
    value: d.pending,
    secondary: d.exceededTAT,
  })) ?? []

  const priorityChartData = reports?.byPriority.map((p) => ({
    label: p.priority,
    value: p.count,
  })) ?? []

  const estCompletion = reports?.byDepartment.map((d) => ({
    label: d.department,
    value: d.pending * 2.5,
  })) ?? []

  const handleEscalate = () => {
    showToast({ type: "success", title: "Escalated", message: "Overdue reports have been escalated" })
  }

  return (
    <PageContainer
      title="Pending Reports Overview"
      description="Monitor pending, overdue, and delayed reports across departments"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending Total"
          value={reports?.totalPending ?? 0}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Overdue"
          value={reports?.exceededTAT ?? 0}
          trend={{ value: overduePct, positive: overduePct < 20 }}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="By Department"
          value={reports?.byDepartment.length ?? 0}
        />
        <StatCard
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Avg Delay (hrs)"
          value={avgDelay}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={deptChartData} type="bar" height={260} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={priorityChartData} type="pie" height={260} showLegend />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oldest Pending Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {(!reports || reports.oldestPending.length === 0) ? (
            <p className="text-sm text-muted-foreground">No pending reports</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Test Name</th>
                    <th className="pb-2 pr-4 font-medium">Patient</th>
                    <th className="pb-2 pr-4 font-medium">Department</th>
                    <th className="pb-2 pr-4 font-medium">Elapsed (hrs)</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.oldestPending.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{r.testName}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{r.patientName}</td>
                      <td className="py-2.5 pr-4">{r.department}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={r.elapsedHours > 72 ? "destructive" : r.elapsedHours > 48 ? "warning" : "default"}>
                          {r.elapsedHours}h
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <Button variant="ghost" size="sm" onClick={handleEscalate}>
                          Escalate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Completion Time per Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ExecutiveChart data={estCompletion} type="horizontal-bar" height={220} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
