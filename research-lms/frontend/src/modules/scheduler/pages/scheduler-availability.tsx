import { useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getSlotGrid, getOperatingHours, updateOperatingHours,
  addMaintenanceWindow, deleteMaintenanceWindow, getResources,
  type SlotAvailabilityDto, type OperatingHoursDto,
  type BookingResourceDto, type UpdateOperatingHoursRequest,
  SlotStatus,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { RotateCw, Plus, Trash2, Clock, CalendarDays } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STATUS_STYLES: Record<SlotStatus, string> = {
  Available: 'bg-green-100 text-green-800 border-green-300',
  Booked: 'bg-blue-100 text-blue-800 border-blue-300',
  Maintenance: 'bg-amber-100 text-amber-800 border-amber-300',
  OutsideHours: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function SchedulerAvailability() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [resourceId, setResourceId] = useState('')
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
  const [slots, setSlots] = useState<SlotAvailabilityDto[]>([])
  const [operatingHours, setOperatingHours] = useState<OperatingHoursDto | null>(null)
  const [hoursDialog, setHoursDialog] = useState(false)
  const [maintenanceDialog, setMaintenanceDialog] = useState(false)
  const [hoursForm, setHoursForm] = useState<UpdateOperatingHoursRequest>({})
  const [maintenanceForm, setMaintenanceForm] = useState({
    startTime: '', endTime: '', reason: '',
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Availability' }])
    getResources().then(setResources).catch(() => {})
  }, [setBreadcrumbs])

  const fetchGrid = useCallback(async () => {
    if (!resourceId) {
      setSlots([]); setPageStatus('success'); return
    }
    setPageStatus('loading')
    try {
      const [slotData, hoursData] = await Promise.all([
        getSlotGrid(resourceId, date, date),
        getOperatingHours(resourceId),
      ])
      setSlots(slotData)
      setOperatingHours(hoursData)
      setPageStatus(slotData.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [resourceId, date])

  useEffect(() => { fetchGrid() }, [fetchGrid])

  const dayHours = operatingHours ? (() => {
    const day = moment(date).format('dddd')
    const key = day.toLowerCase() as keyof UpdateOperatingHoursRequest
    const startKey = `${key}Start` as keyof OperatingHoursDto
    const endKey = `${key}End` as keyof OperatingHoursDto
    return { start: operatingHours[startKey] as string | null, end: operatingHours[endKey] as string | null }
  })() : null

  const handleSaveHours = async () => {
    if (!resourceId) return
    try {
      await updateOperatingHours(resourceId, hoursForm)
      toast({ title: 'Hours updated', variant: 'success' })
      setHoursDialog(false)
      fetchGrid()
    } catch {
      toast({ title: 'Failed to update hours', variant: 'destructive' })
    }
  }

  const handleAddMaintenance = async () => {
    if (!resourceId) return
    try {
      await addMaintenanceWindow({
        resourceId,
        startTime: new Date(maintenanceForm.startTime).toISOString(),
        endTime: new Date(maintenanceForm.endTime).toISOString(),
        reason: maintenanceForm.reason,
      })
      toast({ title: 'Maintenance window added', variant: 'success' })
      setMaintenanceDialog(false)
      setMaintenanceForm({ startTime: '', endTime: '', reason: '' })
      fetchGrid()
    } catch {
      toast({ title: 'Failed to add maintenance window', variant: 'destructive' })
    }
  }

  const openHoursDialog = () => {
    if (operatingHours) {
      setHoursForm({
        mondayStart: operatingHours.mondayStart,
        mondayEnd: operatingHours.mondayEnd,
        tuesdayStart: operatingHours.tuesdayStart,
        tuesdayEnd: operatingHours.tuesdayEnd,
        wednesdayStart: operatingHours.wednesdayStart,
        wednesdayEnd: operatingHours.wednesdayEnd,
        thursdayStart: operatingHours.thursdayStart,
        thursdayEnd: operatingHours.thursdayEnd,
        fridayStart: operatingHours.fridayStart,
        fridayEnd: operatingHours.fridayEnd,
        saturdayStart: operatingHours.saturdayStart,
        saturdayEnd: operatingHours.saturdayEnd,
        sundayStart: operatingHours.sundayStart,
        sundayEnd: operatingHours.sundayEnd,
        timezone: operatingHours.timezone,
      })
    }
    setHoursDialog(true)
  }

  return (
    <PageContainer
      title="Resource Availability"
      description="View slot grid, operating hours, and maintenance windows"
      status={pageStatus}
      onRetry={fetchGrid}
      actions={
        <div className="flex items-center gap-2">
          <Select value={resourceId} onValueChange={setResourceId}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select resource..." /></SelectTrigger>
            <SelectContent>
              {resources.map((r) => (
                <SelectItem key={r.resourceId} value={r.resourceId}>
                  {r.name} ({r.identifier})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[160px]"
          />
          <Button variant="outline" size="icon" onClick={fetchGrid}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      {resourceId && (
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid"><CalendarDays className="mr-2 h-4 w-4" />Slot Grid</TabsTrigger>
            <TabsTrigger value="hours"><Clock className="mr-2 h-4 w-4" />Operating Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {moment(date).format('dddd, MMM D, YYYY')}
                {dayHours && dayHours.start && dayHours.end && (
                  <span className="ml-2">
                    ({dayHours.start} &ndash; {dayHours.end})
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setMaintenanceDialog(true)}>
                <Plus className="mr-1 h-4 w-4" />Add Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className={`rounded border px-2 py-1.5 text-xs ${STATUS_STYLES[slot.status]} ${
                    slot.status === SlotStatus.Available ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  title={slot.reason || slot.status}
                >
                  <div className="font-medium">
                    {moment(slot.slotStart).format('HH:mm')}
                  </div>
                  {slot.reason && (
                    <div className="truncate text-[10px] opacity-70">{slot.reason}</div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Timezone: {operatingHours?.timezone || 'UTC'}
              </p>
              <Button variant="outline" size="sm" onClick={openHoursDialog}>
                <Plus className="mr-1 h-4 w-4" />Edit Hours
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const key = day.toLowerCase() as keyof UpdateOperatingHoursRequest
                const startKey = `${key}Start` as keyof OperatingHoursDto
                const endKey = `${key}End` as keyof OperatingHoursDto
                const start = operatingHours?.[startKey] as string | null
                const end = operatingHours?.[endKey] as string | null
                return (
                  <Card key={day}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{day}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm">
                      {start && end
                        ? <span>{start} &ndash; {end}</span>
                        : <span className="text-muted-foreground">Not set</span>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!resourceId && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-4 opacity-30" />
          <p>Select a resource to view availability</p>
        </div>
      )}

      <Dialog open={hoursDialog} onOpenChange={setHoursDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Operating Hours</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const key = day.toLowerCase()
              return (
                <div key={day} className="space-y-1 col-span-1">
                  <Label className="text-xs">{day}</Label>
                  <div className="flex gap-1">
                    <Input
                      type="time"
                      className="h-8 text-xs"
                      value={(hoursForm as any)[`${key}Start`] || ''}
                      onChange={(e) => setHoursForm({ ...hoursForm, [`${key}Start`]: e.target.value })}
                    />
                    <Input
                      type="time"
                      className="h-8 text-xs"
                      value={(hoursForm as any)[`${key}End`] || ''}
                      onChange={(e) => setHoursForm({ ...hoursForm, [`${key}End`]: e.target.value })}
                    />
                  </div>
                </div>
              )
            })}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Timezone</Label>
              <Input
                className="h-8 text-xs"
                value={hoursForm.timezone || ''}
                onChange={(e) => setHoursForm({ ...hoursForm, timezone: e.target.value })}
                placeholder="UTC"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoursDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveHours}>Save Hours</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Maintenance Window</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={maintenanceForm.startTime}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={maintenanceForm.endTime}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Textarea
                value={maintenanceForm.reason}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMaintenance}>Add Window</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
