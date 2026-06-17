import { Badge } from '@/shared/ui/badge'
import type { InventoryItemStatus } from '@/services/api/inventory'

const variants: Record<InventoryItemStatus, string> = {
  Available: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  LowStock: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  OutOfStock: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  Discontinued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Quarantined: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}

export function StockStatusBadge({ status }: { status: InventoryItemStatus }) {
  const label = status === 'LowStock' ? 'Low Stock'
    : status === 'OutOfStock' ? 'Out of Stock'
    : status
  return (
    <Badge className={`${variants[status]} border-0`}>
      {label}
    </Badge>
  )
}
