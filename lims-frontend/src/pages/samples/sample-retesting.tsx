"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { RetestRequest, Sample } from "@/types"
import { getRetestRequests, createRetestRequest, getSamplesExtended } from "@/mock/services"
import { formatDate } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/stat-card"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"

export default function SampleRetestingPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<RetestRequest[]>([])
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [createDialog, setCreateDialog] = useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState("")
  const [originalResultId, setOriginalResultId] = useState("")
  const [retestReason, setRetestReason] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Retesting" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [req, smp] = await Promise.all([
        getRetestRequests({}),
        getSamplesExtended({}),
      ])
      setRequests(req)
      setSamples(smp.data)
    } catch {
      setError("Failed to load retest data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests])
  const approvedRequests = useMemo(() => requests.filter((r) => r.status === "approved"), [requests])
  const completedRequests = useMemo(() => requests.filter((r) => r.status === "completed"), [requests])

  const stats = useMemo(() => ({
    total: requests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    completed: completedRequests.length,
  }), [requests, pendingRequests, approvedRequests, completedRequests])

  const filtered = useMemo(() => {
    let data = activeTab === "pending" ? pendingRequests : activeTab === "approved" ? approvedRequests : completedRequests
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.sampleId.toLowerCase().includes(q) ||
          r.requestedBy.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      )
    }
    return data
  }, [activeTab, pendingRequests, approvedRequests, completedRequests, search])

  const columns: ColumnDef<RetestRequest>[] = [
    {
      id: "sampleId",
      header: "Sample",
      accessorKey: "sampleId",
      cell: (row) => {
        const sample = samples.find((s) => s.id === row.sampleId)
        return <span className="font-mono text-xs font-medium">{sample?.barcode || row.sampleId}</span>
      },
    },
    {
      id: "requestedBy",
      header: "Requested By",
      accessorKey: "requestedBy",
    },
    {
      id: "reason",
      header: "Reason",
      accessorKey: "reason",
      cell: (row) => <span className="text-xs truncate max-w-[200px] block">{row.reason}</span>,
    },
    {
      id: "requestedAt",
      header: "Requested At",
      accessorKey: "requestedAt",
      cell: (row) => <span className="text-xs">{formatDate(row.requestedAt, "datetime")}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: (row) => {
        if (row.status === "pending") {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const { getRetestRequests: grr } = await import("@/mock/services")
                    const all = await grr({})
                    const idx = all.findIndex((r) => r.id === row.id)
                    if (idx !== -1) {
                      all[idx] = { ...all[idx], status: "approved", approvedBy: "Current User", approvedAt: new Date().toISOString() }
                    }
                    showToast({ type: "success", title: "Request Approved", message: "Retest request has been approved." })
                    loadData()
                  } catch {
                    showToast({ type: "error", title: "Error", message: "Failed to approve request." })
                  }
                }}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          )
        }
        if (row.status === "approved") {
          return (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const { getRetestRequests: grr } = await import("@/mock/services")
                  const all = await grr({})
                  const idx = all.findIndex((r) => r.id === row.id)
                  if (idx !== -1) {
                    all[idx] = { ...all[idx], status: "completed" }
                  }
                  showToast({ type: "success", title: "Retest Completed", message: "Retest has been marked as completed." })
                  loadData()
                } catch {
                  showToast({ type: "error", title: "Error", message: "Failed to complete retest." })
                }
              }}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
            </Button>
          )
        }
        return null
      },
    },
  ]

  const handleCreate = async () => {
    if (!selectedSampleId || !retestReason || !originalResultId) {
      showToast({ type: "error", title: "Validation Error", message: "Please fill all required fields." })
      return
    }
    setSaving(true)
    try {
      await createRetestRequest({
        sampleId: selectedSampleId,
        originalResultId,
        requestedBy: "Current User",
        requestedAt: new Date().toISOString(),
        reason: retestReason,
        status: "pending",
      })
      showToast({ type: "success", title: "Retest Requested", message: "Retest request has been submitted." })
      setCreateDialog(false)
      setSelectedSampleId("")
      setOriginalResultId("")
      setRetestReason("")
      loadData()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to create retest request." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="table" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Sample Retesting"
        description="Manage retest request queue"
        actions={
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Retest Request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<RotateCcw className="h-5 w-5" />} label="Total Requests" value={stats.total} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={stats.pending} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Approved" value={stats.approved} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={stats.completed} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={15}
            filterPlaceholder="Search requests..."
            emptyMessage="No retest requests found."
            exportable
          />
        </CardContent>
      </Card>

      <Dialog open={createDialog} onOpenChange={(o) => !o && setCreateDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Retest Request</DialogTitle>
            <DialogDescription>Submit a new retest request for a sample.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sample</label>
              <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sample..." />
                </SelectTrigger>
                <SelectContent>
                  {samples.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.barcode} - {s.patientName} ({s.testName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Result ID</label>
              <Input value={originalResultId} onChange={(e) => setOriginalResultId(e.target.value)} placeholder="Enter the result ID..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Retest</label>
              <Textarea value={retestReason} onChange={(e) => setRetestReason(e.target.value)} placeholder="Why is retesting required?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !selectedSampleId || !retestReason || !originalResultId}>
              {saving ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
