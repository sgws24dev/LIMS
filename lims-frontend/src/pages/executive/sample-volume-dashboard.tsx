"use client"

import { useState, useEffect, useMemo } from "react"
import { Beaker, TrendingUp, Calendar, Activity } from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getSampleVolumeTrend, getBranchPerformance } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface BranchRow {
  branch: string
  tests: number
  revenue: number
}

const branchColumns: ColumnDef<BranchRow>[] = [
  { id: "branch", header: "Branch", accessorKey: "branch", sortable: true },
  { id: "tests", header: "Tests", accessorKey: "tests", sortable: true },
  {
    id: "revenue", header: "Revenue", accessorKey: "revenue",
    cell: (row) => `₹${row.revenue.toLocaleString()}`,
    sortable: true,
  },
]

export default function SampleVolumeDashboard() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [volumeTrend, setVolumeTrend] = useState<{ month: string; total: number; routine: number; urgent: number; stat: number }[]>([])
  const [branchPerf, setBranchPerf] = useState<{ branch: string; revenue: number; tests: number }[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Volume" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [volumes, branches] = await Promise.all([
        getSampleVolumeTrend(),
        getBranchPerformance(),
      ])
      setVolumeTrend(volumes)
      setBranchPerf(branches)
    } catch {
      setError("Failed to load sample volume data")
      showToast({ type: "error", title: "Error", message: "Failed to load sample volume dashboard" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const mtdData = useMemo(() => volumeTrend.filter((v) => {
    const [y, m] = v.month.split("-")
    return y === "2026" && m === "06"
  }), [volumeTrend])

  const currentYearData = useMemo(() => volumeTrend.filter((v) => v.month.startsWith("2026")), [volumeTrend])
  const prevYearData = useMemo(() => volumeTrend.filter((v) => v.month.startsWith("2025")), [volumeTrend])

  const mtdTotal = mtdData.reduce((s, d) => s + d.total, 0)
  const dailyAvg = Math.round(mtdTotal / 30)
  const currentYearTotal = currentYearData.reduce((s, d) => s + d.total, 0)
  const prevYearTotal = prevYearData.reduce((s, d) => s + d.total, 0)
  const yoyGrowth = prevYearTotal > 0 ? Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100 * 10) / 10 : 0
  const peakDay = Math.max(...currentYearData.map((d) => d.total))
  const peakMonth = currentYearData.find((d) => d.total === peakDay)

  const volChartData = currentYearData.map((d) => ({
    label: d.month.split("-")[1],
    value: d.total,
  }))

  const deptPieData = [
    { label: "Biochemistry", value: 35 },
    { label: "Hematology", value: 25 },
    { label: "Microbiology", value: 18 },
    { label: "Immunology", value: 12 },
    { label: "Molecular", value: 7 },
    { label: "Histopathology", value: 3 },
  ]

  const categoryData = [
    { label: "Routine", value: volumeTrend.reduce((s, d) => s + d.routine, 0) },
    { label: "Urgent", value: volumeTrend.reduce((s, d) => s + d.urgent, 0) },
    { label: "Stat", value: volumeTrend.reduce((s, d) => s + d.stat, 0) },
  ]

  const branchData = branchPerf.map((b) => ({
    label: b.branch,
    value: b.tests,
  }))

  const prevData = prevYearData.map((d) => ({
    label: d.month.split("-")[1],
    value: d.total,
  }))

  return (
    <PageContainer
      title="Sample Volume Analytics"
      description="Track sample volumes, trends, and distribution"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Beaker className="h-5 w-5" />}
          label="Total Samples (MTD)"
          value={mtdTotal.toLocaleString()}
          trend={{ value: 8.5, positive: true }}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Daily Avg"
          value={dailyAvg.toLocaleString()}
          trend={{ value: 5.2, positive: true }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="YoY Growth"
          value={`${yoyGrowth}%`}
          trend={{ value: Math.abs(yoyGrowth), positive: yoyGrowth >= 0 }}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Peak Day"
          value={peakDay.toLocaleString()}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Volume Trend (2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={volChartData} type="bar" height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volume by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={deptPieData} type="pie" height={280} showLegend />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={branchColumns}
              data={branchPerf}
              pageSize={6}
              emptyMessage="No branch data available"
              exportable
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volume by Test Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={categoryData} type="horizontal-bar" height={180} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period Comparison (Current vs Previous Year)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">2026 (Current)</p>
              <ExecutiveChart data={volChartData} type="bar" height={200} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">2025 (Previous)</p>
              <ExecutiveChart data={prevData} type="bar" height={200} />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
