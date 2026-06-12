"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Sample } from "@/types"
import { getSamplesExtended, disposeSample, getSampleTimeline } from "@/mock/services"
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
  Trash2,
  Search,
  Clock,
  AlertTriangle,
  Barcode,
} from "lucide-react"

export default function SampleDisposalPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ready")
  const [disposeDialog, setDisposeDialog] = useState<Sample | null>(null)
  const [disposalReason, setDisposalReason] = useState("")
  const [disposalMethod, setDisposalMethod] = useState("incineration")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Disposal" },
    ])
  }, [setBreadcrumbs])

  const loadSamples = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSamplesExtended({})
      setSamples(result.data)
    } catch {
      setError("Failed to load sample data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  const readyForDisposal = useMemo(
    () => samples.filter((s) => s.status === "approved" || s.status === "rejected" || s.status === "disposed" || (s.createdAt && new Date(s.createdAt) < new Date(Date.now() - 90 * 86400000))),
    [samples]
  )

  const disposalHistory = useMemo(
    () => samples.filter((s) => s.status === "disposed"),
    [samples]
  )

  const stats = useMemo(() => ({
    ready: samples.filter((s) => s.status === "approved" || s.status === "rejected").length,
    disposed: disposalHistory.length,
  }), [samples, disposalHistory])

  const filtered = useMemo(() => {
    let data = activeTab === "ready" ? readyForDisposal.filter((s) => s.status !== "disposed") : disposalHistory
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.barcode.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q)
      )
    }
    return data
  }, [activeTab, readyForDisposal, disposalHistory, search])

  const handleDispose = async () => {
    if (!disposeDialog || !disposalReason) return
    setSaving(true)
    try {
      await disposeSample(disposeDialog.id, "Current User", `${disposalReason} (Method: ${disposalMethod})`)
      showToast({
        type: "success",
        title: "Sample Disposed",
        message: `Sample ${disposeDialog.barcode} has been disposed.`,
      })
      setDisposeDialog(null)
      setDisposalReason("")
      loadSamples()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to dispose sample." })
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<Sample>[] = [
    {
      id: "barcode",
      header: "Barcode",
      accessorKey: "barcode",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs font-medium">{row.barcode}</span>
        </div>
      ),
    },
    {
      id: "patientName",
      header: "Patient",
      accessorKey: "patientName",
    },
    {
      id: "testName",
      header: "Test",
      accessorKey: "testName",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "disposedAt",
      header: "Disposed At",
      accessorKey: "disposedAt",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.disposedAt ? formatDate(row.disposedAt, "datetime") : "—"}
        </span>
      ),
    },
    {
      id: "disposalReason",
      header: "Reason",
      accessorKey: "disposalReason",
      cell: (row) => <span className="text-xs truncate max-w-[200px] block">{row.disposalReason || "—"}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: (row) => {
        if (row.status === "approved" || row.status === "rejected") {
          return (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setDisposeDialog(row)
                setDisposalReason("")
                setDisposalMethod("incineration")
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Dispose
            </Button>
          )
        }
        return null
      },
    },
  ]

  const historyColumns: ColumnDef<Sample>[] = [
    {
      id: "barcode",
      header: "Barcode",
      accessorKey: "barcode",
      cell: (row) => (
        <span className="font-mono text-xs font-medium">{row.barcode}</span>
      ),
    },
    {
      id: "patientName",
      header: "Patient",
      accessorKey: "patientName",
    },
    {
      id: "disposedBy",
      header: "Disposed By",
      accessorKey: "disposedBy",
      cell: (row) => <span>{row.disposedBy || "—"}</span>,
    },
    {
      id: "disposedAt",
      header: "Disposed At",
      accessorKey: "disposedAt",
      cell: (row) => <span className="text-xs">{row.disposedAt ? formatDate(row.disposedAt, "datetime") : "—"}</span>,
    },
    {
      id: "disposalReason",
      header: "Reason",
      accessorKey: "disposalReason",
      cell: (row) => <span className="text-xs">{row.disposalReason || "—"}</span>,
    },
  ]

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
        <ErrorState message={error} onRetry={loadSamples} />
      </div>
    )
  }

  const disposalMethods = [
    { value: "incineration", label: "Incineration" },
    { value: "autoclave", label: "Autoclave" },
    { value: "chemical", label: "Chemical Treatment" },
    { value: "sharps", label: "Sharps Disposal" },
    { value: "biohazard", label: "Biohazard Waste" },
  ]

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Sample Disposal"
        description="Manage sample disposal and disposal history"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Ready for Disposal" value={stats.ready} />
        <StatCard icon={<Trash2 className="h-5 w-5" />} label="Disposed" value={stats.disposed} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="ready">Ready for Disposal ({readyForDisposal.filter((s) => s.status !== "disposed").length})</TabsTrigger>
              <TabsTrigger value="history">Disposal History ({disposalHistory.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by barcode or patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {activeTab === "ready" ? (
            <DataTable
              columns={columns}
              data={filtered}
              pageSize={15}
              emptyMessage="No samples ready for disposal."
              filterPlaceholder="Search..."
              exportable
            />
          ) : (
            <DataTable
              columns={historyColumns}
              data={filtered}
              pageSize={15}
              emptyMessage="No disposal history found."
              filterPlaceholder="Search..."
              exportable
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!disposeDialog} onOpenChange={(o) => !o && setDisposeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Sample</DialogTitle>
            <DialogDescription>Confirm disposal of this sample.</DialogDescription>
          </DialogHeader>
          {disposeDialog && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode:</span>
                  <span className="font-mono font-medium">{disposeDialog.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{disposeDialog.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test:</span>
                  <span>{disposeDialog.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <StatusBadge status={disposeDialog.status} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Disposal Method</label>
                <Select value={disposalMethod} onValueChange={setDisposalMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {disposalMethods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Disposal Reason</label>
                <Textarea
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  placeholder="Reason for disposal..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDispose} disabled={saving || !disposalReason}>
              {saving ? "Processing..." : "Confirm Disposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
