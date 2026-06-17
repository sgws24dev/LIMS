import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { formatDate } from '@/lib/utils'
import { getVendors, createVendor, updateVendor, type VendorDto } from '@/services/api/inventory'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Building2 } from 'lucide-react'

export default function VendorDirectoryPage() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [vendors, setVendors] = useState<VendorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingVendor, setEditingVendor] = useState<VendorDto | null>(null)
  const [form, setForm] = useState({ name: '', code: '', contactPerson: '', email: '', phone: '', address: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getVendors(false)
      setVendors(data)
    } catch {
      setError('Failed to load vendors.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Inventory', href: '/inventory' }, { label: 'Vendors' }])
    fetchData()
  }, [setBreadcrumbs, fetchData])

  const resetForm = () => setForm({ name: '', code: '', contactPerson: '', email: '', phone: '', address: '' })

  const openCreate = () => { resetForm(); setShowCreate(true) }
  const openEdit = (v: VendorDto) => {
    setForm({ name: v.name, code: v.code, contactPerson: v.contactPerson ?? '', email: v.email ?? '', phone: v.phone ?? '', address: v.address ?? '' })
    setEditingVendor(v)
  }

  const handleSave = async () => {
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, { name: form.name, contactPerson: form.contactPerson || undefined, email: form.email || undefined, phone: form.phone || undefined, address: form.address || undefined, isActive: true })
        toast({ title: 'Vendor updated' })
      } else {
        await createVendor({ name: form.name, code: form.code.toUpperCase(), contactPerson: form.contactPerson || undefined, email: form.email || undefined, phone: form.phone || undefined, address: form.address || undefined })
        toast({ title: 'Vendor created' })
      }
      setShowCreate(false)
      setEditingVendor(null)
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to save vendor.', variant: 'destructive' })
    }
  }

  return (
    <PageContainer title="Vendors" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No vendors yet. Add your first vendor to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map(v => (
              <Card key={v.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{v.name}</h3>
                    <p className="text-xs text-muted-foreground">{v.code}</p>
                  </div>
                  <Badge variant={v.isActive ? 'default' : 'secondary'}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  {v.contactPerson && <p><span className="text-muted-foreground">Contact: </span>{v.contactPerson}</p>}
                  {v.email && <p><span className="text-muted-foreground">Email: </span>{v.email}</p>}
                  {v.phone && <p><span className="text-muted-foreground">Phone: </span>{v.phone}</p>}
                  <p><span className="text-muted-foreground">Items: </span>{v.itemCount}</p>
                  <p><span className="text-muted-foreground">Added: </span>{formatDate(v.createdAt)}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => openEdit(v)}>
                  <Pencil className="h-3 w-3 mr-2" />Edit
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={() => { setShowCreate(false); setEditingVendor(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editingVendor} /></div>
            </div>
            <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditingVendor(null) }}>Cancel</Button>
            <Button onClick={handleSave}>{editingVendor ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
