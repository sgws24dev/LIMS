"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Bell,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  FlaskConical,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getQCDashboard, getQCRecordsExtended, getWestgardViolations } from "@/mock/services"
import type { QCRecord } from "@/types"

const departments = ["Biochemistry", "Hematology", "Immunology", "Microbiology", "Coagulation"]

export default function QCDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<{
    totalTests: number; inControl: number; warnings: number; outOfControl: number; violations: number; openAlerts: number
  } | null>(null)
  const [records, setRecords] = useState<QCRecord[]>([])
  const [violations, setViolations] = useState<number>(0)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Dashboard" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [d, r, v] = await Promise.all([
          getQCDashboard(),
          getQCRecordsExtended({ limit: 10 }),
          getWestgardViolations(),
        ])
        setDashboard(d)
        setRecords(r)
        setViolations(v.length)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load QC data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const deptQC = useMemo(() => {
    return departments.map((dept) => {
      const deptRecords = records.filter((r) => r.testName.includes(dept) || records.some((rr) => rr.instrumentId))
      const inControl = deptRecords.filter((r) => r.result === "in_control").length
      const warning = deptRecords.filter((r) => r.result === "warning").length
      const ooc = deptRecords.filter((r) => r.result === "out_of_control" || r.result === "violation").length
      return { department: dept, total: deptRecords.length, inControl, warning, outOfControl: ooc }
    })
  }, [records])

  const sparklineData = useMemo(() => {
    const groups: Record<string, number[]> = {}
    records.forEach((r) => {
      const key = r.testName
      if (!groups[key]) groups[key] = []
      groups[key].push(r.value)
    })
    return Object.entries(groups).slice(0, 4)
  }, [records])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="QC Dashboard" description="Quality control overview and monitoring" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="QC Dashboard" description="Quality control overview and monitoring" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="QC Dashboard" description="Quality control overview and monitoring" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Tests in Control" value={dashboard?.inControl ?? 0} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Warnings" value={dashboard?.warnings ?? 0} />
        <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Out of Control" value={dashboard?.outOfControl ?? 0} />
        <StatCard icon={<ShieldAlert className="h-5 w-5" />} label="Violations" value={dashboard?.violations ?? 0} />
      </div>

      {dashboard && dashboard.openAlerts > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Bell className="h-4 w-4 shrink-0" />
          <span>{dashboard.openAlerts} open QC alert{dashboard.openAlerts !== 1 ? "s" : ""} require{dashboard.openAlerts === 1 ? "s" : ""} attention</span>
          <Badge variant="warning" className="ml-auto">{dashboard.openAlerts} open</Badge>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Department-wise QC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>In Control</TableHead>
                  <TableHead>Warning</TableHead>
                  <TableHead>Out of Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptQC.map((d) => (
                  <TableRow key={d.department}>
                    <TableCell className="font-medium">{d.department}</TableCell>
                    <TableCell>
                      <Badge variant="success">{d.inControl}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">{d.warning}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{d.outOfControl}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Levey-Jennings Sparklines</CardTitle>
            <CardDescription>Recent QC values for top tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sparklineData.length === 0 ? (
              <EmptyState title="No data" description="No QC records available" />
            ) : (
              sparklineData.map(([testName, values]) => {
                const max = Math.max(...values)
                const min = Math.min(...values)
                const range = max - min || 1
                return (
                  <div key={testName}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{testName}</span>
                      <span className="text-muted-foreground">{values.length} points</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8">
                      {values.map((val, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${((val - min) / range) * 100}%`,
                            backgroundColor: val > max - range * 0.2 ? "hsl(142, 76%, 36%)" :
                              val < min + range * 0.2 ? "hsl(0, 84%, 60%)" : "hsl(200, 98%, 39%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent QC Results</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState title="No records" description="No recent QC results" />
          ) : (
            <div className="divide-y rounded-md border">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{r.testName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.performedAt, "datetime")} by {r.performedBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{r.value}</span>
                    <Badge variant={
                      r.result === "in_control" ? "success" :
                      r.result === "warning" ? "warning" :
                      r.result === "violation" ? "destructive" :
                      "destructive"
                    }>
                      {r.result.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
