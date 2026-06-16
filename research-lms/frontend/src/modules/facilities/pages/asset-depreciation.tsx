"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { ArrowLeft, RotateCcw, DollarSign, Calendar } from "lucide-react"
import { getAssetById, getDepreciationSchedule, recalculateDepreciation, type AssetDetail, type DepreciationEntry } from "@/services/api/facilities"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
}

export default function AssetDepreciationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [schedule, setSchedule] = useState<DepreciationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Facilities" },
      { label: "Assets", href: "/facilities/assets" },
      { label: "Depreciation" },
    ])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [assetData, scheduleData] = await Promise.all([
        getAssetById(id),
        getDepreciationSchedule(id),
      ])
      setAsset(assetData)
      setSchedule(scheduleData)
    } catch {
      setError("Failed to load depreciation data.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRecalculate = async () => {
    if (!id) return
    setRecalculating(true)
    try {
      await recalculateDepreciation(id)
      await fetchData()
    } catch {
      // silent
    } finally {
      setRecalculating(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const chartData = schedule.map((entry) => ({
    year: `Year ${entry.year}`,
    projected: entry.bookValue,
    ...(entry.year === schedule.length
      ? { actual: entry.bookValue }
      : entry.year === Math.min(schedule.length, currentYear - (asset?.acquisitionDate ? new Date(asset.acquisitionDate).getFullYear() : currentYear) + 1)
        ? { actual: asset?.currentValue ?? entry.bookValue }
        : {}),
  }))

  return (
    <PageContainer
      title="Depreciation Schedule"
      description={asset ? `${asset.name} (${asset.identifier})` : "Loading..."}
      status={error ? "error" : loading ? "loading" : !asset ? "empty" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="Asset not found"
      emptyDescription="The requested asset could not be found."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/assets/${id}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Asset
          </Button>
          <Button size="sm" onClick={handleRecalculate} disabled={recalculating}>
            <RotateCcw className={`mr-1 h-4 w-4 ${recalculating ? "animate-spin" : ""}`} /> Recalculate
          </Button>
        </div>
      }
    >
      {asset && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Current Book Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(asset.currentValue ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Acquisition Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(asset.acquisitionCost ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Salvage Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(asset.salvageValue ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Method / Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{asset.depreciationMethod || "N/A"}</Badge>
                  <span className="text-lg font-bold">{asset.usefulLifeYears ?? "—"}yrs</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs text-muted-foreground" />
                  <YAxis
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                    className="text-xs text-muted-foreground"
                  />
                  <Tooltip formatter={(v) => typeof v === "number" ? formatCurrency(v) : v} />
                  <Legend />
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} dot={false} name="Projected" />
                  <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{ r: 6 }} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Amortization Table */}
          <Card>
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Year</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Period End</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Opening Value</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Depreciation</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Closing Book Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, idx) => {
                      const prevValue = idx === 0 ? (asset.acquisitionCost ?? 0) : schedule[idx - 1].bookValue
                      const isCurrentYear = entry.year === Math.min(schedule.length, currentYear - new Date(asset.acquisitionDate ?? new Date()).getFullYear() + 1)
                      return (
                        <tr key={entry.year} className={`border-b last:border-0 ${isCurrentYear ? "bg-primary/5" : ""}`}>
                          <td className="px-4 py-2 font-medium">Year {entry.year}</td>
                          <td className="px-4 py-2">{entry.periodEnd}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(prevValue)}</td>
                          <td className="px-4 py-2 text-right text-destructive">{formatCurrency(entry.depreciationAmount)}</td>
                          <td className="px-4 py-2 text-right font-semibold">{formatCurrency(entry.bookValue)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
