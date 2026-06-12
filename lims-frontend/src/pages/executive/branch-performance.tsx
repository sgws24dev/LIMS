"use client"

import { useState, useEffect, useMemo } from "react"
import { Building2, Beaker, TrendingUp, Zap } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getBranchPerformanceExtended } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface BranchPerf {
  branch: string
  tests: number
  revenue: number
  growth: number
  target: number
  achievement: number
}

export default function BranchPerformancePage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BranchPerf[]>([])
  const [selectedBranch, setSelectedBranch] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Branch Performance" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getBranchPerformanceExtended()
      setData(result)
    } catch {
      setError("Failed to load branch data")
      showToast({ type: "error", title: "Error", message: "Failed to load branch performance" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    if (selectedBranch === "all") return data
    return data.filter((b) => b.branch === selectedBranch)
  }, [data, selectedBranch])

  const ranked = useMemo(() =>
    [...filtered].sort((a, b) => b.achievement - a.achievement),
    [filtered]
  )

  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0)
  const totalTests = filtered.reduce((s, d) => s + d.tests, 0)
  const avgGrowth = filtered.length > 0
    ? filtered.reduce((s, d) => s + d.growth, 0) / filtered.length
    : 0
  const avgEfficiency = filtered.length > 0
    ? filtered.reduce((s, d) => s + d.achievement, 0) / filtered.length
    : 0

  const revChartData = filtered.map((d) => ({ label: d.branch, value: d.revenue }))
  const testsChartData = filtered.map((d) => ({ label: d.branch, value: d.tests }))

  return (
    <PageContainer
      title="Branch Performance"
      description="Compare performance across all branches"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
      actions={
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {data.map((b) => (
              <SelectItem key={b.branch} value={b.branch}>{b.branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          icon={<Beaker className="h-5 w-5" />}
          label="Total Tests"
          value={totalTests.toLocaleString()}
          trend={{ value: 8.3, positive: true }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Growth %"
          value={`${avgGrowth.toFixed(1)}%`}
          trend={{ value: Math.abs(avgGrowth), positive: avgGrowth >= 0 }}
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Avg Efficiency"
          value={`${avgEfficiency.toFixed(1)}%`}
          trend={{ value: Math.abs(avgEfficiency - 100), positive: avgEfficiency >= 100 }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranked.map((b, i) => (
              <div key={b.branch} className="flex items-center gap-4">
                <span className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                  i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" :
                  i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                  "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{b.branch}</span>
                    <span className="text-sm text-muted-foreground">{b.achievement.toFixed(1)}% achieved</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        b.achievement >= 100 ? "bg-emerald-500" : b.achievement >= 90 ? "bg-amber-500" : "bg-destructive"
                      )}
                      style={{ width: `${Math.min(100, b.achievement)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={revChartData} type="bar" height={260} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tests by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={testsChartData} type="bar" height={260} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Targets vs Actuals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Branch</th>
                  <th className="pb-2 pr-4 font-medium">Tests</th>
                  <th className="pb-2 pr-4 font-medium">Revenue</th>
                  <th className="pb-2 pr-4 font-medium">Target</th>
                  <th className="pb-2 pr-4 font-medium">Achievement</th>
                  <th className="pb-2 font-medium">Growth</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((b) => (
                  <tr key={b.branch} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{b.branch}</td>
                    <td className="py-2.5 pr-4">{b.tests.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">{formatCurrency(b.revenue)}</td>
                    <td className="py-2.5 pr-4">{formatCurrency(b.target)}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={b.achievement >= 100 ? "success" : b.achievement >= 90 ? "warning" : "destructive"}>
                        {b.achievement.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <span className={cn("font-medium", b.growth >= 0 ? "text-emerald-600" : "text-destructive")}>
                        {b.growth >= 0 ? "+" : ""}{b.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
