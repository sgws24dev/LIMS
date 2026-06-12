"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  HardDrive,
  Calendar,
  ArrowRight,
  Download,
  Clock,
  FlaskConical,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getInstruments } from "@/mock/services"
import type { Instrument } from "@/types"

interface ImportRecord {
  id: string
  fileName: string
  recordCount: number
  importedAt: string
  status: "completed" | "failed" | "partial"
  importedBy: string
}

const mockImportHistory: ImportRecord[] = [
  { id: "IMP001", fileName: "cobas_6000_jun12.csv", recordCount: 48, importedAt: "2026-06-12T08:30:00Z", status: "completed", importedBy: "Ananya Gupta" },
  { id: "IMP002", fileName: "sysmex_xn_jun11.csv", recordCount: 32, importedAt: "2026-06-11T09:15:00Z", status: "completed", importedBy: "Rohan Deshmukh" },
  { id: "IMP003", fileName: "cobas_e411_jun10.csv", recordCount: 0, importedAt: "2026-06-10T08:00:00Z", status: "failed", importedBy: "Ananya Gupta" },
  { id: "IMP004", fileName: "bactec_jun09.csv", recordCount: 12, importedAt: "2026-06-09T10:00:00Z", status: "completed", importedBy: "Manoj Tiwari" },
]

interface PreviewRecord {
  patientName: string
  testName: string
  value: string
  unit: string
  collectedAt: string
}

export default function ImportResultsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [step, setStep] = useState(1)
  const [selectedInstrument, setSelectedInstrument] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importHistory] = useState(mockImportHistory)
  const [previewData] = useState<PreviewRecord[]>([
    { patientName: "Rajesh Sharma", testName: "Glucose (FBS)", value: "98", unit: "mg/dL", collectedAt: "2026-06-12T06:30:00Z" },
    { patientName: "Sunita Verma", testName: "CBC", value: "5.2", unit: "M/uL", collectedAt: "2026-06-12T07:00:00Z" },
    { patientName: "Lakshmi Bhat", testName: "HbA1c", value: "5.8", unit: "%", collectedAt: "2026-06-12T07:30:00Z" },
  ])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Import Results" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getInstruments()
        setInstruments(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load instruments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleImport = async () => {
    setImporting(true)
    setImportProgress(0)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200))
      setImportProgress(i)
    }
    toast({ title: "Import Complete", description: `Results imported from ${instruments.find((i) => i.id === selectedInstrument)?.name}`, variant: "success" })
    setImporting(false)
    setStep(4)
  }

  const previewColumns: ColumnDef<PreviewRecord>[] = [
    { id: "patientName", header: "Patient Name", accessorKey: "patientName" },
    { id: "testName", header: "Test", accessorKey: "testName" },
    { id: "value", header: "Value", accessorKey: "value" },
    { id: "unit", header: "Unit", accessorKey: "unit" },
    { id: "collectedAt", header: "Collected", cell: (r) => formatDate(r.collectedAt, "short") },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Import Results" description="Import test results from instruments" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Import Results" description="Import test results from instruments" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Import Results" description="Import test results from instruments" />

      <div className="flex items-center gap-2 text-sm">
        {[
          { num: 1, label: "Select Instrument" },
          { num: 2, label: "Date Range" },
          { num: 3, label: "Preview" },
          { num: 4, label: "Import" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
              step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
            </div>
            <span className={cn(step >= s.num ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
            {i < 3 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Step {step}: {
              step === 1 ? "Select Instrument" :
              step === 2 ? "Select Date Range" :
              step === 3 ? "Preview Results" :
              "Import Status"
            }
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Choose the instrument to import results from" :
             step === 2 ? "Select the date range for results" :
             step === 3 ? "Review the data before importing" :
             "Import progress and status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Choose an instrument..." />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({i.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedInstrument}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 max-w-md">
                <Input label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!dateFrom || !dateTo}>
                  Preview <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{previewData.length} records ready for import</p>
                    <p className="text-xs text-muted-foreground">
                      From: {dateFrom} To: {dateTo}
                    </p>
                  </div>
                </div>
              </div>
              <DataTable columns={previewColumns} data={previewData} pageSize={5} exportable />
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                  Import {previewData.length} Records
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {importing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${importProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Import completed successfully! {previewData.length} records imported.</span>
                  </div>
                  <Button onClick={() => { setStep(1); setSelectedInstrument(""); setDateFrom(""); setDateTo("") }}>
                    Import Another
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Import History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {importHistory.length === 0 ? (
            <EmptyState title="No import history" description="No previous imports found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Imported By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs">{h.fileName}</TableCell>
                    <TableCell>{h.recordCount}</TableCell>
                    <TableCell>{formatDate(h.importedAt, "datetime")}</TableCell>
                    <TableCell>{h.importedBy}</TableCell>
                    <TableCell>
                      <Badge variant={h.status === "completed" ? "success" : h.status === "failed" ? "destructive" : "warning"}>
                        {h.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
