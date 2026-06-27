import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getRateTables, setRateTable, getPricingModels, type RateTableDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

const customerTypeOptions = [
  { value: 'Internal', label: 'Internal' },
  { value: 'ExternalAcademic', label: 'External Academic' },
  { value: 'ExternalCorporate', label: 'External Corporate' },
  { value: 'Government', label: 'Government' },
]

export default function RateEditorPage() {
  const { pricingModelId } = useParams<{ pricingModelId: string }>()
  const navigate = useNavigate()
  const [rates, setRates] = useState<RateTableDto[]>([])
  const [modelName, setModelName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ customerType: 'Internal', rate: 0, minQuantity: 0, maxQuantity: 0, effectiveFrom: '', effectiveTo: '' })

  const fetch = useCallback(async () => {
    if (!pricingModelId) return
    setLoading(true)
    setError(null)
    try {
      const [rateResult, models] = await Promise.all([getRateTables(pricingModelId), getPricingModels()])
      setRates(rateResult)
      const model = models.find(m => m.id === pricingModelId)
      setModelName(model?.name ?? 'Unknown')
    } catch { setError('Failed to load rate tables') }
    finally { setLoading(false) }
  }, [pricingModelId])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setForm({ customerType: 'Internal', rate: 0, minQuantity: 0, maxQuantity: 0, effectiveFrom: new Date().toISOString().split('T')[0], effectiveTo: '' })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!pricingModelId) return
    try {
      await setRateTable({ pricingModelId, ...form, minQuantity: form.minQuantity || undefined, maxQuantity: form.maxQuantity || undefined, effectiveTo: form.effectiveTo || undefined })
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to save rate') }
  }

  const columns = [
    { id: 'customerType', header: 'Customer Type', accessorKey: 'customerType' },
    { id: 'rate', header: 'Rate', accessorKey: 'rate', cell: (r: RateTableDto) => `${r.rate.toFixed(2)}` },
    { id: 'minQuantity', header: 'Min Qty', accessorKey: 'minQuantity', cell: (r: RateTableDto) => r.minQuantity ?? '-' },
    { id: 'maxQuantity', header: 'Max Qty', accessorKey: 'maxQuantity', cell: (r: RateTableDto) => r.maxQuantity ?? '-' },
    { id: 'effectiveFrom', header: 'From', accessorKey: 'effectiveFrom', cell: (r: RateTableDto) => new Date(r.effectiveFrom).toLocaleDateString() },
    { id: 'effectiveTo', header: 'To', accessorKey: 'effectiveTo', cell: (r: RateTableDto) => r.effectiveTo ? new Date(r.effectiveTo).toLocaleDateString() : '-' },
  ]

  return (
    <PageContainer title="Rate Editor" status={loading ? 'loading' : error ? 'error' : rates.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/billing/pricing-models')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-semibold">Rate Editor — {modelName}</h1>
          <Button onClick={openCreate} className="ml-auto"><Plus className="h-4 w-4 mr-2" />Add Rate</Button>
        </div>
        <DataTable columns={columns} data={rates} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Rate Table Entry</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Customer Type</Label>
              <Select value={form.customerType} onValueChange={v => setForm(f => ({...f, customerType: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{customerTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Rate</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm(f => ({...f, rate: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Min Quantity</Label><Input type="number" value={form.minQuantity} onChange={e => setForm(f => ({...f, minQuantity: parseInt(e.target.value) || 0}))} /></div>
            <div><Label>Max Quantity</Label><Input type="number" value={form.maxQuantity} onChange={e => setForm(f => ({...f, maxQuantity: parseInt(e.target.value) || 0}))} /></div>
            <div><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({...f, effectiveFrom: e.target.value}))} /></div>
            <div><Label>Effective To</Label><Input type="date" value={form.effectiveTo} onChange={e => setForm(f => ({...f, effectiveTo: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
