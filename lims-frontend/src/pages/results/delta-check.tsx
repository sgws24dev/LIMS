"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Result } from "@/types"
import { getResultsExtended, getDeltaCheck, getResultById } from "@/mock/services"
import { formatDate, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface DeltaItem {
  resultId: string
  patientName: string
  testName: string
  department: string
  parameterName: string
  previousValue: string
  currentValue: string
  change: number
  status: "normal" | "significant" | "critical"
  enteredAt: string
  acknowledged: boolean
}

export default function DeltaCheckPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deltaItems, setDeltaItems] = useState<DeltaItem[]>([])
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Results", href: "/results" },
      { label: "Delta Check" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getResultsExtended({})
      const items: DeltaItem[] = []
      for (const r of result.data) {
        if (r.deltaCheck === "no_previous" || !r.previousValues) continue
        for (const pv of r.previousValues) {
          items.push({
            resultId: r.id,
            patientName: r.patientName,
            testName: r.testName,
            department: r.department!,
            parameterName: pv.parameterName,
            previousValue: pv.previousValue,
            currentValue: pv.currentValue,
            change: pv.change,
            status: r.deltaCheck as "normal" | "significant" | "critical",
            enteredAt: r.enteredAt,
            acknowledged: false,
          })
        }
      }
      setDeltaItems(items)
    } catch {
      setError("Failed to load delta check data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departments = useMemo(() => [...new Set(deltaItems.map((d) => d.department).filter(Boolean))], [deltaItems])

  const stats = useMemo(() => {
    const total = deltaItems.length
    const critical = deltaItems.filter((d) => d.status === "critical").length
    const significant = deltaItems.filter((d) => d.status === "significant").length
    const acknowledged = deltaItems.filter((d) => d.acknowledged).length
    return { total, critical, significant, acknowledged }
  }, [deltaItems])

  const filtered = useMemo(() => {
    let data = [...deltaItems]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((d) => d.patientName.toLowerCase().includes(q) || d.parameterName.toLowerCase().includes(q))
    }
    if (departmentFilter !== "all") {
      data = data.filter((d) => d.department === departmentFilter)
    }
    if (statusFilter !== "all") {
      data = data.filter((d) => d.status === statusFilter)
    }
    return data
  }, [deltaItems, search, departmentFilter, statusFilter])

  const handleAcknowledge = (idx: number) => {
    setDeltaItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], acknowledged: true }
      return next
    })
    showToast({ type: "success", title: "Acknowledged", message: "Delta change acknowledged." })
  }

  const handleMarkReviewed = (idx: number) => {
    setDeltaItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], acknowledged: true }
      return next
    })
    showToast({ type: "success", title: "Reviewed", message: "Delta change marked as reviewed." })
  }

  const handleEscalate = (idx: number) => {
    showToast({ type: "warning", title: "Escalated", message: "Delta change has been escalated to senior staff." })
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Delta Check" description="Monitor significant changes from previous results" />
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Delta Check" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Delta Check"
        description="Monitor significant changes from previous results"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Activity className="h-5 w-5" />} label="Total Changes" value={stats.total} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Significant" value={stats.significant} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Reviewed" value={stats.acknowledged} trend={stats.total > 0 ? { value: Math.round((stats.acknowledged / stats.total) * 100), positive: true } : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient/parameter..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="significant">Significant</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="No delta changes"
          description="No significant changes detected from previous results."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => {
            const isCritical = item.status === "critical"
            const isSignificant = item.status === "significant"
            const isUp = item.change > 0

            return (
              <Card
                key={`${item.resultId}-${item.parameterName}-${idx}`}
                className={cn(
                  "border-l-4",
                  isCritical ? "border-l-destructive" : isSignificant ? "border-l-amber-400" : "border-l-emerald-400"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.patientName}</span>
                        <Badge
                          variant={isCritical ? "destructive" : isSignificant ? "warning" : "success"}
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                        {item.acknowledged && <Badge variant="secondary" className="text-[10px]">Reviewed</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.testName} · {item.department}</p>
                      <p className="text-xs text-muted-foreground">{item.parameterName}</p>

                      <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <span className="text-[10px] text-muted-foreground">Previous</span>
                            <p className="font-medium text-muted-foreground">{item.previousValue}</p>
                          </div>
                          <div className={cn("flex items-center gap-1 text-lg font-bold", isCritical ? "text-destructive" : isSignificant ? "text-amber-600" : "text-emerald-600")}>
                            {isUp ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-muted-foreground">Current</span>
                            <p className="font-semibold">{item.currentValue}</p>
                          </div>
                        </div>
                      </div>

                      <p className="mt-2 text-[10px] text-muted-foreground">{formatDate(item.enteredAt, "datetime")}</p>
                    </div>
                  </div>

                  {!item.acknowledged && (
                    <div className="mt-3 flex items-center gap-2 border-t pt-3">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAcknowledge(idx)}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Acknowledge
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkReviewed(idx)}>
                        <Eye className="mr-1 h-3 w-3" /> Reviewed
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleEscalate(idx)}>
                        <AlertTriangle className="mr-1 h-3 w-3" /> Escalate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
