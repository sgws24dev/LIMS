"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  Loader2,
  ClipboardList,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import { getMaintenanceRecords } from "@/mock/services"
import type { MaintenanceRecord } from "@/types"

const statusVariant: Record<string, "warning" | "info" | "success" | "destructive"> = {
  scheduled: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "destructive",
}

const typeVariant: Record<string, "default" | "destructive" | "warning"> = {
  preventive: "default",
  corrective: "destructive",
  emergency: "warning",
}

export default function MaintenanceRecordsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [tab, setTab] = useState("scheduled")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [completeDialog, setCompleteDialog] = useState<MaintenanceRecord | null>(null)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [completeNotes, setCompleteNotes] = useState("")
  const [completeCost, setCompleteCost] = useState("")
  const [completeParts, setCompleteParts] = useState("")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Maintenance" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMaintenanceRecords()
        setRecords(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load maintenance records")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tabRecords = useMemo(() => {
    if (tab === "scheduled") return records.filter((r) => r.status === "scheduled")
    if (tab === "in_progress") return records.filter((r) => r.status === "in_progress")
    return records.filter((r) => r.status === "completed" || r.status === "cancelled")
  }, [records, tab])

  const overdueRecords = useMemo(() => {
    const now = new Date()
    return records.filter((r) => r.status === "scheduled" && r.nextMaintenanceDue && new Date(r.nextMaintenanceDue) < now)
  }, [records])

  const columns: ColumnDef<MaintenanceRecord>[] = [
    { id: "instrumentName", header: "Instrument", accessorKey: "instrumentName" },
    {
      id: "type",
      header: "Type",
      cell: (r) => <Badge variant={typeVariant[r.type] || "default"}>{r.type}</Badge>,
    },
    {
      id: "performedAt",
      header: "Scheduled Date",
      cell: (r) => formatDate(r.performedAt, "short"),
    },
    {
      id: "performedBy",
      header: "Assigned To",
      accessorKey: "performedBy",
    },
    {
      id: "cost",
      header: "Cost",
      cell: (r) => r.cost > 0 ? formatCurrency(r.cost) : "-",
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant={statusVariant[r.status] || "secondary"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
  ]

  const handleComplete = async () => {
    if (!completeDialog) return
    setCompleteLoading(true)
    try {
      toast({ title: "Maintenance Completed", description: `${completeDialog.instrumentName} maintenance recorded`, variant: "success" })
      const updated = await getMaintenanceRecords()
      setRecords(updated)
      setCompleteDialog(null)
      setCompleteNotes("")
      setCompleteCost("")
      setCompleteParts("")
    } catch (e) {
      toast({ title: "Error", description: "Failed to complete maintenance", variant: "destructive" })
    } finally {
      setCompleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Maintenance Records" description="Track and manage instrument maintenance" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Maintenance Records" description="Track and manage instrument maintenance" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Records"
        description="Track and manage instrument maintenance"
        actions={
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Schedule Maintenance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
                <DialogDescription>Schedule new maintenance for an instrument</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input label="Instrument Name" placeholder="e.g. Cobas 6000" />
                <div className="space-y-1">
                  <label className="text-sm font-medium">Type</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input label="Assigned To" placeholder="Technician name" />
                <Input label="Scheduled Date" type="date" />
                <Textarea label="Description" placeholder="Maintenance description..." />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                <Button disabled={scheduleLoading} onClick={() => {
                  setScheduleLoading(true)
                  setTimeout(() => {
                    setScheduleLoading(false)
                    setScheduleOpen(false)
                    toast({ title: "Maintenance Scheduled", variant: "success" })
                  }, 500)
                }}>
                  {scheduleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {overdueRecords.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{overdueRecords.length} maintenance record{overdueRecords.length > 1 ? "s" : ""} overdue</span>
          <Badge variant="destructive" className="ml-auto">{overdueRecords.length}</Badge>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled ({records.filter((r) => r.status === "scheduled").length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({records.filter((r) => r.status === "in_progress").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({records.filter((r) => r.status === "completed" || r.status === "cancelled").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <DataTable
            columns={[
              ...columns,
              {
                id: "actions",
                header: "Actions",
                cell: (r) => {
                  if (r.status === "in_progress") {
                    return (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setCompleteDialog(r) }}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
                      </Button>
                    )
                  }
                  return null
                },
              },
            ]}
            data={tabRecords}
            pageSize={10}
            emptyMessage={`No ${tab.replace(/_/g, " ")} maintenance records found`}
            exportable
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!completeDialog} onOpenChange={(o) => { if (!o) setCompleteDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Maintenance</DialogTitle>
            <DialogDescription>{completeDialog?.instrumentName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea label="Completion Notes" value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} placeholder="Describe work done..." />
            <Input label="Parts Replaced (comma separated)" value={completeParts} onChange={(e) => setCompleteParts(e.target.value)} placeholder="e.g. Filter, O-ring" />
            <Input label="Cost (₹)" type="number" value={completeCost} onChange={(e) => setCompleteCost(e.target.value)} placeholder="0" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog(null)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={completeLoading}>
              {completeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
