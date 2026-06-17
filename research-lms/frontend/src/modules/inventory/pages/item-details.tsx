import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { StockStatusBadge } from '../components/stock-status-badge'
import { StockLevelBar } from '../components/stock-level-bar'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getInventoryItemById, adjustStock, type InventoryItemDetailDto } from '@/services/api/inventory'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Package } from 'lucide-react'

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [item, setItem] = useState<InventoryItemDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdjust, setShowAdjust] = useState(false)
  const [newQty, setNewQty] = useState(0)
  const [adjNotes, setAdjNotes] = useState('')

  const fetchItem = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getInventoryItemById(id)
      setItem(data)
      setNewQty(data.quantity)
    } catch {
      setError('Failed to load item details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (item) {
      setBreadcrumbs([{ label: 'Inventory', href: '/inventory' }, { label: 'Items', href: '/inventory/items' }, { label: item.name }])
    }
    fetchItem()
  }, [setBreadcrumbs, fetchItem, item?.name])

  const handleAdjustStock = async () => {
    if (!id) return
    try {
      await adjustStock(id, newQty, adjNotes || undefined)
      toast({ title: 'Stock adjusted', description: `Quantity set to ${newQty}.` })
      setShowAdjust(false)
      fetchItem()
    } catch {
      toast({ title: 'Error', description: 'Failed to adjust stock.', variant: 'destructive' })
    }
  }

  if (!item && !loading && !error) return null

  return (
    <PageContainer title={item?.name ?? 'Item Details'} status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchItem}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/inventory/items')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-semibold">{item?.name}</h1>
          <StockStatusBadge status={item?.status ?? 'Available'} />
        </div>

        {item && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Item Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">SKU</span><span>{item.sku}</span>
                <span className="text-muted-foreground">Category</span><span>{item.category ?? '-'}</span>
                <span className="text-muted-foreground">Unit</span><span>{item.unit ?? '-'}</span>
                <span className="text-muted-foreground">Location</span><span>{item.location ?? '-'}</span>
                <span className="text-muted-foreground">Vendor</span><span>{item.vendorName ?? '-'}</span>
                <span className="text-muted-foreground">Expiry Date</span><span>{item.expiryDate ? formatDate(item.expiryDate) : '-'}</span>
                <span className="text-muted-foreground">Barcode</span><span className="font-mono text-xs">{item.barcode ?? '-'}</span>
                <span className="text-muted-foreground">Specifications</span><span className="max-w-xs truncate">{item.specifications ?? '-'}</span>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Stock Level</h3>
                <Button size="sm" variant="outline" onClick={() => setShowAdjust(true)}>Adjust</Button>
              </div>
              <StockLevelBar quantity={item.quantity} reorderLevel={item.reorderLevel} showLabel className="py-2" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Current Quantity</span><span className="font-semibold">{item.quantity}</span>
                <span className="text-muted-foreground">Reorder Level</span><span>{item.reorderLevel}</span>
                <span className="text-muted-foreground">Reorder Qty</span><span>{item.reorderQuantity}</span>
                <span className="text-muted-foreground">Unit Price</span><span>{formatCurrency(item.unitPrice)}</span>
                <span className="text-muted-foreground">Total Value</span><span className="font-semibold">{formatCurrency(item.totalValue)}</span>
              </div>
            </Card>
          </div>
        )}

        {item && item.recentMovements.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Recent Stock Movements</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Before</th>
                  <th className="text-right py-2">After</th>
                  <th className="text-left py-2">Reference</th>
                  <th className="text-left py-2">Notes</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {item.recentMovements.map(m => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2"><Badge variant="outline">{m.movementType}</Badge></td>
                    <td className="text-right py-2">{m.quantity}</td>
                    <td className="text-right py-2">{m.balanceBefore}</td>
                    <td className="text-right py-2">{m.balanceAfter}</td>
                    <td className="py-2">{m.referenceType ?? '-'}</td>
                    <td className="py-2 max-w-[200px] truncate">{m.notes ?? '-'}</td>
                    <td className="py-2">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Quantity</Label>
              <Input type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input value={adjNotes} onChange={e => setAdjNotes(e.target.value)} placeholder="Reason for adjustment" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
            <Button onClick={handleAdjustStock}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
