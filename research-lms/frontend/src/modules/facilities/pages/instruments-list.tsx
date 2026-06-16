"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { Plus, Search, Wifi, WifiOff, Minus, Calendar } from "lucide-react"
import { getAssets, type Asset } from "@/services/api/facilities"
import { AssetStatusBadge } from "../components/asset-status-badge"
import { Badge } from "@/shared/ui/badge"

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "UnderMaintenance", label: "Under Maintenance" },
  { value: "Decommissioned", label: "Decommissioned" },
]

const protocolOptions = [
  { value: "", label: "All Protocols" },
  { value: "HTTP", label: "HTTP" },
  { value: "MQTT", label: "MQTT" },
  { value: "ModbusTCP", label: "Modbus TCP" },
  { value: "OPC_UA", label: "OPC UA" },
  { value: "Serial", label: "Serial" },
]

interface InstrumentRow {
  id: string
  name: string
  identifier: string
  model?: string
  facilityName?: string
  location?: string
  status: string
  iotEnabled: boolean
  connectionProtocol?: string
  lastCalibrationDate?: string
  nextCalibrationDate?: string
}

function getConnectionStatus(iotEnabled: boolean): { icon: React.ReactNode; label: string } {
  if (!iotEnabled) return { icon: <Minus className="h-4 w-4 text-gray-400" />, label: "N/A" }
  return { icon: <Wifi className="h-4 w-4 text-green-500" />, label: "Online" }
}

function getNextCalibrationBadge(date?: string) {
  if (!date) return <span className="text-xs text-muted-foreground">—</span>
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return <Badge variant="destructive" className="text-xs">OVERDUE ({Math.abs(diffDays)}d)</Badge>
  if (diffDays <= 30) return <Badge variant="warning" className="text-xs bg-amber-100 text-amber-800 border-amber-300">Due in {diffDays}d</Badge>
  return <span className="text-xs">{date}</span>
}

export default function InstrumentsListPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [data, setData] = useState<InstrumentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState("")
  const [protocolFilter, setProtocolFilter] = useState("")
  const [iotFilter, setIotFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAssets({
        category: "Instruments",
        search: debouncedQuery || undefined,
        status: statusFilter || undefined,
        page: 1, pageSize: 100,
      })
      let rows: InstrumentRow[] = result.items.map((a) => ({
        id: a.id,
        name: a.name,
        identifier: a.identifier,
        model: (a as any).model,
        facilityName: a.facilityName,
        location: a.location,
        status: a.status,
        iotEnabled: (a as any).iotEnabled ?? false,
        connectionProtocol: (a as any).connectionProtocol,
        lastCalibrationDate: (a as any).lastCalibrationDate,
        nextCalibrationDate: (a as any).nextCalibrationDate,
      }))

      if (protocolFilter) rows = rows.filter((r) => r.connectionProtocol === protocolFilter)
      if (iotFilter) rows = rows.filter((r) => r.iotEnabled)

      setData(rows)
    } catch {
      setError("Failed to load instruments.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, statusFilter, protocolFilter, iotFilter])

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Instruments" }])
  }, [setBreadcrumbs])

  useEffect(() => { fetchData() }, [fetchData])

  const totalInstruments = data.length
  const onlineCount = data.filter((r) => r.iotEnabled).length
  const offlineCount = data.filter((r) => !r.iotEnabled).length
  const dueCalibrationCount = data.filter((r) => {
    if (!r.nextCalibrationDate) return false
    const diff = Math.ceil((new Date(r.nextCalibrationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff <= 30
  }).length

  const columns: ColumnDef<InstrumentRow>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true },
    { id: "identifier", header: "Identifier", accessorKey: "identifier" },
    { id: "model", header: "Model", accessorKey: "model" },
    { id: "facilityName", header: "Facility", accessorKey: "facilityName" },
    { id: "location", header: "Location", accessorKey: "location" },
    {
      id: "connectionStatus",
      header: "Connection",
      cell: (row) => {
        const { icon, label } = getConnectionStatus(row.iotEnabled)
        return <div className="flex items-center gap-1.5">{icon}<span className="text-xs">{label}</span></div>
      },
    },
    {
      id: "iotEnabled",
      header: "IoT",
      cell: (row) => row.iotEnabled ? <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">Enabled</Badge> : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      id: "lastCalibration",
      header: "Last Cal.",
      cell: (row) => <span className="text-xs">{row.lastCalibrationDate || "—"}</span>,
    },
    {
      id: "nextCalibration",
      header: "Next Cal.",
      cell: (row) => getNextCalibrationBadge(row.nextCalibrationDate),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <AssetStatusBadge status={row.status} />,
    },
  ]

  return (
    <PageContainer
      title="Instruments"
      description="Manage all instruments and IoT-enabled devices"
      status={error ? "error" : isLoading ? "loading" : data.length === 0 && !debouncedQuery ? "empty" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No instruments found"
      emptyDescription="Add an asset with the Instruments category to get started."
      emptyAction={
        <Button size="sm" onClick={() => navigate("/facilities/assets/create")}>
          <Plus className="mr-1 h-4 w-4" /> Add Instrument
        </Button>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/facilities/instruments/dashboard")}>
            Dashboard
          </Button>
          <Button size="sm" onClick={() => navigate("/facilities/assets/create")}>
            <Plus className="mr-1 h-4 w-4" /> Add Instrument
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Summary chips */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalInstruments}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{onlineCount}</p><p className="text-xs text-muted-foreground">Online</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{offlineCount}</p><p className="text-xs text-muted-foreground">Offline</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className={`text-2xl font-bold ${dueCalibrationCount > 0 ? "text-amber-600" : ""}`}>{dueCalibrationCount}</p><p className="text-xs text-muted-foreground">Due for Cal.</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="flex h-9 w-[200px] rounded-lg border border-input bg-background pl-8 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="Search instruments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>{statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={protocolFilter} onValueChange={setProtocolFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Protocols" /></SelectTrigger>
            <SelectContent>{protocolOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={iotFilter} onCheckedChange={setIotFilter} />
            IoT Enabled
          </label>
        </div>

        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/facilities/instruments/${row.id}`)}
          filterPlaceholder="Filter..."
          pageSize={10}
          exportable
          exportFilename="instruments"
        />
      </div>
    </PageContainer>
  )
}
