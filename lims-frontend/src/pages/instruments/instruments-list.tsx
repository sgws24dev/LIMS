"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle,
  Wrench,
  PowerOff,
  Search,
  ChevronRight,
  Calendar,
  HardDrive,
} from "lucide-react"
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
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn, formatDate } from "@/lib/utils"
import type { Instrument } from "@/types"
import { instruments as mockInstruments } from "@/mock/data/instruments"
import { branches as mockBranches } from "@/mock/data/branches"
import { useAppStore } from "@/store/appStore"

const statusConfig = {
  online: { label: "Online", dot: "bg-emerald-500", badge: "success" as const },
  offline: { label: "Offline", dot: "bg-gray-400", badge: "secondary" as const },
  maintenance: { label: "Maintenance", dot: "bg-amber-500", badge: "warning" as const },
  error: { label: "Error", dot: "bg-destructive", badge: "destructive" as const },
  calibrating: { label: "Calibrating", dot: "bg-blue-500", badge: "default" as const },
  idle: { label: "Idle", dot: "bg-slate-400", badge: "secondary" as const },
}

const branchMap = new Map(mockBranches.map((b) => [b.id, b.name]))

export default function InstrumentsListPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")

  useEffect(() => {
    setBreadcrumbs([{ label: "Instruments" }])
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredInstruments = useMemo(
    () =>
      mockInstruments.filter((inst) => {
        const matchesSearch =
          !searchQuery ||
          inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || inst.status === statusFilter
        const matchesBranch = branchFilter === "all" || inst.branchId === branchFilter
        return matchesSearch && matchesStatus && matchesBranch
      }),
    [searchQuery, statusFilter, branchFilter]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instruments" description="Manage laboratory instruments and analyzers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Instruments" description="Manage laboratory instruments and analyzers" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, model, or serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {mockBranches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredInstruments.length === 0 ? (
        <EmptyState
          icon={<HardDrive className="h-12 w-12" />}
          title="No instruments found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInstruments.map((inst) => {
            const st = statusConfig[inst.status]
            const branchName = branchMap.get(inst.branchId) || inst.branchId
            const isOnline = inst.status === "online"
            return (
              <Card
                key={inst.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/instruments/${inst.id}/config`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", st.dot)} />
                        <h3 className="font-semibold truncate">{inst.name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {inst.manufacturer} &middot; {inst.model}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Serial #</span>
                      <span className="font-mono text-xs">{inst.serialNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Branch</span>
                      <span>{branchName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <Badge variant={st.badge}>{st.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Calibration</span>
                      <span>{formatDate(inst.lastCalibration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Calibration</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(inst.nextCalibration)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {isOnline && (
                      <Badge variant="outline" className="text-[10px]">
                        <Wifi className="mr-1 h-3 w-3 text-emerald-500" />
                        Connected
                      </Badge>
                    )}
                    {inst.status === "error" && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Needs Attention
                      </Badge>
                    )}
                    {inst.status === "maintenance" && (
                      <Badge variant="warning" className="text-[10px]">
                        <Wrench className="mr-1 h-3 w-3" />
                        Under Maintenance
                      </Badge>
                    )}
                    {inst.status === "offline" && (
                      <Badge variant="secondary" className="text-[10px]">
                        <PowerOff className="mr-1 h-3 w-3" />
                        Disconnected
                      </Badge>
                    )}
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
