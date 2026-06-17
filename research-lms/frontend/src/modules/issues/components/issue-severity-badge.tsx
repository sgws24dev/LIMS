import { Badge } from '@/shared/ui/badge'
import type { IssueSeverity } from '@/services/api/projects'

const variants: Record<IssueSeverity, string> = {
  Critical: 'bg-red-600 text-white border-0',
  Major: 'bg-orange-500 text-white border-0',
  Minor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0',
  Enhancement: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0',
}

export function IssueSeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <Badge className={variants[severity]}>
      {severity}
    </Badge>
  )
}
