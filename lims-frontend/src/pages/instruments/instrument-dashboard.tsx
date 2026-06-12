"use client"

import { useState, useEffect, useMemo } from "react"
import {
  HardDrive,
  Wifi,
  WifiOff,
  Wrench,
  AlertTriangle,
  PowerOff,
  Monitor,
  Calendar,
  Activity,
  Search,
  Eye,
  ClipboardList,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useNavigate } from "react-router"
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
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getInstruments } from "@/mock/services"
import type { Instrument } from "@/types"

const statusConfig: Record<string, { label: string; dot: string; badge: "success" | "secondary" | "warning" | "destructive" | "info" }> = {
  online: { label: "Online", dot: "bg-emerald-500", badge: "success" },
  offline: { label: "Offline", dot: "bg-gray-400", badge: "secondary" },
  maintenance: { label: "Maintenance", dot: "bg-amber-500", badge: "warning" },
  error: { label: "Error", dot: "bg-destructive", badge: "destructive" },
  calibrating: { label: "Calibrating", dot: "bg-blue-500", badge: "info" },
  idle: { label: "Idle", dot: "bg-sky-400", badge: "info" },
}

export default function InstrumentDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Dashboard" },
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

  const stats = useMemo(() => ({
    total: instruments.length,
    online: instruments.filter((i) => i.status === "online").length,
    offline: instruments.filter((i) => i.status === "offline").length,
    maintenance: instruments.filter((i) => i.status === "maintenance").length,
    error: instruments.filter((i) => i.status === "error").length,
  }), [instruments])

  const filtered = useMemo(() => {
    return instruments.filter((i) => {
      const matchesSearch = !searchQuery ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = deptFilter === "all" || i.department === deptFilter
      return matchesSearch && matchesDept
    })
  }, [instruments, searchQuery, deptFilter])

  const departments = useMemo(() => {
    return Array.from(new Set(instruments.map((i) => i.department))).sort()
  }, [instruments])

  const uptimePercent = (inst: Instrument): number => {
    if (inst.status === "online") return 95 + Math.floor(Math.random() * 5)
    if (inst.status === "error") return 70 + Math.floor(Math.random() * 15)
    if (inst.status === "maintenance") return 85 + Math.floor(Math.random() * 10)
    if (inst.status === "idle") return 98
    return 50
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instrument Dashboard" description="Overview of all laboratory instruments" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instrument Dashboard" description="Overview of all laboratory instruments" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Instrument Dashboard" description="Overview of all laboratory instruments" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<HardDrive className="h-5 w-5" />} label="Total" value={stats.total} />
        <StatCard icon={<Wifi className="h-5 w-5" />} label="Online" value={stats.online} />
        <StatCard icon={<PowerOff className="h-5 w-5" />} label="Offline" value={stats.offline} />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="Maintenance" value={stats.maintenance} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Error" value={stats.error} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search instruments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d!} value={d!}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<HardDrive className="h-12 w-12" />}
          title="No instruments found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => {
            const cfg = statusConfig[inst.status] || statusConfig.offline
            return (
              <Card key={inst.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{inst.name}</h3>
                        <p className="text-xs text-muted-foreground">{inst.model}</p>
                      </div>
                    </div>
                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Connection</span>
                      <span className="flex items-center gap-1">
                        {inst.status === "online" ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-muted-foreground" />}
                        {inst.connectionType?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Calibration</span>
                      <span>{formatDate(inst.lastCalibration, "short")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className={cn(
                        "font-medium",
                        uptimePercent(inst) >= 95 ? "text-emerald-600" :
                        uptimePercent(inst) >= 80 ? "text-amber-600" : "text-red-600"
                      )}>
                        {uptimePercent(inst)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <Badge variant="outline" className="text-[10px]">{inst.department}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate(`/instruments/${inst.id}/logs`)}>
                      <Eye className="mr-1 h-3 w-3" /> Logs
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate(`/instruments/${inst.id}/config`)}>
                      <Activity className="mr-1 h-3 w-3" /> Calibrate
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate(`/instruments/${inst.id}/config`)}>
                      <Wrench className="mr-1 h-3 w-3" /> Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
