"use client"

import { useState, useEffect, useMemo } from "react"
import { Clock, CheckCircle2, AlertTriangle, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getTATData } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface TATItem {
  department: string
  testName: string
  avgMinutes: number
  target: number
  compliance: number
}

export default function TurnaroundDashboard() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TATItem[]>([])
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "TAT" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTATData()
      setData(result)
    } catch {
      setError("Failed to load TAT data")
      showToast({ type: "error", title: "Error", message: "Failed to load TAT dashboard" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const departments = useMemo(() => {
    const deps = new Set(data.map((d) => d.department))
    return Array.from(deps)
  }, [data])

  const filtered = useMemo(() => {
    if (departmentFilter === "all") return data
    return data.filter((d) => d.department === departmentFilter)
  }, [data, departmentFilter])

  const avgTAT = useMemo(() => {
    if (!filtered.length) return 0
    return Math.round(filtered.reduce((s, d) => s + d.avgMinutes, 0) / filtered.length)
  }, [filtered])

  const onTimePct = useMemo(() => {
    if (!filtered.length) return 0
    const onTime = filtered.filter((d) => d.avgMinutes <= d.target).length
    return Math.round((onTime / filtered.length) * 100)
  }, [filtered])

  const breachedCount = useMemo(() => {
    return filtered.filter((d) => d.avgMinutes > d.target).length
  }, [filtered])

  const criticalAvg = useMemo(() => {
    const critical = filtered.filter((d) => d.avgMinutes < 120)
    if (!critical.length) return 0
    return Math.round(critical.reduce((s, d) => s + d.avgMinutes, 0) / critical.length)
  }, [filtered])

  const deptAvgData = useMemo(() => {
    const map: Record<string, { total: number; count: number; target: number }> = {}
    filtered.forEach((d) => {
      if (!map[d.department]) map[d.department] = { total: 0, count: 0, target: d.target }
      map[d.department].total += d.avgMinutes
      map[d.department].count += 1
    })
    return Object.entries(map).map(([dept, v]) => ({
      label: dept,
      value: Math.round(v.total / v.count),
      secondary: v.target,
    }))
  }, [filtered])

  const trendData = useMemo(() => {
    return filtered.map((d) => ({
      label: d.testName.length > 18 ? d.testName.slice(0, 18) + "..." : d.testName,
      value: d.avgMinutes,
      secondary: d.target,
    }))
  }, [filtered])

  const breachData = useMemo(() => {
    return filtered
      .filter((d) => d.avgMinutes > d.target)
      .map((d) => ({
        testName: d.testName,
        department: d.department,
        avgMinutes: d.avgMinutes,
        target: d.target,
        delay: Math.round((d.avgMinutes - d.target) / 60 * 10) / 10,
      }))
  }, [filtered])

  return (
    <PageContainer
      title="Turnaround Time (TAT) Analytics"
      description="Track and analyze test turnaround times across departments"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
      actions={
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg TAT (minutes)"
          value={`${avgTAT} min`}
          trend={{ value: 5, positive: avgTAT < 240 }}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="On Time %"
          value={`${onTimePct}%`}
          trend={{ value: onTimePct - 90, positive: onTimePct >= 90 }}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Breached"
          value={breachedCount}
          trend={{ value: breachedCount, positive: breachedCount === 0 }}
        />
        <StatCard
          icon={<Gauge className="h-5 w-5" />}
          label="Critical TAT (min)"
          value={`${criticalAvg} min`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>TAT by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={deptAvgData} type="horizontal-bar" height={280} target={120} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>TAT Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={trendData} type="bar" height={280} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TAT Breach Details</CardTitle>
        </CardHeader>
        <CardContent>
          {breachData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No breaches found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Test Name</th>
                    <th className="pb-2 pr-4 font-medium">Department</th>
                    <th className="pb-2 pr-4 font-medium">Avg (min)</th>
                    <th className="pb-2 pr-4 font-medium">Target (min)</th>
                    <th className="pb-2 font-medium">Delay (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {breachData.map((b) => (
                    <tr key={b.testName} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{b.testName}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{b.department}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="destructive">{b.avgMinutes}</Badge>
                      </td>
                      <td className="py-2.5 pr-4">{b.target}</td>
                      <td className="py-2.5">
                        <span className="font-semibold text-destructive">{b.delay}h</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
