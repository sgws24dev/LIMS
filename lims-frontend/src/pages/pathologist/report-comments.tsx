"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Clock,
  AlertCircle,
  ChevronLeft,
  Send,
  CheckCheck,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import type { PathologistReview, PathologistComment } from "@/types"
import { pathologistReviews as mockReviews } from "@/mock/data/pathologist-reviews"
import { addComment } from "@/mock/services/index"

export default function ReportCommentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const reviewId = searchParams.get("reviewId")
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<PathologistReview[]>([])
  const [selectedReview, setSelectedReview] = useState<PathologistReview | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "Comments" },
    ])
    const timer = setTimeout(() => {
      setReviews(mockReviews)
      const found = reviewId ? mockReviews.find((r) => r.id === reviewId) : mockReviews[0]
      setSelectedReview(found || mockReviews[0])
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs, reviewId])

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReview) return
    try {
      const updated = await addComment(selectedReview.id, "Current User", newComment, isInternal)
      setSelectedReview(updated)
      setNewComment("")
      toast({ title: "Comment added", description: isInternal ? "Internal note added." : "External comment added.", variant: "success" })
    } catch {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" })
    }
  }

  const handleResolveComment = (commentId: string) => {
    setResolving(commentId)
    setTimeout(() => {
      toast({ title: "Comment resolved", variant: "success" })
      setResolving(null)
    }, 300)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Comments" description="Threaded comments on reports" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1"><CardContent className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</CardContent></Card>
          <Card className="lg:col-span-2"><CardContent className="p-4 space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}</CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Comments"
        description="Threaded comments on reports"
        actions={
          <Select value={selectedReview?.id || ""} onValueChange={(v) => setSelectedReview(reviews.find((r) => r.id === v) || null)}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a report..." /></SelectTrigger>
            <SelectContent>
              {reviews.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.patientName} - {r.testName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Reports</CardTitle></CardHeader>
          <CardContent className="p-0">
            {reviews.length === 0 ? (
              <div className="p-4"><EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No reports" /></div>
            ) : (
              <div className="divide-y">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50",
                      selectedReview?.id === review.id && "bg-accent border-l-2 border-primary"
                    )}
                    onClick={() => setSelectedReview(review)}
                  >
                    <p className="text-sm font-medium">{review.patientName}</p>
                    <p className="text-xs text-muted-foreground">{review.testName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{review.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{review.comments.length} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {selectedReview ? `${selectedReview.patientName} - ${selectedReview.testName}` : "Select a report"}
            </CardTitle>
            <span className="text-xs text-muted-foreground">{selectedReview?.comments.length || 0} comments</span>
          </CardHeader>
          <CardContent>
            {!selectedReview ? (
              <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="Select a report" description="Choose a report from the left panel to view its comments." />
            ) : selectedReview.comments.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No comments yet" description="Be the first to add a comment on this report." />
            ) : (
              <div className="space-y-4">
                {selectedReview.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      comment.isInternal && "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(comment.createdAt, "datetime")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comment.isInternal ? (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />Internal
                          </Badge>
                        ) : (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                            <Eye className="h-3 w-3" />External
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-9">{comment.text}</p>
                    <div className="flex items-center gap-2 mt-2 pl-9">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleResolveComment(comment.id)}
                        disabled={resolving === comment.id}
                      >
                        {resolving === comment.id ? (
                          <CheckCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {resolving === comment.id ? "Resolving..." : "Resolve"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedReview && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Comment</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(true)}
                  className="flex items-center gap-1"
                >
                  <EyeOff className="h-3.5 w-3.5" />Internal
                </Button>
                <Button
                  variant={!isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(false)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />External
                </Button>
              </div>
              <Textarea
                placeholder={isInternal ? "Add an internal note (visible only to lab staff)..." : "Add an external comment (visible on patient report)..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {isInternal
                    ? "Internal notes are visible only to lab staff."
                    : "External comments will appear on the patient's report."}
                </p>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />Add Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
