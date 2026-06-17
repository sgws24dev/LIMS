import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { StatCard } from '@/shared/ui/stat-card'
import { Button } from '@/shared/ui/button'
import { getInventoryDashboardStats, type InventoryDashboardStatsDto } from '@/services/api/inventory'
import { Plus, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'

export default function InventoryDashboardPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [stats, setStats] = useState<InventoryDashboardStatsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getInventoryDashboardStats()
      setStats(data)
    } catch {
      setError('Failed to load inventory dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Inventory', href: '/inventory' }, { label: 'Dashboard' }])
    fetchStats()
  }, [setBreadcrumbs, fetchStats])

  return (
    <PageContainer title="Inventory Dashboard" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchStats}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>
          <Button onClick={() => navigate('/inventory/items/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Items" value={stats?.totalItems ?? 0} icon={<Package className="h-5 w-5" />} />
          <StatCard label="Low Stock Items" value={stats?.lowStockCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard label="Out of Stock" value={stats?.outOfStockCount ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard label="Inventory Value" value={`₹${(stats?.totalInventoryValue ?? 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Expiring (30 days)" value={stats?.expiringCount ?? 0} />
          <StatCard label="Vendors" value={stats?.totalVendors ?? 0} />
          <StatCard label="Pending POs" value={stats?.pendingPoCount ?? 0} />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/inventory/items')}>View All Items</Button>
          <Button variant="outline" onClick={() => navigate('/inventory/purchase-orders')}>Purchase Orders</Button>
          <Button variant="outline" onClick={() => navigate('/inventory/vendors')}>Vendors</Button>
        </div>
      </div>
    </PageContainer>
  )
}
