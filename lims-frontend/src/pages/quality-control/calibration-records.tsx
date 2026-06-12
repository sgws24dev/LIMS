"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Loader2,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { formatDate } from "@/lib/utils"
import { getCalibrationRecordsExtended } from "@/mock/services"
import type { CalibrationRecord } from "@/types"

const statusVariant: Record<string, "success" | "destructive" | "warning" | "info"> = {
  pass: "success",
  fail: "destructive",
  conditional: "warning",
}

export default function CalibrationRecordsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<CalibrationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Calibration" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCalibrationRecordsExtended()
        setRecords(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load calibration records")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery) return records
    const q = searchQuery.toLowerCase()
    return records.filter((r) =>
      r.instrumentName.toLowerCase().includes(q) ||
      r.calibratedBy.toLowerCase().includes(q) ||
      r.standardUsed?.toLowerCase().includes(q)
    )
  }, [records, searchQuery])

  const overdueCalibrations = useMemo(() => {
    const now = new Date()
    return records.filter((r) => new Date(r.nextCalibrationDue) < now && r.status !== "fail")
  }, [records])

  const calibrationColumns: ColumnDef<CalibrationRecord>[] = [
    {
      id: "instrumentName",
      header: "Instrument",
      accessorKey: "instrumentName",
    },
    {
      id: "calibratedAt",
      header: "Date",
      cell: (r) => <span>{formatDate(r.calibratedAt, "short")}</span>,
    },
    {
      id: "calibratedBy",
      header: "Performed By",
      accessorKey: "calibratedBy",
    },
    {
      id: "standardUsed",
      header: "Standard Used",
      cell: (r) => <span className="text-sm text-muted-foreground">{r.standardUsed || "-"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant={statusVariant[r.status] || "secondary"}>
          {r.status}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Calibration Records" description="View and manage instrument calibration records" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Calibration Records" description="View and manage instrument calibration records" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calibration Records"
        description="View and manage instrument calibration records"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Add Record</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calibration Record</DialogTitle>
                <DialogDescription>Record a new calibration for an instrument</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input label="Instrument Name" placeholder="e.g. Cobas 6000" />
                <Input label="Standard Used" placeholder="e.g. Roche C.f.a.s." />
                <Input label="Calibrated By" placeholder="Technician name" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button disabled={addLoading} onClick={() => {
                  setAddLoading(true)
                  setTimeout(() => {
                    setAddLoading(false)
                    setAddOpen(false)
                    toast({ title: "Calibration Record Added", variant: "success" })
                  }, 500)
                }}>
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {overdueCalibrations.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{overdueCalibrations.length} calibration{overdueCalibrations.length > 1 ? "s" : ""} overdue</span>
          <Badge variant="destructive" className="ml-auto">{overdueCalibrations.length}</Badge>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
        </div>
      </div>

      <DataTable columns={calibrationColumns} data={filtered} pageSize={10} onRowClick={(r) => setSelectedRecord(r)} emptyMessage={searchQuery ? "Try a different search" : "No records available"} exportable />

      <Dialog open={!!selectedRecord} onOpenChange={(o) => { if (!o) setSelectedRecord(null) }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Calibration Details - {selectedRecord?.instrumentName}</DialogTitle>
            <DialogDescription>Detailed calibration parameters</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Performed By:</span> <span className="font-medium">{selectedRecord.calibratedBy}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(selectedRecord.calibratedAt, "datetime")}</span></div>
                <div><span className="text-muted-foreground">Standard:</span> <span className="font-medium">{selectedRecord.standardUsed || "-"}</span></div>
                <div><span className="text-muted-foreground">Next Due:</span> <span className="font-medium">{formatDate(selectedRecord.nextCalibrationDue, "short")}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusVariant[selectedRecord.status] || "secondary"}>{selectedRecord.status}</Badge></div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Parameters</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Observed</TableHead>
                        <TableHead>Deviation</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRecord.results.map((res, i) => (
                        <TableRow key={i}>
                          <TableCell>{res.parameter}</TableCell>
                          <TableCell>{res.expected}</TableCell>
                          <TableCell>{res.observed}</TableCell>
                          <TableCell>{res.deviation.toFixed(2)}%</TableCell>
                          <TableCell>
                            {res.pass ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {selectedRecord.notes && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
