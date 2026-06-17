import { Badge } from '@/shared/ui/badge'
import type { PurchaseOrderStatus } from '@/services/api/inventory'

const variants: Record<PurchaseOrderStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function PurchaseOrderStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <Badge className={`${variants[status]} border-0`}>
      {status}
    </Badge>
  )
}
