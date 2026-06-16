import { useState, useEffect } from 'react'
import moment from 'moment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Separator } from '@/shared/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  RecurringFrequency,
  type RecurringInstancePreviewDto,
  previewRecurringInstances,
} from '@/services/api/scheduling'
import { Clock, AlertTriangle, CalendarDays, Repeat } from 'lucide-react'

interface RecurringBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (config: RecurringConfig) => void
  resourceId?: string
  defaultTime?: string
  defaultDuration?: number
}

export interface RecurringConfig {
  frequency: RecurringFrequency
  dayOfWeekMask: number
  timeOfDay: string
  durationMinutes: number
  effectiveFrom: string
  effectiveTo?: string
  maxInstances: number
}

const DAY_BITS: { label: string; bit: number }[] = [
  { label: 'Mon', bit: 1 },
  { label: 'Tue', bit: 2 },
  { label: 'Wed', bit: 4 },
  { label: 'Thu', bit: 8 },
  { label: 'Fri', bit: 16 },
  { label: 'Sat', bit: 32 },
  { label: 'Sun', bit: 64 },
]

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  BiWeekly: 'Bi-Weekly',
  Monthly: 'Monthly',
  Custom: 'Custom (by day mask)',
}

export function RecurringBookingDialog({
  open, onOpenChange, onConfirm, resourceId,
  defaultTime, defaultDuration,
}: RecurringBookingDialogProps) {
  const { toast } = useToast()

  const [frequency, setFrequency] = useState<RecurringFrequency>(RecurringFrequency.Weekly)
  const [dayMask, setDayMask] = useState(62)
  const [timeOfDay, setTimeOfDay] = useState(defaultTime || '09:00')
  const [durationMinutes, setDurationMinutes] = useState(defaultDuration || 60)
  const [effectiveFrom, setEffectiveFrom] = useState(moment().format('YYYY-MM-DD'))
  const [effectiveTo, setEffectiveTo] = useState(moment().add(3, 'months').format('YYYY-MM-DD'))
  const [maxInstances, setMaxInstances] = useState(100)
  const [previews, setPreviews] = useState<RecurringInstancePreviewDto[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setPreviewLoading(true)
    previewRecurringInstances({
      frequency,
      dayOfWeekMask: frequency === RecurringFrequency.Daily ? undefined : dayMask,
      timeOfDay: timeOfDay + ':00',
      durationMinutes,
      effectiveFrom: moment(effectiveFrom).format('YYYY-MM-DD'),
      effectiveTo: effectiveTo ? moment(effectiveTo).format('YYYY-MM-DD') : undefined,
      previewCount: 5,
    }).then(setPreviews).catch(() => {
      toast({ title: 'Failed to load preview', variant: 'destructive' })
    }).finally(() => setPreviewLoading(false))
  }, [open, frequency, dayMask, timeOfDay, durationMinutes, effectiveFrom, effectiveTo])

  const toggleDay = (bit: number) => {
    setDayMask((prev) => prev ^ bit)
  }

  const handleConfirm = () => {
    onConfirm({
      frequency,
      dayOfWeekMask: frequency === RecurringFrequency.Daily ? 0 : dayMask,
      timeOfDay: timeOfDay + ':00',
      durationMinutes,
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : undefined,
      maxInstances,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" /> Recurring Booking
          </DialogTitle>
          <DialogDescription>
            Configure a recurring booking rule. Instances will be generated automatically.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={frequency as string} onValueChange={(v) => setFrequency(v as RecurringFrequency)} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="Daily" className="flex-1">Daily</TabsTrigger>
            <TabsTrigger value="Weekly" className="flex-1">Weekly</TabsTrigger>
            <TabsTrigger value="BiWeekly" className="flex-1">Bi-Weekly</TabsTrigger>
            <TabsTrigger value="Monthly" className="flex-1">Monthly</TabsTrigger>
            <TabsTrigger value="Custom" className="flex-1">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 py-2">
          {frequency !== RecurringFrequency.Daily && (
            <div>
              <Label className="text-sm font-medium">Repeat on</Label>
              <div className="flex gap-1 mt-1">
                {DAY_BITS.map((d) => (
                  <button
                    key={d.bit}
                    type="button"
                    onClick={() => toggleDay(d.bit)}
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium border transition-colors ${
                      dayMask & d.bit
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-input hover:bg-accent'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Time</Label>
              <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Duration (min)</Label>
              <Input type="number" min={15} step={15} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>From</Label>
              <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>To (optional)</Label>
              <Input type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Max Instances</Label>
            <Input type="number" min={1} max={500} value={maxInstances} onChange={(e) => setMaxInstances(Number(e.target.value))} />
          </div>

          <div className="text-xs text-muted-foreground">
            Frequency: <Badge variant="secondary">{FREQ_LABELS[frequency]}</Badge>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-1 flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> Preview (next occurrences)
            </Label>
            {previewLoading ? (
              <div className="text-sm text-muted-foreground">Loading preview...</div>
            ) : previews.length === 0 ? (
              <div className="text-sm text-muted-foreground">No occurrences found for the selected configuration.</div>
            ) : (
              <div className="space-y-1 text-sm">
                {previews.map((p, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-md px-2 py-1 ${
                    p.hasConflict ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    <span>{moment(p.startTime).format('ddd, MMM D, YYYY')} &middot; {moment(p.startTime).format('h:mm A')} - {moment(p.endTime).format('h:mm A')}</span>
                    {p.hasConflict && (
                      <span className="flex items-center gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Conflict</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!frequency || !timeOfDay || durationMinutes < 15}>
            <Repeat className="mr-2 h-4 w-4" /> Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
