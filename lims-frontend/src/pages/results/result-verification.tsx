"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Result } from "@/types"
import { getResultsExtended, verifyResult, getResultById } from "@/mock/services"
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
  ClipboardCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  User,
  RefreshCw,
} from "lucide-react"

export default function ResultVerificationPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Results", href: "/results" },
      { label: "Verification" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getResultsExtended({ status: "draft" })
      const reviewResult = await getResultsExtended({ status: "review" })
      setResults([...result.data, ...reviewResult.data])
    } catch {
      setError("Failed to load verification queue.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const draft = results.filter((r) => r.status === "draft").length
    const review = results.filter((r) => r.status === "review").length
    const critical = results.filter((r) => r.isCritical).length
    return { draft, review, critical, total: results.length }
  }, [results])

  const filtered = useMemo(() => {
    let data = [...results]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.testName.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter)
    }
    return data
  }, [results, search, statusFilter])

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
      { id: "enteredBy", header: "Entered By", accessorKey: "enteredBy" },
      {
        id: "enteredAt",
        header: "Entered At",
        cell: (row) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.enteredAt, "datetime")}</span>
        ),
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
              handleOpenVerify(row)
            }}
          >
            <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> Verify
          </Button>
        ),
        className: "w-[120px]",
      },
    ],
    []
  )

  const handleOpenVerify = async (result: Result) => {
    try {
      const full = await getResultById(result.id)
      setSelectedResult(full ?? result)
      setVerifyDialogOpen(true)
    } catch {
      setSelectedResult(result)
      setVerifyDialogOpen(true)
    }
  }

  const handleVerify = async () => {
    if (!selectedResult) return
    setSaving(true)
    try {
      await verifyResult(selectedResult.id, "Current User")
      showToast({ type: "success", title: "Verified", message: `Result for ${selectedResult.patientName} has been verified.` })
      setVerifyDialogOpen(false)
      setSelectedResult(null)
      loadData()
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not verify result." })
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedResult || !rejectReason) return
    setSaving(true)
    try {
      const { updateResultStatus } = await import("@/mock/services")
      await updateResultStatus(selectedResult.id, "draft", { notes: `Rejected: ${rejectReason}` })
      showToast({ type: "warning", title: "Rejected", message: `Result sent back with reason.` })
      setRejectDialogOpen(false)
      setVerifyDialogOpen(false)
      setSelectedResult(null)
      setRejectReason("")
      loadData()
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not reject result." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Result Verification" description="Review and verify pending results" />
        <LoadingState type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Result Verification" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Result Verification"
        description="Review and verify pending results"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Total Pending" value={stats.total} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Draft" value={stats.draft} />
        <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Review" value={stats.review} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient/test..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        emptyMessage="No pending verifications."
        onRowClick={handleOpenVerify}
        exportable
      />

      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Verify Result
            </DialogTitle>
            <DialogDescription>Review all parameters before verifying the result.</DialogDescription>
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
                  <span className="text-xs text-muted-foreground">Department</span>
                  <p>{selectedResult.department}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Entered By</span>
                  <p>{selectedResult.enteredBy}</p>
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
            </div>
          )}
          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => { setRejectDialogOpen(true) }}>
              <XCircle className="mr-1.5 h-4 w-4" /> Reject
            </Button>
            <Button onClick={handleVerify} disabled={saving}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {saving ? "Verifying..." : "Verify Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Reject Result
            </DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <Textarea
            label="Rejection Reason"
            placeholder="Enter the reason for sending this result back..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason || saving}>
              {saving ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
