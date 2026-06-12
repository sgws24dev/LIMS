"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Result } from "@/types"
import { getResultsExtended, getTests } from "@/mock/services"
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
  Activity,
  RefreshCw,
  Search,
  BarChart3,
  List,
  ChevronDown,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
} from "lucide-react"

interface ExtendedResult {
  result: Result
  parameter: {
    parameterId: string
    parameterName: string
    value: string
    unit: string
    referenceRange: string
    isAbnormal: boolean
    isCritical: boolean
  }
}

type ViewMode = "list" | "chart"

function getRangeStatus(value: string, referenceRange: string): "low" | "normal" | "high" | "critical" {
  const numVal = parseFloat(value)
  if (isNaN(numVal)) return "normal"

  const rangeStr = referenceRange
  if (rangeStr.includes(" - ")) {
    const parts = rangeStr.split(" - ")
    const lower = parseFloat(parts[0])
    const upper = parseFloat(parts[1])
    if (numVal < lower) return "low"
    if (numVal > upper * 1.5) return "critical"
    if (numVal > upper) return "high"
    return "normal"
  } else if (rangeStr.startsWith("< ")) {
    const upper = parseFloat(rangeStr.replace("< ", ""))
    if (numVal > upper * 1.5) return "critical"
    if (numVal > upper) return "high"
    return "normal"
  } else if (rangeStr.startsWith("> ")) {
    const lower = parseFloat(rangeStr.replace("> ", ""))
    if (numVal < lower * 0.5) return "critical"
    if (numVal < lower) return "low"
    return "normal"
  }
  return "normal"
}

function getRangeColor(status: "low" | "normal" | "high" | "critical"): string {
  switch (status) {
    case "low": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300"
    case "normal": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
    case "high": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300"
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20"
  }
}

export default function ReferenceRangesPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [tests, setTests] = useState<{ id: string; name: string; department: string }[]>([])
  const [selectedTestId, setSelectedTestId] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Results", href: "/results" },
      { label: "Reference Ranges" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resultData, testData] = await Promise.all([
        getResultsExtended({}),
        getTests({}),
      ])
      setResults(resultData.data)
      setTests(testData.data.map((t) => ({ id: t.id, name: t.name, department: t.department })))
      if (!selectedTestId && testData.data.length > 0) {
        setSelectedTestId(testData.data[0].id)
      }
    } catch {
      setError("Failed to load reference range data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedTest = useMemo(() => tests.find((t) => t.id === selectedTestId), [tests, selectedTestId])

  const paramResults = useMemo(() => {
    if (!selectedTestId) return []
    const entries: ExtendedResult[] = []
    for (const r of results) {
      if (r.testId !== selectedTestId) continue
      for (const p of r.parameters) {
        entries.push({ result: r, parameter: p })
      }
    }
    return entries
  }, [results, selectedTestId])

  const stats = useMemo(() => {
    const total = paramResults.length
    const abnormal = paramResults.filter((e) => e.parameter.isAbnormal).length
    const critical = paramResults.filter((e) => e.parameter.isCritical).length
    const normal = total - abnormal
    return { total, abnormal, critical, normal }
  }, [paramResults])

  const chartData = useMemo(() => {
    const statuses = paramResults.map((e) => ({
      value: parseFloat(e.parameter.value),
      status: getRangeStatus(e.parameter.value, e.parameter.referenceRange),
      patientName: e.result.patientName,
      date: e.result.enteredAt,
    })).filter((d) => !isNaN(d.value))
    return statuses
  }, [paramResults])

  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) return 100
    return Math.max(...chartData.map((d) => d.value)) * 1.2
  }, [chartData])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Reference Ranges" description="Compare results against reference ranges" />
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Reference Ranges" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Reference Ranges"
        description="Compare results against reference ranges"
        actions={
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="mr-1.5 h-3.5 w-3.5" /> List
            </Button>
            <Button variant={viewMode === "chart" ? "default" : "outline"} size="sm" onClick={() => setViewMode("chart")}>
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Chart
            </Button>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedTestId} onValueChange={setSelectedTestId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a test" />
          </SelectTrigger>
          <SelectContent>
            {tests.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name} ({t.department})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTest && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard icon={<Activity className="h-5 w-5" />} label="Total Results" value={stats.total} />
            <StatCard icon={<MinusCircle className="h-5 w-5" />} label="Within Range" value={stats.normal} />
            <StatCard icon={<ArrowUpCircle className="h-5 w-5" />} label="Abnormal" value={stats.abnormal} />
            <StatCard icon={<ArrowDownCircle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                {selectedTest.name}
                <Badge variant="secondary" className="text-[10px]">{selectedTest.department}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paramResults.length === 0 ? (
                <EmptyState icon={<Activity className="h-8 w-8" />} title="No results" description={`No results found for ${selectedTest.name}.`} />
              ) : viewMode === "list" ? (
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Patient</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Parameter</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Value</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Reference Range</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paramResults.map((entry, idx) => {
                        const rangeStatus = getRangeStatus(entry.parameter.value, entry.parameter.referenceRange)
                        return (
                          <tr key={`${entry.result.id}-${idx}`} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-2 font-medium">{entry.result.patientName}</td>
                            <td className="p-2 text-muted-foreground">{entry.parameter.parameterName}</td>
                            <td className="p-2 font-semibold">{entry.parameter.value}</td>
                            <td className="p-2 text-xs text-muted-foreground">{entry.parameter.referenceRange}</td>
                            <td className="p-2">
                              <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium", getRangeColor(rangeStatus))}>
                                {rangeStatus}
                              </span>
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">{formatDate(entry.result.enteredAt, "short")}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-2">
                  {chartData.map((d, idx) => {
                    const pct = (d.value / maxChartValue) * 100
                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="w-28 truncate text-xs text-muted-foreground">{d.patientName}</span>
                        <div className="flex-1">
                          <div className="relative h-6 w-full rounded-md bg-muted">
                            <div
                              className={cn(
                                "absolute left-0 top-0 h-full rounded-md transition-all",
                                d.status === "critical" ? "bg-destructive" : d.status === "high" ? "bg-orange-400" : d.status === "low" ? "bg-blue-400" : "bg-emerald-400"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className={cn(
                          "w-16 text-right font-mono text-xs font-semibold",
                          d.status === "critical" ? "text-destructive" : d.status === "high" ? "text-orange-600" : d.status === "low" ? "text-blue-600" : "text-emerald-600"
                        )}>
                          {d.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
