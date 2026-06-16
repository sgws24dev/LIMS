import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, momentLocalizer } from 'react-big-calendar'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: string
  status: string
}
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import { getBookings, cancelBooking, getResources, type BookingDto, type BookingResourceDto } from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Plus, X } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  InProgress: '#10b981',
  Completed: '#6b7280',
  Cancelled: '#ef4444',
  NoShow: '#8b5cf6',
}

export default function SchedulerCalendar() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [resourceFilter, setResourceFilter] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<BookingDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const params: Record<string, string> = {}
      if (resourceFilter) params.resourceId = resourceFilter

      const [bookingResult, resourceResult] = await Promise.all([
        getBookings(params),
        getResources(),
      ])
      setBookings(bookingResult.items)
      setResources(resourceResult)
      setPageStatus(bookingResult.items.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [resourceFilter])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Calendar' }])
    fetchData()
  }, [fetchData, setBreadcrumbs])

  const calendarEvents: CalendarEvent[] = bookings.map((b) => ({
    id: b.id,
    title: `${b.title} - ${b.userName}`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    resource: b.resourceId,
    status: b.status,
  }))

  const eventPropGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: STATUS_COLORS[event.status] || '#3b82f6',
      borderRadius: '4px',
      opacity: event.status === 'Cancelled' ? 0.6 : 1,
    },
  })

  const handleSelectEvent = (event: CalendarEvent) => {
    const booking = bookings.find((b) => b.id === event.id)
    if (booking) {
      setSelectedEvent(booking)
      setDialogOpen(true)
    }
  }

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    const params = new URLSearchParams({
      date: moment(slotInfo.start).format('YYYY-MM-DD'),
      start: slotInfo.start.toISOString(),
      end: slotInfo.end.toISOString(),
    })
    navigate(`/scheduler/book?${params.toString()}`)
  }

  const handleCancel = async () => {
    if (!selectedEvent) return
    try {
      await cancelBooking(selectedEvent.id)
      setDialogOpen(false)
      fetchData()
    } catch {
    }
  }

  return (
    <PageContainer
      title="Scheduler Calendar"
      description="View and manage resource bookings"
      status={pageStatus}
      onRetry={fetchData}
      emptyTitle="No bookings found"
      emptyDescription="No bookings match your current filters."
      emptyAction={
        <Button onClick={() => navigate('/scheduler/book')}>
          <Plus className="mr-2 h-4 w-4" /> Create Booking
        </Button>
      }
      actions={
        <div className="flex items-center gap-2">
          <Select value={resourceFilter} onValueChange={(v) => setResourceFilter(v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Resources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              {resources.map((r) => (
                <SelectItem key={r.resourceId} value={r.resourceId}>
                  {r.name} ({r.identifier})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/scheduler/book')}>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
      }
    >
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSlotSelect}
          selectable
          views={['month', 'week', 'day']}
          defaultView="month"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedEvent.status}</Badge>
                <Badge variant="secondary">{selectedEvent.resourceName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {moment(selectedEvent.startTime).format('MMM D, YYYY h:mm A')} &ndash;{' '}
                {moment(selectedEvent.endTime).format('MMM D, YYYY h:mm A')}
              </p>
              {selectedEvent.purpose && (
                <p className="text-sm">
                  <strong>Purpose:</strong> {selectedEvent.purpose}
                </p>
              )}
              {selectedEvent.notes && (
                <p className="text-sm">
                  <strong>Notes:</strong> {selectedEvent.notes}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Booked by: {selectedEvent.userName}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedEvent?.status === 'Pending' || selectedEvent?.status === 'Confirmed' ? (
              <Button variant="destructive" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
