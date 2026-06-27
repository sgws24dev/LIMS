import { Badge } from '@/shared/ui/badge'
import type { InvoiceStatus } from '@/services/api/billing'

const variants: Record<InvoiceStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  Sent: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Overdue: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  Voided: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CreditNote: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge className={`${variants[status]} border-0`}>
      {status === 'CreditNote' ? 'Credit Note' : status}
    </Badge>
  )
}
