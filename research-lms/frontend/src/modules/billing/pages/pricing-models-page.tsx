import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getPricingModels, createPricingModel, updatePricingModel, type PricingModelDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'

const modelTypeOptions = [
  { value: 'FlatRate', label: 'Flat Rate' },
  { value: 'PerUnit', label: 'Per Unit' },
  { value: 'Tiered', label: 'Tiered' },
  { value: 'TimeBased', label: 'Time Based' },
]

export default function PricingModelsPage() {
  const [models, setModels] = useState<PricingModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PricingModelDto | null>(null)
  const [form, setForm] = useState({ name: '', description: '', modelType: 'FlatRate', effectiveFrom: '', effectiveTo: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPricingModels()
      setModels(result)
    } catch { setError('Failed to load pricing models') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', modelType: 'FlatRate', effectiveFrom: new Date().toISOString().split('T')[0], effectiveTo: '' })
    setDialogOpen(true)
  }

  const openEdit = (m: PricingModelDto) => {
    setEditing(m)
    setForm({ name: m.name, description: m.description ?? '', modelType: m.modelType, effectiveFrom: m.effectiveFrom.split('T')[0], effectiveTo: m.effectiveTo ? m.effectiveTo.split('T')[0] : '' })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      if (editing) {
        await updatePricingModel(editing.id, { id: editing.id, ...form, effectiveTo: form.effectiveTo || undefined })
      } else {
        await createPricingModel({ ...form, effectiveTo: form.effectiveTo || undefined })
      }
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to save pricing model') }
  }

  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'modelType', header: 'Type', accessorKey: 'modelType', cell: (r: PricingModelDto) => modelTypeOptions.find(o => o.value === r.modelType)?.label ?? r.modelType },
    { id: 'effectiveFrom', header: 'From', accessorKey: 'effectiveFrom', cell: (r: PricingModelDto) => new Date(r.effectiveFrom).toLocaleDateString() },
    { id: 'effectiveTo', header: 'To', accessorKey: 'effectiveTo', cell: (r: PricingModelDto) => r.effectiveTo ? new Date(r.effectiveTo).toLocaleDateString() : '-' },
    { id: 'isActive', header: 'Active', accessorKey: 'isActive', cell: (r: PricingModelDto) => r.isActive ? 'Yes' : 'No' },
    { id: 'rateTables', header: 'Rate Tiers', cell: (r: PricingModelDto) => r.rateTables?.length ?? 0 },
    { id: 'actions', header: '', cell: (r: PricingModelDto) => (
      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
    )},
  ]

  return (
    <PageContainer title="Pricing Models" status={loading ? 'loading' : error ? 'error' : models.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pricing Models</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Model</Button>
        </div>
        <DataTable columns={columns} data={models} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Pricing Model</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div><Label>Model Type</Label>
              <Select value={form.modelType} onValueChange={v => setForm(f => ({...f, modelType: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{modelTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({...f, effectiveFrom: e.target.value}))} /></div>
            <div><Label>Effective To</Label><Input type="date" value={form.effectiveTo} onChange={e => setForm(f => ({...f, effectiveTo: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
