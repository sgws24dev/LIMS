import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getReconciliations, createReconciliation, matchReconciliation, disputeReconciliation, type ReconciliationDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Unmatched', label: 'Unmatched' },
  { value: 'PartiallyMatched', label: 'Partially Matched' },
  { value: 'Matched', label: 'Matched' },
  { value: 'Disputed', label: 'Disputed' },
]

export default function ReconciliationPage() {
  const [items, setItems] = useState<ReconciliationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [disputeDialog, setDisputeDialog] = useState<ReconciliationDto | null>(null)
  const [disputeNotes, setDisputeNotes] = useState('')
  const [form, setForm] = useState({ invoiceId: '', referenceNumber: '', amount: 0, currency: 'AED', transactionDate: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setItems(await getReconciliations(statusFilter || undefined)) }
    catch { setError('Failed to load reconciliations') }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setForm({ invoiceId: '', referenceNumber: '', amount: 0, currency: 'AED', transactionDate: new Date().toISOString().split('T')[0] })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      await createReconciliation(form)
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to create reconciliation') }
  }

  const handleMatch = async (id: string) => {
    try { await matchReconciliation(id); fetch() }
    catch { setError('Failed to match') }
  }

  const openDispute = (item: ReconciliationDto) => {
    setDisputeDialog(item)
    setDisputeNotes('')
  }

  const handleDispute = async () => {
    if (!disputeDialog) return
    try { await disputeReconciliation(disputeDialog.id, disputeNotes); setDisputeDialog(null); fetch() }
    catch { setError('Failed to dispute') }
  }

  const columns = [
    { id: 'referenceNumber', header: 'Reference', accessorKey: 'referenceNumber' },
    { id: 'invoiceId', header: 'Invoice ID', accessorKey: 'invoiceId', cell: (r: ReconciliationDto) => r.invoiceId.slice(0, 8) + '...' },
    { id: 'amount', header: 'Amount', accessorKey: 'amount', cell: (r: ReconciliationDto) => `${r.currency} ${r.amount.toLocaleString()}` },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (r: ReconciliationDto) => {
      const colors: Record<string, string> = { Matched: 'text-green-600', Disputed: 'text-red-600', Unmatched: 'text-yellow-600', PartiallyMatched: 'text-blue-600' }
      return <span className={colors[r.status] ?? ''}>{r.status}</span>
    }},
    { id: 'transactionDate', header: 'Date', accessorKey: 'transactionDate', cell: (r: ReconciliationDto) => new Date(r.transactionDate).toLocaleDateString() },
    { id: 'actions', header: '', cell: (r: ReconciliationDto) => (
      <div className="flex gap-1">
        {r.status !== 'Matched' && <Button variant="ghost" size="sm" onClick={() => handleMatch(r.id)} title="Match"><CheckCircle className="h-4 w-4 text-green-600" /></Button>}
        {r.status !== 'Disputed' && <Button variant="ghost" size="sm" onClick={() => openDispute(r)} title="Dispute"><AlertTriangle className="h-4 w-4 text-red-600" /></Button>}
      </div>
    )},
  ]

  return (
    <PageContainer title="Payment Reconciliation" status={loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Payment Reconciliation</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Record</Button>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={items} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Reconciliation Record</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Invoice ID</Label><Input value={form.invoiceId} onChange={e => setForm(f => ({...f, invoiceId: e.target.value}))} /></div>
            <div><Label>Reference Number</Label><Input value={form.referenceNumber} onChange={e => setForm(f => ({...f, referenceNumber: e.target.value}))} /></div>
            <div><Label>Amount</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Currency</Label><Input value={form.currency} maxLength={3} onChange={e => setForm(f => ({...f, currency: e.target.value}))} /></div>
            <div><Label>Transaction Date</Label><Input type="date" value={form.transactionDate} onChange={e => setForm(f => ({...f, transactionDate: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!disputeDialog} onOpenChange={() => setDisputeDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dispute Reconciliation</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Notes</Label><Input value={disputeNotes} onChange={e => setDisputeNotes(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleDispute} variant="destructive">Submit Dispute</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
