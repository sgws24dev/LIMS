import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CheckCheck, Filter, Bell } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card, CardContent } from '@/shared/ui/card'
import { PageContainer } from '@/shared/shared/page-container'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationDto,
} from '@/services/api/communications'
import { useSignalR } from '../hooks/useSignalR'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getNotifications({
        unreadOnly: filter === 'unread' ? true : undefined,
        type: typeFilter || undefined,
        page,
        pageSize: 20,
      })
      setNotifications(result.items)
      setTotalCount(result.totalCount)
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [filter, typeFilter, page])

  useEffect(() => { fetchData() }, [fetchData])

  useSignalR(() => {
    fetchData()
  })

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <PageContainer title="Notification Center" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Notification Center</h1>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={v => { setFilter(v as 'all' | 'unread'); setPage(1) }}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="CompetencyExpiry">Competency Expiry</SelectItem>
                <SelectItem value="BookingReminder">Booking Reminder</SelectItem>
                <SelectItem value="InvoicePaid">Invoice Paid</SelectItem>
                <SelectItem value="Announcement">Announcement</SelectItem>
                <SelectItem value="SystemAlert">System Alert</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />Mark All Read
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4" />
                <p className="text-lg">No notifications found</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 px-6 py-4 ${!n.isRead ? 'bg-muted/30' : ''}`}
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0 ml-4">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{n.type}</span>
                      </div>
                    </div>
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} className="shrink-0">
                        Mark read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
