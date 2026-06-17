import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { DataTable, type ColumnDef } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { StockStatusBadge } from '../components/stock-status-badge'
import { StockLevelBar } from '../components/stock-level-bar'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getInventoryItems, getInventoryCategories, deleteInventoryItem, type InventoryItemDto, type InventoryItemStatus } from '@/services/api/inventory'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

export default function ItemCatalogPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItemDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<InventoryItemStatus | ''>('')
  const [categories, setCategories] = useState<string[]>([])
  const pageSize = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getInventoryItems({
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        page, pageSize
      })
      setItems(result.items)
      setTotal(result.totalCount)
    } catch {
      setError('Failed to load inventory items.')
    } finally {
      setLoading(false)
    }
  }, [search, category, status, page])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Inventory', href: '/inventory' }, { label: 'Items' }])
    fetchData()
    getInventoryCategories().then(setCategories).catch(() => {})
  }, [setBreadcrumbs, fetchData])

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteInventoryItem(id)
      toast({ title: 'Item deleted', description: `${name} has been deleted.` })
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<InventoryItemDto>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: 'sku', header: 'SKU', accessorKey: 'sku' },
    { id: 'category', header: 'Category', accessorKey: 'category' },
    { id: 'quantity', header: 'Quantity', accessorKey: 'quantity', cell: (row) => (
      <StockLevelBar quantity={row.quantity} reorderLevel={row.reorderLevel} />
    )},
    { id: 'unitPrice', header: 'Unit Price', accessorKey: 'unitPrice', cell: (row) => formatCurrency(row.unitPrice) },
    { id: 'totalValue', header: 'Total Value', accessorKey: 'totalValue', cell: (row) => formatCurrency(row.totalValue) },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (row) => <StockStatusBadge status={row.status} /> },
    { id: 'vendorName', header: 'Vendor', accessorKey: 'vendorName' },
    { id: 'createdAt', header: 'Created', accessorKey: 'createdAt', cell: (row) => formatDate(row.createdAt) },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/items/${row.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/items/${row.id}/edit`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id, row.name)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="Inventory Items" status={loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'success'} onRetry={fetchData}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inventory Items</h1>
          <Button onClick={() => navigate('/inventory/items/new')}>
            <Plus className="h-4 w-4 mr-2" />Add Item
          </Button>
        </div>

        <div className="flex gap-3">
          <Input placeholder="Search by name, SKU, barcode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="max-w-sm" />
          <Select value={category} onValueChange={v => { setCategory(v); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={v => { setStatus(v as InventoryItemStatus | ''); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="LowStock">Low Stock</SelectItem>
              <SelectItem value="OutOfStock">Out of Stock</SelectItem>
              <SelectItem value="Discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={items} />
      </div>
    </PageContainer>
  )
}
