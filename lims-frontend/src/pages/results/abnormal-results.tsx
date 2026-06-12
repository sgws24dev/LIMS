"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Result } from "@/types"
import { getResultsExtended } from "@/mock/services"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  Phone,
  Stethoscope,
  RefreshCw,
  Activity,
  Clock,
  Eye,
} from "lucide-react"

type SeverityFilter = "all" | "abnormal" | "critical"

export default function AbnormalResultsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [notifyDialog, setNotifyDialog] = useState<Result | null>(null)
  const [detailDialog, setDetailDialog] = useState<Result | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Results", href: "/results" },
      { label: "Abnormal Results" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getResultsExtended({ isAbnormal: true })
      setResults(result.data)
    } catch {
      setError("Failed to load abnormal results.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departments = useMemo(() => [...new Set(results.map((r) => r.department).filter(Boolean))], [results])

  const stats = useMemo(() => {
    const total = results.length
    const critical = results.filter((r) => r.isCritical).length
    const reviewed = results.filter((r) => r.status === "verified" || r.status === "validated" || r.status === "approved" || r.status === "published").length
    const pending = results.filter((r) => r.status === "draft" || r.status === "review").length
    return { total, critical, reviewed, pending }
  }, [results])

  const filtered = useMemo(() => {
    let data = [...results]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((r) => r.patientName.toLowerCase().includes(q) || r.testName.toLowerCase().includes(q))
    }
    if (departmentFilter !== "all") {
      data = data.filter((r) => r.department === departmentFilter)
    }
    if (severityFilter === "critical") {
      data = data.filter((r) => r.isCritical)
    } else if (severityFilter === "abnormal") {
      data = data.filter((r) => r.isAbnormal && !r.isCritical)
    }
    return data
  }, [results, search, departmentFilter, severityFilter])

  const abnormalParamCount = useCallback((result: Result) => {
    return result.parameters.filter((p) => p.isAbnormal || p.isCritical).length
  }, [])

  const columns: ColumnDef<Result>[] = useMemo(
    () => [
      { id: "patientName", header: "Patient", accessorKey: "patientName" },
      { id: "testName", header: "Test", accessorKey: "testName" },
      {
        id: "abnormalCount",
        header: "Abnormal Params",
        cell: (row) => {
          const count = abnormalParamCount(row)
          return (
            <Badge variant={row.isCritical ? "destructive" : count > 1 ? "warning" : "secondary"}>
              {count}
            </Badge>
          )
        },
      },
      {
        id: "severity",
        header: "Severity",
        cell: (row) => {
          if (row.isCritical) return <Badge variant="destructive" className="text-[10px]">Critical</Badge>
          if (row.isAbnormal) return <Badge variant="warning" className="text-[10px]">Abnormal</Badge>
          return <Badge variant="secondary" className="text-[10px]">Normal</Badge>
        },
      },
      { id: "department", header: "Department", accessorKey: "department" },
      {
        id: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: (row) => (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setDetailDialog(row)
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                setNotifyDialog(row)
              }}
            >
              <Phone className="mr-1 h-3 w-3" /> Notify
            </Button>
          </div>
        ),
        className: "w-[140px]",
      },
    ],
    [abnormalParamCount]
  )

  const handleNotifyDoctor = (result: Result) => {
    showToast({ type: "success", title: "Doctor Notified", message: `Referring physician notified about ${result.patientName}.` })
    setNotifyDialog(null)
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Abnormal Results" description="Monitor and manage abnormal test results" />
        <LoadingState type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Abnormal Results" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Abnormal Results"
        description="Monitor and manage abnormal test results"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Activity className="h-5 w-5" />} label="Total Abnormal" value={stats.total} />
        <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Reviewed" value={stats.reviewed} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Review" value={stats.pending} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient/test..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d!} value={d!}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as SeverityFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="abnormal">Abnormal</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        emptyMessage="No abnormal results found."
        onRowClick={(row) => setDetailDialog(row)}
        exportable
      />

      <Dialog open={!!notifyDialog} onOpenChange={() => setNotifyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Notify Doctor
            </DialogTitle>
            <DialogDescription>Notify the referring physician about abnormal results.</DialogDescription>
          </DialogHeader>
          {notifyDialog && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="font-medium">{notifyDialog.patientName}</p>
                <p className="text-sm text-muted-foreground">{notifyDialog.testName}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dr. Amit Verma</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <p>Referring Physician</p>
                  <p>Phone: +91 98765 43210</p>
                </div>
              </div>
              <div className={cn("rounded-lg border p-3", notifyDialog.isCritical ? "border-destructive/50 bg-destructive/5" : "border-amber-200 bg-amber-50 dark:bg-amber-950/10")}>
                <p className="text-sm font-medium">Abnormal Parameters</p>
                {notifyDialog.parameters.filter((p) => p.isAbnormal || p.isCritical).map((p) => (
                  <div key={p.parameterId} className="mt-1 flex items-center justify-between text-sm">
                    <span>{p.parameterName}</span>
                    <span className={cn("font-semibold", p.isCritical ? "text-destructive" : "text-amber-600")}>
                      {p.value} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyDialog(null)}>Cancel</Button>
            <Button onClick={() => handleNotifyDoctor(notifyDialog!)}>
              <Phone className="mr-2 h-4 w-4" /> Confirm Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Result Details
            </DialogTitle>
            <DialogDescription>Detailed view of abnormal parameters.</DialogDescription>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Patient</span>
                  <p className="font-medium">{detailDialog.patientName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Test</span>
                  <p className="font-medium">{detailDialog.testName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Department</span>
                  <p>{detailDialog.department}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={detailDialog.status} />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Parameters</h4>
                {detailDialog.parameters.map((p) => {
                  const isBad = p.isAbnormal || p.isCritical
                  return (
                    <div
                      key={p.parameterId}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 text-sm",
                        p.isCritical && "border-destructive/50 bg-destructive/5",
                        p.isAbnormal && !p.isCritical && "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.parameterName}</span>
                          {p.isCritical && <Badge variant="destructive" className="text-[10px]">Critical</Badge>}
                          {p.isAbnormal && !p.isCritical && <Badge variant="warning" className="text-[10px]">Abnormal</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">Ref: {p.referenceRange}</span>
                      </div>
                      <div className={cn("text-right font-semibold", isBad && "text-destructive")}>
                        {p.value} {p.unit}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Entered by {detailDialog.enteredBy} on {formatDate(detailDialog.enteredAt, "datetime")}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
