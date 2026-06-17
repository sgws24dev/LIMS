import { Badge } from '@/shared/ui/badge'
import type { IssueStatus } from '@/services/api/projects'

const variants: Record<IssueStatus, string> = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  InProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Reopened: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
}

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const label = status === 'InProgress' ? 'In Progress' : status
  return (
    <Badge className={`${variants[status]} border-0`}>
      {label}
    </Badge>
  )
}
