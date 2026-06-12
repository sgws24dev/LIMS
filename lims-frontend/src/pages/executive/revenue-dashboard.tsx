"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Banknote, TrendingUp, TrendingDown, Users, Download, BarChart3,
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getRevenueTrendExtended, getBranchPerformance } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ExecutiveChart } from "@/components/shared/executive-chart"
import type { ColumnDef as ColDef } from "@/components/ui/data-table"

type PeriodType = "monthly" | "quarterly" | "yearly"

interface BranchRow {
  branch: string
  revenue: number
  tests: number
}

const branchColumns: ColDef<BranchRow>[] = [
  { id: "branch", header: "Branch", accessorKey: "branch", sortable: true },
  {
    id: "revenue", header: "Revenue", accessorKey: "revenue",
    cell: (row) => formatCurrency(row.revenue),
    sortable: true,
  },
  { id: "tests", header: "Tests", accessorKey: "tests", sortable: true },
  {
    id: "bar", header: "Trend", accessorKey: "revenue",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-full max-w-[120px] rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${Math.min(100, (row.revenue / 2000000) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{formatCurrency(row.revenue)}</span>
      </div>
    ),
  },
]

interface DoctorRow {
  doctor: string
  count: number
  revenue: number
}

const doctorColumns: ColDef<DoctorRow>[] = [
  { id: "doctor", header: "Doctor", accessorKey: "doctor", sortable: true },
  { id: "count", header: "Referrals", accessorKey: "count", sortable: true },
  {
    id: "revenue", header: "Revenue", accessorKey: "revenue",
    cell: (row) => formatCurrency(row.revenue),
    sortable: true,
  },
]

export default function RevenueDashboard() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [period, setPeriod] = useState<PeriodType>("monthly")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revTrend, setRevTrend] = useState<{ month: string; amount: number }[]>([])
  const [branchPerf, setBranchPerf] = useState<{ branch: string; revenue: number; tests: number }[]>([])
  const [doctorRef, setDoctorRef] = useState<{ doctor: string; count: number; revenue: number }[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Revenue" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [trend, branch, doctor] = await Promise.all([
        getRevenueTrendExtended(),
        getBranchPerformance(),
        (await import("@/mock/services")).getDoctorReferrals(),
      ])
      setRevTrend(trend)
      setBranchPerf(branch)
      setDoctorRef(
        doctor.slice(0, 10).map((d) => ({ doctor: d.doctor, count: d.count, revenue: d.revenue }))
      )
    } catch {
      setError("Failed to load revenue data")
      showToast({ type: "error", title: "Error", message: "Failed to load revenue dashboard" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const aggregatedData = useMemo(() => {
    if (period === "monthly") return revTrend
    if (period === "quarterly") {
      const qMap: Record<string, number> = {}
      revTrend.forEach((r) => {
        const [y, m] = r.month.split("-")
        const q = Math.ceil(Number(m) / 3)
        const key = `${y}-Q${q}`
        qMap[key] = (qMap[key] ?? 0) + r.amount
      })
      return Object.entries(qMap).map(([month, amount]) => ({ month, amount }))
    }
    const yMap: Record<string, number> = {}
    revTrend.forEach((r) => {
      const year = r.month.split("-")[0]
      yMap[year] = (yMap[year] ?? 0) + r.amount
    })
    return Object.entries(yMap).map(([month, amount]) => ({ month, amount }))
  }, [revTrend, period])

  const ytdRevenue = revTrend
    .filter((r) => {
      const [y] = r.month.split("-")
      return y === "2026"
    })
    .reduce((s, r) => s + r.amount, 0)

  const latestMonth = revTrend[revTrend.length - 1]
  const prevMonth = revTrend[revTrend.length - 2]
  const mrr = latestMonth?.amount ?? 0
  const revenueGrowth =
    prevMonth && prevMonth.amount > 0
      ? Math.round(((mrr - prevMonth.amount) / prevMonth.amount) * 100 * 10) / 10
      : 0

  const avgPerPatient =
    doctorRef.reduce((s, d) => s + d.revenue, 0) /
    Math.max(1, doctorRef.reduce((s, d) => s + d.count, 0))

  const chartData = aggregatedData.map((d) => ({
    label: d.month,
    value: d.amount,
  }))

  const deptData = branchPerf.map((b) => ({
    label: b.branch,
    value: b.revenue,
  }))

  const doctorChartData = doctorRef.slice(0, 10).map((d) => ({
    label: d.doctor.replace("Dr. ", ""),
    value: d.revenue,
  }))

  const handleDownload = () => {
    showToast({ type: "success", title: "Download started", message: "Revenue report will be downloaded shortly" })
  }

  return (
    <PageContainer
      title="Revenue Dashboard"
      description="Revenue analytics and performance metrics"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            Report
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total Revenue (YTD)"
          value={formatCurrency(ytdRevenue)}
          trend={{ value: 15.2, positive: true }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Monthly Revenue"
          value={formatCurrency(mrr)}
          trend={{ value: revenueGrowth, positive: revenueGrowth >= 0 }}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Avg Revenue/Patient"
          value={formatCurrency(Math.round(avgPerPatient))}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Revenue Growth %"
          value={`${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}%`}
          trend={{ value: Math.abs(revenueGrowth), positive: revenueGrowth >= 0 }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={chartData} type="bar" height={280} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={deptData} type="horizontal-bar" height={260} formatValue={formatCurrency} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Branch</CardTitle>
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
            <CardTitle>Revenue by Doctor Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={doctorColumns}
              data={doctorRef}
              pageSize={8}
              emptyMessage="No referral data available"
              exportable
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
