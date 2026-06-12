"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Wifi,
  WifiOff,
  Activity,
  Clock,
  RefreshCw,
  Network,
  Server,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getInstruments, getInstrumentLogs } from "@/mock/services"
import type { Instrument, InstrumentLog } from "@/types"

const healthColor = (latency: number): string => {
  if (latency < 50) return "text-emerald-500"
  if (latency < 150) return "text-amber-500"
  return "text-red-500"
}

const healthBg = (latency: number): string => {
  if (latency < 50) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
  if (latency < 150) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
}

export default function ConnectionStatusPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [logs, setLogs] = useState<InstrumentLog[]>([])
  const [testingId, setTestingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Connection Status" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [i, l] = await Promise.all([getInstruments(), getInstrumentLogs({ limit: 20 })])
        setInstruments(i)
        setLogs(l)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load connection data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredInstruments = useMemo(() => {
    if (filterStatus === "all") return instruments
    return instruments.filter((i) => i.status === filterStatus)
  }, [instruments, filterStatus])

  const getLatency = (inst: Instrument): number => {
    if (inst.status === "offline") return 999
    if (inst.status === "error") return 200 + Math.floor(Math.random() * 200)
    return Math.floor(Math.random() * 100) + 5
  }

  const handleTestConnection = async (inst: Instrument) => {
    setTestingId(inst.id)
    await new Promise((r) => setTimeout(r, 1000))
    const latency = getLatency(inst)
    const success = inst.status !== "offline"
    toast({
      title: success ? "Connection Successful" : "Connection Failed",
      description: success ? `${inst.name} responded in ${latency}ms` : `${inst.name} is unreachable`,
      variant: success ? "success" : "destructive",
    })
    setTestingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Connection Status" description="Monitor instrument connectivity" />
        <LoadingState type="table" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Connection Status" description="Monitor instrument connectivity" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Connection Status" description="Monitor instrument connectivity" />

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>

      {filteredInstruments.length === 0 ? (
        <EmptyState
          icon={<Network className="h-12 w-12" />}
          title="No instruments"
          description="No instruments match the current filter"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Connection Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstruments.map((inst) => {
                  const latency = getLatency(inst)
                  const isOnline = inst.status === "online"
                  return (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell className="font-mono text-xs">{inst.ipAddress || "-"}</TableCell>
                      <TableCell>{inst.port || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inst.connectionType?.toUpperCase() || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          inst.status === "online" ? "success" :
                          inst.status === "offline" ? "secondary" :
                          inst.status === "error" ? "destructive" : "warning"
                        }>
                          {inst.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-mono text-sm font-medium", healthColor(latency))}>
                          {isOnline ? `${latency}ms` : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", healthBg(latency))}>
                          {isOnline ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                          {isOnline ? "Connected" : "Disconnected"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(inst)}
                          disabled={testingId === inst.id}
                        >
                          {testingId === inst.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          Test
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Connection Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState title="No logs" description="No connection logs available" />
          ) : (
            <div className="space-y-1">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      log.type === "error" ? "destructive" :
                      log.type === "warning" ? "warning" :
                      log.type === "info" ? "info" : "secondary"
                    } className="text-[10px]">{log.type}</Badge>
                    <span className="font-medium">{log.message}</span>
                  </div>
                  <span className="text-muted-foreground">{formatDate(log.timestamp, "datetime")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
