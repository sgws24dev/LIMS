import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import type { PurchaseOrderDetailDto } from '@/services/api/inventory'

interface ReceivePODialogProps {
  po: PurchaseOrderDetailDto
  onReceive: (lines: { lineId: string; quantityReceived: number }[]) => Promise<void>
  onClose: () => void
}

export function ReceivePODialog({ po, onReceive, onClose }: ReceivePODialogProps) {
  const { toast } = useToast()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const handleReceive = async () => {
    const lines = Object.entries(quantities)
      .map(([lineId, qty]) => ({ lineId, quantityReceived: qty }))
      .filter(l => l.quantityReceived > 0)

    if (lines.length === 0) {
      toast({ title: 'Error', description: 'Enter at least one quantity to receive.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await onReceive(lines)
      toast({ title: 'Success', description: 'Receipt recorded and stock updated.' })
      onClose()
    } catch {
      toast({ title: 'Error', description: 'Failed to record receipt.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Receive Items — {po.poNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Enter the quantity received for each line item. Leave at 0 to skip.
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Ordered</th>
                <th className="text-right py-2">Received</th>
                <th className="text-right py-2">Pending</th>
                <th className="text-right py-2">Receive Now</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item) => {
                const pending = item.quantity - item.quantityReceived
                return (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.itemName}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{item.quantityReceived}</td>
                    <td className="text-right py-2">{pending}</td>
                    <td className="text-right py-2 w-24">
                      <Input
                        type="number"
                        min={0}
                        max={pending}
                        value={quantities[item.id] ?? 0}
                        onChange={(e) => setQuantities({
                          ...quantities,
                          [item.id]: parseInt(e.target.value) || 0,
                        })}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="text-xs text-muted-foreground">
            This action will automatically update inventory stock levels.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleReceive} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
