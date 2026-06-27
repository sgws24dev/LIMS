import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getRebates, createRebate, updateRebate, type RebateDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

const rebateTypeOptions = [
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Fixed', label: 'Fixed Amount' },
  { value: 'Volume', label: 'Volume-Based' },
]

export default function RebatesPage() {
  const [rebates, setRebates] = useState<RebateDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RebateDto | null>(null)
  const [form, setForm] = useState({ name: '', description: '', rebateType: 'Percentage', value: 0, minSpendAmount: 0, maxDiscountAmount: 0, validFrom: '', validTo: '', isActive: true })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setRebates(await getRebates()) }
    catch { setError('Failed to load rebates') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', rebateType: 'Percentage', value: 0, minSpendAmount: 0, maxDiscountAmount: 0, validFrom: new Date().toISOString().split('T')[0], validTo: '', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (r: RebateDto) => {
    setEditing(r)
    setForm({
      name: r.name, description: r.description ?? '', rebateType: r.rebateType, value: r.value,
      minSpendAmount: r.minSpendAmount ?? 0, maxDiscountAmount: r.maxDiscountAmount ?? 0,
      validFrom: r.validFrom.split('T')[0], validTo: r.validTo ? r.validTo.split('T')[0] : '',
      isActive: r.isActive ?? true
    })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      const dto = { ...form, minSpendAmount: form.minSpendAmount || undefined, maxDiscountAmount: form.maxDiscountAmount || undefined, validTo: form.validTo || undefined, isActive: editing?.isActive ?? true }
      if (editing) { await updateRebate(editing.id, { ...dto, id: editing.id }) }
      else { await createRebate(dto as any) }
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to save rebate') }
  }

  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'rebateType', header: 'Type', accessorKey: 'rebateType' },
    { id: 'value', header: 'Value', accessorKey: 'value', cell: (r: RebateDto) => r.rebateType === 'Percentage' ? `${r.value}%` : `${r.value}` },
    { id: 'minSpendAmount', header: 'Min Spend', accessorKey: 'minSpendAmount', cell: (r: RebateDto) => r.minSpendAmount ? `${r.minSpendAmount}` : '-' },
    { id: 'isActive', header: 'Active', accessorKey: 'isActive', cell: (r: RebateDto) => r.isActive ? 'Yes' : 'No' },
    { id: 'actions', header: '', cell: (r: RebateDto) => <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button> },
  ]

  return (
    <PageContainer title="Rebates" status={loading ? 'loading' : error ? 'error' : rebates.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rebates & Discounts</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Rebate</Button>
        </div>
        <DataTable columns={columns} data={rebates} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Rebate</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div><Label>Type</Label>
              <Select value={form.rebateType} onValueChange={v => setForm(f => ({...f, rebateType: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{rebateTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Value</Label><Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({...f, value: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Min Spend Amount</Label><Input type="number" step="0.01" value={form.minSpendAmount} onChange={e => setForm(f => ({...f, minSpendAmount: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Max Discount Amount</Label><Input type="number" step="0.01" value={form.maxDiscountAmount} onChange={e => setForm(f => ({...f, maxDiscountAmount: parseFloat(e.target.value) || 0}))} /></div>
            <div><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={e => setForm(f => ({...f, validFrom: e.target.value}))} /></div>
            <div><Label>Valid To</Label><Input type="date" value={form.validTo} onChange={e => setForm(f => ({...f, validTo: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
