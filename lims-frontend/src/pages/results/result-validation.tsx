"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Result } from "@/types"
import { getResultsExtended, validateResult, getResultById, updateResultStatus } from "@/mock/services"
import { formatDate, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  FileText,
  RefreshCw,
  AlertCircle,
  Activity,
} from "lucide-react"

export default function ResultValidationPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [validationNotes, setValidationNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Results", href: "/results" },
      { label: "Validation" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getResultsExtended({ status: "verified" })
      setResults(result.data)
    } catch {
      setError("Failed to load validation queue.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departments = useMemo(() => {
    return [...new Set(results.map((r) => r.department).filter(Boolean))]
  }, [results])

  const stats = useMemo(() => {
    const total = results.length
    const critical = results.filter((r) => r.isCritical).length
    const deltaWarnings = results.filter((r) => r.deltaCheck === "significant" || r.deltaCheck === "critical").length
    return { total, critical, deltaWarnings }
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
    return data
  }, [results, search, departmentFilter])

  const columns: ColumnDef<Result>[] = useMemo(
    () => [
      { id: "patientName", header: "Patient", accessorKey: "patientName" },
      { id: "testName", header: "Test", accessorKey: "testName" },
      {
        id: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      { id: "department", header: "Department", accessorKey: "department" },
      { id: "verifiedBy", header: "Verified By", accessorKey: "verifiedBy" },
      {
        id: "deltaCheck",
        header: "Delta",
        cell: (row) => {
          if (row.deltaCheck === "critical") return <Badge variant="destructive" className="text-[10px]">Critical</Badge>
          if (row.deltaCheck === "significant") return <Badge variant="warning" className="text-[10px]">Significant</Badge>
          if (row.deltaCheck === "normal") return <Badge variant="success" className="text-[10px]">Normal</Badge>
          return <Badge variant="secondary" className="text-[10px]">No prev</Badge>
        },
      },
      {
        id: "actions",
        header: "",
        cell: (row) => (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenValidate(row)
            }}
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Validate
          </Button>
        ),
        className: "w-[120px]",
      },
    ],
    []
  )

  const handleOpenValidate = async (result: Result) => {
    try {
      const full = await getResultById(result.id)
      setSelectedResult(full ?? result)
      setValidationNotes("")
      setDialogOpen(true)
    } catch {
      setSelectedResult(result)
      setDialogOpen(true)
    }
  }

  const handleValidate = async () => {
    if (!selectedResult) return
    setSaving(true)
    try {
      await validateResult(selectedResult.id, "Current User")
      showToast({ type: "success", title: "Validated", message: `Result for ${selectedResult.patientName} has been validated.` })
      setDialogOpen(false)
      setSelectedResult(null)
      loadData()
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not validate result." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Result Validation" description="Senior staff validation of verified results" />
        <LoadingState type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Result Validation" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Result Validation"
        description="Senior staff validation of verified results"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Awaiting Validation" value={stats.total} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Delta Warnings" value={stats.deltaWarnings} trend={stats.deltaWarnings > 0 ? { value: stats.deltaWarnings, positive: false } : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient/test..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d!} value={d!}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        emptyMessage="No results awaiting validation."
        onRowClick={handleOpenValidate}
        exportable
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Validate Result
            </DialogTitle>
            <DialogDescription>Senior staff review and validation.</DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Patient</span>
                  <p className="font-medium">{selectedResult.patientName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Test</span>
                  <p className="font-medium">{selectedResult.testName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Verified By</span>
                  <p>{selectedResult.verifiedBy || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Verified At</span>
                  <p>{selectedResult.verifiedAt ? formatDate(selectedResult.verifiedAt, "datetime") : "—"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Parameters</h4>
                {selectedResult.parameters.map((p) => {
                  const isAbnormal = p.isAbnormal || p.isCritical
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
                      <div className={cn("text-right font-semibold", isAbnormal && "text-destructive")}>
                        {p.value} {p.unit}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedResult.deltaCheck && selectedResult.deltaCheck !== "no_previous" && selectedResult.previousValues && selectedResult.previousValues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Delta Check Warnings
                  </h4>
                  <div className="space-y-1.5">
                    {selectedResult.previousValues.map((pv, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center justify-between rounded-lg border p-2.5 text-xs",
                        pv.change > 50 ? "border-destructive/30 bg-destructive/5" : "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10"
                      )}>
                        <span className="font-medium">{pv.parameterName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">Prev: {pv.previousValue}</span>
                          <span className="font-semibold">Now: {pv.currentValue}</span>
                          <span className={cn("font-mono", pv.change > 50 ? "text-destructive" : "text-amber-600")}>
                            {pv.change > 0 ? "+" : ""}{pv.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Textarea
                label="Validation Notes (optional)"
                placeholder="Add any notes for this validation..."
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleValidate} disabled={saving}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {saving ? "Validating..." : "Validate Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
