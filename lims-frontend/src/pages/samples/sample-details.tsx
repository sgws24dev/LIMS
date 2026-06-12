"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Sample, Aliquot, SampleTransfer, RetestRequest } from "@/types"
import { formatDate } from "@/lib/utils"
import {
  getSampleById,
  getSampleTimeline,
  getAliquots,
  createAliquot,
  getSampleTransfers,
  getRetestRequests,
  updateSampleStatus,
  rejectSample,
  disposeSample,
} from "@/mock/services"
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { SampleTimeline, type TimelineEvent } from "@/components/shared/sample-timeline"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ArrowLeft,
  Barcode,
  User,
  FlaskConical,
  Package,
  Syringe,
  XCircle,
  Trash2,
  RotateCcw,
  Clock,
  Droplets,
  FlaskRound,
  Plus,
  AlertTriangle,
} from "lucide-react"

export default function SampleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sample, setSample] = useState<Sample | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [aliquots, setAliquots] = useState<Aliquot[]>([])
  const [transfers, setTransfers] = useState<SampleTransfer[]>([])
  const [retestRequests, setRetestRequests] = useState<RetestRequest[]>([])
  const [activeTab, setActiveTab] = useState("details")

  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [disposeDialog, setDisposeDialog] = useState(false)
  const [collectDialog, setCollectDialog] = useState(false)
  const [receiveDialog, setReceiveDialog] = useState(false)
  const [processDialog, setProcessDialog] = useState(false)
  const [aliquotDialog, setAliquotDialog] = useState(false)
  const [retestDialog, setRetestDialog] = useState(false)

  const [rejectReason, setRejectReason] = useState("")
  const [rejectCategory, setRejectCategory] = useState<Sample["rejectionCategory"]>("other")
  const [disposalReason, setDisposalReason] = useState("")
  const [performer, setPerformer] = useState("Current User")
  const [aliquotVolume, setAliquotVolume] = useState("2mL")
  const [aliquotContainer, setAliquotContainer] = useState("Microtube")
  const [retestReason, setRetestReason] = useState("")
  const [originalResultId, setOriginalResultId] = useState("")

  const loadSample = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [smp, tmln, alqs, trns, rtrq] = await Promise.all([
        getSampleById(id),
        getSampleTimeline(id),
        getAliquots({ sampleId: id }),
        getSampleTransfers({ sampleId: id }),
        getRetestRequests({ sampleId: id }),
      ])
      if (!smp) {
        setError("Sample not found.")
        return
      }
      setSample(smp)
      setTimeline(tmln.map((e) => ({ status: e.status, timestamp: e.timestamp, performedBy: e.performedBy, notes: e.notes })))
      setAliquots(alqs)
      setTransfers(trns)
      setRetestRequests(rtrq)
    } catch {
      setError("Failed to load sample details.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadSample()
  }, [loadSample])

  useEffect(() => {
    if (sample) {
      setBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Samples", href: "/samples" },
        { label: sample.barcode },
      ])
    }
  }, [setBreadcrumbs, sample])

  const handleAction = async (
    status: Sample["status"],
    extra?: Partial<Sample>,
    dialogClose?: () => void
  ) => {
    if (!sample) return
    setActionLoading(true)
    try {
      const updated = await updateSampleStatus(sample.id, status, extra)
      setSample(updated)
      const newTimeline = await getSampleTimeline(sample.id)
      setTimeline(newTimeline.map((e) => ({ status: e.status, timestamp: e.timestamp, performedBy: e.performedBy, notes: e.notes })))
      showToast({ type: "success", title: "Sample Updated", message: `Sample status changed to ${status.replace(/_/g, " ")}.` })
      dialogClose?.()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to update sample." })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!sample || !rejectReason) return
    setActionLoading(true)
    try {
      const updated = await rejectSample(sample.id, performer, rejectReason, rejectCategory)
      setSample(updated)
      const newTimeline = await getSampleTimeline(sample.id)
      setTimeline(newTimeline.map((e) => ({ status: e.status, timestamp: e.timestamp, performedBy: e.performedBy, notes: e.notes })))
      showToast({ type: "success", title: "Sample Rejected", message: "Sample has been rejected." })
      setRejectDialog(false)
      setRejectReason("")
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to reject sample." })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispose = async () => {
    if (!sample || !disposalReason) return
    setActionLoading(true)
    try {
      const updated = await disposeSample(sample.id, performer, disposalReason)
      setSample(updated)
      const newTimeline = await getSampleTimeline(sample.id)
      setTimeline(newTimeline.map((e) => ({ status: e.status, timestamp: e.timestamp, performedBy: e.performedBy, notes: e.notes })))
      showToast({ type: "success", title: "Sample Disposed", message: "Sample has been disposed." })
      setDisposeDialog(false)
      setDisposalReason("")
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to dispose sample." })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateAliquot = async () => {
    if (!sample) return
    setActionLoading(true)
    try {
      await createAliquot({
        parentSampleId: sample.id,
        barcode: sample.barcode + "-ALQ" + String(aliquots.length + 1),
        volume: aliquotVolume,
        container: aliquotContainer,
        createdBy: performer,
        createdAt: new Date().toISOString(),
        usedFor: "",
        status: "available",
      })
      const alqs = await getAliquots({ sampleId: sample.id })
      setAliquots(alqs)
      showToast({ type: "success", title: "Aliquot Created", message: "New aliquot has been created." })
      setAliquotDialog(false)
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to create aliquot." })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestRetest = async () => {
    if (!sample || !retestReason || !originalResultId) return
    setActionLoading(true)
    try {
      const { requestRetest } = await import("@/mock/services")
      await requestRetest(sample.id, originalResultId, performer, retestReason)
      const rtrq = await getRetestRequests({ sampleId: sample.id })
      setRetestRequests(rtrq)
      showToast({ type: "success", title: "Retest Requested", message: "Retest request has been submitted." })
      setRetestDialog(false)
      setRetestReason("")
      setOriginalResultId("")
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to request retest." })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="detail" count={1} />
      </div>
    )
  }

  if (error || !sample) {
    return (
      <div className="p-6">
        <ErrorState
          title="Sample Not Found"
          message={error || "Could not load sample details."}
          onRetry={loadSample}
        />
      </div>
    )
  }

  const rejectionCategories: { value: Sample["rejectionCategory"]; label: string }[] = [
    { value: "clotted", label: "Clotted" },
    { value: "haemolysed", label: "Haemolysed" },
    { value: "insufficient", label: "Insufficient" },
    { value: "wrong_container", label: "Wrong Container" },
    { value: "contaminated", label: "Contaminated" },
    { value: "expired", label: "Expired" },
    { value: "mislabeled", label: "Mislabeled" },
    { value: "other", label: "Other" },
  ]

  const actionButtons: { label: string; icon: typeof Syringe; show: boolean; onClick: () => void; variant?: "default" | "destructive" | "outline" }[] = [
    { label: "Collect", icon: Syringe, show: sample.status === "registered", onClick: () => setCollectDialog(true) },
    { label: "Receive", icon: Package, show: sample.status === "collected", onClick: () => setReceiveDialog(true) },
    { label: "Process", icon: FlaskConical, show: sample.status === "received", onClick: () => setProcessDialog(true) },
    { label: "Reject", icon: XCircle, show: ["registered", "collected", "received"].includes(sample.status), onClick: () => setRejectDialog(true), variant: "destructive" },
    { label: "Dispose", icon: Trash2, show: sample.status === "approved" || sample.status === "rejected", onClick: () => setDisposeDialog(true), variant: "destructive" },
    { label: "Request Retest", icon: RotateCcw, show: sample.status === "approved" || sample.status === "delivered", onClick: () => setRetestDialog(true) },
  ]

  const availableActions = actionButtons.filter((a) => a.show)

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`Sample ${sample.barcode}`}
        description={`Patient: ${sample.patientName} | Test: ${sample.testName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/samples/tracking")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracking
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
          >
            <action.icon className="mr-1.5 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="aliquots">Aliquots ({aliquots.length})</TabsTrigger>
          <TabsTrigger value="transfers">Transfers ({transfers.length})</TabsTrigger>
          <TabsTrigger value="retests">Retests ({retestRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sample Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Barcode</p>
                    <p className="flex items-center gap-1 font-mono text-sm font-medium">
                      <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
                      {sample.barcode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={sample.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <StatusBadge status={sample.priority!} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm">{sample.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Container</p>
                    <p className="text-sm">{sample.container}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="text-sm">{sample.volume}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm">{sample.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Is Aliquot</p>
                    <p className="text-sm">{sample.isAliquot ? "Yes" : "No"}</p>
                  </div>
                </div>
                {sample.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{sample.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sample.patientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FlaskConical className="h-4 w-4" />
                  <span>{sample.testName}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{sample.patientPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm">{sample.bookingId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm">{formatDate(sample.createdAt!, "datetime")}</p>
                </div>
              </CardContent>
            </Card>

            {sample.rejectedAt && (
              <Card className="border-destructive/30 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Rejection Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Rejected By:</span> {sample.rejectedBy}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rejected At:</span> {sample.rejectedAt ? formatDate(sample.rejectedAt, "datetime") : ""}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span> {sample.rejectionCategory?.replace(/_/g, " ")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason:</span> {sample.rejectedReason}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <EmptyState icon={<Clock className="h-6 w-6" />} title="No timeline events" description="No status changes recorded yet." />
              ) : (
                <SampleTimeline events={timeline} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aliquots">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aliquots</CardTitle>
                <Button size="sm" onClick={() => setAliquotDialog(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create Aliquot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aliquots.length === 0 ? (
                <EmptyState icon={<FlaskRound className="h-6 w-6" />} title="No aliquots" description="No aliquots created from this sample yet." />
              ) : (
                <div className="space-y-2">
                  {aliquots.map((alq) => (
                    <div key={alq.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-mono text-sm font-medium">{alq.barcode}</p>
                        <p className="text-xs text-muted-foreground">
                          {alq.volume} | {alq.container}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={alq.status} />
                        {alq.expiryDate && (
                          <span className="text-xs text-muted-foreground">
                            Exp: {formatDate(alq.expiryDate, "short")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
            </CardHeader>
            <CardContent>
              {transfers.length === 0 ? (
                <EmptyState icon={<Package className="h-6 w-6" />} title="No transfers" description="No transfers recorded for this sample." />
              ) : (
                <div className="space-y-2">
                  {transfers.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{t.fromDepartment} → {t.toDepartment}</p>
                          <p className="text-xs text-muted-foreground">{t.fromBranch} → {t.toBranch}</p>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>By: {t.transferredBy}</span>
                        <span>At: {formatDate(t.transferredAt, "datetime")}</span>
                      </div>
                      {t.notes && <p className="mt-1 text-xs text-muted-foreground">{t.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Retest Requests</CardTitle>
                <Button size="sm" onClick={() => setRetestDialog(true)}>
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Request Retest
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {retestRequests.length === 0 ? (
                <EmptyState icon={<RotateCcw className="h-6 w-6" />} title="No retest requests" description="No retest requests for this sample." />
              ) : (
                <div className="space-y-2">
                  {retestRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Requested by {r.requestedBy}</p>
                        <p className="text-xs text-muted-foreground">Reason: {r.reason}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.requestedAt, "datetime")}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={collectDialog} onOpenChange={(o) => !o && setCollectDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Collected</DialogTitle>
            <DialogDescription>Confirm sample collection details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collected By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAction("collected", { collectedBy: performer, collectedAt: new Date().toISOString() }, () => setCollectDialog(false))} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={receiveDialog} onOpenChange={(o) => !o && setReceiveDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Received</DialogTitle>
            <DialogDescription>Confirm sample receipt in the lab.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Received By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAction("received", { receivedBy: performer, receivedAt: new Date().toISOString() }, () => setReceiveDialog(false))} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={processDialog} onOpenChange={(o) => !o && setProcessDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Processing</DialogTitle>
            <DialogDescription>Move sample to processing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Processed By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAction("processing", { processedBy: performer, processedAt: new Date().toISOString() }, () => setProcessDialog(false))} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Start Processing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={(o) => !o && setRejectDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Sample</DialogTitle>
            <DialogDescription>Provide details for sample rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejected By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Category</label>
              <Select value={rejectCategory} onValueChange={(v) => setRejectCategory(v as Sample["rejectionCategory"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rejectionCategories.map((c) => (
                    <SelectItem key={c.value!} value={c.value!}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Describe the reason for rejection..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectReason}>
              {actionLoading ? "Processing..." : "Reject Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disposeDialog} onOpenChange={(o) => !o && setDisposeDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Sample</DialogTitle>
            <DialogDescription>Provide disposal details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Disposed By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Disposal Reason</label>
              <Textarea value={disposalReason} onChange={(e) => setDisposalReason(e.target.value)} placeholder="Reason for disposal..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDispose} disabled={actionLoading || !disposalReason}>
              {actionLoading ? "Processing..." : "Dispose Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aliquotDialog} onOpenChange={(o) => !o && setAliquotDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Aliquot</DialogTitle>
            <DialogDescription>Create a new aliquot from this sample.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <Select value={aliquotVolume} onValueChange={setAliquotVolume}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0.5mL", "1mL", "2mL", "3mL", "5mL"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Container</label>
                <Select value={aliquotContainer} onValueChange={setAliquotContainer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Microtube", "Cryovial", "Eppendorf", "PCR Tube"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAliquotDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAliquot} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create Aliquot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={retestDialog} onOpenChange={(o) => !o && setRetestDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Retest</DialogTitle>
            <DialogDescription>Submit a retest request for this sample.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Requested By</label>
              <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
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
            <Button variant="outline" onClick={() => setRetestDialog(false)}>Cancel</Button>
            <Button onClick={handleRequestRetest} disabled={actionLoading || !retestReason || !originalResultId}>
              {actionLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
