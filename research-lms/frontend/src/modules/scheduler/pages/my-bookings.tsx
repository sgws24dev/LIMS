import { useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getBookings, getMyBookingStats, cancelBooking,
  type BookingDto, type MyBookingStatsDto,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/shared/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/ui/dialog'
import { CalendarClock, DollarSign, Clock, Eye, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  InProgress: 'bg-green-100 text-green-800',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-gray-100 text-gray-400',
}

export default function MyBookings() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [stats, setStats] = useState<MyBookingStatsDto | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'My Bookings' }])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const [bookingsData, statsData] = await Promise.all([
        getBookings({ page: 1, pageSize: 50 }),
        getMyBookingStats(),
      ])
      setBookings(bookingsData.items)
      setStats(statsData)
      setPageStatus(bookingsData.items.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCancel = async () => {
    if (!cancelId) return
    try {
      await cancelBooking(cancelId, cancelReason || undefined)
      toast({ title: 'Booking cancelled', variant: 'success' })
      setCancelId(null)
      setCancelReason('')
      fetchData()
    } catch {
      toast({ title: 'Failed to cancel booking', variant: 'destructive' })
    }
  }

  return (
    <PageContainer
      title="My Bookings"
      description="View and manage your scheduled bookings"
      status={pageStatus}
      onRetry={fetchData}
    >
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlySpend.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyHours.toFixed(1)}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{booking.resourceName}</TableCell>
                <TableCell className="text-sm">{moment(booking.startTime).format('MMM D, YYYY')}</TableCell>
                <TableCell className="text-sm">
                  {moment(booking.startTime).format('h:mm A')} &ndash; {moment(booking.endTime).format('h:mm A')}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_STYLES[booking.status]}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{booking.cost != null ? `$${booking.cost.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/scheduler/bookings/${booking.id}`)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setCancelId(booking.id)}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!cancelId} onOpenChange={() => { setCancelId(null); setCancelReason('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this booking?</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-sm font-medium">Reason (optional)</label>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelId(null); setCancelReason('') }}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
