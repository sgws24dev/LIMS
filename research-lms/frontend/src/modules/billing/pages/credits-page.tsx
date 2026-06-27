import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getCredits, adjustCredit, type CreditDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

export default function CreditsPage() {
  const [credits, setCredits] = useState<CreditDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ institutionId: '', amount: 0, currency: 'AED' })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setCredits(await getCredits()) }
    catch { setError('Failed to load credits') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openAdjust = () => {
    setForm({ institutionId: '', amount: 0, currency: 'AED' })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      await adjustCredit(form.institutionId, form.amount, form.currency)
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to adjust credit') }
  }

  const columns = [
    { id: 'institutionId', header: 'Institution ID', accessorKey: 'institutionId', cell: (r: CreditDto) => r.institutionId.slice(0, 8) + '...' },
    { id: 'balance', header: 'Balance', accessorKey: 'balance', cell: (r: CreditDto) => `${r.currency} ${r.balance.toLocaleString()}` },
    { id: 'currency', header: 'Currency', accessorKey: 'currency' },
  ]

  return (
    <PageContainer title="Credits" status={loading ? 'loading' : error ? 'error' : credits.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Institutional Credits</h1>
          <Button onClick={openAdjust}>Adjust Balance</Button>
        </div>
        <DataTable columns={columns} data={credits} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust Credit Balance</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Institution ID</Label><Input value={form.institutionId} onChange={e => setForm(f => ({...f, institutionId: e.target.value}))} /></div>
            <div><Label>Amount (+/-)</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
