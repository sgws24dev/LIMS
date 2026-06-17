import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { DataTable, type ColumnDef } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { PurchaseOrderStatusBadge } from '../components/po-status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus, getVendors, getInventoryItems, type PurchaseOrderDto, type PurchaseOrderDetailDto, type PurchaseOrderStatus, type VendorDto, type InventoryItemDto } from '@/services/api/inventory'
import { useToast } from '@/hooks/use-toast'
import { Plus, Eye } from 'lucide-react'

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [orders, setOrders] = useState<PurchaseOrderDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const [vendors, setVendors] = useState<VendorDto[]>([])
  const [items, setItems] = useState<InventoryItemDto[]>([])
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderDetailDto | null>(null)
  const pageSize = 20

  const [form, setForm] = useState({
    poNumber: '',
    vendorId: '',
    expectedDeliveryDate: '',
    notes: '',
    orderItems: [] as { inventoryItemId: string; quantity: number; unitPrice: number }[],
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPurchaseOrders({ status: statusFilter || undefined, page, pageSize })
      setOrders(result.items)
      setTotal(result.totalCount)
    } catch {
      setError('Failed to load purchase orders.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Inventory', href: '/inventory' }, { label: 'Purchase Orders' }])
    fetchData()
  }, [setBreadcrumbs, fetchData])

  const openCreate = async () => {
    const [v, i] = await Promise.all([getVendors(), getInventoryItems({ pageSize: 1000 })])
    setVendors(v)
    setItems(i.items)
    setShowCreate(true)
  }

  const handleCreate = async () => {
    try {
      await createPurchaseOrder({
        poNumber: form.poNumber,
        vendorId: form.vendorId,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        notes: form.notes || undefined,
        items: form.orderItems,
      })
      toast({ title: 'PO created' })
      setShowCreate(false)
      setForm({ poNumber: '', vendorId: '', expectedDeliveryDate: '', notes: '', orderItems: [] })
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to create PO.', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, newStatus: PurchaseOrderStatus) => {
    try {
      await updatePurchaseOrderStatus(id, newStatus)
      toast({ title: 'Status updated' })
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
    }
  }

  const viewOrder = async (id: string) => {
    const detail = await getPurchaseOrderById(id)
    setSelectedOrder(detail)
  }

  const columns: ColumnDef<PurchaseOrderDto>[] = [
    { id: 'poNumber', header: 'PO Number', accessorKey: 'poNumber', cell: (row) => <span className="font-medium">{row.poNumber}</span> },
    { id: 'vendorName', header: 'Vendor', accessorKey: 'vendorName' },
    { id: 'orderDate', header: 'Order Date', accessorKey: 'orderDate', cell: (row) => formatDate(row.orderDate) },
    { id: 'delivery', header: 'Delivery', accessorKey: 'expectedDeliveryDate', cell: (row) => row.expectedDeliveryDate ? formatDate(row.expectedDeliveryDate) : '-' },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (row) => <PurchaseOrderStatusBadge status={row.status} /> },
    { id: 'itemCount', header: 'Items', accessorKey: 'itemCount' },
    { id: 'totalAmount', header: 'Total', accessorKey: 'totalAmount', cell: (row) => formatCurrency(row.totalAmount) },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => viewOrder(row.id)}><Eye className="h-4 w-4" /></Button>
          {row.status === 'Draft' && <Button variant="ghost" size="sm" onClick={() => handleStatusChange(row.id, 'Pending')}>Submit</Button>}
          {row.status === 'Pending' && <Button variant="ghost" size="sm" onClick={() => handleStatusChange(row.id, 'Approved')}>Approve</Button>}
          {row.status === 'Approved' && <Button variant="ghost" size="sm" onClick={() => handleStatusChange(row.id, 'Received')}>Receive</Button>}
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="Purchase Orders" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Purchase Orders</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New PO</Button>
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as PurchaseOrderStatus | ''); setPage(1) }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={orders} />

        <div className="text-sm text-muted-foreground">Total: {total} purchase orders</div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>PO Number</Label><Input value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} /></div>
              <div><Label>Vendor</Label>
                <Select value={form.vendorId} onValueChange={v => setForm({ ...form, vendorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDeliveryDate} onChange={e => setForm({ ...form, expectedDeliveryDate: e.target.value })} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div>
              <Label>Items</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{item.name} ({item.sku})</span>
                    <Input type="number" placeholder="Qty" className="w-20 h-8"
                      onChange={e => {
                        const qty = parseInt(e.target.value) || 0
                        const existing = form.orderItems.findIndex(i => i.inventoryItemId === item.id)
                        if (existing >= 0) {
                          const updated = [...form.orderItems]
                          updated[existing] = { ...updated[existing], quantity: qty }
                          setForm({ ...form, orderItems: updated })
                        } else {
                          setForm({ ...form, orderItems: [...form.orderItems, { inventoryItemId: item.id, quantity: qty, unitPrice: item.unitPrice }] })
                        }
                      }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>PO {selectedOrder?.poNumber}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Vendor</span><span>{selectedOrder.vendorName}</span>
                <span className="text-muted-foreground">Status</span><span><PurchaseOrderStatusBadge status={selectedOrder.status} /></span>
                <span className="text-muted-foreground">Order Date</span><span>{formatDate(selectedOrder.orderDate)}</span>
                <span className="text-muted-foreground">Delivery</span><span>{selectedOrder.expectedDeliveryDate ? formatDate(selectedOrder.expectedDeliveryDate) : '-'}</span>
                <span className="text-muted-foreground">Total</span><span className="font-semibold">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              {selectedOrder.notes && <div className="text-sm"><span className="text-muted-foreground">Notes: </span>{selectedOrder.notes}</div>}
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit Price</th><th className="text-right py-2">Total</th></tr></thead>
                <tbody>
                  {selectedOrder.items.map(i => (
                    <tr key={i.id} className="border-b">
                      <td className="py-2">{i.itemName} <span className="text-muted-foreground">({i.itemSku})</span></td>
                      <td className="text-right py-2">{i.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(i.unitPrice)}</td>
                      <td className="text-right py-2">{formatCurrency(i.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
