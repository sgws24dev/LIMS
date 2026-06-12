"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  XCircle,
  Search,
  Eye,
  RefreshCw,
  FileEdit,
  AlertTriangle,
  ChevronRight,
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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { PathologistReview, Result } from "@/types"
import { pathologistReviews as mockReviews } from "@/mock/data/pathologist-reviews"
import { results as mockResults } from "@/mock/data/results"

export default function RejectedReportsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [rejectedReviews, setRejectedReviews] = useState<PathologistReview[]>([])
  const [selectedReview, setSelectedReview] = useState<PathologistReview | null>(null)
  const [amendDialog, setAmendDialog] = useState<PathologistReview | null>(null)
  const [amendReason, setAmendReason] = useState("")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "Rejected" },
    ])
    const timer = setTimeout(() => {
      const rejected = mockReviews.filter((r) => r.status === "rejected")
      setRejectedReviews(rejected)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const filtered = useMemo(() => {
    if (!searchQuery) return rejectedReviews
    const q = searchQuery.toLowerCase()
    return rejectedReviews.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    )
  }, [rejectedReviews, searchQuery])

  const handleReReview = (review: PathologistReview) => {
    toast({ title: "Re-review initiated", description: `Re-review started for ${review.patientName}.`, variant: "default" })
  }

  const handleRequestAmendment = (review: PathologistReview) => {
    if (!amendReason.trim()) return
    toast({ title: "Amendment requested", description: `Amendment requested for ${review.resultId}.`, variant: "default" })
    setAmendDialog(null)
    setAmendReason("")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rejected Reports" description="Reports that have been rejected" />
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rejected Reports"
        description="Reports that have been rejected during review"
        actions={
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        }
      />

      {rejectedReviews.length > 0 && (
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-destructive/[0.08] p-3 text-destructive"><XCircle className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Total Rejected</p><p className="text-2xl font-semibold">{rejectedReviews.length}</p></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Rejected Reports</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<XCircle className="h-12 w-12" />}
              title="No rejected reports"
              description={searchQuery ? "Try a different search term" : "All reports have been approved."}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((review) => {
                const rejectionComment = review.comments.find((c) => !c.isInternal)
                return (
                  <div
                    key={review.id}
                    className="rounded-lg border border-destructive/20 p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedReview(selectedReview?.id === review.id ? null : review)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{review.patientName}</span>
                          <StatusBadge status="rejected" />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                          <div><span className="text-xs text-muted-foreground">Test</span><p>{review.testName}</p></div>
                          <div><span className="text-xs text-muted-foreground">Reviewed by</span><p>{review.reviewerName}</p></div>
                          <div><span className="text-xs text-muted-foreground">Date</span><p>{formatDate(review.reviewedAt, "datetime")}</p></div>
                        </div>
                        {rejectionComment && (
                          <div className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3 mt-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-destructive">Rejection Reason</p>
                              <p className="text-sm text-muted-foreground">{rejectionComment.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", selectedReview?.id === review.id && "rotate-90")} />
                    </div>

                    {selectedReview?.id === review.id && (
                      <div className="mt-4 flex items-center gap-2 border-t pt-4">
                        <Button size="sm" onClick={() => handleReReview(review)}>
                          <RefreshCw className="mr-1.5 h-4 w-4" />Re-review
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAmendDialog(review)}>
                          <FileEdit className="mr-1.5 h-4 w-4" />Request Amendment
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/pathologist/review/${review.resultId}`)}>
                          <Eye className="mr-1.5 h-4 w-4" />View Details
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!amendDialog} onOpenChange={() => { setAmendDialog(null); setAmendReason("") }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Amendment</DialogTitle><DialogDescription>Describe the amendment needed for {amendDialog?.patientName} - {amendDialog?.testName}</DialogDescription></DialogHeader>
          <Textarea label="Amendment Details" placeholder="Describe what needs to be amended..." value={amendReason} onChange={(e) => setAmendReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAmendDialog(null); setAmendReason("") }}>Cancel</Button>
            <Button disabled={!amendReason.trim()} onClick={() => amendDialog && handleRequestAmendment(amendDialog)}>
              <FileEdit className="mr-2 h-4 w-4" />Request Amendment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
