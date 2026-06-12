"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  Search,
  Clock,
  HardDrive,
  Shield,
  Eye,
  XCircle,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getInstrumentErrors, getInstruments, resolveError } from "@/mock/services"
import type { InstrumentError, Instrument } from "@/types"

const severityIcon: Record<string, typeof AlertTriangle> = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
}

const severityColor: Record<string, string> = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-500 dark:text-orange-400",
  medium: "text-amber-500 dark:text-amber-400",
  low: "text-blue-500 dark:text-blue-400",
}

const severityBadge: Record<string, "destructive" | "warning" | "secondary" | "info"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "info",
}

export default function ErrorDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<InstrumentError[]>([])
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [filterInstrument, setFilterInstrument] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterResolved, setFilterResolved] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [resolveDialog, setResolveDialog] = useState<InstrumentError | null>(null)
  const [resolveNotes, setResolveNotes] = useState("")
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Error Dashboard" },
    ])
  }, [setBreadcrumbs])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [e, i] = await Promise.all([getInstrumentErrors(), getInstruments()])
      setErrors(e)
      setInstruments(i)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load errors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const unresolvedErrors = useMemo(() => errors.filter((e) => !e.resolvedAt), [errors])
  const criticalErrors = useMemo(() => unresolvedErrors.filter((e) => e.severity === "critical"), [unresolvedErrors])
  const highErrors = useMemo(() => unresolvedErrors.filter((e) => e.severity === "high"), [unresolvedErrors])

  const filteredErrors = useMemo(() => {
    return errors.filter((e) => {
      const matchesInstrument = filterInstrument === "all" || e.instrumentId === filterInstrument
      const matchesSeverity = filterSeverity === "all" || e.severity === filterSeverity
      const matchesResolved = filterResolved === "all" || (filterResolved === "resolved" ? e.resolvedAt : !e.resolvedAt)
      const matchesSearch = !searchTerm || e.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) || e.errorCode.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesInstrument && matchesSeverity && matchesResolved && matchesSearch
    })
  }, [errors, filterInstrument, filterSeverity, filterResolved, searchTerm])

  const handleResolve = async () => {
    if (!resolveDialog) return
    setResolving(true)
    try {
      const updated = await resolveError(resolveDialog.id, "Current User", resolveNotes || undefined)
      setErrors((prev) => prev.map((e) => e.id === updated.id ? updated : e))
      toast({ title: "Error Resolved", description: resolveDialog.errorMessage, variant: "success" })
      setResolveDialog(null)
      setResolveNotes("")
    } catch (e) {
      toast({ title: "Resolution Failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setResolving(false)
    }
  }

  const columns: ColumnDef<InstrumentError>[] = [
    {
      id: "severity",
      header: "Severity",
      cell: (r) => {
        const Icon = severityIcon[r.severity] || AlertTriangle
        return (
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-4 w-4", severityColor[r.severity])} />
            <Badge variant={severityBadge[r.severity]}>{r.severity}</Badge>
          </div>
        )
      },
      sortable: true,
    },
    {
      id: "errorCode",
      header: "Code",
      cell: (r) => <span className="font-mono text-xs">{r.errorCode}</span>,
    },
    {
      id: "errorMessage",
      header: "Error Message",
      cell: (r) => (
        <div className="max-w-xs">
          <p className="truncate font-medium">{r.errorMessage}</p>
        </div>
      ),
    },
    {
      id: "instrument",
      header: "Instrument",
      cell: (r) => instruments.find((i) => i.id === r.instrumentId)?.name || r.instrumentId,
    },
    {
      id: "occurredAt",
      header: "Occurred",
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatDate(r.occurredAt, "datetime")}
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => r.resolvedAt ? (
        <Badge variant="success">Resolved</Badge>
      ) : (
        <Badge variant="destructive">Open</Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (r) => {
        if (r.resolvedAt) return (
          <Button variant="ghost" size="sm" disabled>
            <CheckCircle2 className="mr-1 h-3 w-3" /> Done
          </Button>
        )
        return (
          <Dialog open={resolveDialog?.id === r.id} onOpenChange={(o) => { if (!o) setResolveDialog(null) }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default" onClick={() => { setResolveDialog(r); setResolveNotes("") }}>
                <Shield className="mr-1 h-3 w-3" /> Resolve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Error</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">{r.errorCode}</p>
                  <p className="font-medium">{r.errorMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{instruments.find((i) => i.id === r.instrumentId)?.name}</p>
                </div>
                <Textarea
                  label="Resolution Notes"
                  placeholder="Describe how the error was resolved..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResolveDialog(null)}>Cancel</Button>
                <Button onClick={handleResolve} disabled={resolving}>
                  {resolving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                  Confirm Resolve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error Dashboard" description="Monitor and resolve instrument errors" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error Dashboard" description="Monitor and resolve instrument errors" />
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Error Dashboard" description="Monitor and resolve instrument errors" />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Errors"
          value={errors.length}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Unresolved"
          value={unresolvedErrors.length}
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Critical"
          value={criticalErrors.length}
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <StatCard
          label="High Severity"
          value={highErrors.length}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterInstrument} onValueChange={setFilterInstrument}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Instruments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instruments</SelectItem>
            {instruments.map((i) => (
              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterResolved} onValueChange={setFilterResolved}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredErrors}
        pageSize={10}
        emptyMessage="No errors found"
        exportable={true}
      />
    </div>
  )
}
