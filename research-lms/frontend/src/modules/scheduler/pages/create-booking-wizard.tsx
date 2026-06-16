import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  createBooking, updateBooking, getBookingById, getResources, getCostEstimate,
  type BookingResourceDto, type CreateBookingRequest, type CostBreakdownDto,
} from '@/services/api/scheduling'
import { CostBreakdownCard } from '../components/cost-breakdown-card'
import { RecurringBookingDialog, type RecurringConfig } from '../components/recurring-booking-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Switch } from '@/shared/ui/switch'
import { Separator } from '@/shared/ui/separator'
import { ArrowLeft, ArrowRight, Check, Clock, AlertTriangle, Repeat, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FormState {
  title: string
  purpose: string
  notes: string
}

export default function CreateBookingWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const prefillStart = searchParams.get('start')
  const prefillEnd = searchParams.get('end')
  const editId = searchParams.get('editId')

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [pageStatus, setPageStatus] = useState<PageStatus>(editId ? 'loading' : 'success')
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [costEstimate, setCostEstimate] = useState<CostBreakdownDto | null>(null)
  const [costLoading, setCostLoading] = useState(false)
  const [enableRecurring, setEnableRecurring] = useState(false)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig | null>(null)
  const [showRecurringDialog, setShowRecurringDialog] = useState(false)

  const [form, setForm] = useState<FormState>({
    title: '',
    purpose: '',
    notes: '',
  })

  const defaultStart = prefillStart
    ? moment(prefillStart).format('YYYY-MM-DDTHH:mm')
    : moment().add(1, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm')

  const defaultEnd = prefillEnd
    ? moment(prefillEnd).format('YYYY-MM-DDTHH:mm')
    : moment().add(2, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm')

  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: editId ? 'Edit Booking' : 'New Booking' }])
    getResources().then(setResources).catch(() => {})
    if (editId) {
      getBookingById(editId).then((b) => {
        setSelectedResourceId(b.resourceId)
        setStartTime(moment(b.startTime).format('YYYY-MM-DDTHH:mm'))
        setEndTime(moment(b.endTime).format('YYYY-MM-DDTHH:mm'))
        setForm({ title: b.title, purpose: b.purpose || '', notes: b.notes || '' })
        setPageStatus('success')
      }).catch(() => {
        setPageStatus('error')
      })
    }
  }, [setBreadcrumbs, editId])

  useEffect(() => {
    if (!selectedResourceId || !startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
      setCostEstimate(null)
      return
    }
    setCostLoading(true)
    getCostEstimate({
      resourceId: selectedResourceId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      isRecurring: enableRecurring,
      recurringInstanceCount: enableRecurring ? (recurringConfig?.maxInstances ?? 0) : 0,
    }).then(setCostEstimate).catch(() => setCostEstimate(null)).finally(() => setCostLoading(false))
  }, [selectedResourceId, startTime, endTime, enableRecurring, recurringConfig?.maxInstances])

  const selectedResource = resources.find((r) => r.resourceId === selectedResourceId)

  const canProceedStep2 = selectedResourceId && startTime && endTime && new Date(startTime) < new Date(endTime)
  const canProceedStep3 = canProceedStep2 && form.title.trim().length > 0

  const handleSubmit = async () => {
    if (!selectedResource) return
    setSubmitting(true)
    try {
      const request: CreateBookingRequest = {
        resourceId: selectedResource.resourceId,
        resourceType: selectedResource.resourceType,
        title: form.title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose: form.purpose || undefined,
        notes: form.notes || undefined,
      }
      if (editId) {
        await updateBooking(editId, request)
        toast({ title: 'Booking updated', variant: 'success' })
      } else {
        await createBooking(request)
        toast({ title: 'Booking created', variant: 'success' })
      }
      navigate('/scheduler/calendar')
    } catch {
      toast({ title: editId ? 'Failed to update booking' : 'Failed to create booking', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const durationMinutes = startTime && endTime && new Date(startTime) < new Date(endTime)
    ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
    : 0

  if (pageStatus === 'error') {
    return <PageContainer title="Booking" status="error" description="Could not load booking data." />
  }
  if (pageStatus === 'loading') {
    return <PageContainer title="Booking" status="loading" loadingType="detail" />
  }

  return (
    <PageContainer
      title={editId ? 'Edit Booking' : 'New Booking'}
      description={editId ? 'Modify your existing booking' : 'Create a resource booking in 3 steps'}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          {['Resource & Time', 'Details', 'Review'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step ? 'bg-primary text-primary-foreground' :
                  i === step ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Resource & Time Slot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                  <SelectTrigger id="resource"><SelectValue placeholder="Select a resource..." /></SelectTrigger>
                  <SelectContent>
                    {resources.map((r) => (
                      <SelectItem key={r.resourceId} value={r.resourceId}>
                        {r.name} ({r.identifier}) &mdash; {r.resourceType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedResource && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {selectedResource.location && <Badge variant="outline">{selectedResource.location}</Badge>}
                  {selectedResource.facilityName && <Badge variant="outline">{selectedResource.facilityName}</Badge>}
                  <Badge variant="secondary">&#8377;{selectedResource.hourlyRate}/hr</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {durationMinutes > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{durationMinutes} minutes</span>
                </div>
              )}

              {costLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating cost...</span>
                </div>
              )}

              {!costLoading && costEstimate && (
                <CostBreakdownCard cost={costEstimate} compact />
              )}

              {!canProceedStep2 && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Please select a resource and valid time range.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Spectrometry Analysis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g., Research project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" /> Recurring Booking
                  </Label>
                  <p className="text-xs text-muted-foreground">Repeat this booking on a schedule</p>
                </div>
                <Switch checked={enableRecurring} onCheckedChange={setEnableRecurring} />
              </div>

              {enableRecurring && (
                <div className="rounded-lg border p-3 text-sm space-y-2">
                  {recurringConfig ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{recurringConfig.frequency} rule</span>
                        <Button variant="outline" size="sm" onClick={() => setShowRecurringDialog(true)}>
                          Edit
                        </Button>
                      </div>
                      <p className="text-muted-foreground">
                        {moment(recurringConfig.timeOfDay, 'HH:mm:ss').format('h:mm A')} &middot; {recurringConfig.durationMinutes} min &middot; Up to {recurringConfig.maxInstances} instances
                      </p>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowRecurringDialog(true)}>
                      <Repeat className="mr-1 h-4 w-4" /> Configure Schedule
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Resource</p>
                    <p className="font-medium">{selectedResource?.name} ({selectedResource?.identifier})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedResource?.resourceType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start</p>
                    <p className="font-medium">{moment(startTime).format('MMM D, YYYY h:mm A')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End</p>
                    <p className="font-medium">{moment(endTime).format('MMM D, YYYY h:mm A')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{durationMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium">{form.title}</p>
                  </div>
                </div>
                {form.purpose && (
                  <p className="text-sm"><span className="text-muted-foreground">Purpose:</span> {form.purpose}</p>
                )}
                {form.notes && (
                  <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {form.notes}</p>
                )}
                {enableRecurring && recurringConfig && (
                  <div className="border-t pt-2 text-sm">
                    <p className="text-muted-foreground flex items-center gap-1"><Repeat className="h-3 w-3" /> Recurring</p>
                    <p className="font-medium">{recurringConfig.frequency} &middot; {moment(recurringConfig.timeOfDay, 'HH:mm:ss').format('h:mm A')} &middot; {recurringConfig.durationMinutes} min &middot; {recurringConfig.maxInstances} max</p>
                  </div>
                )}
              </div>

              {costEstimate && (
                <div>
                  <p className="text-sm font-medium mb-2">Cost Breakdown</p>
                  <CostBreakdownCard cost={costEstimate} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/scheduler/calendar')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !canProceedStep2}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceedStep3 || submitting}>
                {submitting ? 'Saving...' : editId ? 'Update Booking' : 'Confirm Booking'} <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <RecurringBookingDialog
        open={showRecurringDialog}
        onOpenChange={setShowRecurringDialog}
        onConfirm={(config) => {
          setRecurringConfig(config)
          setShowRecurringDialog(false)
        }}
        resourceId={selectedResourceId}
        defaultTime="09:00"
        defaultDuration={durationMinutes || 60}
      />
    </PageContainer>
  )
}
