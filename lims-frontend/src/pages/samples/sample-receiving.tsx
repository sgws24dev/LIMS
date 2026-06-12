"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Sample } from "@/types"
import { getSamplesExtended, updateSampleStatus, rejectSample } from "@/mock/services"
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
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Package,
  Search,
  Barcode,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Scan,
} from "lucide-react"

export default function SampleReceivingPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [barcodeScan, setBarcodeScan] = useState("")
  const [receiveDialog, setReceiveDialog] = useState<Sample | null>(null)
  const [rejectDialog, setRejectDialog] = useState<Sample | null>(null)
  const [receiverName, setReceiverName] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectCategory, setRejectCategory] = useState<Sample["rejectionCategory"]>("other")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Receiving" },
    ])
  }, [setBreadcrumbs])

  const loadSamples = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSamplesExtended({ status: "collected" })
      setSamples(result.data)
    } catch {
      setError("Failed to load receiving queue.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  const stats = useMemo(() => {
    const awaiting = samples.length
    const rejected = samples.filter((s) => s.status === "rejected").length
    return { awaiting, rejected }
  }, [samples])

  const filtered = useMemo(() => {
    let data = [...samples]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.patientName.toLowerCase().includes(q) ||
          s.barcode.toLowerCase().includes(q)
      )
    }
    if (barcodeScan) {
      data = data.filter((s) =>
        s.barcode.toLowerCase().includes(barcodeScan.toLowerCase())
      )
    }
    return data
  }, [samples, search, barcodeScan])

  const handleReceive = async () => {
    if (!receiveDialog || !receiverName) return
    setSaving(true)
    try {
      await updateSampleStatus(receiveDialog.id, "received", {
        receivedBy: receiverName,
        receivedAt: new Date().toISOString(),
      })
      showToast({
        type: "success",
        title: "Sample Received",
        message: `Sample ${receiveDialog.barcode} received by ${receiverName}.`,
      })
      setReceiveDialog(null)
      setReceiverName("")
      loadSamples()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to receive sample." })
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason) return
    setSaving(true)
    try {
      await rejectSample(rejectDialog.id, receiverName || "System", rejectReason, rejectCategory)
      showToast({
        type: "success",
        title: "Sample Rejected",
        message: `Sample ${rejectDialog.barcode} has been rejected.`,
      })
      setRejectDialog(null)
      setRejectReason("")
      loadSamples()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to reject sample." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="card" count={3} />
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

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Sample Receiving"
        description="Receiving desk - accept or reject collected samples into the lab"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard icon={<Package className="h-5 w-5" />} label="Awaiting Receipt" value={stats.awaiting} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={stats.rejected} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Collected Samples Pending Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="relative max-w-[220px]">
              <Scan className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan barcode..."
                value={barcodeScan}
                onChange={(e) => setBarcodeScan(e.target.value)}
                className="pl-8 font-mono"
              />
            </div>
            {barcodeScan && (
              <Button variant="ghost" size="sm" onClick={() => setBarcodeScan("")}>
                Clear
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No samples awaiting receipt"
              description="All collected samples have been received or no samples match your search."
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((sample) => (
                <Card key={sample.id} className="border-l-4 border-l-amber-400">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sample.patientName}</span>
                        <Badge variant="outline" className="text-[10px]">{sample.type}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Barcode className="h-3 w-3" />
                          <span className="font-mono">{sample.barcode}</span>
                        </span>
                        <span>•</span>
                        <span>{sample.testName}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        {sample.collectedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Collected: {formatDate(sample.collectedAt, "datetime")}
                          </span>
                        )}
                        {sample.collectedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {sample.collectedBy}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectDialog(sample)
                          setRejectCategory("other")
                          setRejectReason("")
                        }}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setReceiveDialog(sample)
                          setReceiverName("")
                        }}
                      >
                        <Package className="mr-1 h-3 w-3" /> Receive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!receiveDialog} onOpenChange={(o) => !o && setReceiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Receipt</DialogTitle>
            <DialogDescription>Verify sample details and enter receiver information.</DialogDescription>
          </DialogHeader>
          {receiveDialog && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode:</span>
                  <span className="font-mono font-medium">{receiveDialog.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{receiveDialog.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test:</span>
                  <span>{receiveDialog.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collected By:</span>
                  <span>{receiveDialog.collectedBy || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collected At:</span>
                  <span>{receiveDialog.collectedAt ? formatDate(receiveDialog.collectedAt, "datetime") : "—"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Received By</label>
                <Input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Enter receiver name..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialog(null)}>Cancel</Button>
            <Button onClick={handleReceive} disabled={saving || !receiverName}>
              {saving ? "Processing..." : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Sample</DialogTitle>
            <DialogDescription>Provide rejection details.</DialogDescription>
          </DialogHeader>
          {rejectDialog && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode:</span>
                  <span className="font-mono font-medium">{rejectDialog.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{rejectDialog.patientName}</span>
                </div>
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
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Describe the reason for rejection..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving || !rejectReason}>
              {saving ? "Processing..." : "Reject Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
