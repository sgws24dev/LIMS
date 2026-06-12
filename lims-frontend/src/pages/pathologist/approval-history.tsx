"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  History,
  Search,
  Filter,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  ChevronRight,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { PathologistReview } from "@/types"
import { pathologistReviews as mockReviews } from "@/mock/data/pathologist-reviews"

export default function ApprovalHistoryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pathologistFilter, setPathologistFilter] = useState<string>("all")
  const [reviews, setReviews] = useState<PathologistReview[]>([])
  const [selectedReview, setSelectedReview] = useState<PathologistReview | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "History" },
    ])
    const timer = setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const pathologists = useMemo(() => {
    const names = new Set(reviews.map((r) => r.reviewerName))
    return Array.from(names)
  }, [reviews])

  const filtered = useMemo(() => {
    let data = [...reviews]
    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter)
    if (pathologistFilter !== "all") data = data.filter((r) => r.reviewerName === pathologistFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter((r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      )
    }
    return data
  }, [reviews, statusFilter, pathologistFilter, searchQuery])

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved").length
    const rejected = reviews.filter((r) => r.status === "rejected").length
    const pending = reviews.filter((r) => r.status === "pending").length
    return { total: reviews.length, approved, rejected, pending }
  }, [reviews])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Approval History" description="History of all approved and rejected reports" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-12" /></CardContent></Card>))}
        </div>
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval History"
        description="History of all approved and rejected reports"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative max-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><Filter className="mr-2 h-3 w-3" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="amend_requested">Amend Requested</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pathologistFilter} onValueChange={setPathologistFilter}>
              <SelectTrigger className="w-[180px]"><User className="mr-2 h-3 w-3" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pathologists</SelectItem>
                {pathologists.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-primary/[0.08] p-2.5 text-primary"><History className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Total</p><p className="text-lg font-semibold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Approved</p><p className="text-lg font-semibold">{stats.approved}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-destructive/[0.08] p-2.5 text-destructive"><XCircle className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Rejected</p><p className="text-lg font-semibold">{stats.rejected}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><Clock className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Pending</p><p className="text-lg font-semibold">{stats.pending}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<History className="h-12 w-12" />} title="No history found" description="No matching records found with current filters." />
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.patientName}</span>
                      <StatusBadge status={review.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{review.testName}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{review.reviewerName}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(review.reviewedAt, "datetime")}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full audit trail for this review</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
                <div><span className="text-xs text-muted-foreground">Patient</span><p className="font-medium">{selectedReview.patientName}</p></div>
                <div><span className="text-xs text-muted-foreground">Test</span><p className="font-medium">{selectedReview.testName}</p></div>
                <div><span className="text-xs text-muted-foreground">Reviewer</span><p className="font-medium">{selectedReview.reviewerName}</p></div>
                <div><span className="text-xs text-muted-foreground">Status</span><StatusBadge status={selectedReview.status} /></div>
                <div><span className="text-xs text-muted-foreground">Result ID</span><p className="font-mono text-sm">{selectedReview.resultId}</p></div>
                <div><span className="text-xs text-muted-foreground">Sample ID</span><p className="font-mono text-sm">{selectedReview.sampleId}</p></div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Digital Signature</h4>
                {selectedReview.digitalSignature ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{selectedReview.digitalSignature}</span>
                    </div>
                    {selectedReview.signatureDate && (
                      <p className="text-xs text-emerald-600/70 mt-1">Signed on {formatDate(selectedReview.signatureDate, "datetime")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not signed</p>
                )}
              </div>

              {selectedReview.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Comments ({selectedReview.comments.length})</h4>
                  <div className="space-y-2">
                    {selectedReview.comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <div className="flex items-center gap-2">
                            {comment.isInternal && <Badge variant="secondary" className="text-[10px] px-1.5">Internal</Badge>}
                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt, "datetime")}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.status === "rejected" && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Rejected</span>
                  </div>
                  {selectedReview.comments.filter((c) => c.isInternal === false).map((c) => (
                    <p key={c.id} className="text-sm mt-1">{c.text}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
