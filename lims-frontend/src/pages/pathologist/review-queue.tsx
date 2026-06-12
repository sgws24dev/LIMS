"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  ClipboardList,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  Edit3,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Result, ResultParameter } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { pathologistReviews as mockReviews, addComment, approveReview, rejectReview } from "@/mock/services/index"

const priorityColors: Record<string, string> = {
  routine: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  urgent: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  stat: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  today: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
}

function getTATStatus(createdAt: string): { label: string; variant: "success" | "warning" | "destructive" } {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const hours = (now - created) / (1000 * 60 * 60)
  if (hours < 24) return { label: "On Time", variant: "success" }
  if (hours < 48) return { label: "Due Soon", variant: "warning" }
  return { label: "Overdue", variant: "destructive" }
}

export default function ReviewQueuePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState<Result[]>([])
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [reviewDialog, setReviewDialog] = useState<{ type: "approve" | "reject" | "amend"; result: Result } | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [amendReason, setAmendReason] = useState("")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "Review Queue" },
    ])
    const timer = setTimeout(() => {
      const pending = mockResults.filter((r) => r.status === "review" || r.status === "draft")
      setReviews(pending)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const filtered = useMemo(() => {
    if (!searchQuery) return reviews
    const q = searchQuery.toLowerCase()
    return reviews.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    )
  }, [reviews, searchQuery])

  const stats = useMemo(() => {
    const total = reviews.length
    const critical = reviews.filter((r) => r.isCritical).length
    const abnormal = reviews.filter((r) => r.isAbnormal).length
    return { total, critical, abnormal }
  }, [reviews])

  const handleApprove = async (result: Result) => {
    try {
      await approveReview(result.id, "Dr. Current User - Digitally Signed")
      setReviews((prev) => prev.filter((r) => r.id !== result.id))
      toast({ title: "Review approved", description: `Report ${result.id} has been approved.`, variant: "success" })
      setReviewDialog(null)
    } catch {
      toast({ title: "Error", description: "Failed to approve review.", variant: "destructive" })
    }
  }

  const handleReject = async (result: Result) => {
    if (!rejectReason.trim()) return
    try {
      await rejectReview(result.id, rejectReason)
      setReviews((prev) => prev.filter((r) => r.id !== result.id))
      toast({ title: "Review rejected", description: `Report ${result.id} has been rejected.`, variant: "destructive" })
      setReviewDialog(null)
      setRejectReason("")
    } catch {
      toast({ title: "Error", description: "Failed to reject review.", variant: "destructive" })
    }
  }

  const handleAmend = async (result: Result) => {
    if (!amendReason.trim()) return
    try {
      await addComment(result.id, "Current User", "Amendment requested: " + amendReason, false)
      setReviews((prev) => prev.filter((r) => r.id !== result.id))
      toast({ title: "Amendment requested", description: `Amendment requested for ${result.id}.`, variant: "default" })
      setReviewDialog(null)
      setAmendReason("")
    } catch {
      toast({ title: "Error", description: "Failed to request amendment.", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Review Queue" description="Results pending pathologist review" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        description="Results pending pathologist review"
        actions={
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient/test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-primary/[0.08] p-3 text-primary"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Pending Review</p><p className="text-2xl font-semibold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-destructive/[0.08] p-3 text-destructive"><AlertCircle className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Critical Values</p><p className="text-2xl font-semibold">{stats.critical}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><Activity className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Abnormal Results</p><p className="text-2xl font-semibold">{stats.abnormal}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Results Awaiting Review</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No pending reviews" description={searchQuery ? "Try a different search term" : "All results have been reviewed."} />
          ) : (
            <div className="space-y-3">
              {filtered.map((result) => {
                const tat = getTATStatus(result.enteredAt)
                return (
                  <div
                    key={result.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/50",
                      result.isCritical && "border-destructive/30 bg-destructive/5"
                    )}
                    onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{result.patientName}</span>
                          <Badge variant={result.isCritical ? "destructive" : result.isAbnormal ? "warning" : "secondary"}>
                            {result.isCritical ? "Critical" : result.isAbnormal ? "Abnormal" : "Normal"}
                          </Badge>
                          <StatusBadge status={result.status} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div><span className="text-xs text-muted-foreground">Test</span><p>{result.testName}</p></div>
                          <div><span className="text-xs text-muted-foreground">Department</span><p>{result.department || "General"}</p></div>
                          <div><span className="text-xs text-muted-foreground">Submitted</span><p>{formatDate(result.enteredAt, "datetime")}</p></div>
                          <div><span className="text-xs text-muted-foreground">TAT</span><p><Badge variant={tat.variant}>{tat.label}</Badge></p></div>
                        </div>
                      </div>
                      <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", selectedResult?.id === result.id && "rotate-90")} />
                    </div>

                    {selectedResult?.id === result.id && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Parameters</h4>
                          <div className="rounded-lg border divide-y">
                            {result.parameters.map((param) => (
                              <div key={param.parameterId} className={cn("flex items-center justify-between px-4 py-2 text-sm", param.isAbnormal && "bg-destructive/5")}>
                                <div className="flex items-center gap-2">
                                  <span>{param.parameterName}</span>
                                  {param.isAbnormal && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className={cn("font-mono font-medium", param.isAbnormal ? "text-destructive" : "")}>
                                    {param.value} {param.unit}
                                  </span>
                                  <span className="text-muted-foreground text-xs">{param.referenceRange}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {result.previousValues && result.previousValues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5" /> Delta Check
                            </h4>
                            <div className="rounded-lg border divide-y">
                              {result.previousValues.map((pv, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                                  <span>{pv.parameterName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">{pv.previousValue}</span>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    <span className={cn("font-mono", Math.abs(pv.change) > 20 ? "text-destructive font-medium" : "")}>
                                      {pv.currentValue}
                                    </span>
                                    <Badge variant={Math.abs(pv.change) > 20 ? "destructive" : "secondary"}>
                                      {pv.change > 0 ? "+" : ""}{pv.change}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" onClick={() => setReviewDialog({ type: "approve", result })}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => setReviewDialog({ type: "reject", result })}>
                            <XCircle className="mr-1.5 h-4 w-4" />Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setReviewDialog({ type: "amend", result })}>
                            <Edit3 className="mr-1.5 h-4 w-4" />Request Amendment
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

      <Dialog open={reviewDialog?.type === "approve"} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Review</DialogTitle><DialogDescription>Confirm approval for {reviewDialog?.result.patientName} - {reviewDialog?.result.testName}</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button onClick={() => reviewDialog?.result && handleApprove(reviewDialog.result)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Confirm Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialog?.type === "reject"} onOpenChange={() => { setReviewDialog(null); setRejectReason("") }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Review</DialogTitle><DialogDescription>Provide a reason for rejecting {reviewDialog?.result.patientName} - {reviewDialog?.result.testName}</DialogDescription></DialogHeader>
          <Textarea label="Rejection Reason" placeholder="Enter the reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialog(null); setRejectReason("") }}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => reviewDialog?.result && handleReject(reviewDialog.result)}>
              <XCircle className="mr-2 h-4 w-4" />Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialog?.type === "amend"} onOpenChange={() => { setReviewDialog(null); setAmendReason("") }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Amendment</DialogTitle><DialogDescription>Describe the amendment needed for {reviewDialog?.result.patientName} - {reviewDialog?.result.testName}</DialogDescription></DialogHeader>
          <Textarea label="Amendment Details" placeholder="Describe what needs to be amended..." value={amendReason} onChange={(e) => setAmendReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialog(null); setAmendReason("") }}>Cancel</Button>
            <Button disabled={!amendReason.trim()} onClick={() => reviewDialog?.result && handleAmend(reviewDialog.result)}>
              <Edit3 className="mr-2 h-4 w-4" />Request Amendment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
