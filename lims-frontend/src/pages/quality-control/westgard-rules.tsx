"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  ClipboardList,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getWestgardViolations, resolveViolation, getQCRecordsExtended } from "@/mock/services"
import type { WestgardViolation, QCRecord } from "@/types"

const westgardRulesReference = [
  { rule: "1-2s", name: "1-2s Warning", description: "One control value exceeds ±2SD. This is a warning rule - inspect the data and check the next run.", severity: "warning" },
  { rule: "1-3s", name: "1-3s Rejection", description: "One control value exceeds ±3SD. Indicates random error or possibly a blunder.", severity: "out_of_control" },
  { rule: "2-2s", name: "2-2s Rejection", description: "Two consecutive control values exceed ±2SD on the same side of the mean. Indicates systematic error.", severity: "out_of_control" },
  { rule: "R-4s", name: "R-4s Rejection", description: "The range between two QC levels exceeds 4SD. Indicates random error.", severity: "warning" },
  { rule: "4-1s", name: "4-1s Rejection", description: "Four consecutive values exceed ±1SD on the same side of the mean. Indicates systematic error.", severity: "warning" },
  { rule: "10x", name: "10x Rejection", description: "Ten consecutive values on the same side of the mean. Indicates systematic bias.", severity: "out_of_control" },
  { rule: "8x", name: "8x Warning", description: "Eight consecutive values on the same side of the mean. Early warning of systematic bias.", severity: "warning" },
  { rule: "7T", name: "7T Trend", description: "Seven consecutive values trending in the same direction. Indicates reagent or calibrator degradation.", severity: "warning" },
]

export default function WestgardRulesPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [violations, setViolations] = useState<WestgardViolation[]>([])
  const [records, setRecords] = useState<QCRecord[]>([])
  const [selectedViolation, setSelectedViolation] = useState<WestgardViolation | null>(null)
  const [resolveDialog, setResolveDialog] = useState<WestgardViolation | null>(null)
  const [actionText, setActionText] = useState("")
  const [resolveLoading, setResolveLoading] = useState(false)
  const [showReference, setShowReference] = useState(false)
  const [tab, setTab] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Westgard Rules" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [v, r] = await Promise.all([
          getWestgardViolations(),
          getQCRecordsExtended({ limit: 50 }),
        ])
        setViolations(v)
        setRecords(r)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredViolations = useMemo(() => {
    if (tab === "open") return violations.filter((v) => !v.resolvedAt)
    if (tab === "resolved") return violations.filter((v) => v.resolvedAt)
    return violations
  }, [violations, tab])

  const handleResolve = async () => {
    if (!resolveDialog || !actionText.trim()) return
    setResolveLoading(true)
    try {
      await resolveViolation(resolveDialog.id, "Current User", actionText)
      const updated = await getWestgardViolations()
      setViolations(updated)
      toast({ title: "Violation Resolved", description: "Corrective action recorded", variant: "success" })
      setResolveDialog(null)
      setActionText("")
    } catch (e) {
      toast({ title: "Failed to resolve", description: e instanceof Error ? e.message : "Error occurred", variant: "destructive" })
    } finally {
      setResolveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Westgard Rules" description="Westgard rules violations and reference guide" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Westgard Rules" description="Westgard rules violations and reference guide" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Westgard Rules"
        description="Westgard rules violations and reference guide"
        actions={
          <Button variant="outline" size="sm" onClick={() => setShowReference(!showReference)}>
            <BookOpen className="mr-1 h-3.5 w-3.5" />
            {showReference ? "Hide Reference" : "Rules Reference"}
          </Button>
        }
      />

      {showReference && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Westgard Rules Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {westgardRulesReference.map((r) => (
                <div key={r.rule} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={r.severity === "out_of_control" ? "destructive" : "warning"}>{r.rule}</Badge>
                    <span className="font-medium text-sm">{r.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({violations.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({violations.filter((v) => !v.resolvedAt).length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({violations.filter((v) => v.resolvedAt).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filteredViolations.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-12 w-12" />}
              title="No violations"
              description={tab === "open" ? "No open violations - QC is in control" : "No resolved violations"}
            />
          ) : (
            <div className="space-y-2">
              {filteredViolations.map((v) => (
                <Card
                  key={v.id}
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => setSelectedViolation(v)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                          v.severity === "out_of_control" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {v.severity === "out_of_control" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={v.severity === "out_of_control" ? "destructive" : "warning"} className="text-[11px]">{v.rule}</Badge>
                            <span className="font-medium text-sm">{v.description}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(v.detectedAt, "datetime")}</span>
                            <Badge variant={v.severity === "out_of_control" ? "destructive" : "warning"} className="text-[10px]">{v.severity.replace(/_/g, " ")}</Badge>
                            {v.resolvedAt && <span>Resolved: {formatDate(v.resolvedAt, "short")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!v.resolvedAt ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); setResolveDialog(v) }}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Resolve
                          </Button>
                        ) : (
                          <Badge variant="success">Resolved</Badge>
                        )}
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedViolation} onOpenChange={(o) => { if (!o) setSelectedViolation(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Violation Details - {selectedViolation?.rule}</DialogTitle>
            <DialogDescription>Westgard rule violation information</DialogDescription>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={selectedViolation.severity === "out_of_control" ? "destructive" : "warning"}>{selectedViolation.rule}</Badge>
                <Badge variant={selectedViolation.severity === "out_of_control" ? "destructive" : "warning"}>{selectedViolation.severity.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-sm">{selectedViolation.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Detected:</span> {formatDate(selectedViolation.detectedAt, "datetime")}</div>
                <div><span className="text-muted-foreground">QC Records:</span> {selectedViolation.qcRecordIds.length}</div>
                {selectedViolation.resolvedAt && (
                  <>
                    <div><span className="text-muted-foreground">Resolved By:</span> {selectedViolation.resolvedBy}</div>
                    <div><span className="text-muted-foreground">Resolved At:</span> {formatDate(selectedViolation.resolvedAt, "datetime")}</div>
                  </>
                )}
              </div>
              {selectedViolation.action && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">Action Taken:</span>
                  <p>{selectedViolation.action}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!resolveDialog} onOpenChange={(o) => { if (!o) setResolveDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Violation - {resolveDialog?.rule}</DialogTitle>
            <DialogDescription>Record corrective action taken</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              label="Corrective Action"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="Describe corrective action taken..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={resolveLoading || !actionText.trim()}>
              {resolveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
