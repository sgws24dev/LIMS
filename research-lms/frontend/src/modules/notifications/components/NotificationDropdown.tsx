import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { getNotifications, markAllNotificationsRead, type NotificationDto } from '@/services/api/communications'

interface Props {
  onClose: () => void
  onCountChange: () => void
}

export function NotificationDropdown({ onClose, onCountChange }: Props) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationDto[]>([])

  useEffect(() => {
    getNotifications({ unreadOnly: true, pageSize: 10 }).then(r => setNotifications(r.items)).catch(() => {})
  }, [])

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    onCountChange()
    onClose()
  }

  const handleNavigate = (link?: string | null) => {
    if (link) navigate(link)
    onClose()
  }

  return (
    <div className="absolute right-0 top-full mt-1 w-80 rounded-md border bg-popover shadow-md z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-sm font-medium">Notifications</span>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className="px-4 py-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleNavigate(n.link ?? undefined)}
            >
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t px-4 py-2">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { navigate('/notifications'); onClose() }}>
          View all notifications
        </Button>
      </div>
    </div>
  )
}
