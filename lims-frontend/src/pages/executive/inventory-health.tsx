"use client"

import { useState, useEffect, useMemo } from "react"
import { Package, AlertTriangle, Calendar, RefreshCw } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getInventoryHealth } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface InventoryHealthData {
  totalItems: number
  lowStockItems: number
  expiringItems: number
  outOfStock: number
  inventoryValue: number
  monthlyConsumption: number
  stockTurnoverRatio: number
  categories: { name: string; total: number; lowStock: number; expiring: number; value: number }[]
}

export default function InventoryHealthPage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<InventoryHealthData | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Inventory Health" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getInventoryHealth()
      setHealth(result)
    } catch {
      setError("Failed to load inventory health data")
      showToast({ type: "error", title: "Error", message: "Failed to load inventory health dashboard" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const lowStockAlerts = useMemo(() => {
    if (!health) return []
    return health.categories
      .filter((c) => c.lowStock > 0)
      .flatMap((c) =>
        Array.from({ length: Math.min(c.lowStock, 3) }).map((_, i) => ({
          id: `${c.name}-${i}`,
          name: `${c.name} Item ${i + 1}`,
          category: c.name,
          priority: i === 0 ? "high" : i === 1 ? "medium" : "low" as const,
        }))
      )
  }, [health])

  const consumptionData = [
    { label: "Jan", value: 820000 },
    { label: "Feb", value: 780000 },
    { label: "Mar", value: 850000 },
    { label: "Apr", value: 910000 },
    { label: "May", value: 880000 },
    { label: "Jun", value: 920000 },
  ]

  const reorderData = health?.categories.map((c) => ({
    label: c.name,
    value: c.total - c.lowStock,
    secondary: c.total,
  })) ?? []

  const stockValueData = health?.categories.map((c) => ({
    label: c.name,
    value: c.value,
  })) ?? []

  return (
    <PageContainer
      title="Inventory Health Overview"
      description="Monitor stock levels, expiring items, and consumption trends"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Stock Value"
          value={formatCurrency(health?.inventoryValue ?? 0)}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Low Stock Items"
          value={health?.lowStockItems ?? 0}
          trend={{ value: health?.lowStockItems ?? 0, positive: (health?.lowStockItems ?? 0) < 10 }}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Expiring Soon"
          value={health?.expiringItems ?? 0}
          trend={{ value: health?.expiringItems ?? 0, positive: (health?.expiringItems ?? 0) < 5 }}
        />
        <StatCard
          icon={<RefreshCw className="h-5 w-5" />}
          label="Inventory Turnover"
          value={health?.stockTurnoverRatio.toFixed(1) ?? "0"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock alerts</p>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{alert.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.category}</p>
                    </div>
                    <Badge
                      variant={
                        alert.priority === "high" ? "destructive" :
                        alert.priority === "medium" ? "warning" : "secondary"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={stockValueData} type="donut" height={280} formatValue={formatCurrency} showLegend />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={consumptionData} type="line" height={260} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reorder Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={reorderData} type="horizontal-bar" height={180} />
            <div className="mt-4 space-y-2 text-sm">
              {health?.categories.map((c) => {
                const toReorder = Math.max(0, c.total * 0.3 - (c.total - c.lowStock))
                return (
                  <div key={c.name} className="flex items-center justify-between rounded-lg border p-2.5">
                    <span className="font-medium">{c.name}</span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Reorder {Math.ceil(toReorder)} units</p>
                      <p className="text-xs text-destructive">{c.lowStock} low stock items</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Items Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1
              const hasExpiry = i < (health?.expiringItems ?? 0)
              return (
                <div
                  key={i}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border text-sm",
                    hasExpiry
                      ? "border-destructive/30 bg-destructive/5 text-destructive font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {day}
                  {hasExpiry && <span className="absolute mt-6 text-[8px] text-destructive">!</span>}
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {health?.expiringItems ?? 0} items expiring within the next 90 days
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
