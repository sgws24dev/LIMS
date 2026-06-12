"use client"

import { useState, useEffect, useMemo } from "react"
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Stethoscope,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import type { Result, ResultParameter } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { useAppStore } from "@/store/appStore"

const statusConfig = {
  draft: { label: "Draft", variant: "warning" as const },
  review: { label: "Review", variant: "default" as const },
  verified: { label: "Verified", variant: "default" as const },
  validated: { label: "Validated", variant: "success" as const },
  approved: { label: "Approved", variant: "success" as const },
  published: { label: "Published", variant: "secondary" as const },
  amended: { label: "Amended", variant: "warning" as const },
}

export default function ReportApprovalPage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setBreadcrumbs([{ label: "Reports", href: "/reports" }, { label: "Approval Queue" }])
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const pendingReview = useMemo(
    () => mockResults.filter((r) => r.status === "review"),
    []
  )

  const stats = useMemo(() => {
    const approvedToday = mockResults.filter(
      (r) => r.approvedAt?.startsWith("2026-06-01")
    ).length
    return {
      pending: pendingReview.length,
      approvedToday,
      avgReviewTime: "3.5 hours",
    }
  }, [pendingReview])

  const handleApprove = (id: string) => {
    toast({
      title: "Report approved",
      description: "The report has been approved successfully.",
      variant: "success",
    })
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for rejection.", variant: "destructive" })
      return
    }
    toast({
      title: "Report rejected",
      description: "The report has been rejected and sent back for revision.",
      variant: "warning",
    })
    setRejectDialog(null)
    setRejectReason("")
  }

  const handleBatchApprove = () => {
    toast({
      title: "Batch approval complete",
      description: `${selectedIds.size} report${selectedIds.size > 1 ? "s" : ""} approved successfully.`,
      variant: "success",
    })
    setSelectedIds(new Set())
    setBatchMode(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Approval" description="Review and approve pending reports" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Approval Queue"
        description="Review and approve pending test reports"
        actions={
          <div className="flex items-center gap-2">
            {pendingReview.length > 0 && (
              <Button
                variant={batchMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setBatchMode(!batchMode)
                  setSelectedIds(new Set())
                }}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                {batchMode ? "Exit Batch" : "Batch Approve"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Review"
          value={stats.pending}
          trend={stats.pending > 0 ? { value: stats.pending, positive: false } : undefined}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Approved Today"
          value={stats.approvedToday}
        />
        <StatCard
          icon={<FileCheck className="h-5 w-5" />}
          label="Avg Review Time"
          value={stats.avgReviewTime}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4" />
            Reports Pending Approval ({pendingReview.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReview.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileCheck className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No pending reports</h3>
              <p className="mt-1 text-sm text-muted-foreground">All reports have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batchMode && selectedIds.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
                  <span className="text-sm font-medium">{selectedIds.size} report{selectedIds.size > 1 ? "s" : ""} selected</span>
                  <Button size="sm" onClick={handleBatchApprove}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Selected
                  </Button>
                </div>
              )}

              {pendingReview.map((report) => {
                const isExpanded = expandedId === report.id
                const isSelected = selectedIds.has(report.id)
                return (
                  <div
                    key={report.id}
                    className={cn(
                      "rounded-lg border transition-colors",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between p-4"
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    >
                      <div className="flex items-center gap-3">
                        {batchMode && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(report.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{report.patientName}</span>
                            <Badge variant={statusConfig[report.status].variant}>
                              {statusConfig[report.status].label}
                            </Badge>
                          </div>
                          <div className="mt-0.5 text-sm text-muted-foreground">
                            {report.testName} &middot; {report.id} &middot; {formatDate(report.enteredAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Entered by: {report.enteredBy}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-4 pb-4 pt-3">
                        <div className="mb-3 space-y-2">
                          {report.parameters.map((param) => (
                            <div key={param.parameterId} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{param.parameterName}</span>
                                <span className="font-mono text-sm">{param.value}</span>
                                <span className="text-xs text-muted-foreground">{param.unit}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Ref: {param.referenceRange}
                                </span>
                                {param.isAbnormal && (
                                  <Badge variant={param.isCritical ? "destructive" : "warning"} className="text-[10px]">
                                    {param.isCritical ? "CRITICAL" : "ABNORMAL"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {report.notes && (
                          <div className="mb-3 rounded-md bg-muted/30 p-3 text-sm">
                            <span className="text-xs font-medium text-muted-foreground">Notes:</span>
                            <p className="mt-0.5">{report.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 border-t pt-3">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(report.id)}
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setRejectDialog({ id: report.id })}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Reject Report
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this report. This will be sent back to the technician.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason for Rejection *</Label>
            <Textarea
              placeholder="e.g., Value seems inconsistent, please verify instrument calibration..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason("") }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
