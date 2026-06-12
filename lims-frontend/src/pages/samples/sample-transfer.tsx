"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { SampleTransfer, Sample } from "@/types"
import {
  getSampleTransfers,
  createSampleTransfer,
  getSamplesExtended,
  updateSampleStatus,
} from "@/mock/services"
import { formatDate } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
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
  Truck,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react"

const departments = ["Hematology", "Biochemistry", "Microbiology", "Immunology", "Pathology", "Serology", "Molecular"]
const branches = ["Main Lab", "Branch A", "Branch B", "Branch C"]

export default function SampleTransferPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transfers, setTransfers] = useState<SampleTransfer[]>([])
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createDialog, setCreateDialog] = useState(false)
  const [receiveDialog, setReceiveDialog] = useState<SampleTransfer | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  const [selectedSampleId, setSelectedSampleId] = useState("")
  const [fromDepartment, setFromDepartment] = useState(departments[0])
  const [toDepartment, setToDepartment] = useState(departments[1])
  const [fromBranch, setFromBranch] = useState(branches[0])
  const [toBranch, setToBranch] = useState(branches[1])
  const [transferNotes, setTransferNotes] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Transfers" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [trns, smp] = await Promise.all([
        getSampleTransfers({}),
        getSamplesExtended({}),
      ])
      setTransfers(trns)
      setSamples(smp.data)
    } catch {
      setError("Failed to load transfer data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingTransfers = useMemo(() => transfers.filter((t) => t.status === "in_transit"), [transfers])
  const completedTransfers = useMemo(() => transfers.filter((t) => t.status === "received"), [transfers])
  const lostTransfers = useMemo(() => transfers.filter((t) => t.status === "lost"), [transfers])

  const stats = useMemo(() => ({
    total: transfers.length,
    pending: pendingTransfers.length,
    completed: completedTransfers.length,
    lost: lostTransfers.length,
  }), [transfers, pendingTransfers, completedTransfers, lostTransfers])

  const filtered = useMemo(() => {
    let data = activeTab === "pending" ? pendingTransfers : activeTab === "completed" ? completedTransfers : lostTransfers
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (t) =>
          t.sampleId.toLowerCase().includes(q) ||
          t.fromDepartment.toLowerCase().includes(q) ||
          t.toDepartment.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") data = data.filter((t) => t.status === statusFilter)
    return data
  }, [activeTab, pendingTransfers, completedTransfers, lostTransfers, search, statusFilter])

  const handleCreateTransfer = async () => {
    if (!selectedSampleId) {
      showToast({ type: "error", title: "Validation Error", message: "Please select a sample." })
      return
    }
    setSaving(true)
    try {
      await createSampleTransfer({
        sampleId: selectedSampleId,
        fromDepartment,
        toDepartment,
        fromBranch,
        toBranch,
        transferredBy: "Current User",
        transferredAt: new Date().toISOString(),
        status: "in_transit",
        notes: transferNotes || undefined,
      })
      await updateSampleStatus(selectedSampleId, "transferred", {
        transferredTo: toBranch,
        transferredAt: new Date().toISOString(),
      })
      showToast({ type: "success", title: "Transfer Created", message: "Sample transfer has been initiated." })
      setCreateDialog(false)
      setSelectedSampleId("")
      setTransferNotes("")
      loadData()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to create transfer." })
    } finally {
      setSaving(false)
    }
  }

  const handleReceiveTransfer = async () => {
    if (!receiveDialog || !receiverName) return
    setSaving(true)
    try {
      const { getSampleTransfers: gst } = await import("@/mock/services")
      const allTransfers = await gst({})
      const idx = allTransfers.findIndex((t) => t.id === receiveDialog.id)
      if (idx !== -1) {
        allTransfers[idx] = {
          ...allTransfers[idx],
          status: "received",
          receivedBy: receiverName,
          receivedAt: new Date().toISOString(),
        }
      }
      showToast({ type: "success", title: "Transfer Received", message: "Sample has been received at destination." })
      setReceiveDialog(null)
      setReceiverName("")
      loadData()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to confirm transfer receipt." })
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
        title="Sample Transfers"
        description="Manage sample transfers between departments and branches"
        actions={
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Transfer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Truck className="h-5 w-5" />} label="Total Transfers" value={stats.total} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="In Transit" value={stats.pending} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Received" value={stats.completed} />
        <StatCard icon={<Truck className="h-5 w-5" />} label="Lost" value={stats.lost} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">In Transit ({pendingTransfers.length})</TabsTrigger>
              <TabsTrigger value="completed">Received ({completedTransfers.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({lostTransfers.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Truck className="h-6 w-6" />} title="No transfers found" description="There are no transfers matching your criteria." />
          ) : (
            <div className="space-y-2">
              {filtered.map((transfer) => {
                const sample = samples.find((s) => s.id === transfer.sampleId)
                return (
                  <Card key={transfer.id}>
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{sample?.barcode || transfer.sampleId}</span>
                          <StatusBadge status={transfer.status} />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{transfer.fromDepartment}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{transfer.toDepartment}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {transfer.fromBranch} → {transfer.toBranch}
                          </span>
                          <span>•</span>
                          <span>By: {transfer.transferredBy}</span>
                          <span>•</span>
                          <span>{formatDate(transfer.transferredAt, "datetime")}</span>
                        </div>
                        {transfer.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">{transfer.notes}</p>
                        )}
                      </div>
                      {transfer.status === "in_transit" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setReceiveDialog(transfer)
                              setReceiverName("")
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark Received
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialog} onOpenChange={(o) => !o && setCreateDialog(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Transfer Request</DialogTitle>
            <DialogDescription>Transfer a sample between departments or branches.</DialogDescription>
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
                      {s.barcode} - {s.patientName} ({s.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Department</label>
                <Select value={fromDepartment} onValueChange={setFromDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Department</label>
                <Select value={toDepartment} onValueChange={setToDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Branch</label>
                <Select value={fromBranch} onValueChange={setFromBranch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Branch</label>
                <Select value={toBranch} onValueChange={setToBranch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTransfer} disabled={saving || !selectedSampleId}>
              {saving ? "Creating..." : "Create Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!receiveDialog} onOpenChange={(o) => !o && setReceiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer Receipt</DialogTitle>
            <DialogDescription>Mark this transfer as received at the destination.</DialogDescription>
          </DialogHeader>
          {receiveDialog && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span>{receiveDialog.fromDepartment} ({receiveDialog.fromBranch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span>{receiveDialog.toDepartment} ({receiveDialog.toBranch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transferred By:</span>
                  <span>{receiveDialog.transferredBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transferred At:</span>
                  <span>{formatDate(receiveDialog.transferredAt, "datetime")}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Received By</label>
                <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Enter your name..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialog(null)}>Cancel</Button>
            <Button onClick={handleReceiveTransfer} disabled={saving || !receiverName}>
              {saving ? "Processing..." : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
