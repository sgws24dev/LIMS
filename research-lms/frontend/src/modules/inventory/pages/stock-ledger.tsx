import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { ArrowLeft, Download } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { getInventoryItemById, type StockMovementDto, type InventoryItemDetailDto } from '@/services/api/inventory'

export default function StockLedgerPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<InventoryItemDetailDto | null>(null)
  const [movements, setMovements] = useState<StockMovementDto[]>([])
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const setBreadcrumbs = useUIStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Inventory', href: '/inventory' },
      { label: 'Items', href: '/inventory/items' },
      { label: 'Stock Ledger' },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getInventoryItemById(id),
      // Stock movements come from item detail's recentMovements
    ]).then(([itemData]) => {
      setItem(itemData)
      setMovements(itemData.recentMovements || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const filteredMovements = movements.filter((m) => {
    if (fromDate && new Date(m.createdAt) < new Date(fromDate)) return false
    if (toDate && new Date(m.createdAt) > new Date(toDate)) return false
    return true
  })

  const exportCsv = () => {
    const headers = 'Date,Type,Quantity,Before,After,Reference,Notes,By\n'
    const rows = filteredMovements.map((m) =>
      `${new Date(m.createdAt).toISOString()},${m.movementType},${m.quantity},${m.balanceBefore},${m.balanceAfter},${m.referenceType ?? ''},${m.notes ?? ''},${m.performedByName ?? ''}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `stock-ledger-${item?.sku ?? id}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>
  if (!item) return <div className="p-6 text-red-500">Item not found.</div>

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs are set via useUIStore */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/inventory/items/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stock Ledger</h1>
            <p className="text-sm text-muted-foreground">{item.name} ({item.sku})</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            {(fromDate || toDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setFromDate(''); setToDate('') }}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Before</th>
                <th className="text-right p-3">After</th>
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Notes</th>
                <th className="text-left p-3">By</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-6 text-muted-foreground">No stock movements found.</td></tr>
              ) : filteredMovements.map((m) => {
                const isInflow = m.movementType === 'In'
                const typeColor = isInflow ? 'bg-green-100 text-green-700' : m.movementType === 'Out' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                return (
                  <tr key={m.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="p-3"><Badge className={`${typeColor} border-0`}>{m.movementType}</Badge></td>
                    <td className={`p-3 text-right font-medium ${isInflow ? 'text-green-600' : 'text-red-600'}`}>
                      {isInflow ? '+' : '-'}{m.quantity}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{m.balanceBefore}</td>
                    <td className="p-3 text-right font-semibold">{m.balanceAfter}</td>
                    <td className="p-3 text-muted-foreground">{m.referenceType ?? '—'}</td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={m.notes ?? ''}>{m.notes ?? '—'}</td>
                    <td className="p-3">{m.performedByName ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
