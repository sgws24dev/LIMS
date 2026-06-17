import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import {
  getVendors, getInventoryItems, createPurchaseOrder,
  type VendorDto, type InventoryItemDto,
} from '@/services/api/inventory'
import { useNavigate } from 'react-router-dom'

interface LineItem {
  inventoryItemId: string
  itemName: string
  itemSku: string
  quantity: number
  unitPrice: number
}

export function POWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<VendorDto[]>([])
  const [items, setItems] = useState<InventoryItemDto[]>([])

  const [vendorId, setVendorId] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [searchResults, setSearchResults] = useState<InventoryItemDto[]>([])

  useEffect(() => {
    if (open) {
      getVendors(true).then(setVendors).catch(() => {})
      getInventoryItems({ pageSize: 100 }).then(r => setItems(r.items)).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (!itemSearch.trim()) { setSearchResults([]); return }
    const q = itemSearch.toLowerCase()
    setSearchResults(items.filter(i =>
      i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
    ).slice(0, 10))
  }, [itemSearch, items])

  const addLineItem = (item: InventoryItemDto) => {
    if (lineItems.some(l => l.inventoryItemId === item.id)) return
    setLineItems([...lineItems, {
      inventoryItemId: item.id,
      itemName: item.name,
      itemSku: item.sku,
      quantity: 1,
      unitPrice: item.unitPrice,
    }])
    setItemSearch('')
  }

  const removeLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx))
  }

  const updateLine = (idx: number, field: 'quantity' | 'unitPrice', value: number) => {
    setLineItems(lineItems.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const totalAmount = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0)

  const handleSubmit = async (submitForApproval: boolean) => {
    if (!vendorId) { toast({ title: 'Error', description: 'Please select a vendor', variant: 'destructive' }); return }
    if (lineItems.length === 0) { toast({ title: 'Error', description: 'Add at least one line item', variant: 'destructive' }); return }

    setLoading(true)
    try {
      const poId = await createPurchaseOrder({
        poNumber: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        vendorId,
        expectedDeliveryDate: expectedDelivery || undefined,
        notes,
        items: lineItems.map(l => ({
          inventoryItemId: l.inventoryItemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      })

      toast({
        title: 'Success',
        description: `Purchase order created${submitForApproval ? ' and submitted for approval' : ' as draft'}.`,
      })
      onClose()
      navigate('/inventory/purchase-orders')
    } catch {
      toast({ title: 'Error', description: 'Failed to create purchase order', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Step {step} of 3: {step === 1 ? 'Vendor & Details' : step === 2 ? 'Line Items' : 'Review & Submit'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Select vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipping Address</Label>
              <Textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!vendorId}>Next →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search items by name or SKU..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <Card className="absolute z-10 w-full mt-1">
                  <ScrollArea className="h-40">
                    {searchResults.map(item => (
                      <div
                        key={item.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer flex justify-between text-sm"
                        onClick={() => addLineItem(item)}
                      >
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{item.sku} — {item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              )}
            </div>

            <ScrollArea className="h-60">
              {lineItems.map((line, idx) => (
                <Card key={idx} className="mb-2">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{line.itemName}</p>
                      <p className="text-xs text-muted-foreground">{line.itemSku}</p>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number" min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number" min={0} step={0.01}
                        value={line.unitPrice}
                        onChange={(e) => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right">₹{(line.quantity * line.unitPrice).toLocaleString()}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeLineItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>

            <div className="flex justify-between items-center">
              <span className="font-semibold">Order Total: ₹{totalAmount.toLocaleString()}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => setStep(3)} disabled={lineItems.length === 0}>Next →</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p><strong>Vendor:</strong> {vendors.find(v => v.id === vendorId)?.name ?? vendorId}</p>
              {expectedDelivery && <p><strong>Expected Delivery:</strong> {expectedDelivery}</p>}
            </div>
            <ScrollArea className="h-48">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Item</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">Unit Price</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((line, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-1">{line.itemName}</td>
                      <td className="text-right py-1">{line.quantity}</td>
                      <td className="text-right py-1">₹{line.unitPrice.toLocaleString()}</td>
                      <td className="text-right py-1">₹{(line.quantity * line.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={3} className="text-right py-1">Total:</td>
                    <td className="text-right py-1">₹{totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </ScrollArea>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save as Draft
                </Button>
                <Button onClick={() => handleSubmit(true)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit for Approval
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
