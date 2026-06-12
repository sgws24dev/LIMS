"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { inventory, getLowStockItems, getExpiringItems } from "@/mock/data/inventory"
import { stockMovements, getCategoryWiseStockCount } from "@/mock/data/purchase-orders"
import type { InventoryItem } from "@/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { Pagination } from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts"
import {
  Package, AlertTriangle, Clock, DollarSign, Boxes,
  TrendingDown, FlaskConical, RefreshCw,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"

const STATUS_COLORS = {
  normal: "#10b981",
  low: "#f59e0b",
  out_of_stock: "#ef4444",
  expired: "#6b7280",
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"]
const CATEGORY_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"]

export default function InventoryDashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Inventory" }])
  }, [])

  const [lowStockPage, setLowStockPage] = useState(1)
  const [movementsPage, setMovementsPage] = useState(1)
  const lowStockPageSize = 8
  const movementsPageSize = 8

  const lowStock = useMemo(() => getLowStockItems(), [])
  const expiringSoon = useMemo(() => getExpiringItems(30), [])
  const categoryData = useMemo(() => getCategoryWiseStockCount(), [])

  const totalValue = useMemo(
    () => inventory.reduce((s, i) => s + i.price * i.quantity, 0),
    []
  )

  const stockStatusData = useMemo(() => {
    const normal = inventory.filter((i) => i.quantity > i.minQuantity).length
    const low = lowStock.filter((i) => i.quantity > 0).length
    const outOfStock = inventory.filter((i) => i.quantity === 0).length
    const expired = inventory.filter((i) => i.expiryDate && new Date(i.expiryDate) < new Date()).length
    return [
      { name: "Normal", value: normal },
      { name: "Low Stock", value: low },
      { name: "Out of Stock", value: outOfStock },
      { name: "Expired", value: expired },
    ]
  }, [lowStock])

  const recentMovements = useMemo(() => {
    return stockMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const slicedLowStock = useMemo(() => {
    const start = (lowStockPage - 1) * lowStockPageSize
    return lowStock.slice(start, start + lowStockPageSize)
  }, [lowStock, lowStockPage, lowStockPageSize])

  const lowStockTotalPages = Math.ceil(lowStock.length / lowStockPageSize)

  const slicedMovements = useMemo(() => {
    const start = (movementsPage - 1) * movementsPageSize
    return recentMovements.slice(start, start + movementsPageSize)
  }, [recentMovements, movementsPage, movementsPageSize])

  const movementsTotalPages = Math.ceil(recentMovements.length / movementsPageSize)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Dashboard"
        description="Real-time view of laboratory inventory, stock levels, and expiry tracking"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Total Items"
          value={inventory.length}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Low Stock Items"
          value={lowStock.length}
          trend={{ value: lowStock.length > 5 ? 20 : 0, positive: lowStock.length <= 5 }}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Expiring Soon (30d)"
          value={expiringSoon.length}
          trend={{ value: expiringSoon.length, positive: expiringSoon.length <= 3 }}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Inventory Value"
          value={formatCurrency(totalValue)}
        />
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Manage Vendors"
          value="View All"
          onClick={() => navigate("/inventory/vendors")}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stockStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {stockStatusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.name}: <strong>{s.value}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category-wise Stock Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs text-muted-foreground" />
                  <YAxis
                    type="category"
                    dataKey="category"
                    className="text-xs text-muted-foreground capitalize"
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expiry Tracking (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-8 w-8" />}
                title="No items expiring soon"
                description="All items have valid expiry dates beyond 30 days."
              />
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {expiringSoon.map((item) => {
                    const daysLeft = Math.ceil(
                      (new Date(item.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <div className="ml-3 text-right">
                          <Badge
                            variant={daysLeft <= 7 ? "destructive" : "warning"}
                          >
                            {daysLeft}d left
                          </Badge>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(item.expiryDate!)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <EmptyState
                icon={<Package className="h-8 w-8" />}
                title="All items well-stocked"
                description="No inventory items are below minimum quantity."
              />
            ) : (
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Min Qty</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slicedLowStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.sku}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-medium",
                              item.quantity === 0
                                ? "text-destructive"
                                : "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{item.minQuantity}</TableCell>
                        <TableCell className="text-xs">{item.location}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { navigate("/inventory/purchase-orders"); toast({ title: "Reorder", description: "Redirecting to purchase orders...", variant: "default" }) }}>
                            <RefreshCw className="mr-1 h-3 w-3" /> Reorder
                          </Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="px-2 pb-2">
            <Pagination currentPage={lowStockPage} totalPages={lowStockTotalPages} onPageChange={setLowStockPage} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Stock Movements</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slicedMovements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="max-w-[180px] truncate font-medium text-xs">{m.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={m.type === "in" ? "success" : "warning"}>
                          {m.type === "in" ? "IN" : "OUT"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{m.quantity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(m.date, "datetime")}
                      </TableCell>
                      <TableCell className="text-xs">{m.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          <div className="px-2 pb-2">
            <Pagination currentPage={movementsPage} totalPages={movementsTotalPages} onPageChange={setMovementsPage} />
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
