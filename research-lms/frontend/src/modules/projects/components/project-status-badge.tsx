import { Badge } from '@/shared/ui/badge'
import type { ProjectStatus } from '@/services/api/projects'

const variants: Record<ProjectStatus, string> = {
  Planning: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Active: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  OnHold: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Cancelled: 'bg-red-100 text-red-700 line-through dark:bg-red-900 dark:text-red-300',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge className={`${variants[status]} border-0`}>
      {status === 'OnHold' ? 'On Hold' : status}
    </Badge>
  )
}
