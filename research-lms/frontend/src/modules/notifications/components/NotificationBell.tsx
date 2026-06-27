import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { NotificationDropdown } from './NotificationDropdown'
import { getUnreadCount } from '@/services/api/communications'
import { useSignalR } from '../hooks/useSignalR'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchCount = async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchCount() }, [])

  useSignalR(() => {
    fetchCount()
  })

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} onCountChange={fetchCount} />}
    </div>
  )
}
