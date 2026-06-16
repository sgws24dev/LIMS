"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select"
import { Input } from "@/shared/ui/input"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Calendar } from "lucide-react"
import { getCalibrationRecords, getCalibrationSummary, createCalibrationRecord, type CalibrationRecord, type CalibrationSummary } from "@/services/api/facilities"
import { FormInput } from "@/shared/forms/form-input"
import { FormActions } from "@/shared/forms/form-actions"

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "Valid", label: "Valid" },
  { value: "DueSoon", label: "Due Soon" },
  { value: "Expired", label: "Expired" },
  { value: "Failed", label: "Failed" },
]

const logCalibrationSchema = z.object({
  instrumentId: z.string().min(1, "Instrument is required"),
  calibrationDate: z.string().min(1, "Calibration date is required"),
  nextDueDate: z.string().min(1, "Next due date is required"),
  performedBy: z.string().min(1, "Performed by is required").max(200),
  performedByOrganization: z.string().optional(),
  certificateRef: z.string().optional(),
  notes: z.string().optional(),
})

type LogCalibrationForm = z.infer<typeof logCalibrationSchema>

export default function CalibrationRecordsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setBreadcrumbs } = useUIStore()
  const [data, setData] = useState<CalibrationRecord[]>([])
  const [summary, setSummary] = useState<CalibrationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState("")
  const [instrumentSearch, setInstrumentSearch] = useState(searchParams.get("instrumentId") || "")
  const [logDialogOpen, setLogDialogOpen] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Calibration Records" }])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [records, sum] = await Promise.all([
        getCalibrationRecords({
          instrumentId: instrumentSearch || undefined,
          status: statusFilter || undefined,
          page: 1, pageSize: 100,
        }),
        getCalibrationSummary(),
      ])
      setData(records.items)
      setSummary(sum)
    } catch {
      setError("Failed to load calibration records.")
    } finally {
      setLoading(false)
    }
  }, [instrumentSearch, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const form = useForm<LogCalibrationForm>({
    resolver: zodResolver(logCalibrationSchema),
    defaultValues: {
      instrumentId: "",
      calibrationDate: "",
      nextDueDate: "",
      performedBy: "",
      performedByOrganization: "",
      certificateRef: "",
      notes: "",
    },
  })

  const openLogDialog = (instrumentId?: string) => {
    if (instrumentId) form.setValue("instrumentId", instrumentId)
    setLogDialogOpen(true)
  }

  const handleLogCalibration = async (values: LogCalibrationForm) => {
    try {
      await createCalibrationRecord(values)
      setLogDialogOpen(false)
      form.reset()
      fetchData()
    } catch {
      // silent
    }
  }

  const getDueDateHighlight = (nextDueDate: string) => {
    const d = new Date(nextDueDate)
    const now = new Date()
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { bg: "bg-red-50", badge: <Badge variant="destructive" className="text-xs">OVERDUE</Badge> }
    if (diffDays <= 30) return { bg: "bg-amber-50", badge: <Badge variant="warning" className="text-xs bg-amber-100 text-amber-800">DUE SOON</Badge> }
    return { bg: "", badge: <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">VALID</Badge> }
  }

  const columns: ColumnDef<CalibrationRecord>[] = [
    { id: "instrumentName", header: "Instrument", accessorKey: "instrumentName" },
    { id: "calibrationDate", header: "Last Calibration", accessorKey: "calibrationDate" },
    {
      id: "nextDueDate",
      header: "Next Due Date",
      cell: (row) => {
        const { badge } = getDueDateHighlight(row.nextDueDate)
        return <div className="flex items-center gap-2"><span className="text-xs">{row.nextDueDate}</span>{badge}</div>
      },
    },
    { id: "performedBy", header: "Performed By", accessorKey: "performedBy" },
    { id: "certificateRef", header: "Certificate", accessorKey: "certificateRef" },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const { badge } = getDueDateHighlight(row.nextDueDate)
        return badge
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openLogDialog(row.instrumentId)} title="Log Calibration">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => { setInstrumentSearch(row.instrumentId); setStatusFilter("") }} title="View History">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Calibration Records"
      description="Track instrument calibration schedules and history"
      status={error ? "error" : loading ? "loading" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      actions={
        <Button size="sm" onClick={() => openLogDialog()}>
          <Plus className="mr-1 h-4 w-4" /> Log Calibration
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{summary?.validCount ?? 0}</p><p className="text-xs text-muted-foreground">Valid</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{summary?.dueSoonCount ?? 0}</p><p className="text-xs text-muted-foreground">Due Soon</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{summary?.expiredCount ?? 0}</p><p className="text-xs text-muted-foreground">Expired</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{summary?.totalCount ?? 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by instrument..."
            value={instrumentSearch}
            onChange={(e) => setInstrumentSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>{statusFilterOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data}
          filterPlaceholder="Filter records..."
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          exportable
          exportFilename="calibration-records"
        />
      </div>

      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Calibration</DialogTitle>
            <DialogDescription>Record a new calibration event</DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleLogCalibration)} className="space-y-4">
              <FormInput name="instrumentId" label="Instrument ID" placeholder="Enter instrument ID" />
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="calibrationDate" label="Calibration Date" type="date" />
                <FormInput name="nextDueDate" label="Next Due Date" type="date" />
              </div>
              <FormInput name="performedBy" label="Performed By" placeholder="Technician name" />
              <FormInput name="performedByOrganization" label="Organization (optional)" />
              <FormInput name="certificateRef" label="Certificate Reference (optional)" />
              <FormInput name="notes" label="Notes (optional)" />
              <FormActions
                submitLabel="Save Calibration"
                cancelLabel="Cancel"
                onCancel={() => setLogDialogOpen(false)}
              />
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
