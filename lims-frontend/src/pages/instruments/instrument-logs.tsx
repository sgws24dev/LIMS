"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Info,
  Bug,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { cn, formatDate } from "@/lib/utils"
import { getInstrumentLogs, getInstruments, resolveError } from "@/mock/services"
import type { InstrumentLog, Instrument } from "@/types"

const typeVariant: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
  error: "destructive",
  warning: "warning",
  info: "info",
  debug: "secondary",
}

export default function InstrumentLogsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<InstrumentLog[]>([])
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [filterInstrument, setFilterInstrument] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Logs" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [l, i] = await Promise.all([getInstrumentLogs(), getInstruments()])
        setLogs(l)
        setInstruments(i)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load logs")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesInstrument = filterInstrument === "all" || log.instrumentId === filterInstrument
      const matchesType = filterType === "all" || log.type === filterType
      return matchesInstrument && matchesType
    })
  }, [logs, filterInstrument, filterType])

  const handleResolve = async (log: InstrumentLog) => {
    setResolvingId(log.id)
    try {
      await resolveError(log.id, "Current User", "Resolved from log viewer")
      toast({ title: "Error Resolved", description: log.message, variant: "success" })
    } catch (e) {
      toast({ title: "Resolution Failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setResolvingId(null)
    }
  }

  const handleExport = () => {
    const csv = [["Timestamp", "Instrument", "Type", "Message"].join(","),
      ...filteredLogs.map((l) => {
        const inst = instruments.find((i) => i.id === l.instrumentId)
        return [l.timestamp, inst?.name || l.instrumentId, l.type, `"${l.message.replace(/"/g, '""')}"`].join(",")
      }),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "instrument-logs.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Logs Exported", variant: "success" })
  }

  const columns: ColumnDef<InstrumentLog>[] = [
    {
      id: "timestamp",
      header: "Timestamp",
      cell: (r) => formatDate(r.timestamp, "datetime"),
      sortable: true,
    },
    {
      id: "instrument",
      header: "Instrument",
      cell: (r) => instruments.find((i) => i.id === r.instrumentId)?.name || r.instrumentId,
    },
    {
      id: "type",
      header: "Type",
      cell: (r) => <Badge variant={typeVariant[r.type] || "secondary"}>{r.type}</Badge>,
    },
    {
      id: "message",
      header: "Message",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[300px]">{r.message}</span>
          {r.details && (
            <Button variant="ghost" size="icon-sm" onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}>
              {expandedRow === r.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (r) => {
        if (r.type === "error" && !r.resolvedAt) {
          return (
            <Button size="sm" variant="outline" onClick={() => handleResolve(r)} disabled={resolvingId === r.id}>
              {resolvingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Resolve
            </Button>
          )
        }
        if (r.resolvedAt) return <Badge variant="success">Resolved</Badge>
        return null
      },
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instrument Logs" description="View and filter instrument activity logs" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instrument Logs" description="View and filter instrument activity logs" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instrument Logs"
        description="View and filter instrument activity logs"
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterInstrument} onValueChange={setFilterInstrument}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Instruments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instruments</SelectItem>
            {instruments.map((i) => (
              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Log Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        pageSize={15}
        emptyMessage="No logs found matching your filters"
        exportable={false}
      />

      {expandedRow && (() => {
        const log = logs.find((l) => l.id === expandedRow)
        if (!log?.details) return null
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Log Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">{log.details}</pre>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
