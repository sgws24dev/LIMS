"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  Share2,
  Plus,
  Copy,
  XCircle,
  Clock,
  Eye,
  Link2,
  RefreshCw,
  Mail,
  Calendar,
  ExternalLink,
  Search,
  ChevronRight,
  Trash2,
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
import { Input } from "@/components/ui/input"
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
import type { SharedReport } from "@/types"
import { sharedReports as mockSharedReports } from "@/mock/data/shared-reports"
import { results as mockResults } from "@/mock/data/results"
import { getSharedReports, shareReport } from "@/mock/services/index"

const statusConfig = {
  active: { label: "Active", variant: "success" as const },
  expired: { label: "Expired", variant: "secondary" as const },
  revoked: { label: "Revoked", variant: "destructive" as const },
}

export default function ShareCenterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([])
  const [shareDialog, setShareDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null)
  const [shareForm, setShareForm] = useState({ resultId: "", emails: "", expiryDays: "90" })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "Share Center" },
    ])
    const timer = setTimeout(async () => {
      try {
        const data = await getSharedReports()
        setSharedReports(data)
      } catch {
        setSharedReports(mockSharedReports)
      }
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const filtered = useMemo(() => {
    let data = [...sharedReports]
    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.sharedWith.some((e) => e.toLowerCase().includes(q)) ||
        r.resultId.toLowerCase().includes(q)
      )
    }
    return data
  }, [sharedReports, statusFilter, searchQuery])

  const stats = useMemo(() => {
    const active = sharedReports.filter((r) => r.status === "active").length
    const expired = sharedReports.filter((r) => r.status === "expired").length
    const revoked = sharedReports.filter((r) => r.status === "revoked").length
    return { total: sharedReports.length, active, expired, revoked }
  }, [sharedReports])

  const handleShare = async () => {
    if (!shareForm.resultId || !shareForm.emails.trim()) return
    const emails = shareForm.emails.split(",").map((e) => e.trim()).filter(Boolean)
    if (emails.length === 0) return

    try {
      const newReport = await shareReport(shareForm.resultId, emails, parseInt(shareForm.expiryDays))
      setSharedReports((prev) => [newReport, ...prev])
      toast({ title: "Report shared", description: `Shared with ${emails.length} recipient(s).`, variant: "success" })
      setShareDialog(false)
      setShareForm({ resultId: "", emails: "", expiryDays: "90" })
    } catch {
      toast({ title: "Error", description: "Failed to share report.", variant: "destructive" })
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({ title: "Link copied", description: "Share link copied to clipboard.", variant: "success" })
  }

  const handleRevoke = (report: SharedReport) => {
    setSharedReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: "revoked" as const } : r))
    toast({ title: "Access revoked", description: "Share link has been revoked.", variant: "warning" })
  }

  const handleRenew = (report: SharedReport) => {
    setSharedReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: "active" as const } : r))
    toast({ title: "Share renewed", description: "Share link has been reactivated.", variant: "success" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Share Center" description="Manage report sharing" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-12" /></CardContent></Card>))}
        </div>
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Share Center"
        description="Manage report sharing and access"
        actions={
          <Button onClick={() => setShareDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />Share New Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-primary/[0.08] p-2.5 text-primary"><Share2 className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Total Shares</p><p className="text-lg font-semibold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"><Link2 className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Active</p><p className="text-lg font-semibold">{stats.active}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><Clock className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Expired</p><p className="text-lg font-semibold">{stats.expired}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-xl bg-destructive/[0.08] p-2.5 text-destructive"><XCircle className="h-4 w-4" /></div>
            <div><p className="text-xs text-muted-foreground/70">Revoked</p><p className="text-lg font-semibold">{stats.revoked}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Shared Reports</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative max-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent pl-7 pr-2 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Share2 className="h-12 w-12" />} title="No shared reports" description={searchQuery ? "Try a different search" : "Share a report to get started."} />
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((report) => (
                <div
                  key={report.id}
                  className="px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{report.resultId}</span>
                        <Badge variant={statusConfig[report.status].variant}>{statusConfig[report.status].label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{report.sharedWith.join(", ")}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{report.accessCount} views</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Expires {formatDate(report.expiresAt, "short")}</span>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", selectedReport?.id === report.id && "rotate-90")} />
                  </div>

                  {selectedReport?.id === report.id && (
                    <div className="mt-3 flex items-center gap-2 border-t pt-3">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleCopyLink(report.shareLink) }}>
                        <Copy className="mr-1 h-3 w-3" />Copy Link
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/results?resultId=${report.resultId}`) }}>
                        <Eye className="mr-1 h-3 w-3" />View Report
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); window.open(report.shareLink, "_blank") }}>
                        <ExternalLink className="mr-1 h-3 w-3" />Open
                      </Button>
                      {report.status === "active" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={(e) => { e.stopPropagation(); handleRevoke(report) }}>
                          <XCircle className="mr-1 h-3 w-3" />Revoke
                        </Button>
                      )}
                      {(report.status === "expired" || report.status === "revoked") && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleRenew(report) }}>
                          <RefreshCw className="mr-1 h-3 w-3" />Renew
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Share Report</DialogTitle>
            <DialogDescription>Share a report with recipients via email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Select Report</label>
              <Select value={shareForm.resultId} onValueChange={(v) => setShareForm((f) => ({ ...f, resultId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose a report..." /></SelectTrigger>
                <SelectContent>
                  {mockResults.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.id} - {r.patientName} ({r.testName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Recipient Emails</label>
              <Input
                placeholder="doctor@example.com, patient@example.com"
                value={shareForm.emails}
                onChange={(e) => setShareForm((f) => ({ ...f, emails: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expires In</label>
              <Select value={shareForm.expiryDays} onValueChange={(v) => setShareForm((f) => ({ ...f, expiryDays: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialog(false)}>Cancel</Button>
            <Button onClick={handleShare} disabled={!shareForm.resultId || !shareForm.emails.trim()}>
              <Share2 className="mr-2 h-4 w-4" />Share Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
