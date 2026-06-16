"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { RefreshCw, WifiOff, AlertTriangle, ArrowRight, Loader2 } from "lucide-react"
import { getAssets, getCalibrationSummary, type Asset, type CalibrationSummary } from "@/services/api/facilities"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

const CALIBRATION_COLORS = { valid: "#22c55e", dueSoon: "#f59e0b", expired: "#ef4444" }

export default function InstrumentDashboardPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instruments, setInstruments] = useState<Asset[]>([])
  const [summary, setSummary] = useState<CalibrationSummary | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [assetResult, calSummary] = await Promise.all([
        getAssets({ category: "Instruments", pageSize: 100 }),
        getCalibrationSummary(),
      ])
      setInstruments(assetResult.items)
      setSummary(calSummary)
    } catch {
      setError("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Instruments", href: "/facilities/instruments" }, { label: "Dashboard" }])
  }, [setBreadcrumbs])

  useEffect(() => { fetchData() }, [fetchData])

  const totalInstruments = instruments.length
  const onlineCount = instruments.filter((a) => (a as any).iotEnabled).length
  const offlineCount = totalInstruments - onlineCount

  const facilityMap = new Map<string, { online: number; offline: number; maintenance: number }>()
  instruments.forEach((a) => {
    const name = a.facilityName || "Unknown"
    const entry = facilityMap.get(name) || { online: 0, offline: 0, maintenance: 0 }
    if ((a as any).iotEnabled) entry.online++
    else entry.offline++
    if (a.status === "UnderMaintenance") entry.maintenance++
    facilityMap.set(name, entry)
  })
  const facilityData = Array.from(facilityMap.entries()).map(([name, counts]) => ({
    name,
    Online: counts.online,
    Offline: counts.offline,
    Maintenance: counts.maintenance,
  }))

  const calPieData = summary ? [
    { name: "Valid", value: summary.validCount, color: CALIBRATION_COLORS.valid },
    { name: "Due Soon", value: summary.dueSoonCount, color: CALIBRATION_COLORS.dueSoon },
    { name: "Expired", value: summary.expiredCount, color: CALIBRATION_COLORS.expired },
  ].filter((d) => d.value > 0) : []

  const alerts = instruments
    .filter((a) => {
      const nextCal = (a as any).nextCalibrationDate
      if (!nextCal) return false
      const diffDays = Math.ceil((new Date(nextCal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    })
    .sort((a, b) => {
      const da = new Date((a as any).nextCalibrationDate || "").getTime()
      const db = new Date((b as any).nextCalibrationDate || "").getTime()
      return da - db
    })
    .slice(0, 10)

  const offlineInstruments = instruments.filter((a) => !(a as any).iotEnabled).slice(0, 10)

  return (
    <PageContainer
      title="Instrument Dashboard"
      description="Real-time overview of all instruments"
      status={error ? "error" : loading ? "loading" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      actions={
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      {/* Row 1: KPI Chips */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalInstruments}</p><p className="text-xs text-muted-foreground">Total Instruments</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{onlineCount}</p><p className="text-xs text-muted-foreground">Online</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{offlineCount}</p><p className="text-xs text-muted-foreground">Offline</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className={`text-3xl font-bold ${(summary?.dueSoonCount ?? 0) > 0 ? "text-amber-600" : ""}`}>{summary?.dueSoonCount ?? 0}</p><p className="text-xs text-muted-foreground">Due for Calibration</p></CardContent></Card>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Status Distribution by Facility</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Online" fill="#22c55e" stackId="a" />
                <Bar dataKey="Offline" fill="#ef4444" stackId="a" />
                <Bar dataKey="Maintenance" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Calibration Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={calPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {calPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Lists */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Recent Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No alerts at this time.</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => {
                  const nextCal = (a as any).nextCalibrationDate
                  const diffDays = nextCal ? Math.ceil((new Date(nextCal).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
                  const isUrgent = diffDays < 0
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{isUrgent ? "Calibration overdue" : "Calibration due soon"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isUrgent ? "destructive" : "warning"} className="text-xs">{isUrgent ? `${Math.abs(diffDays)}d overdue` : `${diffDays}d`}</Badge>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/facilities/calibration?instrumentId=${a.id}`)}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><WifiOff className="h-4 w-4 text-red-500" /> Instruments Offline</CardTitle></CardHeader>
          <CardContent>
            {offlineInstruments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All instruments are online.</p>
            ) : (
              <div className="space-y-2">
                {offlineInstruments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.location || a.facilityName || "—"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/instruments/${a.id}`)}>
                      Check Connection
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
