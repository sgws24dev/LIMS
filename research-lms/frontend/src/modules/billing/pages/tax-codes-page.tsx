import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getTaxCodes, createTaxCode, updateTaxCode, type TaxCodeDto } from '@/services/api/billing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'

export default function TaxCodesPage() {
  const [codes, setCodes] = useState<TaxCodeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TaxCodeDto | null>(null)
  const [form, setForm] = useState({ name: '', description: '', country: '', region: '', rate: 0, isDefault: false, isCompound: false, effectiveFrom: '', effectiveTo: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setCodes(await getTaxCodes()) }
    catch { setError('Failed to load tax codes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', country: 'AE', region: '', rate: 5, isDefault: false, isCompound: false, effectiveFrom: new Date().toISOString().split('T')[0], effectiveTo: '' })
    setDialogOpen(true)
  }

  const openEdit = (c: TaxCodeDto) => {
    setEditing(c)
    setForm({
      name: c.name, description: c.description ?? '', country: c.country, region: c.region ?? '',
      rate: c.rate, isDefault: c.isDefault, isCompound: c.isCompound,
      effectiveFrom: c.effectiveFrom.split('T')[0], effectiveTo: c.effectiveTo ? c.effectiveTo.split('T')[0] : ''
    })
    setDialogOpen(true)
  }

  const save = async () => {
    try {
      const dto = { ...form, region: form.region || undefined, effectiveTo: form.effectiveTo || undefined }
      if (editing) { await updateTaxCode(editing.id, { ...dto, id: editing.id }) }
      else { await createTaxCode(dto as any) }
      setDialogOpen(false)
      fetch()
    } catch { setError('Failed to save tax code') }
  }

  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'country', header: 'Country', accessorKey: 'country' },
    { id: 'region', header: 'Region', accessorKey: 'region', cell: (r: TaxCodeDto) => r.region ?? '-' },
    { id: 'rate', header: 'Rate', accessorKey: 'rate', cell: (r: TaxCodeDto) => `${r.rate}%` },
    { id: 'isDefault', header: 'Default', accessorKey: 'isDefault', cell: (r: TaxCodeDto) => r.isDefault ? 'Yes' : 'No' },
    { id: 'actions', header: '', cell: (r: TaxCodeDto) => <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button> },
  ]

  return (
    <PageContainer title="Tax Codes" status={loading ? 'loading' : error ? 'error' : codes.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tax Codes</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Tax Code</Button>
        </div>
        <DataTable columns={columns} data={codes} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Tax Code</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div><Label>Country</Label><Input value={form.country} maxLength={3} onChange={e => setForm(f => ({...f, country: e.target.value}))} /></div>
            <div><Label>Region</Label><Input value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} /></div>
            <div><Label>Rate (%)</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm(f => ({...f, rate: parseFloat(e.target.value) || 0}))} /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isDefault} onCheckedChange={v => setForm(f => ({...f, isDefault: v === true}))} id="isDefault" />
              <Label htmlFor="isDefault">Default Tax Code</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isCompound} onCheckedChange={v => setForm(f => ({...f, isCompound: v === true}))} id="isCompound" />
              <Label htmlFor="isCompound">Compound Tax</Label>
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
