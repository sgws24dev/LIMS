"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  FileText,
  Eye,
  Send,
  CheckCircle2,
  Download,
  Search,
  CheckSquare,
  FileCheck,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import type { Result } from "@/types"
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

export default function ReportsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("draft")
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Reports" }])
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const grouped = useMemo(() => {
    const draft = mockResults.filter((r) => r.status === "draft")
    const review = mockResults.filter((r) => r.status === "review")
    const approved = mockResults.filter((r) => r.status === "approved")
    const published = mockResults.filter((r) => r.status === "published")
    return { draft, review, approved, published }
  }, [])

  const currentData = useMemo(() => {
    const data = grouped[activeTab as keyof typeof grouped] || []
    if (!searchQuery) return data
    const q = searchQuery.toLowerCase()
    return data.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q)
    )
  }, [activeTab, grouped, searchQuery])

  const handleAction = (id: string, action: string) => {
    setConfirmAction({ id, action })
  }

  const confirmAndAct = () => {
    if (!confirmAction) return
    const { action } = confirmAction
    const messages: Record<string, string> = {
      "submit-review": "submitted for review",
      approve: "approved",
      publish: "published",
    }
    toast({
      title: `Report ${messages[action] || action}`,
      description: `Report has been ${messages[action] || action} successfully.`,
      variant: "success",
    })
    setConfirmAction(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" description="Manage and view test reports" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-[400px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Manage and view test reports"
        actions={
          <Button variant="outline" onClick={() => navigate("/reports/approval")}>
            <FileCheck className="mr-2 h-4 w-4" />
            Approval Queue
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="draft">
              Draft
              {grouped.draft.length > 0 && (
                <Badge variant="warning" className="ml-2 text-[10px] px-1.5 py-0">{grouped.draft.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="review">
              Review
              {grouped.review.length > 0 && (
                <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0">{grouped.review.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {grouped.approved.length > 0 && (
                <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0">{grouped.approved.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published">
              Published
              {grouped.published.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{grouped.published.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by patient/report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {(["draft", "review", "approved", "published"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {currentData.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title={`No ${tab} reports`}
                description={searchQuery ? "Try a different search term" : `No reports in ${tab} status`}
              />
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Report ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Test</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentData.map((report) => (
                      <tr key={report.id} className="group hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm">{report.id}</td>
                        <td className="px-4 py-3 font-medium">{report.patientName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{report.testName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(report.enteredAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig[report.status].variant}>{statusConfig[report.status].label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/reports/pdf-preview?id=${report.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Submit for Review"
                                onClick={() => handleAction(report.id, "submit-review")}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {report.status === "review" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600"
                                title="Approve"
                                onClick={() => handleAction(report.id, "approve")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {report.status === "approved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Publish"
                                onClick={() => handleAction(report.id, "publish")}
                              >
                                <CheckSquare className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={() => {
                              const link = document.createElement("a")
                              link.download = `report-${report.id}.pdf`
                              link.click()
                              toast({ title: "Downloading PDF", description: `Report ${report.id} is being downloaded.`, variant: "success" })
                            }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "submit-review" && "Submit this report for review?"}
              {confirmAction?.action === "approve" && "Approve this report?"}
              {confirmAction?.action === "publish" && "Publish this report?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button onClick={confirmAndAct}>
              {confirmAction?.action === "submit-review" && "Submit"}
              {confirmAction?.action === "approve" && "Approve"}
              {confirmAction?.action === "publish" && "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
