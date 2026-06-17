import type { PurchaseOrderItemDto } from '@/services/api/inventory'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'

interface PoLineItemsTableProps {
  lines: PurchaseOrderItemDto[]
  readOnly?: boolean
  onQuantityChange?: (lineId: string, quantity: number) => void
}

export default function PoLineItemsTable({ lines, readOnly = true, onQuantityChange }: PoLineItemsTableProps) {
  if (lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No line items
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Qty Ordered</TableHead>
          <TableHead className="text-right">Qty Received</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Total Price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.id}>
            <TableCell className="font-mono text-xs">{line.itemSku}</TableCell>
            <TableCell className="font-medium">{line.itemName}</TableCell>
            <TableCell className="text-right">{line.quantity}</TableCell>
            <TableCell className="text-right">{line.quantityReceived ?? 0}</TableCell>
            <TableCell className="text-right">{line.unitPrice.toFixed(2)}</TableCell>
            <TableCell className="text-right font-medium">{line.totalPrice.toFixed(2)}</TableCell>
            <TableCell>
              <Badge className={cn(
                line.quantityReceived >= line.quantity ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              )}>
                {line.quantityReceived >= line.quantity ? 'Received' : 'Pending'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
