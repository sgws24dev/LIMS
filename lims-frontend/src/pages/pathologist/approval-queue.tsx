"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  Signature,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Result } from "@/types"
import { results as mockResults } from "@/mock/data/results"

export default function ApprovalQueuePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [approveDialog, setApproveDialog] = useState<Result | null>(null)
  const [rejectDialog, setRejectDialog] = useState<Result | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [signatureConfirmed, setSignatureConfirmed] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "Approval" },
    ])
    const timer = setTimeout(() => {
      const pending = mockResults.filter((r) => r.status === "review" || r.status === "verified" || r.status === "validated")
      setResults(pending)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const filtered = useMemo(() => {
    if (!searchQuery) return results
    const q = searchQuery.toLowerCase()
    return results.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    )
  }, [results, searchQuery])

  const stats = useMemo(() => {
    const total = results.length
    const critical = results.filter((r) => r.isCritical).length
    return { total, critical }
  }, [results])

  const handleApprove = async (result: Result) => {
    try {
      setResults((prev) => prev.filter((r) => r.id !== result.id))
      toast({ title: "Report approved", description: `${result.id} approved with digital signature.`, variant: "success" })
      setApproveDialog(null)
      setSignatureConfirmed(false)
    } catch {
      toast({ title: "Error", description: "Failed to approve report.", variant: "destructive" })
    }
  }

  const handleReject = async (result: Result) => {
    if (!rejectReason.trim()) return
    try {
      setResults((prev) => prev.filter((r) => r.id !== result.id))
      toast({ title: "Report rejected", description: `${result.id} has been rejected.`, variant: "destructive" })
      setRejectDialog(null)
      setRejectReason("")
    } catch {
      toast({ title: "Error", description: "Failed to reject report.", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Approval Queue" description="Results pending final approval" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Queue"
        description="Results pending final sign-off"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-primary/[0.08] p-3 text-primary"><FileCheck className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Pending Approval</p><p className="text-2xl font-semibold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-destructive/[0.08] p-3 text-destructive"><AlertCircle className="h-5 w-5" /></div>
            <div><p className="text-xs font-medium text-muted-foreground/70 uppercase">Critical Values</p><p className="text-2xl font-semibold">{stats.critical}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Awaiting Final Approval</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={<FileCheck className="h-12 w-12" />} title="No pending approvals" description={searchQuery ? "Try a different search term" : "All reports have been approved."} />
          ) : (
            <div className="space-y-3">
              {filtered.map((result) => (
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
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                        <div><span className="text-xs text-muted-foreground">Test</span><p>{result.testName}</p></div>
                        <div><span className="text-xs text-muted-foreground">Department</span><p>{result.department || "General"}</p></div>
                        <div><span className="text-xs text-muted-foreground">Submitted</span><p>{formatDate(result.enteredAt, "datetime")}</p></div>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", selectedResult?.id === result.id && "rotate-90")} />
                  </div>

                  {selectedResult?.id === result.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
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

                      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
                        <Signature className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-3 flex-1">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Digital Signature Required</p>
                            <p className="text-xs text-muted-foreground">Confirm that you have reviewed and verified all results before approving.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`sign-${result.id}`}
                              checked={selectedResult?.id === result.id}
                              onCheckedChange={() => {}}
                            />
                            <Label htmlFor={`sign-${result.id}`} className="text-sm">
                              I have reviewed and verified the results for {result.patientName}
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => { setApproveDialog(result); setSignatureConfirmed(true) }}>
                          <ShieldCheck className="mr-1.5 h-4 w-4" />Approve with Signature
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectDialog(result)}>
                          <XCircle className="mr-1.5 h-4 w-4" />Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!approveDialog} onOpenChange={() => { setApproveDialog(null); setSignatureConfirmed(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Approve with Signature</DialogTitle>
            <DialogDescription>You are about to digitally sign and approve this report. This action is legally binding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Patient</span><span className="font-medium">{approveDialog?.patientName}</span></div>
              <div className="flex justify-between text-sm"><span>Test</span><span className="font-medium">{approveDialog?.testName}</span></div>
              <div className="flex justify-between text-sm"><span>Report ID</span><span className="font-mono">{approveDialog?.id}</span></div>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
              <p className="text-sm font-medium mb-2">Signature Confirmation</p>
              <div className="flex items-center gap-2">
                <Checkbox id="approve-sign" checked={signatureConfirmed} onCheckedChange={(c) => setSignatureConfirmed(!!c)} />
                <Label htmlFor="approve-sign" className="text-sm">I confirm that I have reviewed all parameters and I am digitally signing this report.</Label>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground mb-1">Signed by</p>
              <p className="font-medium">Dr. Current User</p>
              <p className="text-xs text-muted-foreground">{formatDate(new Date().toISOString(), "datetime")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveDialog(null); setSignatureConfirmed(false) }}>Cancel</Button>
            <Button disabled={!signatureConfirmed} onClick={() => approveDialog && handleApprove(approveDialog)}>
              <ShieldCheck className="mr-2 h-4 w-4" />Sign & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason("") }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Report</DialogTitle><DialogDescription>Provide a reason for rejecting {rejectDialog?.patientName} - {rejectDialog?.testName}</DialogDescription></DialogHeader>
          <Textarea label="Rejection Reason" placeholder="Enter the reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason("") }}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => rejectDialog && handleReject(rejectDialog)}>
              <XCircle className="mr-2 h-4 w-4" />Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
