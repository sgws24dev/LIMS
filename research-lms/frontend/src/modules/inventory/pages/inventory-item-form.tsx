import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card } from '@/shared/ui/card'
import { createInventoryItem, type CreateInventoryItemRequest } from '@/services/api/inventory'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

const CATEGORIES = ['Consumable', 'Reagent', 'Equipment', 'Glassware', 'Safety', 'Other']
const UNITS = ['Each', 'Box', 'Case', 'Liter', 'mL', 'Gram', 'Kg', 'Pack', 'Set']

export default function InventoryItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateInventoryItemRequest>({
    name: '',
    sku: '',
    description: '',
    category: '',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    location: '',
    barcode: '',
  })

  const handleSubmit = async () => {
    if (!form.name || !form.sku) {
      toast({ title: 'Validation error', description: 'Name and SKU are required.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await createInventoryItem(form)
      toast({ title: 'Item created', description: `${form.name} has been created.` })
      navigate('/inventory/items')
    } catch {
      toast({ title: 'Error', description: 'Failed to create item.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer title={isEdit ? 'Edit Item' : 'New Item'} status="success"
      actions={
        <Button variant="ghost" onClick={() => navigate('/inventory/items')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      }
    >
      <Card className="max-w-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" />
          </div>
          <div className="space-y-2">
            <Label>SKU *</Label>
            <Input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="Auto-generated if empty" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Input value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit of Measure</Label>
            <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
              <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={0} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Unit Price</Label>
            <Input type="number" min={0} step={0.01} value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Reorder Level</Label>
            <Input type="number" min={0} value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Reorder Quantity</Label>
            <Input type="number" min={0} value={form.reorderQuantity} onChange={e => setForm(p => ({ ...p, reorderQuantity: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location ?? ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. A-12-B" />
          </div>
          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input value={form.barcode ?? ''} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} placeholder="Optional" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => navigate('/inventory/items')}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  )
}
