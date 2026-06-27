import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getExchangeRates, createExchangeRate, type ExchangeRateDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRateDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ fromCurrency: 'AED', toCurrency: 'USD', rate: 3.67, validFrom: '', validTo: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setRates(await getExchangeRates()) }
    catch { setError('Failed to load exchange rates') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setForm({ fromCurrency: 'AED', toCurrency: 'USD', rate: 3.67, validFrom: new Date().toISOString().split('T')[0], validTo: '' })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      await createExchangeRate({ ...form, validTo: form.validTo || undefined })
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to save exchange rate') }
  }

  const columns = [
    { id: 'fromCurrency', header: 'From', accessorKey: 'fromCurrency' },
    { id: 'toCurrency', header: 'To', accessorKey: 'toCurrency' },
    { id: 'rate', header: 'Rate', accessorKey: 'rate', cell: (r: ExchangeRateDto) => r.rate.toFixed(4) },
    { id: 'validFrom', header: 'Valid From', accessorKey: 'validFrom', cell: (r: ExchangeRateDto) => new Date(r.validFrom).toLocaleDateString() },
    { id: 'validTo', header: 'Valid To', accessorKey: 'validTo', cell: (r: ExchangeRateDto) => r.validTo ? new Date(r.validTo).toLocaleDateString() : '-' },
  ]

  return (
    <PageContainer title="Exchange Rates" status={loading ? 'loading' : error ? 'error' : rates.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Exchange Rates</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Rate</Button>
        </div>
        <DataTable columns={columns} data={rates} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Exchange Rate</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>From Currency</Label><Input value={form.fromCurrency} maxLength={3} onChange={e => setForm(f => ({...f, fromCurrency: e.target.value}))} /></div>
            <div><Label>To Currency</Label><Input value={form.toCurrency} maxLength={3} onChange={e => setForm(f => ({...f, toCurrency: e.target.value}))} /></div>
            <div><Label>Rate</Label><Input type="number" step="0.0001" value={form.rate} onChange={e => setForm(f => ({...f, rate: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={e => setForm(f => ({...f, validFrom: e.target.value}))} /></div>
            <div><Label>Valid To</Label><Input type="date" value={form.validTo} onChange={e => setForm(f => ({...f, validTo: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
