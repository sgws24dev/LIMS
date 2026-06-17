import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { formatDate } from '@/lib/utils'
import type { WorkOrderDto, Priority, WorkOrderStatus } from '@/services/api/projects'

const priorityColors: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
}

interface WorkOrderCardProps {
  workOrder: WorkOrderDto
  onStatusChange?: (id: string, newStatus: WorkOrderStatus) => void
  onClick?: () => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded', priorityColors[workOrder.priority])}>
          {workOrder.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {workOrder.title}
      </h4>
      {workOrder.assignedToName && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>👤 {workOrder.assignedToName}</span>
        </div>
      )}
      {workOrder.dueDate && (
        <div className={cn('text-xs mb-1', workOrder.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400')}>
          📅 Due: {formatDate(workOrder.dueDate)}
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>⏱ {workOrder.estimatedHours}h / {workOrder.actualHours}h</span>
      </div>
      {workOrder.tags && (
        <div className="flex flex-wrap gap-1 mt-1">
          {workOrder.tags.split(',').map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
