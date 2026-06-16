import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import { getBookingById, cancelBooking, checkInBooking, type BookingDetailDto, type BookingStatus } from '@/services/api/scheduling'
import { BookingStatusBadge } from '../components/booking-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { Clock, User, MapPin, Building2, FileText, RotateCcw, XCircle, LogIn, ArrowLeft, ChevronRight } from 'lucide-react'

const statusSteps: { status: BookingStatus; label: string }[] = [
  { status: 'Pending' as BookingStatus, label: 'Booking Requested' },
  { status: 'Confirmed' as BookingStatus, label: 'Confirmed' },
  { status: 'InProgress' as BookingStatus, label: 'Check-In' },
  { status: 'Completed' as BookingStatus, label: 'Completed' },
]

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [booking, setBooking] = useState<BookingDetailDto | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setPageStatus('loading')
    try {
      const data = await getBookingById(id)
      setBooking(data)
      setPageStatus('success')
    } catch {
      setPageStatus('error')
    }
  }, [id])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Scheduling', href: '/scheduler/calendar' },
      { label: 'Bookings', href: '/scheduler/bookings' },
      { label: 'Booking Details' },
    ])
    load()
  }, [load, setBreadcrumbs])

  const handleCancel = async () => {
    if (!id) return
    setCancelling(true)
    try {
      await cancelBooking(id)
      toast({ title: 'Booking cancelled', variant: 'success' })
      setShowCancel(false)
      load()
    } catch {
      toast({ title: 'Failed to cancel booking', variant: 'destructive' })
    } finally {
      setCancelling(false)
    }
  }

  const handleCheckIn = async () => {
    if (!id) return
    setCheckingIn(true)
    try {
      await checkInBooking(id)
      toast({ title: 'Checked in successfully', variant: 'success' })
      load()
    } catch {
      toast({ title: 'Failed to check in', variant: 'destructive' })
    } finally {
      setCheckingIn(false)
    }
  }

  const currentStepIdx = booking
    ? statusSteps.findIndex((s) => s.status === booking.status)
    : -1

  if (!booking && pageStatus === 'loading') {
    return <PageContainer title="Booking Details" status="loading" loadingType="detail" />
  }
  if (pageStatus === 'error' || !booking) {
    return <PageContainer title="Booking Details" status="error" onRetry={load} />
  }

  return (
    <PageContainer
      title={booking.title}
      description={moment(booking.startTime).format('MMM D, YYYY h:mm A')}
      actions={
        <div className="flex gap-2">
          {booking.status === 'Confirmed' && (
            <Button variant="outline" size="sm" onClick={handleCheckIn} disabled={checkingIn}>
              <LogIn className="mr-1 h-4 w-4" /> {checkingIn ? 'Checking In...' : 'Check In'}
            </Button>
          )}
          {booking.status === 'Pending' || booking.status === 'Confirmed' ? (
            <Button variant="destructive" size="sm" onClick={() => setShowCancel(true)}>
              <XCircle className="mr-1 h-4 w-4" /> Cancel
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => navigate('/scheduler/bookings')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Booking Information
                <BookingStatusBadge status={booking.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> User</p>
                  <p className="font-medium">{booking.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resource</p>
                  <p className="font-medium">{booking.resourceName} ({booking.resourceIdentifier})</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                  <p className="font-medium">{booking.resourceLocation || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Facility</p>
                  <p className="font-medium">{booking.facilityName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Start Time</p>
                  <p className="font-medium">{moment(booking.startTime).format('MMM D, YYYY h:mm A')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> End Time</p>
                  <p className="font-medium">{moment(booking.endTime).format('MMM D, YYYY h:mm A')}</p>
                </div>
              </div>
              {booking.recurringRuleId && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Recurring Rule: </span>
                  <Button variant="link" className="h-auto p-0 text-sm" onClick={() => navigate(`/scheduler/recurring-rules/${booking.recurringRuleId}`)}>
                    View Rule <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {booking.purpose && (
                <div className="text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Purpose</span>
                  <p>{booking.purpose}</p>
                </div>
              )}
              {booking.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes</span>
                  <p>{booking.notes}</p>
                </div>
              )}
              {booking.cost != null && (
                <div className="border-t pt-3 text-sm font-semibold flex justify-between">
                  <span>Cost</span>
                  <span>&nbsp;&#8377;{booking.cost}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />
                  {booking.statusHistory.map((h, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className={`mt-1.5 h-[10px] w-[10px] rounded-full border-2 shrink-0 ${
                        i === booking.statusHistory.length - 1 ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'
                      }`} />
                      <div className="text-sm">
                        <p className="font-medium">{h.from} &rarr; {h.to}</p>
                        <p className="text-muted-foreground text-xs">{moment(h.changedAt).format('MMM D, YYYY h:mm A')}</p>
                        {h.reason && <p className="text-muted-foreground text-xs">{h.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusSteps.map((step, i) => (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      i <= currentStepIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${i <= currentStepIdx ? 'font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {booking.checkedInAt && (
            <Card>
              <CardHeader>
                <CardTitle>Check-In Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">Checked in at</p>
                <p className="font-medium">{moment(booking.checkedInAt).format('MMM D, YYYY h:mm A')}</p>
              </CardContent>
            </Card>
          )}

          {booking.cancelledAt && (
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-muted-foreground">Cancelled at</p>
                <p className="font-medium">{moment(booking.cancelledAt).format('MMM D, YYYY h:mm A')}</p>
                {booking.cancellationReason && (
                  <>
                    <p className="text-muted-foreground mt-2">Reason</p>
                    <p className="font-medium">{booking.cancellationReason}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        variant="destructive"
        confirmLabel="Cancel Booking"
        onConfirm={handleCancel}
        isLoading={cancelling}
      />
    </PageContainer>
  )
}
