import { Badge } from '@/shared/ui/badge'
import { BookingStatus } from '@/services/api/scheduling'

const statusConfig: Record<BookingStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
  [BookingStatus.Pending]: { variant: 'warning', label: 'Pending' },
  [BookingStatus.Confirmed]: { variant: 'success', label: 'Confirmed' },
  [BookingStatus.InProgress]: { variant: 'warning', label: 'In Progress' },
  [BookingStatus.Completed]: { variant: 'success', label: 'Completed' },
  [BookingStatus.Cancelled]: { variant: 'destructive', label: 'Cancelled' },
  [BookingStatus.NoShow]: { variant: 'destructive', label: 'No Show' },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status] ?? { variant: 'secondary' as const, label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
